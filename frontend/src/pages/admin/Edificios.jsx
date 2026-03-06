import { useState, useEffect } from 'react';
import api from '../../api/client';

export default function Edificios() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ nombre: '', direccion: '', ciudad: '', codigo_postal: '' });
  const [error, setError] = useState('');

  function load() {
    return api('/edificios').then(setList);
  }

  useEffect(() => {
    load().catch(console.error).finally(() => setLoading(false));
  }, []);

  const openCreate = () => {
    setForm({ nombre: '', direccion: '', ciudad: '', codigo_postal: '' });
    setModal('create');
    setError('');
  };

  const openEdit = (e) => {
    setForm({ id: e.id, nombre: e.nombre, direccion: e.direccion, ciudad: e.ciudad || '', codigo_postal: e.codigo_postal || '' });
    setModal('edit');
    setError('');
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (modal === 'create') {
        await api('/edificios', { method: 'POST', body: JSON.stringify(form) });
      } else {
        await api(`/edificios/${form.id}`, { method: 'PUT', body: JSON.stringify(form) });
      }
      await load();
      setModal(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar este edificio? Se eliminarán sus departamentos y datos relacionados.')) return;
    try {
      await api(`/edificios/${id}`, { method: 'DELETE' });
      await load();
      setModal(null);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <p style={{ color: 'var(--text-secondary)' }}>Cargando...</p>;

  return (
    <>
      <div className="header-bar" style={{ marginBottom: '1rem' }}>
        <h2 className="page-title">Edificios</h2>
        <button type="button" className="btn btn-primary" onClick={openCreate}>Nuevo edificio</button>
      </div>
      <div className="card table-wrap">
        {list.length === 0 ? (
          <div className="empty-state">No hay edificios. Cree uno para comenzar.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Dirección</th>
                <th>Ciudad</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {list.map((e) => (
                <tr key={e.id}>
                  <td>{e.nombre}</td>
                  <td>{e.direccion}</td>
                  <td>{e.ciudad || '—'}</td>
                  <td>
                    <button type="button" className="btn btn-sm" onClick={() => openEdit(e)}>Editar</button>
                    <button type="button" className="btn btn-sm btn-danger" style={{ marginLeft: 6 }} onClick={() => eliminar(e.id)}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{modal === 'create' ? 'Nuevo edificio' : 'Editar edificio'}</h2>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={submit}>
              <div className="form-group">
                <label>Nombre</label>
                <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Dirección</label>
                <input value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Ciudad</label>
                <input value={form.ciudad} onChange={(e) => setForm({ ...form, ciudad: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Código postal</label>
                <input value={form.codigo_postal} onChange={(e) => setForm({ ...form, codigo_postal: e.target.value })} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn" onClick={() => setModal(null)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
