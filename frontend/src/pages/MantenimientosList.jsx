import { useState, useEffect } from 'react';
import api from '../api/client';

const ESTADOS = { pendiente: 'Pendiente', en_curso: 'En curso', completado: 'Completado', cancelado: 'Cancelado' };
const TIPOS = { preventivo: 'Preventivo', correctivo: 'Correctivo', obra: 'Obra' };

export default function MantenimientosList() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api('/mantenimientos')
      .then(setList)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ color: 'var(--text-secondary)' }}>Cargando...</p>;

  return (
    <>
      <h2 className="page-title">Mantenimientos</h2>
      <div className="card table-wrap">
        {list.length === 0 ? (
          <div className="empty-state">No hay mantenimientos.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Edificio</th>
                <th>Tipo</th>
                <th>Descripción</th>
                <th>Estado</th>
                <th>Fecha solicitud</th>
                <th>Fecha prevista</th>
              </tr>
            </thead>
            <tbody>
              {list.map((m) => (
                <tr key={m.id}>
                  <td>{m.edificio_nombre}</td>
                  <td>{TIPOS[m.tipo] || m.tipo}</td>
                  <td>{m.descripcion?.slice(0, 60)}{m.descripcion?.length > 60 ? '…' : ''}</td>
                  <td><span className={`badge badge-${m.estado === 'completado' ? 'success' : m.estado === 'cancelado' ? 'danger' : 'neutral'}`}>{ESTADOS[m.estado] || m.estado}</span></td>
                  <td>{m.fecha_solicitud}</td>
                  <td>{m.fecha_prevista || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
