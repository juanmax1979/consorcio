import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import api from '../../api/client';

const ESTADOS = { pendiente: 'Pendiente', en_curso: 'En curso', completado: 'Completado', cancelado: 'Cancelado' };

export default function MantenimientosAdminScreen() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const data = await api('/mantenimientos');
      setList(data);
    } catch (e) {
      setList([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);
  const onRefresh = () => { setRefreshing(true); load(); };

  const renderItem = ({ item }) => (
    <View style={styles.row}>
      <Text style={styles.nombre}>{item.edificio_nombre}</Text>
      <Text style={styles.desc} numberOfLines={2}>{item.descripcion}</Text>
      <Text style={styles.muted}>{ESTADOS[item.estado] || item.estado} · {item.fecha_solicitud}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={list}
        keyExtractor={(i) => String(i.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<Text style={styles.empty}>No hay mantenimientos.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f6f8' },
  list: { padding: 16, paddingBottom: 32 },
  row: { backgroundColor: '#fff', padding: 14, marginBottom: 8, borderRadius: 6, borderWidth: 1, borderColor: '#e2e8f0' },
  nombre: { fontWeight: '600', color: '#2d3748' },
  desc: { marginTop: 4, color: '#2d3748' },
  muted: { fontSize: 12, color: '#718096', marginTop: 4 },
  empty: { textAlign: 'center', padding: 24, color: '#718096' },
});
