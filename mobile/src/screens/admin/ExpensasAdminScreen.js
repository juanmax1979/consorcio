import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import api from '../../api/client';

export default function ExpensasAdminScreen() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const data = await api('/expensas');
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
      <View style={styles.cell}>
        <Text style={styles.nombre}>{item.edificio_nombre} - {item.piso} {item.numero}</Text>
        <Text style={styles.muted}>{item.periodo_mes}/{item.periodo_anio} · Vence {item.fecha_vencimiento}</Text>
      </View>
      <Text style={styles.monto}>${Number(item.monto).toLocaleString('es-AR')}</Text>
      <Text style={item.pagado ? styles.badgeOk : styles.badgePending}>{item.pagado ? 'Pagado' : 'Pend.'}</Text>
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
        ListEmptyComponent={<Text style={styles.empty}>No hay expensas.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f6f8' },
  list: { padding: 16, paddingBottom: 32 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 14, marginBottom: 8, borderRadius: 6, borderWidth: 1, borderColor: '#e2e8f0' },
  cell: { flex: 1 },
  nombre: { fontWeight: '600', color: '#2d3748' },
  muted: { fontSize: 12, color: '#718096', marginTop: 4 },
  monto: { marginRight: 12, fontWeight: '600' },
  badgeOk: { color: '#276749', fontSize: 12 },
  badgePending: { color: '#b7791f', fontSize: 12 },
  empty: { textAlign: 'center', padding: 24, color: '#718096' },
});
