import { useNavigate } from 'react-router-dom';
import Header from '../shared/components/Header';
import useAuth from '../features/auth/hooks/useAuth';

type AdminCard = {
  href: string;
  icon: string;
  title: string;
  description: string;
  iconBg: string;
  iconColor: string;
};

const adminCards: AdminCard[] = [
  {
    href: '/admin/usuarios',
    icon: 'manage_accounts',
    title: 'Usuarios',
    description: 'Crea usuarios del sistema, edita sus datos y asígnales un perfil.',
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary'
  },
  {
    href: '/admin/tipos-comensal',
    icon: 'group',
    title: 'Tipos de comensal',
    description: 'Define categorías como obrero, jefe o secretaria y su modalidad de emisión.',
    iconBg: 'bg-secondary/15',
    iconColor: 'text-secondary'
  },
  {
    href: '/admin/servicios',
    icon: 'restaurant_menu',
    title: 'Servicios',
    description: 'Mantiene los servicios de alimentación, su categoría y sus horarios.',
    iconBg: 'bg-tertiary/15',
    iconColor: 'text-tertiary'
  },
  {
    href: '/admin/valorizacion-vales',
    icon: 'payments',
    title: 'Valorización de vales',
    description: 'Define el valor de cada vale según el tipo de comensal y el servicio.',
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary'
  },
  {
    href: '/admin/vales-adicionales',
    icon: 'add_card',
    title: 'Vales adicionales',
    description: 'Genera vales especiales para reuniones, visitas u otras necesidades.',
    iconBg: 'bg-secondary/15',
    iconColor: 'text-secondary'
  },
  {
    href: '/admin/reportes',
    icon: 'assessment',
    title: 'Reportes',
    description: 'Consulta auditoría de vales emitidos, utilizados, disponibles y expirados.',
    iconBg: 'bg-tertiary/15',
    iconColor: 'text-tertiary'
  }
];

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background-light text-text-light">
      <Header />

      <main className="max-w-7xl mx-auto px-8 py-10">
        <section className="mb-8 text-center">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-secondary mb-3">Panel administrativo</p>
          <h1 className="text-5xl font-extrabold text-primary tracking-tight">Hola, {user?.nombre ?? 'Administrador'}</h1>
          <p className="mt-2 text-lg text-slate-600">{user?.rol ?? 'Administrador'}</p>
        </section>

        <section className="mb-6">
          <h2 className="text-3xl font-extrabold text-slate-600 mb-2">Módulos de administración</h2>
          <p className="text-lg text-slate-500">Accede rápidamente a las configuraciones principales del sistema.</p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mb-12">
          {adminCards.map((card) => (
            <article
              key={card.href}
              onClick={() => navigate(card.href)}
              className="group flex h-full cursor-pointer flex-col bg-surface-light shadow-card rounded-3xl overflow-hidden border border-slate-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(20,70,125,0.14)]"
            >
              <div className="flex-1 p-8">
                <div className={`w-16 h-16 rounded-2xl ${card.iconBg} flex items-center justify-center mb-5`}>
                  <span className={`material-symbols-outlined ${card.iconColor} text-4xl`}>{card.icon}</span>
                </div>
                <h3 className="text-3xl font-extrabold text-primary mb-3">{card.title}</h3>
                <p className="text-lg text-slate-600 leading-relaxed">{card.description}</p>
              </div>
              <div className="mt-auto h-2 w-full flex opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <div className="h-full w-2/3 bg-primary"></div>
                <div className="h-full w-1/3 bg-secondary"></div>
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
};

export default AdminDashboardPage;
