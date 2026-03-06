import { useState, useEffect } from 'react';
import api from '../api/client';

export default function MensajesList() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    api('/mensajes')
      .then(setList)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const openMsg = (m) => {
    setSelected(m);
    if (m.id && !m.leido) api(`/mensajes/${m.id}`).then(setSelected).catch(console.error);
  };

  if (loading) return <p style={{ color: 'var(--text-secondary)' }}>Cargando...</p>;

  return (
    <>
      <h2 className="page-title">Mensajes de la administración</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1rem', minHeight: 300 }}>
        <div className="card" style={{ overflow: 'auto' }}>
          {list.length === 0 ? (
            <div className="empty-state">No hay mensajes.</div>
          ) : (
            list.map((m) => (
              <div
                key={m.id}
                onClick={() => openMsg(m)}
                style={{
                  padding: '0.6rem 0',
                  borderBottom: '1px solid var(--border)',
                  cursor: 'pointer',
                  background: selected?.id === m.id ? '#edf2f7' : 'transparent',
                }}
              >
                <strong>{m.titulo}</strong>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {new Date(m.created_at).toLocaleDateString('es-AR')} · {m.enviado_por_nombre}
                  {m.leido === 0 && <span className="badge badge-warning" style={{ marginLeft: 6 }}>Nuevo</span>}
                </div>
              </div>
            ))
          )}
        </div>
        <div className="card">
          {selected ? (
            <>
              <h3 style={{ margin: '0 0 0.5rem' }}>{selected.titulo}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0 0 1rem' }}>
                {selected.enviado_por_nombre} · {new Date(selected.created_at).toLocaleString('es-AR')}
              </p>
              <div style={{ whiteSpace: 'pre-wrap' }}>{selected.cuerpo}</div>
            </>
          ) : (
            <div className="empty-state">Seleccione un mensaje.</div>
          )}
        </div>
      </div>
    </>
  );
}
