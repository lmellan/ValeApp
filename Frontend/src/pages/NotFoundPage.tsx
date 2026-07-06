import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-background-light text-text-light flex items-center justify-center px-6 py-10">
      <div className="max-w-xl bg-surface-light rounded-3xl border border-slate-200 shadow-strong p-10 text-center">
        <h1 className="text-6xl font-extrabold text-primary mb-4">404</h1>
        <p className="text-xl text-slate-600 mb-8">No pudimos encontrar la página que buscas.</p>
        <Link
          to="/"
          className="inline-flex items-center justify-center rounded-2xl bg-primary px-8 py-4 text-lg font-bold text-white hover:bg-blue-800 transition"
        >
          Ir al inicio
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
