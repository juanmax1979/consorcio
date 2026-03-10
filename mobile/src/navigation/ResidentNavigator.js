import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import VencimientosScreen from '../screens/resident/VencimientosScreen';
import ExpensasScreen from '../screens/resident/ExpensasScreen';
import AlquileresScreen from '../screens/resident/AlquileresScreen';
import MasHomeScreen from '../screens/resident/MasHomeScreen';
import MantenimientosScreen from '../screens/resident/MantenimientosScreen';
import NotificacionesScreen from '../screens/resident/NotificacionesScreen';
import MensajesScreen from '../screens/resident/MensajesScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MasStack() {
  return (
    <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#2d3748' }, headerTintColor: '#fff' }}>
      <Stack.Screen name="MasHome" component={MasHomeScreen} options={{ title: 'Más' }} />
      <Stack.Screen name="Mantenimientos" component={MantenimientosScreen} options={{ title: 'Mantenimientos' }} />
      <Stack.Screen name="Notificaciones" component={NotificacionesScreen} options={{ title: 'Notificaciones' }} />
      <Stack.Screen name="Mensajes" component={MensajesScreen} options={{ title: 'Mensajes' }} />
    </Stack.Navigator>
  );
}

export default function ResidentNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#2d3748' },
        headerTintColor: '#fff',
        tabBarActiveTintColor: '#2d3748',
        tabBarInactiveTintColor: '#718096',
      }}
    >
      <Tab.Screen name="Vencimientos" component={VencimientosScreen} options={{ tabBarLabel: 'Vencimientos' }} />
      <Tab.Screen name="Expensas" component={ExpensasScreen} options={{ tabBarLabel: 'Expensas' }} />
      <Tab.Screen name="Alquileres" component={AlquileresScreen} options={{ tabBarLabel: 'Alquileres' }} />
      <Tab.Screen name="Mas" component={MasStack} options={{ tabBarLabel: 'Más', headerShown: false }} />
    </Tab.Navigator>
  );
}
