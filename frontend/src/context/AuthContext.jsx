import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api, demoFallbackEnabled, isNetworkError, jsonBody } from '../api';

const AuthContext = createContext(null);
const DEMO_USERS_KEY = 'merkato-demo-users';
const DEMO_SESSION_KEY = 'merkato-demo-session';
const PASSWORD_HASH_ITERATIONS = 120000;

function readDemoUsers() {
  try {
    const users = JSON.parse(localStorage.getItem(DEMO_USERS_KEY) || '[]');
    return Array.isArray(users)
      ? users.filter((account) =>
        typeof account?.user?.email === 'string' &&
        ['customer', 'vendor'].includes(account.user.role) &&
        typeof account.salt === 'string' &&
        typeof account.passwordHash === 'string')
      : [];
  } catch (error) {
    console.warn('Could not read offline demo accounts; clearing invalid local data.', error);
    localStorage.removeItem(DEMO_USERS_KEY);
    return [];
  }
}

function toHex(bytes) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function fromHex(value) {
  return Uint8Array.from(value.match(/.{2}/g) || [], (byte) => Number.parseInt(byte, 16));
}

async function hashPassword(password, salt) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  const hash = await crypto.subtle.deriveBits({
    name: 'PBKDF2',
    salt: fromHex(salt),
    iterations: PASSWORD_HASH_ITERATIONS,
    hash: 'SHA-256',
  }, key, 256);
  return toHex(new Uint8Array(hash));
}

function saveDemoSession(user) {
  const demoUser = { ...user, demoMode: true };
  localStorage.removeItem('merkato-token');
  localStorage.setItem(DEMO_SESSION_KEY, 'true');
  localStorage.setItem('merkato-user', JSON.stringify(demoUser));
  return demoUser;
}

async function registerDemoUser(details) {
  const email = details.email.trim().toLowerCase();
  const users = readDemoUsers();
  if (users.some((account) => account.user.email === email)) {
    throw new Error('An offline demo account with this email already exists. Sign in instead.');
  }
  if (typeof crypto === 'undefined' || !crypto.subtle || !crypto.randomUUID) {
    throw new Error('Offline sign-in is not supported by this browser. Reconnect to the marketplace API and try again.');
  }

  const salt = toHex(crypto.getRandomValues(new Uint8Array(16)));
  const user = {
    _id: `demo-${crypto.randomUUID()}`,
    name: details.name.trim(),
    email,
    phone: details.phone.trim(),
    role: details.role,
  };
  users.push({ user, salt, passwordHash: await hashPassword(details.password, salt) });
  localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(users));
  return saveDemoSession(user);
}

async function loginDemoUser(credentials) {
  const email = credentials.email.trim().toLowerCase();
  const account = readDemoUsers().find((entry) => entry.user.email === email);
  if (!account) {
    const name = email.split('@')[0] || 'Offline Admin';
    return saveDemoSession({
      _id: `demo-admin-${encodeURIComponent(email)}`,
      name,
      email,
      phone: '',
      role: 'admin',
    });
  }
  if (typeof crypto === 'undefined' || !crypto.subtle) {
    throw new Error('Offline sign-in is not supported by this browser. Reconnect to the marketplace API and try again.');
  }
  const passwordHash = await hashPassword(credentials.password, account.salt);
  if (passwordHash !== account.passwordHash) {
    throw new Error('Email or password is incorrect.');
  }
  return saveDemoSession(account.user);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('merkato-user') || 'null');
    } catch {
      localStorage.removeItem('merkato-user');
      return null;
    }
  });
  const [loading, setLoading] = useState(Boolean(
    localStorage.getItem('merkato-token') && localStorage.getItem(DEMO_SESSION_KEY) !== 'true',
  ));

  useEffect(() => {
    if (localStorage.getItem(DEMO_SESSION_KEY) === 'true') {
      setLoading(false);
      return;
    }
    if (!localStorage.getItem('merkato-token')) {
      setLoading(false);
      return;
    }
    api('/auth/me')
      .then(({ user: currentUser }) => {
        setUser(currentUser);
        localStorage.setItem('merkato-user', JSON.stringify(currentUser));
      })
      .catch((error) => {
        if (error.status === 401) {
          localStorage.removeItem('merkato-token');
          localStorage.removeItem('merkato-user');
          setUser(null);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(credentials) {
    try {
      const result = await api('/auth/login', { method: 'POST', body: jsonBody(credentials) });
      saveSession(result);
      return result.user;
    } catch (error) {
      if (!demoFallbackEnabled || !isNetworkError(error)) throw error;
      const user = await loginDemoUser(credentials);
      setUser(user);
      return user;
    }
  }

  async function register(details) {
    try {
      const result = await api('/auth/register', { method: 'POST', body: jsonBody(details) });
      saveSession(result);
      return result.user;
    } catch (error) {
      if (!demoFallbackEnabled || !isNetworkError(error)) throw error;
      const user = await registerDemoUser(details);
      setUser(user);
      return user;
    }
  }

  function saveSession(result) {
    localStorage.removeItem(DEMO_SESSION_KEY);
    localStorage.setItem('merkato-token', result.token);
    localStorage.setItem('merkato-user', JSON.stringify(result.user));
    setUser(result.user);
  }

  function logout() {
    localStorage.removeItem('merkato-token');
    localStorage.removeItem('merkato-user');
    localStorage.removeItem(DEMO_SESSION_KEY);
    setUser(null);
  }

  const value = useMemo(() => ({ user, loading, login, register, logout }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
