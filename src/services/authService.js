import { removeStoredToken } from '../api/client';

export const logout = () => {
  removeStoredToken();
  window.location.href = '/login';
};
