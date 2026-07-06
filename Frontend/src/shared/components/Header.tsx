import { useNavigate } from 'react-router-dom';
import useAuth from '../../features/auth/hooks/useAuth';

const Header = ({ title }: { title?: string }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="w-full bg-surface-light border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-8 py-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <img alt="Logo ValeApp" className="h-14 w-auto object-contain" src="/logo_valeapp.png" />
          {title && <span className="text-xl font-extrabold text-primary">{title}</span>}
        </div>
        <div className="flex flex-wrap gap-3 items-center justify-end">
          {user && (
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center rounded-2xl bg-surface-light px-4 py-2 border border-slate-200">
                <div className="text-sm text-slate-700">
                  <div className="font-semibold">{user.nombre}</div>
                  <div className="text-xs text-slate-500">{user.rol}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="h-10 px-4 rounded-2xl border border-slate-200 bg-white text-slate-600 text-sm font-bold hover:bg-slate-50 transition"
              >
                Cerrar sesion
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;