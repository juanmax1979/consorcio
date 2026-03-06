import { useState, useEffect } from 'react';
import api from '../../api/client';

export default function AdminHome() {
  const [stats, setStats] = useState({ edificios: 0, departamentos: 0, expensasPendientes: 0, alquileresPendientes: 0 });

  useEffect(() => {
    Promise.all([
      api('/edificios').then((r) => r.length),
      api('/departamentos').then((r) => r.length),
      api('/expensas?pendientes=1').then((r) => r.length),
      api('/alquileres?pendientes=1').then((r) => r.length),
    ])
      .then(([edificios, departamentos, expensasPendientes, alquileresPendientes]) =>
        setStats({ edificios, departamentos, expensasPendientes, alquileresPendientes })
      )
      .catch(console.error);
  }, []);

  return (
    <>
      <h2 className="page-title">Administración</h2>
      <div className="grid-2" style={{ maxWidth: 600 }}>
        <div className="card">
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Edificios</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>{stats.edificios}</div>
        </div>
        <div className="card">
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Departamentos</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>{stats.departamentos}</div>
        </div>
        <div className="card">
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Expensas pendientes</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>{stats.expensasPendientes}</div>
        </div>
        <div className="card">
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Alquileres pendientes</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>{stats.alquileresPendientes}</div>
        </div>
      </div>
    </>
  );
}
