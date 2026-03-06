import { useState, useEffect } from 'react';
import api from '../../api/client';

export default function Departamentos() {
  const [list, setList] = useState([]);
  const [edificios, setEdificios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ edificio_id: '', piso: '', numero: '', metros_cuadrados: '', habitaciones: '' });
  const [error, setError] = useState('');
  const [filtroEdificio, setFiltroEdificio] = useState('');

  function load() {
    return api('/departamentos').then(setList);
  }

  useEffect(() => {
    api('/edificios').then(setEdificios).catch(console.error);
  }, []);

  useEffect(() => {
    const q = filtroEdificio ? `?edificio_id=${filtroEdificio}` : '';
    api(`/departamentos${q}`).then(setList).catch(console.error).finally(() => setLoading(false));
  }, [filtroEdificio]);

  const openCreate = () => {
    setForm({ edificio_id: edificios[0]?.id || '', piso: '', numero: '', metros_cuadrados: '', habitaciones: '' });
    setModal('create');
    setError('');
  };

  const openEdit = (d) => {
    setForm({ id: d.id, edificio_id: d.edificio_id, piso: d.piso, numero: d.numero, metros_cuadrados: d.metros_cuadrados || '', habitaciones: d.habitaciones || '' });
    setModal('edit');
    setError('');
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    const payload = { ...form, edificio_id: Number(form.edificio_id), metros_cuadrados: form.metros_cuadrados || null, habitaciones: form.habitaciones ? Number(form.habitaciones) : null };
    try {
      if (modal === 'create') {
        await api('/departamentos', { method: 'POST', body: JSON.stringify(payload) });
      } else {
        await api(`/departamentos/${form.id}`, { method: 'PUT', body: JSON.stringify(payload) });
      }
      await load();
      setModal(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar este departamento?')) return;
    try {
      await api(`/departamentos/${id}`, { method: 'DELETE' });
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
        <h2 className="page-title">Departamentos</h2>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <select value={filtroEdificio} onChange={(e) => setFiltroEdificio(e.target.value)} style={{ width: 'auto' }}>
            <option value="">Todos los edificios</option>
            {edificios.map((e) => <option key={e.id} value={e.id}>{e.nombre}</option>)}
          </select>
          <button type="button" className="btn btn-primary" onClick={openCreate}>Nuevo departamento</button>
        </div>
      </div>
      <div className="card table-wrap">
        {list.length === 0 ? (
          <div className="empty-state">No hay departamentos.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Edificio</th>
                <th>Piso</th>
                <th>Número</th>
                <th>m²</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {list.map((d) => (
                <tr key={d.id}>
                  <td>{d.edificio_nombre}</td>
                  <td>{d.piso}</td>
                  <td>{d.numero}</td>
                  <td>{d.metros_cuadrados ?? '—'}</td>
                  <td>
                    <button type="button" className="btn btn-sm" onClick={() => openEdit(d)}>Editar</button>
                    <button type="button" className="btn btn-sm btn-danger" style={{ marginLeft: 6 }} onClick={() => eliminar(d.id)}>Eliminar</button>
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
            <h2>{modal === 'create' ? 'Nuevo departamento' : 'Editar departamento'}</h2>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={submit}>
              <div className="form-group">
                <label>Edificio</label>
                <select value={form.edificio_id} onChange={(e) => setForm({ ...form, edificio_id: e.target.value })} required>
                  {edificios.map((e) => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Piso</label>
                <input value={form.piso} onChange={(e) => setForm({ ...form, piso: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Número</label>
                <input value={form.numero} onChange={(e) => setForm({ ...form, numero: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Metros cuadrados</label>
                <input type="number" step="0.01" value={form.metros_cuadrados} onChange={(e) => setForm({ ...form, metros_cuadrados: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Habitaciones</label>
                <input type="number" min="0" value={form.habitaciones} onChange={(e) => setForm({ ...form, habitaciones: e.target.value })} />
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
