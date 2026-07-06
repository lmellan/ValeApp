import { User } from '../../../shared/types/api';

type UserStatsProps = {
  users: User[];
};

const statCards = [
  { label: 'Usuarios activos', icon: 'group', color: 'text-primary', bg: 'bg-primary/10', value: (users: User[]) => users.filter((user) => user.activo).length },
  { label: 'Funcionarios', icon: 'badge', color: 'text-secondary', bg: 'bg-secondary/15', value: (users: User[]) => users.filter((user) => user.rol === 'Funcionario').length },
  { label: 'Cajeros', icon: 'point_of_sale', color: 'text-tertiary', bg: 'bg-tertiary/15', value: (users: User[]) => users.filter((user) => user.rol === 'Cajero').length },
  { label: 'Administradores', icon: 'admin_panel_settings', color: 'text-primary', bg: 'bg-primary/10', value: (users: User[]) => users.filter((user) => user.rol === 'Administrador').length }
];

const UserStats = ({ users }: UserStatsProps) => (
  <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
    {statCards.map((card) => (
      <div key={card.label} className="bg-surface-light rounded-3xl border border-slate-200 shadow-card p-7">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl ${card.bg} flex items-center justify-center`}>
            <span className={`material-symbols-outlined ${card.color} text-3xl`}>{card.icon}</span>
          </div>
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-on-surface-variant">{card.label}</p>
            <p className="text-3xl font-extrabold text-primary">{card.value(users)}</p>
          </div>
        </div>
      </div>
    ))}
  </section>
);

export default UserStats;

