// API del backend. En desarrollo:
// - Emulador Android: usar http://10.0.2.2:4000/api (localhost del host)
// - Dispositivo físico: usar la IP de tu PC, ej. http://192.168.1.10:4000/api
// - iOS simulador: localhost suele funcionar
export const API_BASE = __DEV__
  ? 'http://localhost:4000/api'
  : 'https://tu-servidor.com/api';
