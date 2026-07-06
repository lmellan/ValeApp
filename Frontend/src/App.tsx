import { Route, Routes } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminSectionPage from './pages/AdminSectionPage';
import FuncionarioDashboardPage from './pages/FuncionarioDashboardPage';
import CajeroDashboardPage from './pages/CajeroDashboardPage';
import ImpresionPage from './pages/ImpresionPage';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './shared/components/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />

      <Route element={<ProtectedRoute allowedRoles={['Administrador']} redirectTo="/" />}>
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/:module" element={<AdminSectionPage />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['Funcionario']} redirectTo="/" />}>
        <Route path="/funcionario" element={<FuncionarioDashboardPage />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['Cajero']} redirectTo="/" />}>
        <Route path="/cajero" element={<CajeroDashboardPage />} />
      </Route>

      <Route element={<ProtectedRoute redirectTo="/" />}>
        <Route path="/impresion" element={<ImpresionPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;

