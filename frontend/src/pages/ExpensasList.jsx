import { useState, useEffect } from 'react';
import api from '../api/client';

export default function ExpensasList() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroPagado, setFiltroPagado] = useState('');

  useEffect(() => {
    const q = new URLSearchParams();
    if (filtroPagado === 'pendientes') q.set('pendientes', '1');
    api(`/expensas?${q}`)
      .then(setList)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filtroPagado]);

  if (loading) return <p style={{ color: 'var(--text-secondary)' }}>Cargando...</p>;

  return (
    <>
      <div className="header-bar" style={{ marginBottom: '1rem' }}>
        <h2 className="page-title">Mis expensas</h2>
        <select value={filtroPagado} onChange={(e) => setFiltroPagado(e.target.value)} style={{ width: 'auto' }}>
          <option value="">Todas</option>
          <option value="pendientes">Pendientes</option>
        </select>
      </div>
      <div className="card table-wrap">
        {list.length === 0 ? (
          <div className="empty-state">No hay expensas.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Período</th>
                <th>Concepto</th>
                <th>Vencimiento</th>
                <th>Monto</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {list.map((e) => (
                <tr key={e.id}>
                  <td>{e.periodo_mes}/{e.periodo_anio}</td>
                  <td>{e.concepto_nombre || '—'}</td>
                  <td>{e.fecha_vencimiento}</td>
                  <td>${Number(e.monto).toLocaleString('es-AR')}</td>
                  <td>{e.pagado ? <span className="badge badge-success">Pagado</span> : <span className="badge badge-warning">Pendiente</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
