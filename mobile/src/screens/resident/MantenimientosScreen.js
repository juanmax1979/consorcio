import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import api from '../../api/client';

const ESTADOS = { pendiente: 'Pendiente', en_curso: 'En curso', completado: 'Completado', cancelado: 'Cancelado' };
const TIPOS = { preventivo: 'Preventivo', correctivo: 'Correctivo', obra: 'Obra' };

export default function MantenimientosScreen() {
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

  if (loading && list.length === 0) {
    return <View style={styles.centered}><Text style={styles.muted}>Cargando...</Text></View>;
  }

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.edificio_nombre}</Text>
      <Text style={styles.tipo}>{TIPOS[item.tipo] || item.tipo}</Text>
      <Text style={styles.desc} numberOfLines={2}>{item.descripcion}</Text>
      <Text style={styles.estado}>{ESTADOS[item.estado] || item.estado} · {item.fecha_solicitud}</Text>
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
        ListEmptyComponent={<Text style={styles.muted}>No hay mantenimientos.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f6f8' },
  list: { padding: 16, paddingBottom: 32 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardTitle: { fontWeight: '600', color: '#2d3748' },
  tipo: { fontSize: 12, color: '#718096', marginTop: 4 },
  desc: { marginTop: 6, color: '#2d3748' },
  estado: { fontSize: 12, color: '#718096', marginTop: 6 },
  muted: { textAlign: 'center', padding: 24, color: '#718096' },
});
