import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  FiBell,
  FiCheck,
  FiCheckCircle,
  FiDollarSign,
  FiStar,
  FiAlertTriangle,
  FiMessageSquare,
  FiInbox,
} from 'react-icons/fi';
import { useNotifications } from '../../../context/NotificationContext';
import { formatDate } from '../../../utils/format';

// Helper pour formater la date relative
const formatRelativeTime = (dateStr) => {
  if (!dateStr) return '';
  const now = new Date();
  const date = new Date(dateStr);
  const diffSec = Math.floor((now - date) / 1000);

  if (diffSec < 60) return 'À l’instant';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `Il y a ${diffMin} min`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `Il y a ${diffHours} h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Hier';
  if (diffDays < 7) return `Il y a ${diffDays} j`;
  return formatDate(dateStr, { includeTime: false });
};

// Configuration des icônes et couleurs par TypeNotification
const getTypeConfig = (type) => {
  switch (type) {
    case 'OFFRE_RECUE':
    case 'CONTRE_OFFRE':
      return { icon: FiInbox, bg: '#FFF3E0', color: '#F57C00' };
    case 'OFFRE_ACCEPTEE':
      return { icon: FiCheckCircle, bg: '#E8F5E9', color: '#2E7D32' };
    case 'PAIEMENT_RECU':
      return { icon: FiDollarSign, bg: '#E1F5FE', color: '#0288D1' };
    case 'AVIS_RECU':
      return { icon: FiStar, bg: '#FFFDE7', color: '#F9A825' };
    case 'DOCUMENT_EXPIRE':
    case 'LITIGE_OUVERT':
      return { icon: FiAlertTriangle, bg: '#FFEBEE', color: '#C62828' };
    case 'MESSAGE':
      return { icon: FiMessageSquare, bg: '#F3E5F5', color: '#7B1FA2' };
    case 'SYSTEME':
    default:
      return { icon: FiBell, bg: '#E8EEF5', color: '#1A3A5C' };
  }
};

export const NotificationDropdown = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const isRtl = i18n.language === 'ar';

  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('ALL'); // 'ALL' ou 'UNREAD'
  const dropdownRef = useRef(null);

  // Fermer au clic extérieur
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayedNotifications = filter === 'UNREAD'
    ? notifications.filter((n) => !n.lue)
    : notifications;

  const handleNotificationClick = async (notif) => {
    if (!notif.lue) {
      await markAsRead(notif.id);
    }
    setIsOpen(false);
    if (notif.lien) {
      navigate(notif.lien);
    }
  };

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      {/* BOUTON CLOCHE AVEC BADGE EN TEMPS RÉEL */}
      <button
        type="button"
        className="st-btn st-btn-ghost st-btn-sm"
        style={{
          position: 'relative',
          padding: 8,
          borderRadius: '50%',
          backgroundColor: isOpen ? '#F0F2F5' : 'transparent',
          color: unreadCount > 0 ? '#1A3A5C' : '#718096',
        }}
        onClick={() => setIsOpen((prev) => !prev)}
        title="Notifications"
        aria-label="Notifications"
        aria-expanded={isOpen}
      >
        <FiBell size={18} />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: 2,
              right: 2,
              minWidth: 17,
              height: 17,
              padding: '0 4px',
              borderRadius: 10,
              backgroundColor: '#F57C00',
              color: '#FFFFFF',
              fontSize: 10,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* POPOVER DU CENTRE DE NOTIFICATIONS */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: isRtl ? 'auto' : 0,
            left: isRtl ? 0 : 'auto',
            width: 380,
            maxWidth: '90vw',
            backgroundColor: '#FFFFFF',
            borderRadius: 10,
            border: '1px solid #E2E8F0',
            boxShadow: '0 12px 28px -4px rgba(0, 0, 0, 0.15), 0 4px 8px -2px rgba(0, 0, 0, 0.05)',
            zIndex: 1100,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            textAlign: isRtl ? 'right' : 'left',
          }}
        >
          {/* EN-TÊTE DU POPOVER */}
          <div
            style={{
              padding: '12px 16px',
              borderBottom: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#F8FAFC',
              flexDirection: isRtl ? 'row-reverse' : 'row',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexDirection: isRtl ? 'row-reverse' : 'row' }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#1A3A5C' }}>
                Notifications
              </span>
              {unreadCount > 0 && (
                <span
                  style={{
                    backgroundColor: '#E8EEF5',
                    color: '#1A3A5C',
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '1px 7px',
                    borderRadius: 10,
                  }}
                >
                  {unreadCount}
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#0288D1',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: 0,
                }}
              >
                <FiCheck size={13} />
                <span>Tout marquer comme lu</span>
              </button>
            )}
          </div>

          {/* ONGLETS FILTRES : TOUTES / NON LUES */}
          <div
            style={{
              display: 'flex',
              borderBottom: '1px solid #E2E8F0',
              padding: '6px 16px',
              gap: 8,
              backgroundColor: '#FFFFFF',
              flexDirection: isRtl ? 'row-reverse' : 'row',
            }}
          >
            <button
              type="button"
              onClick={() => setFilter('ALL')}
              style={{
                border: 'none',
                background: filter === 'ALL' ? '#E8EEF5' : 'transparent',
                color: filter === 'ALL' ? '#1A3A5C' : '#718096',
                fontWeight: 600,
                fontSize: 12,
                padding: '4px 10px',
                borderRadius: 6,
                cursor: 'pointer',
              }}
            >
              Toutes ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('UNREAD')}
              style={{
                border: 'none',
                background: filter === 'UNREAD' ? '#FFF3E0' : 'transparent',
                color: filter === 'UNREAD' ? '#E65100' : '#718096',
                fontWeight: 600,
                fontSize: 12,
                padding: '4px 10px',
                borderRadius: 6,
                cursor: 'pointer',
              }}
            >
              Non lues ({unreadCount})
            </button>
          </div>

          {/* LISTE DES NOTIFICATIONS */}
          <div style={{ maxHeight: 380, overflowY: 'auto' }}>
            {displayedNotifications.length > 0 ? (
              displayedNotifications.map((notif) => {
                const config = getTypeConfig(notif.type);
                const Icon = config.icon;
                return (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid #F0F2F5',
                      display: 'flex',
                      gap: 12,
                      cursor: 'pointer',
                      backgroundColor: notif.lue ? '#FFFFFF' : '#F7FAFC',
                      transition: 'background-color 0.15s ease',
                      flexDirection: isRtl ? 'row-reverse' : 'row',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#EDF2F7';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = notif.lue ? '#FFFFFF' : '#F7FAFC';
                    }}
                  >
                    {/* ICÔNE THÉMATIQUE */}
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 8,
                        backgroundColor: config.bg,
                        color: config.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 16,
                        flexShrink: 0,
                      }}
                    >
                      <Icon />
                    </div>

                    {/* TEXTE & DÉTAILS */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 6,
                          marginBottom: 2,
                          flexDirection: isRtl ? 'row-reverse' : 'row',
                        }}
                      >
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: notif.lue ? 600 : 700,
                            color: '#1A202C',
                          }}
                        >
                          {notif.titre}
                        </span>

                        <span style={{ fontSize: 11, color: '#A0AEC0', whiteSpace: 'nowrap' }}>
                          {formatRelativeTime(notif.createdAt)}
                        </span>
                      </div>

                      <p
                        style={{
                          margin: 0,
                          fontSize: 12,
                          color: '#4A5568',
                          lineHeight: 1.4,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {notif.contenu}
                      </p>
                    </div>

                    {/* PASTILLE NON LUE */}
                    {!notif.lue && (
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor: '#F57C00',
                          flexShrink: 0,
                          alignSelf: 'center',
                        }}
                        title="Non lue"
                      />
                    )}
                  </div>
                );
              })
            ) : (
              <div style={{ padding: '36px 16px', textAlign: 'center', color: '#718096' }}>
                <FiBell size={28} style={{ opacity: 0.3, marginBottom: 8 }} />
                <div style={{ fontSize: 13, fontWeight: 500 }}>
                  {filter === 'UNREAD' ? 'Toutes les notifications sont lues' : 'Aucune notification reçue'}
                </div>
                <div style={{ fontSize: 11, color: '#A0AEC0', marginTop: 4 }}>
                  Les mises à jour de vos trajets, offres et paiements apparaîtront ici.
                </div>
              </div>
            )}
          </div>

          {/* PIED DE PAGE DU POPOVER */}
          <div
            style={{
              padding: '8px 16px',
              borderTop: '1px solid #E2E8F0',
              backgroundColor: '#F8FAFC',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <span style={{ fontSize: 11, color: '#718096' }}>
              Connecté au service en temps réel de SoukTransport
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
