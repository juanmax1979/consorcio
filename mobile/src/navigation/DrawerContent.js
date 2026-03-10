import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { useAuth } from '../context/AuthContext';

export default function DrawerContent(props) {
  const { user, logout } = useAuth();
  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.user}>
        <Text style={styles.userName}>{user?.nombre} {user?.apellido}</Text>
        <Text style={styles.userEmail} numberOfLines={1}>{user?.email}</Text>
      </View>
      {props.state.routes.map((route, i) => (
        <TouchableOpacity
          key={route.key}
          style={[styles.item, props.state.index === i && styles.itemActive]}
          onPress={() => props.navigation.navigate(route.name)}
        >
          <Text style={[styles.itemText, props.state.index === i && styles.itemTextActive]}>{route.name}</Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity style={styles.logout} onPress={() => logout()}>
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  user: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  userName: { fontWeight: '600', color: '#2d3748' },
  userEmail: { fontSize: 12, color: '#718096', marginTop: 2 },
  item: { padding: 14, paddingLeft: 20 },
  itemActive: { backgroundColor: '#edf2f7' },
  itemText: { color: '#718096', fontSize: 16 },
  itemTextActive: { color: '#2d3748', fontWeight: '600' },
  logout: { marginTop: 16, marginHorizontal: 12, padding: 14, borderRadius: 6, backgroundColor: '#e2e8f0' },
  logoutText: { color: '#2d3748', textAlign: 'center', fontWeight: '600' },
});
