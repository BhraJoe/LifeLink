import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

function getDefaultApiUrl() {
  const hostUri = Constants.expoConfig?.hostUri;
  const host = hostUri?.replace(/^https?:\/\//, '').split('/')[0].split(':')[0];

  if (Platform.OS === 'web') {
    return 'http://localhost:4000/api';
  }

  if (Platform.OS === 'android' && (!host || host === 'localhost' || host === '127.0.0.1')) {
    return 'http://10.0.2.2:4000/api';
  }

  return `http://${host || 'localhost'}:4000/api`;
}

const API_URL = (process.env.EXPO_PUBLIC_API_URL || getDefaultApiUrl()).replace(/\/$/, '');
const BASE_URL = API_URL.replace(/\/api$/, '');
const TOKEN_KEY = 'lifelink_token';
const USER_KEY = 'lifelink_user';
const AVATAR_FALLBACK = 'https://i.pravatar.cc/120?img=12';

export function getAvatarUri(avatar) {
  if (!avatar) return AVATAR_FALLBACK;
  if (/^https?:\/\//.test(avatar)) return avatar;
  return `${BASE_URL}/uploads/${avatar}`;
}

async function request(path, options = {}) {
  const token = await getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
    });
  } catch (error) {
    if (error?.name === 'AbortError') throw error;
    throw new Error(`Could not reach the LifeLink server at ${API_URL}. Start the backend and check the API URL.`);
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data.message || data.error || 'Something went wrong';
    throw new Error(message);
  }

  return data;
}

export async function login(email, password) {
  const data = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  if (data.token) {
    await AsyncStorage.setItem(TOKEN_KEY, data.token);
  }
  if (data.user) {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(data.user));
  }

  return data;
}

export async function register(fullName, email, phoneNumber, password) {
  const data = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ fullName, email, phoneNumber, password }),
  });

  if (data.token) {
    await AsyncStorage.setItem(TOKEN_KEY, data.token);
  }
  if (data.user) {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(data.user));
  }

  return data;
}

export async function updateUser(updates) {
  const data = await request('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(updates),
  });

  if (data.token) {
    await AsyncStorage.setItem(TOKEN_KEY, data.token);
  }
  if (data.user) {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(data.user));
  }

  return data;
}

export async function uploadAvatar(imageBase64, contentType) {
  const data = await request('/auth/profile/avatar', {
    method: 'POST',
    body: JSON.stringify({ image: imageBase64, contentType }),
  });

  if (data.token) {
    await AsyncStorage.setItem(TOKEN_KEY, data.token);
  }
  if (data.user) {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(data.user));
  }

  return data;
}

export async function forgotPassword(email) {
  return request('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function logout() {
  await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
}

export async function getToken() {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function getUser() {
  try {
    const data = await request('/auth/me');
    if (data?.user) {
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(data.user));
      return data.user;
    }
  } catch {
    const raw = await AsyncStorage.getItem(USER_KEY);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        return null;
      }
    }
  }

  return null;
}

export async function isLoggedIn() {
  const token = await getToken();
  if (!token) return false;

  try {
    const data = await request('/auth/me');
    if (data?.user) {
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(data.user));
      return true;
    }
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
    return false;
  } catch {
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
    return false;
  }
}

export async function getStoredAuth() {
  const [token, user] = await AsyncStorage.multiGet([TOKEN_KEY, USER_KEY]);
  return {
    token: token[1] || null,
    user: user[1] ? JSON.parse(user[1]) : null,
  };
}

export async function getMissingPersons({ status, verifiedOnly, search } = {}) {
  const params = new URLSearchParams();
  if (status) params.set('status', status);
  if (verifiedOnly !== undefined) params.set('verifiedOnly', String(verifiedOnly));
  if (search) params.set('search', search);

  const qs = params.toString();
  const data = await request(`/missing-persons${qs ? `?${qs}` : ''}`);
  return data.missingPersons || [];
}

export async function createMissingPerson(payload) {
  const data = await request('/missing-persons', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return data;
}

export async function createSighting(id, payload) {
  const data = await request(`/missing-persons/${encodeURIComponent(id)}/sighting`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return data;
}

export async function getIncidentById(id) {
  const data = await request(`/incidents/${encodeURIComponent(id)}`);
  return data.incident || null;
}

export async function getIncidents({ type, status, search } = {}) {
  const params = new URLSearchParams();
  if (type) params.set('type', type);
  if (status) params.set('status', status);
  if (search) params.set('search', search);

  const qs = params.toString();
  const data = await request(`/incidents${qs ? `?${qs}` : ''}`);
  return data.incidents || [];
}

export async function searchHospitals(query, options = {}) {
  const params = new URLSearchParams({ q: query });
  const data = await request(`/hospitals/search?${params.toString()}`, {
    signal: options.signal,
  });
  if (!Array.isArray(data.results)) {
    throw new Error('Hospital search service returned an invalid response');
  }
  return data.results;
}

export async function createIncident(payload) {
  const data = await request('/incidents', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return data;
}

export async function updateIncidentStatus(id, status) {
  const data = await request(`/incidents/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
  return data;
}

export async function shareLiveLocation(payload) {
  const data = await request('/sos/live-location', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return data;
}

export async function createSosEvent(payload, options = {}) {
  const data = await request('/sos', {
    method: 'POST',
    body: JSON.stringify(payload),
    signal: options.signal,
  });
  return data.sosEvent;
}

export async function cancelSosEvent(id) {
  const data = await request(`/sos/${encodeURIComponent(id)}/cancel`, {
    method: 'PATCH',
  });
  return data.sosEvent;
}
