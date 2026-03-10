import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import api from '../../api/client';

export default function VencimientosScreen() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dias, setDias] = useState(30);

  const load = async () => {
    try {
      const data = await api(`/expensas/vencimientos?dias=${dias}`);
      setItems(data);
    } catch (e) {
      setItems([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, [dias]);

  const onRefresh = () => { setRefreshing(true); load(); };

  if (loading && items.length === 0) {
    return <View style={styles.centered}><Text style={styles.muted}>Cargando...</Text></View>;
  }

  const renderItem = ({ item }) => (
    <View style={[styles.card, item.pagado === 0 && styles.cardUrgent]}>
      <View style={styles.cardRow}>
        <Text style={styles.badge}>{item.tipo}</Text>
        <Text style={item.pagado ? styles.badgeOk : styles.badgePending}>
          {item.pagado ? 'Pagado' : 'Pendiente'}
        </Text>
      </View>
      <Text style={styles.cardTitle}>{item.edificio_nombre} - Piso {item.piso} Nº {item.numero}</Text>
      <Text style={styles.muted}>Período: {item.periodo_mes}/{item.periodo_anio} · Vence: {item.fecha_vencimiento}</Text>
      <Text style={styles.monto}>${Number(item.monto).toLocaleString('es-AR')}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(i) => `${i.tipo}-${i.id}`}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<Text style={styles.muted}>No hay vencimientos en el período.</Text>}
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
  cardUrgent: { borderLeftWidth: 4, borderLeftColor: '#b7791f' },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  badge: { fontSize: 12, color: '#718096', backgroundColor: '#e2e8f0', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  badgeOk: { fontSize: 12, color: '#276749', fontWeight: '600' },
  badgePending: { fontSize: 12, color: '#b7791f', fontWeight: '600' },
  cardTitle: { fontWeight: '600', color: '#2d3748', marginBottom: 4 },
  muted: { fontSize: 14, color: '#718096', textAlign: 'center', padding: 24 },
  monto: { fontWeight: '600', marginTop: 8, fontSize: 16 },
});
