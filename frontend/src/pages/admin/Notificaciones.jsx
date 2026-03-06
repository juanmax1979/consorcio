import { useState, useEffect } from 'react';
import api from '../../api/client';

const TIPOS = { vencimiento: 'Vencimiento', aviso: 'Aviso', mantenimiento: 'Mantenimiento', mensaje: 'Mensaje', alerta: 'Alerta' };

export default function Notificaciones() {
  const [list, setList] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ usuario_id: '', tipo: 'aviso', titulo: '', mensaje: '' });
  const [error, setError] = useState('');
  const [usuarioFiltro, setUsuarioFiltro] = useState('');

  function load() {
    const q = usuarioFiltro ? `?usuario_id=${usuarioFiltro}` : '';
    return api(`/notificaciones${q}`).then(setList);
  }

  useEffect(() => {
    api('/usuarios').then(setUsuarios).catch(console.error);
  }, []);

  useEffect(() => {
    load().catch(console.error).finally(() => setLoading(false));
  }, [usuarioFiltro]);

  const openCreate = () => {
    setForm({ usuario_id: usuarios.find((u) => u.rol === 'residente')?.id || usuarios[0]?.id || '', tipo: 'aviso', titulo: '', mensaje: '' });
    setModal(true);
    setError('');
  };

  const submit = async (ev) => {
    ev.preventDefault();
    setError('');
    try {
      await api('/notificaciones', {
        method: 'POST',
        body: JSON.stringify({ usuario_id: Number(form.usuario_id), tipo: form.tipo, titulo: form.titulo, mensaje: form.mensaje || null }),
      });
      await load();
      setModal(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar esta notificación?')) return;
    try {
      await api(`/notificaciones/${id}`, { method: 'DELETE' });
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <p style={{ color: 'var(--text-secondary)' }}>Cargando...</p>;

  return (
    <>
      <div className="header-bar" style={{ marginBottom: '1rem' }}>
        <h2 className="page-title">Notificaciones</h2>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <select value={usuarioFiltro} onChange={(e) => setUsuarioFiltro(e.target.value)} style={{ width: 'auto' }}>
            <option value="">Todos los usuarios</option>
            {usuarios.filter((u) => u.rol === 'residente').map((u) => <option key={u.id} value={u.id}>{u.nombre} {u.apellido} - {u.email}</option>)}
          </select>
          <button type="button" className="btn btn-primary" onClick={openCreate}>Nueva notificación</button>
        </div>
      </div>
      {error && <div className="alert alert-error">{error}</div>}
      <div className="card">
        {list.length === 0 ? (
          <div className="empty-state">No hay notificaciones.</div>
        ) : (
          list.map((n) => (
            <div key={n.id} style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <strong>{n.titulo}</strong>
                <span className="badge badge-neutral" style={{ marginLeft: 8 }}>{TIPOS[n.tipo] || n.tipo}</span>
                {n.mensaje && <p style={{ margin: '0.35rem 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{n.mensaje}</p>}
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{new Date(n.created_at).toLocaleString('es-AR')}</span>
              </div>
              <button type="button" className="btn btn-sm btn-danger" onClick={() => eliminar(n.id)}>Eliminar</button>
            </div>
          ))
        )}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Nueva notificación</h2>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={submit}>
              <div className="form-group">
                <label>Destinatario</label>
                <select value={form.usuario_id} onChange={(e) => setForm({ ...form, usuario_id: e.target.value })} required>
                  {usuarios.filter((u) => u.rol === 'residente').map((u) => <option key={u.id} value={u.id}>{u.nombre} {u.apellido} - {u.email}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Tipo</label>
                <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
                  {Object.entries(TIPOS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Título</label>
                <input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Mensaje</label>
                <textarea value={form.mensaje} onChange={(e) => setForm({ ...form, mensaje: e.target.value })} rows={3} />
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
