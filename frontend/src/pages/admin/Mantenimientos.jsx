import { useState, useEffect } from 'react';
import api from '../../api/client';

const ESTADOS = { pendiente: 'Pendiente', en_curso: 'En curso', completado: 'Completado', cancelado: 'Cancelado' };
const TIPOS = { preventivo: 'Preventivo', correctivo: 'Correctivo', obra: 'Obra' };

export default function Mantenimientos() {
  const [list, setList] = useState([]);
  const [edificios, setEdificios] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({
    edificio_id: '', departamento_id: '', tipo: 'correctivo', descripcion: '', estado: 'pendiente',
    fecha_solicitud: new Date().toISOString().slice(0, 10), fecha_prevista: '', fecha_realizacion: '', costo: '',
  });
  const [error, setError] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');

  function load() {
    const q = filtroEstado ? `?estado=${filtroEstado}` : '';
    return api(`/mantenimientos${q}`).then(setList);
  }

  useEffect(() => {
    api('/edificios').then(setEdificios).catch(console.error);
    api('/departamentos').then(setDepartamentos).catch(console.error);
  }, []);

  useEffect(() => {
    load().catch(console.error).finally(() => setLoading(false));
  }, [filtroEstado]);

  const openCreate = () => {
    setForm({
      edificio_id: edificios[0]?.id || '', departamento_id: '', tipo: 'correctivo', descripcion: '', estado: 'pendiente',
      fecha_solicitud: new Date().toISOString().slice(0, 10), fecha_prevista: '', fecha_realizacion: '', costo: '',
    });
    setModal('create');
    setError('');
  };

  const openEdit = (m) => {
    setForm({
      id: m.id, edificio_id: m.edificio_id, departamento_id: m.departamento_id || '', tipo: m.tipo, descripcion: m.descripcion, estado: m.estado,
      fecha_solicitud: m.fecha_solicitud, fecha_prevista: m.fecha_prevista || '', fecha_realizacion: m.fecha_realizacion || '', costo: m.costo ?? '',
    });
    setModal('edit');
    setError('');
  };

  const submit = async (ev) => {
    ev.preventDefault();
    setError('');
    const payload = {
      edificio_id: Number(form.edificio_id),
      departamento_id: form.departamento_id ? Number(form.departamento_id) : null,
      tipo: form.tipo,
      descripcion: form.descripcion,
      estado: form.estado,
      fecha_solicitud: form.fecha_solicitud,
      fecha_prevista: form.fecha_prevista || null,
      fecha_realizacion: form.fecha_realizacion || null,
      costo: form.costo ? Number(form.costo) : null,
    };
    try {
      if (modal === 'create') {
        await api('/mantenimientos', { method: 'POST', body: JSON.stringify(payload) });
      } else {
        await api(`/mantenimientos/${form.id}`, { method: 'PUT', body: JSON.stringify(payload) });
      }
      await load();
      setModal(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar este mantenimiento?')) return;
    try {
      await api(`/mantenimientos/${id}`, { method: 'DELETE' });
      await load();
      setModal(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const deptosDelEdificio = form.edificio_id ? departamentos.filter((d) => d.edificio_id === Number(form.edificio_id)) : [];

  if (loading) return <p style={{ color: 'var(--text-secondary)' }}>Cargando...</p>;

  return (
    <>
      <div className="header-bar" style={{ marginBottom: '1rem' }}>
        <h2 className="page-title">Mantenimientos</h2>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)} style={{ width: 'auto' }}>
            <option value="">Todos</option>
            {Object.entries(ESTADOS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <button type="button" className="btn btn-primary" onClick={openCreate}>Nuevo mantenimiento</button>
        </div>
      </div>
      <div className="card table-wrap">
        {list.length === 0 ? (
          <div className="empty-state">No hay mantenimientos.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Edificio</th>
                <th>Depto</th>
                <th>Tipo</th>
                <th>Descripción</th>
                <th>Estado</th>
                <th>Fecha solicitud</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {list.map((m) => (
                <tr key={m.id}>
                  <td>{m.edificio_nombre}</td>
                  <td>{m.piso && m.numero ? `${m.piso} ${m.numero}` : '—'}</td>
                  <td>{TIPOS[m.tipo] || m.tipo}</td>
                  <td>{m.descripcion?.slice(0, 50)}{m.descripcion?.length > 50 ? '…' : ''}</td>
                  <td><span className={`badge badge-${m.estado === 'completado' ? 'success' : m.estado === 'cancelado' ? 'danger' : 'neutral'}`}>{ESTADOS[m.estado]}</span></td>
                  <td>{m.fecha_solicitud}</td>
                  <td>
                    <button type="button" className="btn btn-sm" onClick={() => openEdit(m)}>Editar</button>
                    <button type="button" className="btn btn-sm btn-danger" style={{ marginLeft: 6 }} onClick={() => eliminar(m.id)}>Eliminar</button>
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
            <h2>{modal === 'create' ? 'Nuevo mantenimiento' : 'Editar mantenimiento'}</h2>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={submit}>
              <div className="form-group">
                <label>Edificio</label>
                <select value={form.edificio_id} onChange={(e) => setForm({ ...form, edificio_id: e.target.value, departamento_id: '' })} required>
                  {edificios.map((e) => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Departamento (opcional)</label>
                <select value={form.departamento_id} onChange={(e) => setForm({ ...form, departamento_id: e.target.value })}>
                  <option value="">— Común —</option>
                  {deptosDelEdificio.map((d) => <option key={d.id} value={d.id}>Piso {d.piso} Nº {d.numero}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Tipo</label>
                <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
                  {Object.entries(TIPOS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Descripción</label>
                <textarea value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} rows={3} required />
              </div>
              <div className="form-group">
                <label>Estado</label>
                <select value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })}>
                  {Object.entries(ESTADOS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Fecha solicitud</label>
                  <input type="date" value={form.fecha_solicitud} onChange={(e) => setForm({ ...form, fecha_solicitud: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Fecha prevista</label>
                  <input type="date" value={form.fecha_prevista} onChange={(e) => setForm({ ...form, fecha_prevista: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Fecha realización</label>
                  <input type="date" value={form.fecha_realizacion} onChange={(e) => setForm({ ...form, fecha_realizacion: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label>Costo</label>
                <input type="number" step="0.01" value={form.costo} onChange={(e) => setForm({ ...form, costo: e.target.value })} />
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
