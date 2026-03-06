import { useState, useEffect } from 'react';
import api from '../../api/client';

export default function Mensajes() {
  const [list, setList] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ titulo: '', cuerpo: '', destinatarios: [] });
  const [error, setError] = useState('');

  function load() {
    return api('/mensajes').then(setList);
  }

  useEffect(() => {
    api('/usuarios').then((u) => setUsuarios(u.filter((x) => x.rol === 'residente'))).catch(console.error);
  }, []);

  useEffect(() => {
    load().catch(console.error).finally(() => setLoading(false));
  }, []);

  const openCreate = () => {
    setForm({ titulo: '', cuerpo: '', destinatarios: [] });
    setModal(true);
    setError('');
  };

  const toggleDest = (id) => {
    setForm((f) => ({
      ...f,
      destinatarios: f.destinatarios.includes(id) ? f.destinatarios.filter((x) => x !== id) : [...f.destinatarios, id],
    }));
  };

  const submit = async (ev) => {
    ev.preventDefault();
    setError('');
    if (!form.destinatarios.length) return setError('Seleccione al menos un destinatario.');
    try {
      await api('/mensajes', {
        method: 'POST',
        body: JSON.stringify({ titulo: form.titulo, cuerpo: form.cuerpo, destinatarios: form.destinatarios }),
      });
      await load();
      setModal(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar este mensaje?')) return;
    try {
      await api(`/mensajes/${id}`, { method: 'DELETE' });
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <p style={{ color: 'var(--text-secondary)' }}>Cargando...</p>;

  return (
    <>
      <div className="header-bar" style={{ marginBottom: '1rem' }}>
        <h2 className="page-title">Mensajes a residentes</h2>
        <button type="button" className="btn btn-primary" onClick={openCreate}>Nuevo mensaje</button>
      </div>
      {error && <div className="alert alert-error">{error}</div>}
      <div className="card">
        {list.length === 0 ? (
          <div className="empty-state">No hay mensajes enviados.</div>
        ) : (
          list.map((m) => (
            <div key={m.id} style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong>{m.titulo}</strong>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{m.enviado_por_nombre} · {new Date(m.created_at).toLocaleString('es-AR')}</div>
              </div>
              <button type="button" className="btn btn-sm btn-danger" onClick={() => eliminar(m.id)}>Eliminar</button>
            </div>
          ))
        )}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <h2>Nuevo mensaje</h2>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={submit}>
              <div className="form-group">
                <label>Título</label>
                <input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Mensaje</label>
                <textarea value={form.cuerpo} onChange={(e) => setForm({ ...form, cuerpo: e.target.value })} rows={4} required />
              </div>
              <div className="form-group">
                <label>Destinatarios (seleccione uno o más)</label>
                <div style={{ maxHeight: 180, overflow: 'auto', border: '1px solid var(--border)', borderRadius: 6, padding: '0.5rem' }}>
                  {usuarios.map((u) => (
                    <label key={u.id} style={{ display: 'block', padding: '0.35rem 0', margin: 0 }}>
                      <input type="checkbox" checked={form.destinatarios.includes(u.id)} onChange={() => toggleDest(u.id)} />
                      {' '}{u.nombre} {u.apellido} - {u.email}
                    </label>
                  ))}
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn" onClick={() => setModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Enviar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
