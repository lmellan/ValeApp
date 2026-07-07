import { useCallback, useEffect, useRef, useState } from 'react';
import Header from '../shared/components/Header';
import useAuth from '../features/auth/hooks/useAuth';
import { validateVale, canjearVale } from '../features/vales/services/valeService';
import { getServicios } from '../features/servicios/services/serviciosService';
import { getUserById } from '../features/users/services/usersService';
import { ValeDisponible } from '../shared/types/api';

type Fase = 'idle' | 'validando' | 'validado' | 'canjeando';

type ValeConInfo = {
  vale: ValeDisponible;
  funcionarioNombre: string;
  servicioNombre: string;
};

type HistorialEntry = {
  id: number;
  tipo: 'canje' | 'error';
  titulo: string;
  detalle: string;
  hora: string;
};

const getNowTime = () => {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
};

const formatTime = (value?: string | null) => value?.slice(0, 5) ?? '--:--';

const formatCurrency = (value?: number | null) =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(Number(value || 0));

const CajeroDashboardPage = () => {
  const { user } = useAuth();
  const [codigo, setCodigo] = useState('');
  const [fase, setFase] = useState<Fase>('idle');
  const [valeInfo, setValeInfo] = useState<ValeConInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [historial, setHistorial] = useState<HistorialEntry[]>([]);
  const [serviciosMap, setServiciosMap] = useState<Record<number, string>>({});
  const inputRef = useRef<HTMLInputElement>(null);
  const nextId = useRef(1);

  useEffect(() => {
    getServicios()
      .then((servicios) => {
        const map: Record<number, string> = {};
        servicios.forEach((s) => { map[s.idServicio] = s.nombre; });
        setServiciosMap(map);
      })
      .catch(() => {});
  }, []);

  const addToHistorial = (entry: Omit<HistorialEntry, 'id'>) => {
    setHistorial((prev) => [{ ...entry, id: nextId.current++ }, ...prev].slice(0, 10));
  };

  const resetBusqueda = () => {
    setValeInfo(null);
    setError(null);
    setFase('idle');
  };

  const handleValidar = useCallback(async () => {
    const codigoTrimmed = codigo.trim().toUpperCase();
    if (!codigoTrimmed) {
      setError('Ingresa el código del vale antes de continuar.');
      return;
    }
    if (!user) return;

    setFase('validando');
    setError(null);
    setValeInfo(null);

    try {
      const result = await validateVale(codigoTrimmed, user.id);
      const vale = result.vale!;

      let funcionarioNombre = `Funcionario ${vale.idFuncionario ?? ''}`;
      if (vale.idFuncionario) {
        try {
          const funcionario = await getUserById(vale.idFuncionario);
          funcionarioNombre = funcionario.nombre;
        } catch {}
      }

      const servicioNombre = vale.idServicio
        ? (serviciosMap[vale.idServicio] ?? `Servicio ${vale.idServicio}`)
        : 'Sin servicio';

      setValeInfo({ vale, funcionarioNombre, servicioNombre });
      setFase('validado');
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? 'No se pudo validar el vale. Revisa el código o intenta de nuevo.';
      setError(msg);
      addToHistorial({ tipo: 'error', titulo: 'Código inválido', detalle: msg, hora: getNowTime() });
      setFase('idle');
    }
  }, [codigo, user, serviciosMap]);

  const handleCanjear = useCallback(async () => {
    if (!valeInfo || !user) return;

    setFase('canjeando');
    try {
      await canjearVale(valeInfo.vale.idVale, user.id);
      addToHistorial({
        tipo: 'canje',
        titulo: 'Vale registrado exitosamente',
        detalle: `${valeInfo.funcionarioNombre} • ${valeInfo.vale.idVale}`,
        hora: getNowTime(),
      });
      setCodigo('');
      resetBusqueda();
      setTimeout(() => inputRef.current?.focus(), 50);
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? 'No se pudo registrar el canje.';
      setError(msg);
      addToHistorial({ tipo: 'error', titulo: 'Error al registrar', detalle: msg, hora: getNowTime() });
      setFase('validado');
    }
  }, [valeInfo, user]);

  const handleCodigoChange = (value: string) => {
    setCodigo(value);
    if (error) setError(null);
    if (valeInfo) resetBusqueda();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && fase === 'idle') handleValidar();
    if (e.key === 'Escape') { resetBusqueda(); setCodigo(''); }
  };

  const isLoading = fase === 'validando' || fase === 'canjeando';

  return (
    <div className="min-h-screen bg-background-light text-text-light">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">

        <section className="text-center">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-secondary mb-3">Cajero</p>
          <h1 className="text-5xl font-extrabold text-primary tracking-tight">
            Hola, {user?.nombre?.split(' ')[0] ?? 'Cajero'}
          </h1>
        </section>

        {/* Buscador */}
        <div className="bg-surface-light rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden">
          <div className="p-8 md:p-10">
            <h2 className="text-2xl font-extrabold text-primary mb-2 text-center">Validar Vale de Alimentación</h2>
            <p className="text-on-surface-variant text-center mb-8 font-medium">
              Ingresa el código del vale para verificar su vigencia
            </p>

            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-grow group">
                <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                  qr_code_scanner
                </span>
                <input
                  ref={inputRef}
                  type="text"
                  value={codigo}
                  onChange={(e) => handleCodigoChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ej: VALE-1001"
                  disabled={isLoading}
                  autoFocus
                  className="w-full pl-14 pr-6 h-20 bg-slate-50 border-slate-200 border-2 rounded-3xl focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-2xl font-bold text-primary placeholder:text-slate-300 disabled:opacity-60"
                />
              </div>
              <button
                onClick={handleValidar}
                disabled={isLoading}
                className="h-20 px-10 bg-primary hover:bg-blue-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-extrabold rounded-3xl shadow-lg shadow-primary/30 transition-all duration-300 flex items-center justify-center gap-3 active:scale-95"
              >
                <span className="material-symbols-outlined text-2xl">search</span>
                {fase === 'validando' ? 'Validando...' : 'Validar'}
              </button>
            </div>

            {error && (
              <div className="mt-6 flex items-start gap-3 rounded-3xl bg-red-50 border border-red-200 p-5">
                <span className="material-symbols-outlined text-red-500 shrink-0 mt-0.5">error</span>
                <p className="text-red-700 font-semibold text-sm">{error}</p>
              </div>
            )}
          </div>
        </div>

        {/* Tarjeta de resultado */}
        {valeInfo && (
          <div className="relative bg-surface-light rounded-[2.5rem] border-2 border-secondary/30 shadow-xl shadow-secondary/10 overflow-hidden">
            <div className="p-8 md:p-10">

              {/* Funcionario + estado */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div className="flex items-center gap-5">
                  <div className="w-20 h-20 rounded-3xl bg-secondary/10 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-secondary text-5xl">person</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant">
                      Funcionario Identificado
                    </p>
                    <h3 className="text-3xl font-extrabold text-primary">{valeInfo.funcionarioNombre}</h3>
                    <p className="text-sm text-slate-500 font-medium mt-0.5">{valeInfo.vale.idVale}</p>
                  </div>
                </div>
                <div className="bg-secondary/10 px-6 py-3 rounded-2xl border border-secondary/20 text-center">
                  <p className="text-xs font-bold uppercase tracking-widest text-secondary mb-1">Estado Vale</p>
                  <p className="text-xl font-black text-secondary uppercase italic">Válido para Canje</p>
                </div>
              </div>

              {/* Detalles del vale */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                <InfoItem icon="restaurant" label="Servicio" value={valeInfo.servicioNombre} />
                <InfoItem icon="schedule" label="Horario límite" value={`Hasta las ${formatTime(valeInfo.vale.horaFinValidez)}`} />
                <InfoItem icon="payments" label="Valor" value={formatCurrency(valeInfo.vale.valor)} />
                {valeInfo.vale.tipoAsignacion === 'ADMINISTRATIVA' && (
                  <InfoItem icon="note" label="Motivo" value={valeInfo.vale.motivo ?? 'Vale adicional'} />
                )}
              </div>

              {/* Boton de canje */}
              <button
                onClick={handleCanjear}
                disabled={fase === 'canjeando'}
                className="w-full h-24 rounded-[2rem] bg-secondary hover:bg-green-600 disabled:opacity-60 disabled:cursor-not-allowed text-white text-2xl font-extrabold shadow-lg shadow-secondary/30 transition-all duration-300 flex items-center justify-center gap-4 active:scale-[0.98]"
              >
                <span className="material-symbols-outlined text-4xl">check_circle</span>
                {fase === 'canjeando' ? 'Registrando...' : 'Registrar Entrega de Alimento'}
              </button>
            </div>

            <div className="h-3 w-full flex">
              <div className="h-full w-1/3 bg-primary/20" />
              <div className="h-full w-1/3 bg-secondary" />
              <div className="h-full w-1/3 bg-tertiary/20" />
            </div>
          </div>
        )}

        {/* Historial */}
        {historial.length > 0 && (
          <div className="bg-surface-light rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden">
            <div className="p-8 md:p-10">
              <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-primary text-2xl">history</span>
                <h2 className="text-2xl font-extrabold text-primary">Historial de Operaciones</h2>
              </div>
              <div className="space-y-3 max-h-72 overflow-y-auto">
                {historial.map((entry) => (
                  <HistoryRow key={entry.id} entry={entry} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Nota informativa */}
        <div className="rounded-3xl border border-slate-200 bg-slate-50 px-6 py-5 flex items-center gap-4">
          <span className="material-symbols-outlined text-primary shrink-0">info</span>
          <p className="text-sm text-slate-600 font-medium italic">
            Registra cada vale individualmente. El sistema invalida el código automáticamente tras la confirmación para evitar duplicidad.
          </p>
        </div>

      </main>
    </div>
  );
};

const InfoItem = ({ icon, label, value }: { icon: string; label: string; value: string }) => (
  <div className="flex items-start gap-5">
    <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
      <span className="material-symbols-outlined text-primary text-3xl">{icon}</span>
    </div>
    <div>
      <p className="text-sm font-bold uppercase tracking-wider text-on-surface-variant">{label}</p>
      <p className="text-2xl font-bold text-primary">{value}</p>
    </div>
  </div>
);

const HistoryRow = ({ entry }: { entry: HistorialEntry }) => {
  const isCanje = entry.tipo === 'canje';
  return (
    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200 hover:bg-secondary/5 transition-colors">
      <div className="flex items-center gap-4 flex-grow min-w-0">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isCanje ? 'bg-green-100' : 'bg-red-100'}`}>
          <span className={`material-symbols-outlined text-lg ${isCanje ? 'text-green-600' : 'text-red-600'}`}>
            {isCanje ? 'check_circle' : 'error'}
          </span>
        </div>
        <div className="min-w-0">
          <p className="font-bold text-primary text-sm">{entry.titulo}</p>
          <p className="text-xs text-on-surface-variant truncate">{entry.detalle}</p>
        </div>
      </div>
      <p className="text-xs font-medium text-slate-500 whitespace-nowrap ml-4">{entry.hora}</p>
    </div>
  );
};

export default CajeroDashboardPage;
