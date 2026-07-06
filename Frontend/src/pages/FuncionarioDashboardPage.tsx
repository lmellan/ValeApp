import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../shared/components/Header';
import useAuth from '../features/auth/hooks/useAuth';
import { getAvailableVales } from '../features/vales/services/valeService';
import { ValeDisponible } from '../shared/types/api';

const FuncionarioDashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [vales, setVales] = useState<ValeDisponible[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchVales = async () => {
      if (!user) return;
      setLoading(true);
      setError('');
      try {
        const data = await getAvailableVales(user.id);
        setVales(data);
      } catch (err) {
        setError('No se pudieron cargar los vales disponibles. Intenta de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    fetchVales();
  }, [user]);

  return (
    <div className="min-h-screen bg-background-light text-text-light">
      <Header title="Dashboard funcionario" />

      <main className="max-w-6xl mx-auto px-8 py-10">
        <section className="mb-8 text-center">
          <h2 className="text-5xl font-extrabold text-primary tracking-tight">Hola, {user?.nombre ?? 'Funcionario'}</h2>
          <p className="mt-4 text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Consulta los vales disponibles y selecciona el servicio que quieres imprimir.
          </p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="bg-surface-light rounded-3xl border border-slate-200 shadow-card p-7">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-3xl">badge</span>
              </div>
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-on-surface-variant">Funcionario</p>
                <p className="text-lg text-slate-600">Perfil: {user?.rol ?? 'Operario'}</p>
              </div>
            </div>
          </div>
          <div className="bg-surface-light rounded-3xl border border-slate-200 shadow-card p-7">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-secondary/15 flex items-center justify-center">
                <span className="material-symbols-outlined text-secondary text-3xl">schedule</span>
              </div>
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-on-surface-variant">Turno asignado</p>
                <p className="text-2xl font-extrabold text-primary">08:00 â€” 16:00</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-6">
          <h3 className="text-3xl font-extrabold text-slate-600 mb-2">Vales disponibles</h3>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </section>

        {loading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-lg text-slate-700 shadow-sm">
            Cargando vales disponibles...
          </div>
        ) : vales.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-lg text-slate-700 shadow-sm">
            No hay vales disponibles en este momento.
          </div>
        ) : (
          <section className="grid gap-8 mb-12">
            {vales.map((vale) => (
              <article key={vale.id_vale_disponible ?? vale.id_vale ?? String(Math.random())} className="group bg-surface-light shadow-strong rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(20,70,125,0.18)]">
                <div className="p-8">
                  <div className="flex items-start justify-between gap-4 mb-8">
                    <div>
                      <p className="text-sm font-bold uppercase tracking-[0.18em] text-secondary mb-2">Servicio disponible</p>
                      <h4 className="text-4xl font-extrabold text-primary leading-tight">{vale.servicio ?? 'Servicio'}</h4>
                    </div>
                    <div className="min-w-[130px] rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-center transition-colors duration-300 group-hover:border-primary/40 group-hover:bg-primary/5">
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-on-surface-variant mb-1">Valor</p>
                      <p className="text-3xl font-extrabold text-primary">${vale.valor ?? '0.000'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 transition-colors duration-300 group-hover:border-primary/40 group-hover:bg-primary/5">
                        <span className="material-symbols-outlined text-primary text-3xl">timer</span>
                      </div>
                      <div>
                        <p className="text-sm font-bold uppercase tracking-[0.16em] text-on-surface-variant">Vigencia</p>
                        <p className="text-2xl font-bold text-primary">{vale.vigencia ?? 'N/A'}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 transition-colors duration-300 group-hover:border-secondary/60 group-hover:bg-secondary/10">
                        <span className="material-symbols-outlined text-primary text-3xl">storefront</span>
                      </div>
                      <div>
                        <p className="text-sm font-bold uppercase tracking-[0.16em] text-on-surface-variant">Casino autorizado</p>
                        <p className="text-2xl font-bold text-primary">{vale.casino ?? 'Casino'}</p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate('/impresion')}
                    className="w-full h-24 rounded-3xl bg-tertiary hover:bg-amber-700 text-white text-2xl font-extrabold shadow-lg transition flex items-center justify-center gap-3"
                  >
                    <span className="material-symbols-outlined text-3xl">print</span>
                    Imprimir vale
                  </button>
                </div>
                <div className="h-2 w-full flex opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <div className="h-full w-2/3 bg-primary"></div>
                  <div className="h-full w-1/3 bg-secondary"></div>
                </div>
              </article>
            ))}
          </section>
        )}
      </main>
    </div>
  );
};

export default FuncionarioDashboardPage;

