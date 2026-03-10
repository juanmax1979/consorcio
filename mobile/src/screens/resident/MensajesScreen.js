import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import api from '../../api/client';

export default function MensajesScreen() {
  const [list, setList] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const data = await api('/mensajes');
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

  const openMsg = (m) => {
    setSelected(m);
    if (m.id && !m.leido) api(`/mensajes/${m.id}`).then(setSelected).catch(() => {});
  };

  if (loading && list.length === 0) {
    return <View style={styles.centered}><Text style={styles.muted}>Cargando...</Text></View>;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={list}
        keyExtractor={(i) => String(i.id)}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<Text style={styles.muted}>No hay mensajes.</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.row, selected?.id === item.id && styles.rowSelected]}
            onPress={() => openMsg(item)}
          >
            <View style={styles.cell}>
              <Text style={styles.titulo}>{item.titulo}</Text>
              <Text style={styles.fecha}>{new Date(item.created_at).toLocaleDateString('es-AR')} · {item.enviado_por_nombre}</Text>
              {item.leido === 0 && <Text style={styles.badgeNew}>Nuevo</Text>}
            </View>
          </TouchableOpacity>
        )}
      />
      {selected ? (
        <View style={styles.detail}>
          <Text style={styles.detailTitle}>{selected.titulo}</Text>
          <Text style={styles.detailMeta}>{selected.enviado_por_nombre} · {new Date(selected.created_at).toLocaleString('es-AR')}</Text>
          <Text style={styles.detailBody}>{selected.cuerpo}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f6f8' },
  list: { padding: 16, paddingBottom: 32 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  row: {
    backgroundColor: '#fff',
    padding: 14,
    marginBottom: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  rowSelected: { backgroundColor: '#edf2f7' },
  cell: {},
  titulo: { fontWeight: '600', color: '#2d3748' },
  fecha: { fontSize: 12, color: '#718096', marginTop: 4 },
  badgeNew: { fontSize: 11, color: '#b7791f', marginTop: 4 },
  muted: { textAlign: 'center', padding: 24, color: '#718096' },
  detail: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  detailTitle: { fontWeight: '600', fontSize: 16, color: '#2d3748' },
  detailMeta: { fontSize: 12, color: '#718096', marginTop: 4 },
  detailBody: { marginTop: 12, color: '#2d3748' },
});
