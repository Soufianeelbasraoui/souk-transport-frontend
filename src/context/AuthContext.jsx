import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import client, { getStoredToken, setStoredToken, removeStoredToken } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialisation à partir du stockage (local ou session)
  useEffect(() => {
    const stored = getStoredToken();
    if (stored) {
      try {
        const decoded = jwtDecode(stored);
        // Vérification d'expiration du token
        if (decoded.exp && decoded.exp * 1000 < Date.now()) {
          removeStoredToken();
          setUser(null);
          setToken(null);
        } else {
          setToken(stored);
          setUser({
            email: decoded.sub,
            nom: decoded.nom || '',
            prenom: decoded.prenom || '',
            role: decoded.role || '',
            userId: decoded.userId || null,
          });
        }
      } catch {
        removeStoredToken();
        setUser(null);
        setToken(null);
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email, password, rememberMe = true) => {
    const response = await client.post('/auth/login', { email, password });
    const data = response.data;
    const receivedToken = data.token;

    if (receivedToken) {
      setStoredToken(receivedToken, rememberMe);
      if (data.refreshToken) {
        if (rememberMe) localStorage.setItem('refreshToken', data.refreshToken);
        else sessionStorage.setItem('refreshToken', data.refreshToken);
      }

      const decoded = jwtDecode(receivedToken);
      const userObj = {
        email: decoded.sub || data.email,
        nom: data.nom || decoded.nom || '',
        prenom: data.prenom || decoded.prenom || '',
        role: data.role || decoded.role || '',
        userId: data.userId || null,
      };
      setToken(receivedToken);
      setUser(userObj);
      return userObj;
    }
    throw new Error("Aucun jeton d'authentification reçu.");
  }, []);

  const registerExpediteur = useCallback(async (formData) => {
    const response = await client.post('/auth/register/expediteur', formData);
    const data = response.data;
    if (data.token) {
      setStoredToken(data.token, true);
      const decoded = jwtDecode(data.token);
      const userObj = {
        email: decoded.sub || data.email,
        nom: data.nom || decoded.nom || '',
        prenom: data.prenom || decoded.prenom || '',
        role: data.role || decoded.role || 'EXPEDITEUR',
        userId: data.userId || null,
      };
      setToken(data.token);
      setUser(userObj);
      return userObj;
    }
    return data;
  }, []);

  const registerTransporteur = useCallback(async (formData) => {
    // Le backend ne renvoie pas de token (compte en attente de validation admin)
    const response = await client.post('/auth/register/transporteur', formData);
    return response.data;
  }, []);

  const DEMO_TOKENS = {
    TRANSPORTEUR: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0cmFuc3BvcnRldXJAc291a3RyYW5zcG9ydC5tYSIsIm5vbSI6IkVsIEZhc3NpIiwicHJlbm9tIjoiTW9oYW1lZCIsInJvbGUiOiJUUkFOU1BPUlRFVVIiLCJ1c2VySWQiOjIsInRyYW5zcG9ydGV1cklkIjoxLCJleHAiOjk5OTk5OTk5OTl9.test',
    EXPEDITEUR: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJleHBlZGl0ZXVyQHNvdWt0cmFuc3BvcnQubWEiLCJub20iOiJCZW5uYW5pIiwicHJlbm9tIjoiS2FyaW0iLCJyb2xlIjoiRVhQRURJVEVVUiIsInVzZXJJZCI6MywiZXhwIjo5OTk5OTk5OTk5fQ.test',
    ADMIN: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbkBzb3VrdHJhbnNwb3J0Lm1hIiwibm9tIjoiQWRtaW4iLCJwcmVub20iOiJQcmluY2lwYWwiLCJyb2xlIjoiQURNSU4iLCJ1c2VySWQiOjEsImV4cCI6OTk5OTk5OTk5OX0.test',
  };

  const loginAsDemoRole = useCallback((roleToLogin) => {
    const targetRole = roleToLogin?.toUpperCase() || 'TRANSPORTEUR';
    const fakeToken = DEMO_TOKENS[targetRole] || DEMO_TOKENS.TRANSPORTEUR;
    const decoded = jwtDecode(fakeToken);
    const userObj = {
      email: decoded.sub,
      nom: decoded.nom || '',
      prenom: decoded.prenom || '',
      role: decoded.role || '',
      userId: decoded.userId || null,
      transporteurId: decoded.transporteurId || null,
    };
    setStoredToken(fakeToken, true);
    setToken(fakeToken);
    setUser(userObj);
    return userObj;
  }, []);

  const logout = useCallback(() => {
    const refreshToken = localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');
    if (refreshToken) {
      // Notification backend facultative
      client.post('/auth/logout', { refreshToken }).catch(() => {});
    }
    removeStoredToken();
    setUser(null);
    setToken(null);
    window.location.href = '/login';
  }, []);

  const hasRole = useCallback(
    (roles) => {
      if (!user || !user.role) return false;
      if (Array.isArray(roles)) return roles.includes(user.role);
      return user.role === roles;
    },
    [user]
  );

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated: !!token && !!user,
    login,
    loginAsDemoRole,
    registerExpediteur,
    registerTransporteur,
    logout,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
