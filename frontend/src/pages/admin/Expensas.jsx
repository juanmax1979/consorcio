import { useState, useEffect } from 'react';
import api from '../../api/client';

export default function Expensas() {
  const [list, setList] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [conceptos, setConceptos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({
    departamento_id: '', concepto_id: '', periodo_mes: new Date().getMonth() + 1, periodo_anio: new Date().getFullYear(),
    monto: '', fecha_vencimiento: '', observaciones: '', pagado: 0, fecha_pago: '',
  });
  const [error, setError] = useState('');
  const [filtroPendientes, setFiltroPendientes] = useState(false);

  function load() {
    const q = filtroPendientes ? '?pendientes=1' : '';
    return api(`/expensas${q}`).then(setList);
  }

  useEffect(() => {
    api('/departamentos').then(setDepartamentos).catch(console.error);
    api('/conceptos-expensa').then(setConceptos).catch(console.error);
  }, []);

  useEffect(() => {
    load().catch(console.error).finally(() => setLoading(false));
  }, [filtroPendientes]);

  const openCreate = () => {
    const now = new Date();
    setForm({
      departamento_id: departamentos[0]?.id || '', concepto_id: '', periodo_mes: now.getMonth() + 1, periodo_anio: now.getFullYear(),
      monto: '', fecha_vencimiento: '', observaciones: '', pagado: 0, fecha_pago: '',
    });
    setModal('create');
    setError('');
  };

  const openEdit = (e) => {
    setForm({
      id: e.id, departamento_id: e.departamento_id, concepto_id: e.concepto_id || '', periodo_mes: e.periodo_mes, periodo_anio: e.periodo_anio,
      monto: e.monto, fecha_vencimiento: e.fecha_vencimiento, observaciones: e.observaciones || '', pagado: e.pagado ? 1 : 0, fecha_pago: e.fecha_pago || '',
    });
    setModal('edit');
    setError('');
  };

  const submit = async (ev) => {
    ev.preventDefault();
    setError('');
    const payload = {
      departamento_id: Number(form.departamento_id),
      concepto_id: form.concepto_id ? Number(form.concepto_id) : null,
      periodo_mes: Number(form.periodo_mes),
      periodo_anio: Number(form.periodo_anio),
      monto: Number(form.monto),
      fecha_vencimiento: form.fecha_vencimiento,
      observaciones: form.observaciones || null,
    };
    try {
      if (modal === 'create') {
        await api('/expensas', { method: 'POST', body: JSON.stringify(payload) });
      } else {
        const updatePayload = { ...payload, pagado: !!form.pagado, fecha_pago: form.fecha_pago || null };
        await api(`/expensas/${form.id}`, { method: 'PUT', body: JSON.stringify(updatePayload) });
      }
      await load();
      setModal(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar esta expensa?')) return;
    try {
      await api(`/expensas/${id}`, { method: 'DELETE' });
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
        <h2 className="page-title">Expensas</h2>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            <input type="checkbox" checked={filtroPendientes} onChange={(e) => setFiltroPendientes(e.target.checked)} />
            Solo pendientes
          </label>
          <button type="button" className="btn btn-primary" onClick={openCreate}>Nueva expensa</button>
        </div>
      </div>
      <div className="card table-wrap">
        {list.length === 0 ? (
          <div className="empty-state">No hay expensas.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Edificio / Depto</th>
                <th>Período</th>
                <th>Concepto</th>
                <th>Vencimiento</th>
                <th>Monto</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {list.map((e) => (
                <tr key={e.id}>
                  <td>{e.edificio_nombre} - {e.piso} {e.numero}</td>
                  <td>{e.periodo_mes}/{e.periodo_anio}</td>
                  <td>{e.concepto_nombre || '—'}</td>
                  <td>{e.fecha_vencimiento}</td>
                  <td>${Number(e.monto).toLocaleString('es-AR')}</td>
                  <td>{e.pagado ? <span className="badge badge-success">Pagado</span> : <span className="badge badge-warning">Pendiente</span>}</td>
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
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <h2>{modal === 'create' ? 'Nueva expensa' : 'Editar expensa'}</h2>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={submit}>
              <div className="form-group">
                <label>Departamento</label>
                <select value={form.departamento_id} onChange={(e) => setForm({ ...form, departamento_id: e.target.value })} required>
                  {departamentos.map((d) => <option key={d.id} value={d.id}>{d.edificio_nombre} - {d.piso} {d.numero}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Concepto</label>
                <select value={form.concepto_id} onChange={(e) => setForm({ ...form, concepto_id: e.target.value })}>
                  <option value="">—</option>
                  {conceptos.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Mes</label>
                  <input type="number" min="1" max="12" value={form.periodo_mes} onChange={(e) => setForm({ ...form, periodo_mes: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Año</label>
                  <input type="number" min="2000" max="2100" value={form.periodo_anio} onChange={(e) => setForm({ ...form, periodo_anio: e.target.value })} required />
                </div>
              </div>
              <div className="form-group">
                <label>Monto</label>
                <input type="number" step="0.01" min="0" value={form.monto} onChange={(e) => setForm({ ...form, monto: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Fecha vencimiento</label>
                <input type="date" value={form.fecha_vencimiento} onChange={(e) => setForm({ ...form, fecha_vencimiento: e.target.value })} required />
              </div>
              {modal === 'edit' && (
                <>
                  <div className="form-group">
                    <label><input type="checkbox" checked={!!form.pagado} onChange={(e) => setForm({ ...form, pagado: e.target.checked ? 1 : 0 })} /> Pagado</label>
                  </div>
                  {form.pagado && (
                    <div className="form-group">
                      <label>Fecha de pago</label>
                      <input type="date" value={form.fecha_pago} onChange={(e) => setForm({ ...form, fecha_pago: e.target.value })} />
                    </div>
                  )}
                </>
              )}
              <div className="form-group">
                <label>Observaciones</label>
                <input value={form.observaciones} onChange={(e) => setForm({ ...form, observaciones: e.target.value })} />
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
