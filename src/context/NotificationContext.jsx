import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import notificationService from '../api/services/notificationService';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Rafraîchir le compteur et la liste récente
  const refreshNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const [count, res] = await Promise.all([
        notificationService.getNonLuesCount(),
        notificationService.getNotifications({ page: 0, size: 10 }),
      ]);
      setUnreadCount(Number(count) || 0);
      setNotifications(res.content || []);
    } catch (err) {
      console.debug('Erreur rafraîchissement notifications:', err);
    }
  }, [isAuthenticated]);

  // Initialisation et rafraîchissement périodique (polling 30s en sécurité)
  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    refreshNotifications();

    const interval = setInterval(() => {
      refreshNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, [isAuthenticated, refreshNotifications]);

  // Souscription au flux SSE temps réel du backend
  useEffect(() => {
    if (!isAuthenticated) return;

    const unsubscribe = notificationService.subscribeToSseStream(
      (newNotif) => {
        // Notification reçue en temps réel depuis Spring Boot !
        setNotifications((prev) => [newNotif, ...prev.filter((n) => n.id !== newNotif.id)]);
        setUnreadCount((prev) => prev + 1);

        // Affichage d'un toast moderne non intrusif
        toast.info(
          <div>
            <div style={{ fontWeight: 600, fontSize: 13 }}>{newNotif.titre}</div>
            <div style={{ fontSize: 12, opacity: 0.9 }}>{newNotif.contenu}</div>
          </div>,
          { autoClose: 4000 }
        );
      },
      () => {
        // Reconnexion gérée ou bascule polling automatique
      }
    );

    return () => unsubscribe();
  }, [isAuthenticated]);

  // Marquer une notification comme lue
  const markAsRead = async (id) => {
    try {
      await notificationService.marquerCommeLue(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, lue: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Erreur marquer comme lue:', err);
    }
  };

  // Marquer toutes les notifications comme lues
  const markAllAsRead = async () => {
    try {
      await notificationService.marquerToutCommeLu();
      setNotifications((prev) => prev.map((n) => ({ ...n, lue: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Erreur marquer tout comme lu:', err);
    }
  };

  const value = {
    notifications,
    unreadCount,
    isLoading,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications doit être utilisé à l’intérieur d’un NotificationProvider');
  }
  return context;
};

export default NotificationContext;
