import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://192.168.139.218:4000/api';
const TOKEN_KEY = 'lifelink_token';
const USER_KEY = 'lifelink_user';

async function request(path, options = {}) {
  const token = await getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

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
  const raw = await AsyncStorage.getItem(USER_KEY);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  try {
    const data = await request('/auth/me');
    if (data?.user) {
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(data.user));
      return data.user;
    }
    return null;
  } catch {
    return null;
  }
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
