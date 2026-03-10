import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import api from '../../api/client';

export default function AdminHomeScreen() {
  const [stats, setStats] = useState({ edificios: 0, departamentos: 0, expensas: 0, alquileres: 0 });

  useEffect(() => {
    Promise.all([
      api('/edificios').then((r) => r.length),
      api('/departamentos').then((r) => r.length),
      api('/expensas?pendientes=1').then((r) => r.length),
      api('/alquileres?pendientes=1').then((r) => r.length),
    ])
      .then(([edificios, departamentos, expensas, alquileres]) =>
        setStats({ edificios, departamentos, expensas, alquileres })
      )
      .catch(() => {});
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        <View style={styles.card}><Text style={styles.label}>Edificios</Text><Text style={styles.value}>{stats.edificios}</Text></View>
        <View style={styles.card}><Text style={styles.label}>Departamentos</Text><Text style={styles.value}>{stats.departamentos}</Text></View>
        <View style={styles.card}><Text style={styles.label}>Expensas pendientes</Text><Text style={styles.value}>{stats.expensas}</Text></View>
        <View style={styles.card}><Text style={styles.label}>Alquileres pendientes</Text><Text style={styles.value}>{stats.alquileres}</Text></View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f6f8', padding: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 6,
    minWidth: '45%',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  label: { fontSize: 12, color: '#718096' },
  value: { fontSize: 24, fontWeight: '600', marginTop: 4, color: '#2d3748' },
});
