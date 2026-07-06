import { Link } from 'react-router-dom';
import Header from '../shared/components/Header';

const ImpresionPage = () => {
  return (
    <div className="min-h-screen bg-background-light text-text-light">
      <Header title="ImpresiÃ³n de vales" />

      <div className="flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-3xl">
          <div className="bg-surface-light rounded-[2.5rem] border border-slate-200 shadow-strong overflow-hidden">
            <div className="p-10 text-center">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-secondary mb-3">ImpresiÃ³n de vale</p>
              <h1 className="text-5xl font-extrabold text-primary mb-4">Vale listo para imprimir</h1>
              <p className="text-lg text-slate-600 mb-10">Revisa los detalles del vale y confirma la impresiÃ³n para continuar.</p>
              <div className="space-y-4 text-left rounded-3xl border border-slate-200 bg-slate-50 p-8">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-500">Servicio</span>
                  <span className="text-lg font-bold text-slate-800">Desayuno</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-500">Valor</span>
                  <span className="text-lg font-bold text-slate-800">$5.000</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-500">Empleado</span>
                  <span className="text-lg font-bold text-slate-800">MarÃ­a FernÃ¡ndez</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-500">Vigencia</span>
                  <span className="text-lg font-bold text-slate-800">09:00 â€” 10:00</span>
                </div>
              </div>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
                <button className="inline-flex items-center justify-center rounded-2xl bg-primary px-8 py-4 text-lg font-bold text-white hover:bg-blue-800 transition">
                  Imprimir ahora
                </button>
                <Link
                  to="/funcionario"
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-8 py-4 text-lg font-bold text-slate-700 hover:bg-slate-50 transition"
                >
                  Volver
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImpresionPage;

