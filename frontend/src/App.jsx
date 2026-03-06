import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import MisVencimientos from './pages/MisVencimientos';
import ExpensasList from './pages/ExpensasList';
import AlquileresList from './pages/AlquileresList';
import MantenimientosList from './pages/MantenimientosList';
import NotificacionesList from './pages/NotificacionesList';
import MensajesList from './pages/MensajesList';
import AdminHome from './pages/admin/AdminHome';
import Edificios from './pages/admin/Edificios';
import Departamentos from './pages/admin/Departamentos';
import Usuarios from './pages/admin/Usuarios';
import Expensas from './pages/admin/Expensas';
import Alquileres from './pages/admin/Alquileres';
import Mantenimientos from './pages/admin/Mantenimientos';
import Notificaciones from './pages/admin/Notificaciones';
import Mensajes from './pages/admin/Mensajes';
import './App.css';

function ProtectedRoute({ children, adminOnly }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Cargando...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.rol !== 'admin') return <Navigate to="/mis-vencimientos" replace />;
  return children;
}

function RedirectByRole() {
  const { user } = useAuth();
  return <Navigate to={user?.rol === 'admin' ? '/admin' : '/mis-vencimientos'} replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<RedirectByRole />} />
        <Route path="mis-vencimientos" element={<MisVencimientos />} />
        <Route path="expensas" element={<ExpensasList />} />
        <Route path="alquileres" element={<AlquileresList />} />
        <Route path="mantenimientos" element={<MantenimientosList />} />
        <Route path="notificaciones" element={<NotificacionesList />} />
        <Route path="mensajes" element={<MensajesList />} />
        <Route path="admin" element={<ProtectedRoute adminOnly><AdminHome /></ProtectedRoute>} />
        <Route path="admin/edificios" element={<ProtectedRoute adminOnly><Edificios /></ProtectedRoute>} />
        <Route path="admin/departamentos" element={<ProtectedRoute adminOnly><Departamentos /></ProtectedRoute>} />
        <Route path="admin/usuarios" element={<ProtectedRoute adminOnly><Usuarios /></ProtectedRoute>} />
        <Route path="admin/expensas" element={<ProtectedRoute adminOnly><Expensas /></ProtectedRoute>} />
        <Route path="admin/alquileres" element={<ProtectedRoute adminOnly><Alquileres /></ProtectedRoute>} />
        <Route path="admin/mantenimientos" element={<ProtectedRoute adminOnly><Mantenimientos /></ProtectedRoute>} />
        <Route path="admin/notificaciones" element={<ProtectedRoute adminOnly><Notificaciones /></ProtectedRoute>} />
        <Route path="admin/mensajes" element={<ProtectedRoute adminOnly><Mensajes /></ProtectedRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
