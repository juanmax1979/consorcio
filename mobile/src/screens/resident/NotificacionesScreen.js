import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import api from '../../api/client';

export default function NotificacionesScreen() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const data = await api('/notificaciones');
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

  const marcarLeida = async (id) => {
    try {
      await api(`/notificaciones/${id}/leer`, { method: 'PUT' });
      load();
    } catch (e) {}
  };

  if (loading && list.length === 0) {
    return <View style={styles.centered}><Text style={styles.muted}>Cargando...</Text></View>;
  }

  const renderItem = ({ item }) => (
    <View style={[styles.card, item.leida && styles.cardLeida]}>
      <Text style={styles.titulo}>{item.titulo}</Text>
      {item.mensaje ? <Text style={styles.mensaje}>{item.mensaje}</Text> : null}
      <Text style={styles.fecha}>{new Date(item.created_at).toLocaleString('es-AR')}</Text>
      {!item.leida && (
        <TouchableOpacity style={styles.btnLeida} onPress={() => marcarLeida(item.id)}>
          <Text style={styles.btnLeidaText}>Marcar leída</Text>
        </TouchableOpacity>
      )}
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
        ListEmptyComponent={<Text style={styles.muted}>No hay notificaciones.</Text>}
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
  cardLeida: { opacity: 0.85 },
  titulo: { fontWeight: '600', color: '#2d3748' },
  mensaje: { marginTop: 6, color: '#718096' },
  fecha: { fontSize: 12, color: '#718096', marginTop: 8 },
  btnLeida: { marginTop: 8 },
  btnLeidaText: { color: '#4a5568', fontSize: 14 },
  muted: { textAlign: 'center', padding: 24, color: '#718096' },
});
