import { useState } from 'react';
import Header from '../shared/components/Header';
import { validateVale } from '../features/vales/services/valeService';

const CajeroDashboardPage = () => {
  const [codigo, setCodigo] = useState('');
  const [resultado, setResultado] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleValidar = async () => {
    setResultado(null);
    setError(null);

    if (!codigo.trim()) {
      setError('Ingresa el cÃ³digo del vale antes de continuar.');
      return;
    }

    setLoading(true);
    try {
      const response = await validateVale(codigo.trim());
      setResultado(response.mensaje || 'El vale ha sido validado.');
    } catch (err) {
      setError('No se pudo validar el vale. Revisa el cÃ³digo o intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-light text-text-light">
      <Header title="Dashboard cajero" />

      <main className="max-w-4xl mx-auto px-8 py-10 space-y-8">
        <section className="text-center">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-secondary mb-3">Cajero</p>
          <h1 className="text-5xl font-extrabold text-primary tracking-tight">Validar vales</h1>
        </section>

        <div className="bg-surface-light rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden">
          <div className="p-8 md:p-10">
            <h2 className="text-2xl font-extrabold text-primary mb-2 text-center">Validar Vale de AlimentaciÃ³n</h2>
            <p className="text-on-surface-variant text-center mb-8 font-medium">Ingresa el cÃ³digo del vale para verificar su estado y validez.</p>

            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-grow group">
                <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">qr_code_scanner</span>
                <input
                  type="text"
                  value={codigo}
                  onChange={(event) => setCodigo(event.target.value)}
                  placeholder="Ej: VALE-1001"
                  className="w-full pl-14 pr-6 h-20 bg-slate-50 border-slate-200 border-2 rounded-3xl focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-2xl font-bold text-primary placeholder:text-slate-300"
                />
              </div>
              <button
                onClick={handleValidar}
                disabled={loading}
                className="h-20 px-10 bg-primary hover:bg-blue-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-extrabold rounded-3xl shadow-lg shadow-primary/30 transition-all duration-300 flex items-center justify-center gap-3 active:scale-95"
              >
                <span className="material-symbols-outlined text-2xl">search</span>
                {loading ? 'Validando...' : 'Validar'}
              </button>
            </div>

            {error && <p className="mt-6 rounded-3xl bg-red-50 border border-red-200 p-5 text-red-700">{error}</p>}
            {resultado && <p className="mt-6 rounded-3xl bg-emerald-50 border border-emerald-200 p-5 text-emerald-700">{resultado}</p>}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CajeroDashboardPage;

