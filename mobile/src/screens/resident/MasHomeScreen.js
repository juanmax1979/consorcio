import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function MasHomeScreen({ navigation }) {
  const { logout } = useAuth();
  const items = [
    { name: 'Mantenimientos', screen: 'Mantenimientos' },
    { name: 'Notificaciones', screen: 'Notificaciones' },
    { name: 'Mensajes', screen: 'Mensajes' },
  ];
  return (
    <View style={styles.container}>
      {items.map((item) => (
        <TouchableOpacity
          key={item.screen}
          style={styles.row}
          onPress={() => navigation.navigate(item.screen)}
        >
          <Text style={styles.text}>{item.name}</Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity style={styles.logout} onPress={() => logout()}>
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f6f8', padding: 16 },
  row: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  text: { fontWeight: '600', color: '#2d3748', fontSize: 16 },
  logout: { marginTop: 24, padding: 16, borderRadius: 6, backgroundColor: '#e2e8f0' },
  logoutText: { color: '#2d3748', fontWeight: '600', textAlign: 'center' },
});
