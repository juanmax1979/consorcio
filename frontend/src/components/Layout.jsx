import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Layout.css';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.rol === 'admin';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="brand">Consorcio</div>
        <nav>
          {isAdmin ? (
            <>
              <NavLink to="/admin" end>Inicio</NavLink>
              <NavLink to="/admin/edificios">Edificios</NavLink>
              <NavLink to="/admin/departamentos">Departamentos</NavLink>
              <NavLink to="/admin/usuarios">Usuarios</NavLink>
              <NavLink to="/admin/expensas">Expensas</NavLink>
              <NavLink to="/admin/alquileres">Alquileres</NavLink>
              <NavLink to="/admin/mantenimientos">Mantenimientos</NavLink>
              <NavLink to="/admin/notificaciones">Notificaciones</NavLink>
              <NavLink to="/admin/mensajes">Mensajes</NavLink>
            </>
          ) : (
            <>
              <NavLink to="/mis-vencimientos" end>Vencimientos</NavLink>
              <NavLink to="/expensas">Mis expensas</NavLink>
              <NavLink to="/alquileres">Mis alquileres</NavLink>
              <NavLink to="/mantenimientos">Mantenimientos</NavLink>
              <NavLink to="/notificaciones">Notificaciones</NavLink>
              <NavLink to="/mensajes">Mensajes</NavLink>
            </>
          )}
        </nav>
      </aside>
      <main className="main">
        <div className="header-bar">
          <h1 className="page-title" style={{ margin: 0 }}>Consorcio</h1>
          <div className="header-bar-right">
            <span className="user-info">{user?.nombre} {user?.apellido}</span>
            <button type="button" className="btn btn-sm" onClick={handleLogout}>Salir</button>
          </div>
        </div>
        <Outlet />
      </main>
    </div>
  );
}
