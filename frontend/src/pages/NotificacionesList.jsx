import { useState, useEffect } from 'react';
import api from '../api/client';

export default function NotificacionesList() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [soloNoLeidas, setSoloNoLeidas] = useState(false);

  function load() {
    const q = soloNoLeidas ? '?leida=0' : '';
    return api(`/notificaciones${q}`).then(setList);
  }

  useEffect(() => {
    load().catch(console.error).finally(() => setLoading(false));
  }, [soloNoLeidas]);

  const marcarLeida = (id) => {
    api(`/notificaciones/${id}/leer`, { method: 'PUT' })
      .then(() => load())
      .catch(console.error);
  };

  if (loading) return <p style={{ color: 'var(--text-secondary)' }}>Cargando...</p>;

  return (
    <>
      <div className="header-bar" style={{ marginBottom: '1rem' }}>
        <h2 className="page-title">Notificaciones</h2>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
          <input type="checkbox" checked={soloNoLeidas} onChange={(e) => setSoloNoLeidas(e.target.checked)} />
          Solo no leídas
        </label>
      </div>
      {list.length === 0 ? (
        <div className="card empty-state">No hay notificaciones.</div>
      ) : (
        <div className="card">
          {list.map((n) => (
            <div
              key={n.id}
              style={{
                padding: '0.75rem 0',
                borderBottom: '1px solid var(--border)',
                opacity: n.leida ? 0.85 : 1,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                <div>
                  <strong>{n.titulo}</strong>
                  {n.mensaje && <p style={{ margin: '0.35rem 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{n.mensaje}</p>}
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{new Date(n.created_at).toLocaleString('es-AR')}</span>
                </div>
                {!n.leida && (
                  <button type="button" className="btn btn-sm" onClick={() => marcarLeida(n.id)}>Marcar leída</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
