import axios from 'axios';
import { toast } from 'react-toastify';

/**
 * Récupère le token JWT stocké soit en localStorage, soit en sessionStorage.
 */
export const getStoredToken = () => {
  return localStorage.getItem('token') || sessionStorage.getItem('token') || null;
};

/**
 * Enregistre le token selon le choix "Se souvenir de moi".
 */
export const setStoredToken = (token, rememberMe = true) => {
  if (rememberMe) {
    localStorage.setItem('token', token);
    sessionStorage.removeItem('token');
  } else {
    sessionStorage.setItem('token', token);
    localStorage.removeItem('token');
  }
};

/**
 * Supprime le token de tous les stockages.
 */
export const removeStoredToken = () => {
  localStorage.removeItem('token');
  sessionStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  sessionStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  sessionStorage.removeItem('user');
};

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const client = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur de requête : injection automatique du token Bearer
client.interceptors.request.use(
  (config) => {
    const token = getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur de réponse : gestion centralisée des erreurs 401 et 403
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status } = error.response;
      
      if (status === 401) {
        removeStoredToken();
        if (window.location.pathname !== '/login') {
          toast.warning('Votre session a expiré. Veuillez vous reconnecter.', {
            toastId: 'session-expired',
          });
          window.location.href = '/login';
        }
      } else if (status === 403) {
        // Message spécifique si renvoyé par le backend (ex: compte suspendu ou en attente)
        const backendMessage = error.response.data?.message;
        if (backendMessage && (backendMessage.includes('attente') || backendMessage.includes('suspendu'))) {
          // Laisse l'appelant traiter ou affiche le message précis
          toast.error(backendMessage, { toastId: 'forbidden-account' });
        } else {
          toast.error("Vous n'avez pas l'autorisation d'accéder à cette ressource.", {
            toastId: 'forbidden-resource',
          });
        }
      }
    }
    return Promise.reject(error);
  }
);

export default client;
