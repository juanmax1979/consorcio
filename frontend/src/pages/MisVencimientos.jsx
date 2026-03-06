import { useState, useEffect } from 'react';
import api from '../api/client';

export default function MisVencimientos() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dias, setDias] = useState(30);

  useEffect(() => {
    api(`/expensas/vencimientos?dias=${dias}`)
      .then(setItems)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [dias]);

  if (loading) return <p style={{ color: 'var(--text-secondary)' }}>Cargando...</p>;

  return (
    <>
      <div className="header-bar" style={{ marginBottom: '1rem' }}>
        <h2 className="page-title">Próximos vencimientos</h2>
        <select value={dias} onChange={(e) => setDias(Number(e.target.value))} style={{ width: 'auto' }}>
          <option value={7}>Próximos 7 días</option>
          <option value={15}>Próximos 15 días</option>
          <option value={30}>Próximos 30 días</option>
          <option value={60}>Próximos 60 días</option>
        </select>
      </div>
      {items.length === 0 ? (
        <div className="empty-state">No hay vencimientos en el período seleccionado.</div>
      ) : (
        <div className="grid-2">
          {items.map((v) => (
            <div
              key={`${v.tipo}-${v.id}`}
              className={`vencimiento-card ${v.fecha_vencimiento && new Date(v.fecha_vencimiento) - new Date() < 7 * 24 * 60 * 60 * 1000 ? 'urgente' : ''}`}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span className="badge badge-neutral">{v.tipo}</span>
                {v.pagado === 0 ? <span className="badge badge-warning">Pendiente</span> : <span className="badge badge-success">Pagado</span>}
              </div>
              <div style={{ fontWeight: 600 }}>{v.edificio_nombre} - Piso {v.piso} Nº {v.numero}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Período: {v.periodo_mes}/{v.periodo_anio} · Vence: {v.fecha_vencimiento}
              </div>
              <div style={{ marginTop: '0.5rem', fontWeight: 600 }}>${Number(v.monto).toLocaleString('es-AR')}</div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
