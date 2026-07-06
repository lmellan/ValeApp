import { useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Header from '../shared/components/Header';
import UsersPage from '../features/users/components/UsersPage';
import TiposComensalPage from '../features/tiposComensal/components/TiposComensalPage';
import ServiciosPage from '../features/servicios/components/ServiciosPage';
import ValesAdicionalesPage from '../features/valesAdicionales/components/ValesAdicionalesPage';
import ValorizacionValesPage from '../features/valorizacionVales/components/ValorizacionValesPage';
import ReportesPage from '../features/reportes/components/ReportesPage';

const moduleData: Record<string, { title: string; description: string }> = {
  usuarios: {
    title: 'Usuarios',
    description: 'Administra cuentas, permisos y roles del personal.'
  },
  'tipos-comensal': {
    title: 'Tipos de comensal',
    description: 'Gestiona las categorias de comensal y su modalidad de emision.'
  },
  servicios: {
    title: 'Servicios',
    description: 'Configura los servicios de alimentacion y sus horarios disponibles.'
  },
  'valorizacion-vales': {
    title: 'Valorizacion de vales',
    description: 'Configura el valor del vale segun tipo de comensal y servicio.'
  },
  'reglas-vales': {
    title: 'Valorizacion de vales',
    description: 'Configura el valor del vale segun tipo de comensal y servicio.'
  },
  'vales-adicionales': {
    title: 'Vales adicionales',
    description: 'Genera y revisa vales especiales para necesidades excepcionales.'
  },
  reportes: {
    title: 'Reportes',
    description: 'Consulta auditorias de uso y metricas del sistema.'
  }
};

const AdminSectionPage = () => {
  const navigate = useNavigate();
  const { module } = useParams<{ module: string }>();
  const section = useMemo(() => (module ? moduleData[module] : undefined), [module]);

  if (!section) {
    return (
      <div className="min-h-screen bg-background-light text-text-light flex items-center justify-center px-6 py-10">
        <div className="max-w-2xl bg-surface-light rounded-3xl border border-slate-200 shadow-strong p-10 text-center">
          <h1 className="text-4xl font-extrabold text-primary mb-4">Seccion no encontrada</h1>
          <p className="text-lg text-slate-600 mb-8">La ruta solicitada no existe. Regresa al panel administrativo.</p>
          <Link
            to="/admin"
            className="inline-flex items-center justify-center rounded-2xl bg-primary px-8 py-4 text-lg font-bold text-white hover:bg-blue-800 transition"
          >
            Volver al admin
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light text-text-light">
      <Header />
      <main className="max-w-7xl mx-auto px-8 py-10">
        <div className="mb-8">
          <button
            type="button"
            onClick={() => navigate('/admin')}
            className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-surface-light px-5 py-3 text-base font-extrabold text-primary shadow-sm hover:bg-slate-50 transition"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            Volver al panel
          </button>
        </div>

        {module === 'usuarios' && <UsersPage />}
        {module === 'tipos-comensal' && <TiposComensalPage />}
        {module === 'servicios' && <ServiciosPage />}
        {(module === 'valorizacion-vales' || module === 'reglas-vales') && <ValorizacionValesPage />}
        {module === 'vales-adicionales' && <ValesAdicionalesPage />}
        {module === 'reportes' && <ReportesPage />}
        {module !== 'usuarios' && module !== 'tipos-comensal' && module !== 'servicios' && module !== 'valorizacion-vales' && module !== 'reglas-vales' && module !== 'vales-adicionales' && module !== 'reportes' && <PlaceholderSection section={section} />}
      </main>
    </div>
  );
};

const PlaceholderSection = ({ section }: { section: { title: string; description: string } }) => (
  <div className="space-y-10">
    <div className="rounded-3xl border border-slate-200 bg-surface-light p-8 shadow-card">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-on-surface-variant mb-2">{section.title}</p>
          <h2 className="text-4xl font-extrabold text-primary mb-3">{section.title}</h2>
          <p className="max-w-2xl text-base text-slate-600">{section.description}</p>
        </div>
      </div>
    </div>

    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      <article className="rounded-3xl border border-slate-200 bg-surface-light p-6 shadow-card">
        <h3 className="text-xl font-bold text-slate-900 mb-2">Estado actual</h3>
        <p className="text-slate-600">Resumen del modulo y acceso a acciones de administracion.</p>
      </article>
      <article className="rounded-3xl border border-slate-200 bg-surface-light p-6 shadow-card">
        <h3 className="text-xl font-bold text-slate-900 mb-2">Proximos pasos</h3>
        <p className="text-slate-600">Agregar, editar o desactivar elementos desde este panel.</p>
      </article>
      <article className="rounded-3xl border border-slate-200 bg-surface-light p-6 shadow-card">
        <h3 className="text-xl font-bold text-slate-900 mb-2">Metricas</h3>
        <p className="text-slate-600">Monitorea el estado de tus usuarios y roles.</p>
      </article>
      <article className="rounded-3xl border border-slate-200 bg-surface-light p-6 shadow-card">
        <h3 className="text-xl font-bold text-slate-900 mb-2">Soporte</h3>
        <p className="text-slate-600">Revisa datos de configuracion y consulta reportes cuando sea necesario.</p>
      </article>
    </div>
  </div>
);

export default AdminSectionPage;