import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE } from '../config';

const TOKEN_KEY = '@consorcio_token';

export async function getToken() {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function setToken(token) {
  try {
    if (token) await AsyncStorage.setItem(TOKEN_KEY, token);
    else await AsyncStorage.removeItem(TOKEN_KEY);
  } catch (e) {
    console.warn(e);
  }
}

export async function api(path, options = {}) {
  const token = await getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = res.status === 204 ? null : await res.json().catch(() => ({}));
  if (res.status === 401) {
    await setToken(null);
    throw new Error('Sesión expirada');
  }
  if (!res.ok) throw new Error(data?.error || data?.message || 'Error');
  return data;
}

export default api;
