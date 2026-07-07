import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Header from '../shared/components/Header';
import useAuth from '../features/auth/hooks/useAuth';
import { printVale } from '../features/vales/services/valeService';
import { ServicioAlimentacion } from '../features/servicios/types';
import { ValeDisponible } from '../shared/types/api';

const toInputDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatDate = (value?: string | null) => {
  if (!value) return 'Sin fecha';
  const [year, month, day] = value.slice(0, 10).split('-');
  if (!year || !month || !day) return value;
  return `${day}/${month}/${year}`;
};
const formatTime = (value?: string | null) => value?.slice(0, 5) || '--:--';
const timeForDate = (value?: string | null, fallback = '00:00') => formatTime(value) === '--:--' ? fallback : formatTime(value);
const formatCurrency = (value?: number | null) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(Number(value || 0));
const getVoucherTypeLabel = (vale?: ValeDisponible) => vale?.tipoAsignacion === 'ADMINISTRATIVA' ? 'Adicional' : 'Base';
const getVoucherDate = (vale?: ValeDisponible) => {
  const value = vale?.fechaUso;
  if (!value) return '';
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value.slice(0, 10) : toInputDate(parsed);
};
const isPrinted = (vale?: ValeDisponible) => Boolean(vale?.impreso || vale?.fechaHoraImpresion);
const isUsed = (vale?: ValeDisponible) => vale?.estadoUso === 'UTILIZADO';

const voucherDateTime = (vale: ValeDisponible, time?: string | null, fallback = '00:00') => new Date(`${getVoucherDate(vale)}T${timeForDate(time, fallback)}:00`);
const getPrintBlockReason = (vale?: ValeDisponible) => {
  if (!vale) return 'No hay vale seleccionado.';
  const now = new Date();
  const start = voucherDateTime(vale, vale.horaInicioValidez, '00:00');
  const end = voucherDateTime(vale, vale.horaFinValidez, '23:59');
  if (getVoucherDate(vale) !== toInputDate(now)) return 'Solo se pueden imprimir vales del día actual.';
  if (isUsed(vale)) return 'Este vale ya fue utilizado.';
  if (vale.expirado || now > end) return 'Este vale está expirado.';
  if (now < start) return `Este vale se habilita a las ${formatTime(vale.horaInicioValidez)}.`;
  return '';
};

type PrintState = {
  vale?: ValeDisponible;
  service?: ServicioAlimentacion;
  casinoName?: string;
};

const ImpresionPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { vale, service, casinoName } = (location.state || {}) as PrintState;
  const [printing, setPrinting] = useState(false);
  const [printed, setPrinted] = useState(Boolean(vale?.impreso || vale?.fechaHoraImpresion));
  const [error, setError] = useState('');
  const blockReason = getPrintBlockReason(vale);

  const handlePrint = async () => {
    if (!vale?.idVale || !user?.id || blockReason) return;
    setPrinting(true);
    setError('');
    try {
      await printVale(vale.idVale, user.id);
      setPrinted(true);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'No se pudo confirmar la impresión del vale.');
    } finally {
      setPrinting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-light text-text-light">
      <Header title="Impresión de vale" />

      <main className="mx-auto max-w-[460px] px-4 py-6 sm:px-6">
        {!vale ? (
          <section className="rounded-3xl border border-slate-200 bg-surface-light p-8 text-center shadow-card">
            <h1 className="text-3xl font-extrabold text-primary">No hay vale seleccionado</h1>
            <p className="mt-3 text-slate-600">Vuelve al panel y selecciona un vale disponible.</p>
            <Link to="/funcionario" className="mt-6 inline-flex h-14 items-center justify-center rounded-2xl bg-primary px-6 text-base font-extrabold text-white">Volver</Link>
          </section>
        ) : (
          <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-surface-light shadow-strong">
            <div className="bg-primary px-6 py-5 text-white">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-white/80">Simulación de impresión</p>
              <h1 className="mt-2 text-3xl font-extrabold">Vale de colación</h1>
            </div>

            <div className="bg-white px-6 py-7">
              <div className="mx-auto max-w-[320px] rounded-sm border border-slate-200 bg-slate-50 px-5 py-6 font-mono text-slate-800 shadow-inner">
                <div className="border-b border-dashed border-slate-300 pb-4 text-center">
                  <p className="text-xs uppercase tracking-[0.24em]">ValeApp</p>
                  <p className="mt-2 text-xl font-black">{service?.nombre || `Servicio ${vale.idServicio ?? ''}`}</p>
                  <p className="mt-1 text-xs">{getVoucherTypeLabel(vale)}</p>
                </div>

                <div className="space-y-3 border-b border-dashed border-slate-300 py-4 text-sm">
                  <ReceiptRow label="Funcionario" value={user?.nombre || `ID ${vale.idFuncionario}`} />
                  <ReceiptRow label="Código" value={user?.codigo || String(user?.id || '')} />
                  <ReceiptRow label="Casino" value={casinoName || 'Casino autorizado'} />
                  <ReceiptRow label="Fecha" value={formatDate(vale.fechaUso)} />
                  <ReceiptRow label="Horario" value={`${formatTime(vale.horaInicioValidez)}-${formatTime(vale.horaFinValidez)}`} />
                  <ReceiptRow label="Valor" value={formatCurrency(vale.valor)} />
                </div>

                <div className="pt-4 text-center">
                  <p className="break-all text-xs font-bold">{vale.idVale}</p>
                  <div className="mx-auto mt-4 grid h-20 w-20 grid-cols-4 gap-1 bg-white p-2">
                    {Array.from({ length: 16 }, (_, index) => <span key={index} className={(index + vale.idVale.length) % 3 === 0 ? 'bg-slate-900' : 'bg-slate-300'} />)}
                  </div>
                  <p className="mt-4 text-[10px] uppercase tracking-[0.18em] text-slate-500">Presentar en caja</p>
                </div>
              </div>

              {blockReason && <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">{blockReason}</div>}
              {error && <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}
              {printed && !blockReason && <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">Vale impreso. Puedes reimprimirlo mientras esté disponible.</div>}

              <div className="mt-6 grid grid-cols-1 gap-3">
                <button
                  type="button"
                  onClick={handlePrint}
                  disabled={printing || Boolean(blockReason)}
                  className={`flex h-16 items-center justify-center gap-3 rounded-2xl text-lg font-extrabold transition ${blockReason ? 'cursor-not-allowed bg-slate-100 text-slate-500' : 'bg-primary text-white hover:bg-blue-800'}`}
                >
                  <span className="material-symbols-outlined">{blockReason ? 'block' : 'print'}</span>
                  {printing ? 'Imprimiendo...' : blockReason ? 'No imprimible' : printed ? 'Reimprimir' : 'Confirmar impresión'}
                </button>
                <button type="button" onClick={() => navigate('/funcionario')} className="flex h-14 items-center justify-center rounded-2xl border border-slate-200 bg-white text-base font-extrabold text-slate-700 transition hover:bg-slate-50">
                  Volver al panel
                </button>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

const ReceiptRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-start justify-between gap-4">
    <span className="text-slate-500">{label}</span>
    <span className="max-w-[170px] text-right font-bold">{value}</span>
  </div>
);

export default ImpresionPage;
