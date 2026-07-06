import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../shared/components/Header';
import useAuth from '../features/auth/hooks/useAuth';
import { getFuncionarioVales } from '../features/vales/services/valeService';
import { getCasinos, getServicios } from '../features/servicios/services/serviciosService';
import { Casino, ServicioAlimentacion } from '../features/servicios/types';
import { ValeDisponible } from '../shared/types/api';

const toInputDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const todayInput = () => toInputDate(new Date());
const formatDate = (value?: string | null) => {
  if (!value) return 'Sin fecha';
  const [year, month, day] = value.slice(0, 10).split('-');
  if (!year || !month || !day) return value;
  return `${day}/${month}/${year}`;
};
const formatTime = (value?: string | null) => value?.slice(0, 5) || '--:--';
const timeForDate = (value?: string | null, fallback = '00:00') => formatTime(value) === '--:--' ? fallback : formatTime(value);
const formatCurrency = (value?: number | null) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(Number(value || 0));
const getVoucherDate = (vale?: ValeDisponible) => {
  const value = vale?.fechaUso;
  if (!value) return '';
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value.slice(0, 10) : toInputDate(parsed);
};
const getVoucherTypeLabel = (vale: ValeDisponible) => vale.tipoAsignacion === 'ADMINISTRATIVA' ? 'Adicional' : 'Base';
const isPrinted = (vale: ValeDisponible) => Boolean(vale.impreso || vale.fechaHoraImpresion);
const isUsed = (vale: ValeDisponible) => vale.estadoUso === 'UTILIZADO';
const getService = (services: ServicioAlimentacion[], idServicio?: number | null) => services.find((service) => service.idServicio === idServicio);
const getCasinoName = (casinos: Casino[], idCasino?: number | null) => casinos.find((casino) => casino.idCasino === idCasino)?.nombre || 'Casino autorizado';
const voucherDateTime = (vale: ValeDisponible, time?: string | null, fallback = '00:00') => new Date(`${getVoucherDate(vale)}T${timeForDate(time, fallback)}:00`);

const getVoucherState = (vale: ValeDisponible, now = new Date()) => {
  const start = voucherDateTime(vale, vale.horaInicioValidez, '00:00');
  const end = voucherDateTime(vale, vale.horaFinValidez, '23:59');

  if (isUsed(vale)) return { label: 'Utilizado', detail: 'Este vale ya fue canjeado.', className: 'bg-emerald-50 text-emerald-700 border-emerald-200', cardClassName: 'border-emerald-200', printable: false };
  if (isPrinted(vale)) return { label: 'Impreso', detail: 'Ya fue impreso y no puede repetirse.', className: 'bg-indigo-50 text-indigo-700 border-indigo-200', cardClassName: 'border-indigo-200', printable: false };
  if (vale.expirado || now > end) return { label: 'Expirado', detail: 'El horario de uso ya termino.', className: 'bg-slate-100 text-slate-600 border-slate-200', cardClassName: 'border-slate-300 opacity-80', printable: false };
  if (now < start) return { label: 'Aun no disponible', detail: `Disponible desde ${formatTime(vale.horaInicioValidez)}.`, className: 'bg-amber-50 text-amber-700 border-amber-200', cardClassName: 'border-amber-200', printable: false };
  return { label: 'Disponible', detail: '', className: 'bg-green-50 text-green-700 border-green-200', cardClassName: 'border-green-300 ring-2 ring-green-100', printable: true };
};

const sortVales = (a: ValeDisponible, b: ValeDisponible) => {
  const dateCompare = getVoucherDate(a).localeCompare(getVoucherDate(b));
  if (dateCompare !== 0) return dateCompare;
  return String(a.horaInicioValidez || '').localeCompare(String(b.horaInicioValidez || ''));
};

const FuncionarioDashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [vales, setVales] = useState<ValeDisponible[]>([]);
  const [servicios, setServicios] = useState<ServicioAlimentacion[]>([]);
  const [casinos, setCasinos] = useState<Casino[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      setLoading(true);
      setError('');
      try {
        const [valesData, serviciosData, casinosData] = await Promise.all([getFuncionarioVales(user.id), getServicios(), getCasinos()]);
        setVales((valesData || []).sort(sortVales));
        setServicios(serviciosData || []);
        setCasinos(casinosData || []);
      } catch {
        setError('No se pudieron cargar tus vales. Intenta nuevamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const today = todayInput();
  const todaysVales = useMemo(() => vales.filter((vale) => getVoucherDate(vale) === today), [today, vales]);
  const printableToday = todaysVales.filter((vale) => getVoucherState(vale).printable).length;
  const blockedToday = todaysVales.length - printableToday;

  const openPrintPreview = (vale: ValeDisponible) => {
    const service = getService(servicios, vale.idServicio);
    navigate('/impresion', { state: { vale, service, casinoName: getCasinoName(casinos, service?.idCasino) } });
  };

  return (
    <div className="min-h-screen bg-background-light text-text-light">
      <Header title="Panel funcionario" />
      <main className="mx-auto max-w-[560px] px-4 py-6 sm:px-6">
        <section className="mb-5 rounded-3xl border border-slate-200 bg-surface-light p-6 shadow-card">
          <p className="mb-2 text-sm font-bold uppercase tracking-[0.18em] text-secondary">Mis vales de colacion</p>
          <h1 className="text-4xl font-extrabold leading-tight text-primary">Hola, {user?.nombre ?? 'Funcionario'}</h1>
          <p className="mt-3 text-base leading-relaxed text-slate-600">Solo se muestran los vales de hoy. La impresion se habilita dentro del horario del vale.</p>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <InfoTile icon="badge" label="Codigo" value={user?.codigo || String(user?.id || '')} />
            <InfoTile icon="schedule" label="Turno" value={user?.turno || 'No asignado'} />
            <InfoTile icon="restaurant" label="Comensal" value={user?.tipo_comensal || 'No aplica'} />
            <InfoTile icon="event" label="Hoy" value={formatDate(today)} />
          </div>
        </section>

        {error && <Message icon="error" text={error} />}

        <section className="mb-5 grid grid-cols-2 gap-3">
          <KpiCard icon="confirmation_number" label="Vales hoy" value={todaysVales.length} />
          <KpiCard icon="print" label="Imprimibles" value={printableToday} detail={`${blockedToday} bloqueados`} />
        </section>

        <section>
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-extrabold text-primary">Vales de hoy</h2>
              <p className="text-sm text-slate-600">{formatDate(today)}</p>
            </div>
          </div>

          {loading ? (
            <EmptyState icon="progress_activity" title="Cargando vales" text="Consultando tus asignaciones." />
          ) : todaysVales.length === 0 ? (
            <EmptyState icon="event_busy" title="Sin vales para hoy" text="No tienes vales asignados para la fecha actual." />
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {todaysVales.map((vale) => {
                const service = getService(servicios, vale.idServicio);
                return <VoucherCard key={vale.idVale} vale={vale} service={service} casinoName={getCasinoName(casinos, service?.idCasino)} onPrint={() => openPrintPreview(vale)} />;
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

const InfoTile = ({ icon, label, value }: { icon: string; label: string; value: string }) => (
  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
    <span className="material-symbols-outlined text-primary">{icon}</span>
    <p className="mt-2 text-xs font-bold uppercase tracking-[0.14em] text-on-surface-variant">{label}</p>
    <p className="mt-1 truncate text-base font-extrabold text-primary">{value}</p>
  </div>
);

const KpiCard = ({ icon, label, value, detail }: { icon: string; label: string; value: number; detail?: string }) => (
  <article className="rounded-3xl border border-slate-200 bg-surface-light p-5 shadow-card">
    <span className="material-symbols-outlined text-primary">{icon}</span>
    <p className="mt-3 text-xs font-bold uppercase tracking-[0.14em] text-on-surface-variant">{label}</p>
    <p className="mt-1 text-4xl font-extrabold text-primary">{value}</p>
    {detail && <p className="mt-1 text-sm font-semibold text-slate-500">{detail}</p>}
  </article>
);

const VoucherCard = ({ vale, service, casinoName, onPrint }: { vale: ValeDisponible; service?: ServicioAlimentacion; casinoName: string; onPrint: () => void }) => {
  const state = getVoucherState(vale);
  const additional = vale.tipoAsignacion === 'ADMINISTRATIVA';

  return (
    <article className={`overflow-hidden rounded-3xl border bg-surface-light shadow-card ${state.cardClassName}`}>
      <div className="p-5">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <span className={`mb-2 inline-flex rounded-full px-3 py-1 text-sm font-bold ${additional ? 'bg-tertiary/15 text-tertiary' : 'bg-primary/10 text-primary'}`}>{getVoucherTypeLabel(vale)}</span>
            <h3 className="truncate text-3xl font-extrabold text-primary">{service?.nombre || `Servicio ${vale.idServicio ?? 'N/A'}`}</h3>
            <p className="mt-1 text-sm font-semibold text-slate-500">{casinoName}</p>
          </div>
          <div className="shrink-0 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-right">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-on-surface-variant">Valor</p>
            <p className="text-xl font-extrabold text-primary">{formatCurrency(vale.valor)}</p>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-3">
          <Detail icon="timer" label="Horario" value={`${formatTime(vale.horaInicioValidez)} a ${formatTime(vale.horaFinValidez)}`} />
          <StatusDetail state={state} />
        </div>

        {state.detail && <div className={`mb-4 rounded-2xl border px-4 py-3 text-sm font-bold ${state.className}`}>{state.detail}</div>}

        {vale.motivo && <p className="mb-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600">Motivo: {vale.motivo}</p>}

        <button
          type="button"
          disabled={!state.printable}
          onClick={onPrint}
          className={`flex h-16 w-full items-center justify-center gap-3 rounded-2xl text-lg font-extrabold transition ${state.printable ? 'bg-primary text-white hover:bg-blue-800' : 'cursor-not-allowed bg-slate-100 text-slate-500'}`}
        >
          <span className="material-symbols-outlined">{state.printable ? 'print' : 'block'}</span>
          {state.printable ? 'Ver impresion' : 'No imprimible'}
        </button>
      </div>
    </article>
  );
};

const StatusDetail = ({ state }: { state: ReturnType<typeof getVoucherState> }) => (
  <div className={`rounded-2xl border p-4 ${state.className}`}>
    <span className="material-symbols-outlined">event_available</span>
    <p className="mt-2 text-xs font-bold uppercase tracking-[0.14em] opacity-80">Estado</p>
    <p className="mt-1 text-sm font-extrabold">{state.label}</p>
  </div>
);

const Detail = ({ icon, label, value }: { icon: string; label: string; value: string }) => (
  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
    <span className="material-symbols-outlined text-primary">{icon}</span>
    <p className="mt-2 text-xs font-bold uppercase tracking-[0.14em] text-on-surface-variant">{label}</p>
    <p className="mt-1 text-sm font-bold text-slate-800">{value}</p>
  </div>
);

const Message = ({ icon, text }: { icon: string; text: string }) => (
  <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
    <span className="material-symbols-outlined text-[20px]">{icon}</span>
    <span>{text}</span>
  </div>
);

const EmptyState = ({ icon, title, text }: { icon: string; title: string; text: string }) => (
  <div className="rounded-3xl border border-slate-200 bg-surface-light p-8 text-center shadow-card">
    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
      <span className="material-symbols-outlined text-3xl">{icon}</span>
    </div>
    <h3 className="text-2xl font-extrabold text-primary">{title}</h3>
    <p className="mt-2 text-base text-slate-600">{text}</p>
  </div>
);

export default FuncionarioDashboardPage;