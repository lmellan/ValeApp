import { useEffect, useMemo, useState } from 'react';
import { ReporteValeRow, useReportes } from '../hooks/useReportes';

type ReportType = 'diario' | 'semanal' | 'mensual' | 'anual';
type ReportTab = 'resumen' | 'vales';

type GroupedMetric = {
  name: string;
  emitidos: number;
  usados: number;
  noUsados: number;
  monto: number;
};

type VoucherFilters = {
  query: string;
  tipo: string;
  estado: string;
  servicio: string;
};

const pageSizeOptions = [5, 10, 20];
const initialVoucherFilters: VoucherFilters = { query: '', tipo: 'Todos', estado: 'Todos', servicio: 'Todos' };

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

const formatCurrency = (value?: number | null) =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(Number(value || 0));

const parseLocalDate = (value: string) => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const getWeekStart = (date: Date) => {
  const copy = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = copy.getDay();
  const offset = day === 0 ? 6 : day - 1;
  copy.setDate(copy.getDate() - offset);
  return copy;
};

const getPeriodStart = (type: ReportType, cutDate: string) => {
  const date = parseLocalDate(cutDate);
  if (type === 'diario') return date;
  if (type === 'semanal') return getWeekStart(date);
  if (type === 'anual') return new Date(date.getFullYear(), 0, 1);
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

const getComparableDateForYear = (year: number) => {
  const today = new Date();
  const month = today.getMonth();
  const day = today.getDate();
  const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
  return new Date(year, month, Math.min(day, lastDayOfMonth));
};

const getCutDate = (type: ReportType, selectedYear: number) => {
  const currentYear = new Date().getFullYear();
  if (type === 'anual' && selectedYear < currentYear) return `${selectedYear}-12-31`;
  return toInputDate(getComparableDateForYear(selectedYear));
};

const getPeriodLabel = (type: ReportType, from: string, to: string) => {
  if (type === 'diario') return `${formatDate(to)} (diario)`;
  const suffix = type === 'semanal' ? 'semanal a la fecha' : type === 'anual' ? 'anual a la fecha' : 'mensual a la fecha';
  return `${formatDate(from)} al ${formatDate(to)} (${suffix})`;
};

const getServiceReportTitle = (type: ReportType) => {
  if (type === 'diario') return 'Emisiones por servicio hoy';
  if (type === 'semanal') return 'Emisiones por servicio semanal a la fecha';
  if (type === 'anual') return 'Emisiones por servicio anual a la fecha';
  return 'Emisiones por servicio mensual a la fecha';
};

const getSuffix = (type: ReportType) => {
  if (type === 'diario') return 'del día';
  if (type === 'semanal') return 'semanal a la fecha';
  if (type === 'anual') return 'anual a la fecha';
  return 'mensual a la fecha';
};

const inRange = (value: string | null | undefined, from: string, to: string) => {
  if (!value) return false;
  const date = value.slice(0, 10);
  return date >= from && date <= to;
};

const getLatestValeDate = (rows: ReporteValeRow[]) => {
  const dates = rows
    .map((vale) => vale.fechaUso?.slice(0, 10))
    .filter((date): date is string => Boolean(date))
    .sort();

  return dates.length > 0 ? dates[dates.length - 1] : '';
};

const normalize = (value?: string | number | null) => String(value ?? '').toLowerCase().trim();

const matchesSearch = (vale: ReporteValeRow, query: string) => {
  const term = normalize(query);
  if (!term) return true;

  return [
    vale.idVale,
    vale.funcionarioNombre,
    vale.funcionarioCodigo,
    vale.tipoComensal,
    vale.servicioNombre,
    vale.tipoLabel,
    vale.estadoLabel,
    vale.motivo,
    vale.idCajeroCanje
  ].some((field) => normalize(field).includes(term));
};

const groupByService = (rows: ReporteValeRow[]): GroupedMetric[] => {
  const map = new Map<string, GroupedMetric>();
  rows.forEach((vale) => {
    const current = map.get(vale.servicioNombre) || { name: vale.servicioNombre, emitidos: 0, usados: 0, noUsados: 0, monto: 0 };
    current.emitidos += 1;
    current.monto += Number(vale.valor || 0);
    if (vale.estadoLabel === 'Utilizado') current.usados += 1;
    else current.noUsados += 1;
    map.set(vale.servicioNombre, current);
  });
  return Array.from(map.values()).sort((a, b) => b.emitidos - a.emitidos);
};

const normalizeHexColor = (color?: string) => (/^#[0-9a-fA-F]{6}$/.test(color || '') ? color || '#64748b' : '#64748b');

const getReadableAccent = (color?: string) => {
  const hex = normalizeHexColor(color).replace('#', '');
  const red = parseInt(hex.slice(0, 2), 16);
  const green = parseInt(hex.slice(2, 4), 16);
  const blue = parseInt(hex.slice(4, 6), 16);
  const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255;
  return luminance > 0.78 ? '#334155' : normalizeHexColor(color);
};

const getTagStyle = (color?: string) => {
  const normalized = normalizeHexColor(color);
  return {
    color: getReadableAccent(normalized),
    backgroundColor: `${normalized}26`,
    borderColor: `${normalized}73`
  };
};

const ReportesPage = () => {
  const { allRows, loading, error } = useReportes();
  const [reportType, setReportType] = useState<ReportType>('mensual');
  const [activeTab, setActiveTab] = useState<ReportTab>('resumen');
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());
  const [hasSyncedYear, setHasSyncedYear] = useState(false);
  const [voucherFilters, setVoucherFilters] = useState<VoucherFilters>(initialVoucherFilters);

  useEffect(() => {
    if (hasSyncedYear || allRows.length === 0) return;

    const latestValeDate = getLatestValeDate(allRows);
    if (latestValeDate) setSelectedYear(Number(latestValeDate.slice(0, 4)));
    setHasSyncedYear(true);
  }, [allRows, hasSyncedYear]);

  const cutDate = useMemo(() => getCutDate(reportType, selectedYear), [reportType, selectedYear]);
  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const lastYear = Math.max(currentYear, selectedYear);
    return Array.from({ length: lastYear - 2024 + 1 }, (_, index) => 2024 + index);
  }, [selectedYear]);
  const periodStart = useMemo(() => toInputDate(getPeriodStart(reportType, cutDate)), [cutDate, reportType]);
  const periodRows = useMemo(() => allRows.filter((vale) => inRange(vale.fechaUso, periodStart, cutDate)), [allRows, cutDate, periodStart]);

  const serviceOptions = useMemo(() => Array.from(new Set(periodRows.map((vale) => vale.servicioNombre))).sort(), [periodRows]);
  const filteredVoucherRows = useMemo(() => periodRows.filter((vale) => {
    const matchesTipo = voucherFilters.tipo === 'Todos' || vale.tipoLabel === voucherFilters.tipo;
    const matchesEstado = voucherFilters.estado === 'Todos' || vale.estadoLabel === voucherFilters.estado;
    const matchesServicio = voucherFilters.servicio === 'Todos' || vale.servicioNombre === voucherFilters.servicio;
    return matchesTipo && matchesEstado && matchesServicio && matchesSearch(vale, voucherFilters.query);
  }), [periodRows, voucherFilters]);

  const usedRows = useMemo(() => periodRows.filter((vale) => vale.estadoLabel === 'Utilizado'), [periodRows]);
  const unusedRows = useMemo(() => periodRows.filter((vale) => vale.estadoLabel !== 'Utilizado'), [periodRows]);
  const additionalRows = useMemo(() => periodRows.filter((vale) => vale.tipoLabel === 'Adicional'), [periodRows]);
  const serviceMetrics = useMemo(() => groupByService(periodRows), [periodRows]);
  const suffix = getSuffix(reportType);

  const totalAmount = periodRows.reduce((total, vale) => total + Number(vale.valor || 0), 0);
  const usedAmount = usedRows.reduce((total, vale) => total + Number(vale.valor || 0), 0);
  const unusedAmount = unusedRows.reduce((total, vale) => total + Number(vale.valor || 0), 0);
  const additionalAmount = additionalRows.reduce((total, vale) => total + Number(vale.valor || 0), 0);

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-slate-200 bg-surface-light p-7 shadow-card">
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-12 xl:items-end">
          <div className="xl:col-span-6">
            <h1 className="text-4xl font-extrabold text-primary mb-2">Reportes y auditoría</h1>
            <p className="text-base text-slate-600">
              Consulta la asignación, uso y control de vales según el período seleccionado.
            </p>
          </div>

          <label className="xl:col-span-3">
            <span className="mb-2 block text-sm font-bold uppercase tracking-[0.16em] text-on-surface-variant">Tipo de reporte</span>
            <select
              value={reportType}
              onChange={(event) => setReportType(event.target.value as ReportType)}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-700 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="diario">Diario</option>
              <option value="semanal">Semanal a la fecha</option>
              <option value="mensual">Mensual a la fecha</option>
              <option value="anual">Anual a la fecha</option>
            </select>
          </label>

          <label className="xl:col-span-3">
            <span className="mb-2 block text-sm font-bold uppercase tracking-[0.16em] text-on-surface-variant">Año</span>
            <select
              value={selectedYear}
              onChange={(event) => setSelectedYear(Number(event.target.value))}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-700 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              {yearOptions.map((year) => <option key={year} value={year}>{year}</option>)}
            </select>
          </label>
        </div>
        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3">
          <p className="text-sm text-slate-600">
            <span className="font-bold text-slate-700">Período considerado: </span>
            {getPeriodLabel(reportType, periodStart, cutDate)}
          </p>
        </div>
      </section>

      {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">{error}</div>}
      {loading && <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-semibold text-slate-600">Cargando reportes...</div>}

      <Tabs activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'resumen' && (
        <div className="space-y-8">
          <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            <KpiCard label="Vales emitidos" value={periodRows.length} amount={totalAmount} detail={`Total asignado en el ${suffix}`} color="text-primary" />
            <KpiCard label="Vales utilizados" value={usedRows.length} amount={usedAmount} detail={`Registrados como usados en el ${suffix}`} color="text-secondary" />
            <KpiCard label="No utilizados" value={unusedRows.length} amount={unusedAmount} detail={`No usados acumulados en el ${suffix}`} color="text-tertiary" />
            <KpiCard label="Vales adicionales" value={additionalRows.length} amount={additionalAmount} detail={`Generados manualmente en el ${suffix}`} color="text-primary" />
          </section>

          <ReportCard title={getServiceReportTitle(reportType)} subtitle="Cantidad de vales asignados y usados por cada servicio.">
            <ServiceTable rows={serviceMetrics} />
          </ReportCard>
        </div>
      )}

      {activeTab === 'vales' && (
        <ReportCard title={`Detalle de vales ${suffix}`} subtitle="Consulta todos los vales del periodo, incluyendo bases y adicionales, usados, pendientes y expirados.">
          <VoucherToolbar
            filters={voucherFilters}
            services={serviceOptions}
            total={filteredVoucherRows.length}
            onChange={(changes) => setVoucherFilters((current) => ({ ...current, ...changes }))}
            onClear={() => setVoucherFilters(initialVoucherFilters)}
          />
          <ValeTable rows={filteredVoucherRows} />
        </ReportCard>
      )}
    </div>
  );
};

const Tabs = ({ activeTab, onChange }: { activeTab: ReportTab; onChange: (tab: ReportTab) => void }) => {
  const tabs: Array<{ id: ReportTab; label: string; icon: string }> = [
    { id: 'resumen', label: 'Resumen', icon: 'dashboard' },
    { id: 'vales', label: 'Vales', icon: 'receipt_long' }
  ];

  return (
    <div className="flex flex-wrap gap-3 rounded-3xl border border-slate-200 bg-surface-light p-3 shadow-card">
      {tabs.map((tab) => {
        const active = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`inline-flex h-12 items-center justify-center gap-2 rounded-2xl px-5 text-sm font-extrabold transition ${active ? 'bg-primary text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
          >
            <span className="material-symbols-outlined text-[20px]">{tab.icon}</span>
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

const KpiCard = ({ label, value, amount, detail, color }: { label: string; value: number; amount: number; detail: string; color: string }) => (
  <article className="rounded-3xl border border-slate-200 bg-surface-light p-7 shadow-card">
    <p className="mb-2 text-sm font-bold uppercase tracking-[0.16em] text-on-surface-variant">{label}</p>
    <p className={`text-4xl font-extrabold ${color}`}>{value.toLocaleString('es-CL')}</p>
    <p className="mt-2 text-sm text-slate-500">{detail}</p>
    <p className="mt-1 text-sm font-semibold text-slate-700">Equivalente: {formatCurrency(amount)}</p>
  </article>
);

const ReportCard = ({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) => (
  <section className="overflow-hidden rounded-3xl border border-slate-200 bg-surface-light shadow-card">
    <div className="border-b border-slate-200 bg-slate-50 px-6 py-5">
      <h2 className="text-2xl font-extrabold text-primary">{title}</h2>
      <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
    </div>
    {children}
  </section>
);

const VoucherToolbar = ({ filters, services, total, onChange, onClear }: { filters: VoucherFilters; services: string[]; total: number; onChange: (filters: Partial<VoucherFilters>) => void; onClear: () => void }) => (
  <div className="border-b border-slate-200 bg-white px-6 py-5">
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-end">
      <label className="lg:col-span-4">
        <span className="mb-2 block text-sm font-bold uppercase tracking-[0.16em] text-on-surface-variant">Buscar</span>
        <span className="relative block">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
          <input
            value={filters.query}
            onChange={(event) => onChange({ query: event.target.value })}
            placeholder="Usuario, código, vale o cajero"
            className="w-full rounded-2xl border border-slate-300 bg-white py-4 pl-14 pr-5 text-base text-slate-700 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </span>
      </label>

      <FilterSelect label="Tipo" value={filters.tipo} options={['Todos', 'Base', 'Adicional']} onChange={(value) => onChange({ tipo: value })} className="lg:col-span-2" />
      <FilterSelect label="Estado" value={filters.estado} options={['Todos', 'Disponible', 'Utilizado', 'Expirado']} onChange={(value) => onChange({ estado: value })} className="lg:col-span-2" />
      <FilterSelect label="Servicio" value={filters.servicio} options={['Todos', ...services]} onChange={(value) => onChange({ servicio: value })} className="lg:col-span-2" />

      <button
        type="button"
        onClick={onClear}
        className="h-[54px] rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-extrabold text-slate-600 transition hover:bg-slate-100 lg:col-span-2"
      >
        Limpiar
      </button>
    </div>
    <p className="mt-4 text-sm font-bold text-slate-500">{total.toLocaleString('es-CL')} vales encontrados</p>
  </div>
);

const FilterSelect = ({ label, value, options, onChange, className = '' }: { label: string; value: string; options: string[]; onChange: (value: string) => void; className?: string }) => (
  <label className={className}>
    <span className="mb-2 block text-sm font-bold uppercase tracking-[0.16em] text-on-surface-variant">{label}</span>
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-[54px] w-full rounded-2xl border border-slate-300 bg-white px-4 text-base text-slate-700 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
    >
      {options.map((option) => <option key={option} value={option}>{option}</option>)}
    </select>
  </label>
);

const ServiceTable = ({ rows }: { rows: GroupedMetric[] }) => (
  <div>
    <div className="hidden grid-cols-12 gap-4 border-b border-slate-200 bg-slate-50 px-6 py-4 text-sm font-bold uppercase tracking-[0.14em] text-on-surface-variant lg:grid">
      <span className="col-span-4">Servicio</span>
      <span className="col-span-2">Emitidos</span>
      <span className="col-span-2">Usados</span>
      <span className="col-span-2">No usados</span>
      <span className="col-span-2">Monto total</span>
    </div>
    <div className="divide-y divide-slate-200">
      {rows.length === 0 ? <EmptyMessage text="No hay servicios para el período seleccionado." /> : rows.map((row) => (
        <div key={row.name} className="grid grid-cols-1 gap-3 px-6 py-5 text-sm text-slate-600 lg:grid-cols-12 lg:gap-4">
          <span className="font-semibold text-slate-700 lg:col-span-4">{row.name}</span>
          <MetricCell label="Emitidos" value={row.emitidos.toString()} className="lg:col-span-2" />
          <MetricCell label="Usados" value={row.usados.toString()} className="lg:col-span-2" />
          <MetricCell label="No usados" value={row.noUsados.toString()} className="lg:col-span-2" />
          <MetricCell label="Monto" value={formatCurrency(row.monto)} className="lg:col-span-2" />
        </div>
      ))}
    </div>
  </div>
);

const ValeTable = ({ rows }: { rows: ReporteValeRow[] }) => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    setPage(1);
  }, [rows, pageSize]);

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const paginatedRows = rows.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div>
      <div className="hidden grid-cols-12 gap-4 border-b border-slate-200 bg-slate-50 px-6 py-4 text-sm font-bold uppercase tracking-[0.14em] text-on-surface-variant lg:grid">
        <span className="col-span-2">Fecha y vigencia</span>
        <span className="col-span-2">Funcionario</span>
        <span className="col-span-2">Comensal</span>
        <span className="col-span-1">Tipo</span>
        <span className="col-span-2">Servicio</span>
        <span className="col-span-1">Estado</span>
        <span className="col-span-1">Valor</span>
      </div>
      <div className="divide-y divide-slate-200">
        {paginatedRows.length === 0 ? <EmptyMessage text="No hay vales para los filtros seleccionados." /> : paginatedRows.map((row) => (
          <div key={row.idVale} className="grid grid-cols-1 gap-3 px-6 py-5 text-sm text-slate-600 lg:grid-cols-12 lg:items-center lg:gap-4">
            <span className="lg:col-span-2">
              <span className="block text-xs font-bold uppercase tracking-[0.14em] text-slate-400 lg:hidden">Fecha y vigencia</span>
              <span className="block font-bold text-slate-700">{formatDate(row.fechaUso)}</span>
              <span className="block text-xs text-slate-500">{formatTime(row.horaInicioValidez)} a {formatTime(row.horaFinValidez)}</span>
            </span>
            <span className="font-semibold text-slate-700 lg:col-span-2">
              <span className="block text-xs font-bold uppercase tracking-[0.14em] text-slate-400 lg:hidden">Funcionario</span>
              {row.funcionarioNombre}
              <span className="block text-xs font-semibold text-slate-500">{row.funcionarioCodigo}</span>
            </span>
            <span className="lg:col-span-2">
              <span className="block text-xs font-bold uppercase tracking-[0.14em] text-slate-400 lg:hidden">Comensal</span>
              <span className="inline-flex max-w-full items-center rounded-full border px-3 py-1 text-sm font-bold leading-5" style={getTagStyle(row.tipoComensalColor)}>
                <span className="truncate">{row.tipoComensal}</span>
              </span>
            </span>
            <MetricCell label="Tipo" value={row.tipoLabel} className="font-semibold text-slate-700 lg:col-span-1" />
            <MetricCell label="Servicio" value={row.servicioNombre} className="lg:col-span-2" />
            <div className="lg:col-span-1"><StatusBadge status={row.estadoLabel} /></div>
            <MetricCell label="Valor" value={formatCurrency(row.valor)} className="font-bold text-slate-800 lg:col-span-1" />
          </div>
        ))}
      </div>
      <Pagination page={page} totalPages={totalPages} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={setPageSize} />
    </div>
  );
};

const Pagination = ({ page, totalPages, pageSize, onPageChange, onPageSizeChange }: { page: number; totalPages: number; pageSize: number; onPageChange: (page: number) => void; onPageSizeChange: (size: number) => void }) => (
  <div className="flex flex-col gap-4 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
    <p className="text-sm font-semibold text-slate-500">Página {page} de {totalPages}</p>
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={pageSize}
        onChange={(event) => onPageSizeChange(Number(event.target.value))}
        className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-600 outline-none transition focus:border-primary"
      >
        {pageSizeOptions.map((size) => <option key={size} value={size}>{size} filas</option>)}
      </select>
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(Math.max(1, page - 1))}
        className="h-10 rounded-xl border border-slate-200 bg-white px-4 font-bold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Anterior
      </button>
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        className="h-10 rounded-xl border border-slate-200 bg-white px-4 font-bold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Siguiente
      </button>
    </div>
  </div>
);

const MetricCell = ({ label, value, className = '' }: { label: string; value: string; className?: string }) => (
  <span className={className}>
    <span className="block text-xs font-bold uppercase tracking-[0.14em] text-slate-400 lg:hidden">{label}</span>
    {value}
  </span>
);

const StatusBadge = ({ status }: { status: string }) => {
  const className = status === 'Utilizado'
    ? 'bg-secondary/15 text-secondary'
    : status === 'Disponible'
      ? 'bg-tertiary/15 text-tertiary'
      : 'bg-slate-100 text-slate-600';
  const label = status === 'Disponible' ? 'Disponible' : status === 'Utilizado' ? 'Utilizado' : 'Expirado';

  return <span className={`inline-flex rounded-full px-3 py-1 text-sm font-bold ${className}`}>{label}</span>;
};

const EmptyMessage = ({ text }: { text: string }) => (
  <div className="px-6 py-8 text-center text-sm font-semibold text-slate-500">{text}</div>
);

export default ReportesPage;