import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../features/auth/hooks/useAuth';
import { getHomeRouteForRole } from '../features/auth/roleRoutes';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const [identificador, setIdentificador] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    if (!identificador || !password) {
      setError('Ingresa codigo o correo y contraseña.');
      return;
    }

    const usuario = await login(identificador, password);
    if (!usuario) {
      setError('Correo o contraseña invalidos. Verifica tus credenciales.');
      return;
    }

    navigate(getHomeRouteForRole(usuario.rol));
  };

  return (
    <div className="min-h-screen bg-background-light text-text-light flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-md">
        <div className="bg-surface-light rounded-3xl border border-slate-200 shadow-strong overflow-hidden">
          <div className="px-8 pt-8 pb-6 text-center border-b border-slate-200">
            <div className="flex justify-center mb-5">
              <img alt="Logo ValeApp" className="h-16 w-auto object-contain" src="/logo_valeapp.png" />
            </div>
            <h1 className="text-3xl font-extrabold text-primary mb-2">Inicio de sesion</h1>
            <p className="text-base text-slate-600">Ingresa con tu codigo o correo y contraseña.</p>
          </div>

          <div className="p-8 space-y-6">
            <div>
              <label className="block text-sm font-bold uppercase tracking-[0.16em] text-on-surface-variant mb-2">Codigo o correo <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={identificador}
                onChange={(event) => setIdentificador(event.target.value)}
                placeholder="ADM1203 o usuario@vales.cl"
                className="w-full rounded-2xl border border-slate-300 bg-white px-5 py-4 text-lg text-slate-700 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-bold uppercase tracking-[0.16em] text-on-surface-variant mb-2">Contraseña <span className="text-red-500">*</span></label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">lock</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-2xl border border-slate-300 bg-white pl-14 pr-14 py-4 text-lg text-slate-700 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                >
                  <span className="material-symbols-outlined">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">{error}</div>}

            <button
              type="button"
              onClick={handleLogin}
              disabled={loading}
              className="w-full h-16 rounded-2xl bg-primary hover:bg-blue-800 disabled:opacity-60 disabled:cursor-not-allowed text-white text-lg font-extrabold transition flex items-center justify-center gap-3"
            >
              <span className="material-symbols-outlined">login</span>
              {loading ? 'Iniciando...' : 'Ingresar'}
            </button>

          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

