import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import api from '../../api/client';

export default function DepartamentosScreen() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const data = await api('/departamentos');
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
      <Text style={styles.nombre}>{item.edificio_nombre} - Piso {item.piso} Nº {item.numero}</Text>
      {item.metros_cuadrados ? <Text style={styles.muted}>{item.metros_cuadrados} m²</Text> : null}
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
        ListEmptyComponent={<Text style={styles.empty}>No hay departamentos.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f6f8' },
  list: { padding: 16, paddingBottom: 32 },
  row: { backgroundColor: '#fff', padding: 14, marginBottom: 8, borderRadius: 6, borderWidth: 1, borderColor: '#e2e8f0' },
  nombre: { fontWeight: '600', color: '#2d3748' },
  muted: { fontSize: 12, color: '#718096', marginTop: 4 },
  empty: { textAlign: 'center', padding: 24, color: '#718096' },
});
