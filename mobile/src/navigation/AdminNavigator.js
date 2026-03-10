import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import DrawerContent from './DrawerContent';
import AdminHomeScreen from '../screens/admin/AdminHomeScreen';
import EdificiosScreen from '../screens/admin/EdificiosScreen';
import DepartamentosScreen from '../screens/admin/DepartamentosScreen';
import UsuariosScreen from '../screens/admin/UsuariosScreen';
import ExpensasAdminScreen from '../screens/admin/ExpensasAdminScreen';
import AlquileresAdminScreen from '../screens/admin/AlquileresAdminScreen';
import MantenimientosAdminScreen from '../screens/admin/MantenimientosAdminScreen';
import NotificacionesAdminScreen from '../screens/admin/NotificacionesAdminScreen';
import MensajesAdminScreen from '../screens/admin/MensajesAdminScreen';

const Drawer = createDrawerNavigator();

export default function AdminNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: '#2d3748' },
        headerTintColor: '#fff',
        drawerActiveTintColor: '#2d3748',
        drawerInactiveTintColor: '#718096',
      }}
    >
      <Drawer.Screen name="Inicio" component={AdminHomeScreen} />
      <Drawer.Screen name="Edificios" component={EdificiosScreen} />
      <Drawer.Screen name="Departamentos" component={DepartamentosScreen} />
      <Drawer.Screen name="Usuarios" component={UsuariosScreen} />
      <Drawer.Screen name="Expensas" component={ExpensasAdminScreen} />
      <Drawer.Screen name="Alquileres" component={AlquileresAdminScreen} />
      <Drawer.Screen name="Mantenimientos" component={MantenimientosAdminScreen} />
      <Drawer.Screen name="Notificaciones" component={NotificacionesAdminScreen} />
      <Drawer.Screen name="Mensajes" component={MensajesAdminScreen} />
    </Drawer.Navigator>
  );
}
