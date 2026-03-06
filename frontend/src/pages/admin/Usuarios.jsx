import { useState, useEffect } from 'react';
import api from '../../api/client';

export default function Usuarios() {
  const [list, setList] = useState([]);
  const [edificios, setEdificios] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ email: '', password: '', nombre: '', apellido: '', rol: 'residente', departamento_id: '', activo: 1 });
  const [error, setError] = useState('');
  const [filtroEdificio, setFiltroEdificio] = useState('');

  function load() {
    const q = filtroEdificio ? `?edificio_id=${filtroEdificio}` : '';
    return api(`/usuarios${q}`).then(setList);
  }

  useEffect(() => {
    api('/edificios').then(setEdificios).catch(console.error);
  }, []);

  useEffect(() => {
    api('/departamentos').then(setDepartamentos).catch(console.error);
  }, []);

  useEffect(() => {
    load().catch(console.error).finally(() => setLoading(false));
  }, [filtroEdificio]);

  const openCreate = () => {
    setForm({ email: '', password: '', nombre: '', apellido: '', rol: 'residente', departamento_id: '', activo: 1 });
    setModal('create');
    setError('');
  };

  const openEdit = (u) => {
    setForm({ id: u.id, email: u.email, password: '', nombre: u.nombre, apellido: u.apellido || '', rol: u.rol, departamento_id: u.departamento_id || '', activo: u.activo });
    setModal('edit');
    setError('');
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    const payload = { nombre: form.nombre, apellido: form.apellido || null, rol: form.rol, departamento_id: form.departamento_id ? Number(form.departamento_id) : null, activo: form.activo ? 1 : 0 };
    if (modal === 'create') {
      payload.email = form.email;
      payload.password = form.password;
      if (!form.password || form.password.length < 6) return setError('La contraseña debe tener al menos 6 caracteres.');
    } else if (form.password) payload.password = form.password;
    try {
      if (modal === 'create') {
        await api('/usuarios', { method: 'POST', body: JSON.stringify({ ...payload, password: payload.password }) });
      } else {
        await api(`/usuarios/${form.id}`, { method: 'PUT', body: JSON.stringify(payload) });
      }
      await load();
      setModal(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar este usuario?')) return;
    try {
      await api(`/usuarios/${id}`, { method: 'DELETE' });
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
        <h2 className="page-title">Usuarios</h2>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <select value={filtroEdificio} onChange={(e) => setFiltroEdificio(e.target.value)} style={{ width: 'auto' }}>
            <option value="">Todos</option>
            {edificios.map((e) => <option key={e.id} value={e.id}>{e.nombre}</option>)}
          </select>
          <button type="button" className="btn btn-primary" onClick={openCreate}>Nuevo usuario</button>
        </div>
      </div>
      <div className="card table-wrap">
        {list.length === 0 ? (
          <div className="empty-state">No hay usuarios.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Departamento</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {list.map((u) => (
                <tr key={u.id}>
                  <td>{u.nombre} {u.apellido}</td>
                  <td>{u.email}</td>
                  <td><span className="badge badge-neutral">{u.rol}</span></td>
                  <td>{u.edificio_nombre ? `${u.edificio_nombre} - ${u.piso} ${u.numero}` : '—'}</td>
                  <td>{u.activo ? 'Activo' : 'Inactivo'}</td>
                  <td>
                    <button type="button" className="btn btn-sm" onClick={() => openEdit(u)}>Editar</button>
                    <button type="button" className="btn btn-sm btn-danger" style={{ marginLeft: 6 }} onClick={() => eliminar(u.id)}>Eliminar</button>
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
            <h2>{modal === 'create' ? 'Nuevo usuario' : 'Editar usuario'}</h2>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={submit}>
              <div className="form-group">
                <label>Nombre</label>
                <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Apellido</label>
                <input value={form.apellido} onChange={(e) => setForm({ ...form, apellido: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required disabled={modal === 'edit'} />
              </div>
              {modal === 'create' && (
                <div className="form-group">
                  <label>Contraseña</label>
                  <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} minLength={6} required={modal === 'create'} />
                </div>
              )}
              {modal === 'edit' && (
                <div className="form-group">
                  <label>Nueva contraseña (dejar en blanco para no cambiar)</label>
                  <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} minLength={6} />
                </div>
              )}
              <div className="form-group">
                <label>Rol</label>
                <select value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value })}>
                  <option value="admin">Administrador</option>
                  <option value="residente">Residente</option>
                </select>
              </div>
              <div className="form-group">
                <label>Departamento (solo residentes)</label>
                <select value={form.departamento_id} onChange={(e) => setForm({ ...form, departamento_id: e.target.value })}>
                  <option value="">—</option>
                  {departamentos.map((d) => <option key={d.id} value={d.id}>{d.edificio_nombre} - Piso {d.piso} Nº {d.numero}</option>)}
                </select>
              </div>
              {modal === 'edit' && (
                <div className="form-group">
                  <label>
                    <input type="checkbox" checked={!!form.activo} onChange={(e) => setForm({ ...form, activo: e.target.checked ? 1 : 0 })} />
                    Activo
                  </label>
                </div>
              )}
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
