import { useState, useEffect } from 'react';
import api from '../api/client';

export default function AlquileresList() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroPagado, setFiltroPagado] = useState('');

  useEffect(() => {
    const q = new URLSearchParams();
    if (filtroPagado === 'pendientes') q.set('pendientes', '1');
    api(`/alquileres?${q}`)
      .then(setList)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filtroPagado]);

  if (loading) return <p style={{ color: 'var(--text-secondary)' }}>Cargando...</p>;

  return (
    <>
      <div className="header-bar" style={{ marginBottom: '1rem' }}>
        <h2 className="page-title">Mis alquileres</h2>
        <select value={filtroPagado} onChange={(e) => setFiltroPagado(e.target.value)} style={{ width: 'auto' }}>
          <option value="">Todas</option>
          <option value="pendientes">Pendientes</option>
        </select>
      </div>
      <div className="card table-wrap">
        {list.length === 0 ? (
          <div className="empty-state">No hay alquileres.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Período</th>
                <th>Vencimiento</th>
                <th>Monto</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {list.map((a) => (
                <tr key={a.id}>
                  <td>{a.periodo_mes}/{a.periodo_anio}</td>
                  <td>{a.fecha_vencimiento}</td>
                  <td>${Number(a.monto).toLocaleString('es-AR')}</td>
                  <td>{a.pagado ? <span className="badge badge-success">Pagado</span> : <span className="badge badge-warning">Pendiente</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
