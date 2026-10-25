import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  FiMenu,
  FiSearch,
  FiGlobe,
  FiChevronDown,
  FiUser,
  FiLogOut,
  FiExternalLink,
  FiHelpCircle,
  FiRefreshCw,
  FiTruck,
  FiPackage,
  FiShield,
} from 'react-icons/fi';
import { useAuth } from '../../../context/AuthContext';
import Breadcrumb from '../../common/Breadcrumb';
import DemoBadge from '../../common/DemoBadge';
import NotificationDropdown from './NotificationDropdown';

export const AppHeader = ({ onToggleSidebar, onOpenSearch, onOpenShortcuts }) => {
  const { user, logout, loginAsDemoRole } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentLang = i18n.language || 'fr';
  const isRtl = currentLang === 'ar';

  const toggleLanguage = () => {
    const nextLang = currentLang === 'fr' ? 'ar' : 'fr';
    i18n.changeLanguage(nextLang);
  };

  // Fermer le dropdown au clic extérieur
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Détermination automatique du fil d'Ariane selon l'URL
  const getBreadcrumbItems = () => {
    const segments = location.pathname.split('/').filter(Boolean);
    if (segments.length === 0) return [];

    const labelMap = {
      transporteur: t('roles.carrier', 'Transporteur'),
      expediteur: t('roles.shipper', 'Expéditeur'),
      admin: t('roles.admin', 'Administration'),
      dashboard: t('nav.dashboard', 'Tableau de bord'),
      trajets: t('nav.myTrips', 'Mes Trajets'),
      camions: t('nav.myTrucks', 'Mes Camions'),
      cargaisons: t('nav.myCargo', 'Cargaisons'),
      reservations: t('nav.receivedOffers', 'Réservations'),
      revenus: t('nav.earnings', 'Revenus'),
      avis: t('nav.reviews', 'Avis & Réputation'),
      profile: t('nav.profile', 'Mon profil & Paramètres'),
      users: t('nav.users', 'Utilisateurs'),
      verifications: t('nav.verifications', 'Vérifications'),
      litiges: t('nav.disputes', 'Litiges'),
      analytics: t('nav.analytics', 'Analytics'),
      paiements: t('nav.transactions', 'Finances & Paiements'),
      messages: 'Messagerie',
      chat: 'Messagerie',
      favoris: 'Transporteurs favoris',
      abonnements: 'Abonnements & Quotas',
      new: 'Nouveau',
      edit: 'Modification',
      'design-system': 'Design System',
    };

    let curPath = '';
    return segments.map((seg, idx) => {
      curPath += `/${seg}`;
      const isLast = idx === segments.length - 1;
      return {
        label: labelMap[seg] || seg.charAt(0).toUpperCase() + seg.slice(1),
        path: isLast ? null : curPath,
      };
    });
  };

  const initial = (user?.prenom || user?.nom || user?.email || 'U').charAt(0).toUpperCase();
  const fullName = `${user?.prenom || ''} ${user?.nom || ''}`.trim() || user?.email || 'Utilisateur';

  return (
    <header className="st-header">
      {/* SECTION GAUCHE : TOGGLE + FIL D'ARIANE */}
      <div className="st-header-left">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="st-btn-collapse"
          title={t('common.toggleMenu', 'Afficher / Masquer le menu')}
          aria-label="Toggle menu"
        >
          <FiMenu size={16} />
        </button>

        <Breadcrumb items={getBreadcrumbItems()} showHome={true} />
      </div>

      {/* SECTION DROITE : RECHERCHE (CTRL+K), RACCOURCIS, DÉMO, CLOCHE, LANGUE, AVATAR */}
      <div className="st-header-right">
        {/* RECHERCHE GLOBALE RAPIDE */}
        <button
          type="button"
          className="st-search-trigger"
          onClick={onOpenSearch}
          title={t('shortcuts.globalSearch', 'Rechercher partout dans l’application (Ctrl+K)')}
        >
          <FiSearch size={14} />
          <span>{t('common.search', 'Rechercher...')}</span>
          <kbd className="st-kbd">Ctrl+K</kbd>
        </button>

        {/* RACCOURCIS CLAVIER AIDE (?) */}
        <button
          type="button"
          className="st-btn st-btn-ghost st-btn-sm"
          style={{ padding: 6, borderRadius: '50%', color: '#718096' }}
          onClick={onOpenShortcuts}
          title={t('shortcuts.title', 'Raccourcis clavier (?)')}
          aria-label="Shortcuts Help"
        >
          <FiHelpCircle size={18} />
        </button>

        {/* BADGE DÉMO SI MOCK ACTIF */}
        <DemoBadge />

        {/* NOTIFICATIONS TEMPS RÉEL DU BACKEND */}
        <NotificationDropdown />

        {/* TOGGLE LANGUE (FR / AR avec indicateur) */}
        <button
          type="button"
          onClick={toggleLanguage}
          className="st-btn st-btn-outline st-btn-sm"
          style={{
            gap: 5,
            padding: '4px 10px',
            fontSize: 12,
            fontWeight: 600,
            borderColor: '#CBD5E0',
            backgroundColor: isRtl ? '#E8EEF5' : '#FFFFFF',
          }}
          title={isRtl ? 'Passer en Français' : 'التبديل إلى العربية'}
        >
          <FiGlobe size={13} style={{ color: '#1A3A5C' }} />
          <span style={{ color: '#1A3A5C' }}>
            {currentLang.toUpperCase()}
          </span>
        </button>

        {/* MENU PROFIL / AVATAR */}
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="st-btn st-btn-ghost st-btn-sm"
            style={{
              gap: 8,
              padding: '4px 8px',
              borderRadius: 20,
              backgroundColor: dropdownOpen ? '#F0F2F5' : 'transparent',
            }}
            aria-expanded={dropdownOpen}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                backgroundColor: '#1A3A5C',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              {initial}
            </div>
            <span style={{ fontSize: 13, fontWeight: 500, color: '#1A202C' }}>
              {fullName}
            </span>
            <FiChevronDown size={14} color="#718096" />
          </button>

          {dropdownOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                right: isRtl ? 'auto' : 0,
                left: isRtl ? 0 : 'auto',
                width: 220,
                backgroundColor: '#FFFFFF',
                borderRadius: 8,
                border: '1px solid #E2E8F0',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                padding: '6px 0',
                zIndex: 1050,
                textAlign: isRtl ? 'right' : 'left',
              }}
            >
              <div style={{ padding: '8px 16px', borderBottom: '1px solid #E2E8F0' }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#1A202C' }}>
                  {fullName}
                </p>
                <p style={{ margin: 0, fontSize: 11, color: '#718096' }}>
                  {user?.email}
                </p>
                <span
                  style={{
                    display: 'inline-block',
                    fontSize: 10,
                    fontWeight: 700,
                    color: '#1A3A5C',
                    backgroundColor: '#E8EEF5',
                    padding: '1px 6px',
                    borderRadius: 4,
                    marginTop: 4,
                  }}
                >
                  {user?.role}
                </span>
              </div>

              <Link
                to={
                  user?.role === 'ADMIN'
                    ? '/admin/profile'
                    : user?.role === 'TRANSPORTEUR'
                    ? '/transporteur/profile'
                    : '/expediteur/profile'
                }
                onClick={() => setDropdownOpen(false)}
                className="st-btn st-btn-ghost st-btn-sm"
                style={{
                  width: '100%',
                  justifyContent: 'flex-start',
                  padding: '8px 16px',
                  borderRadius: 0,
                }}
              >
                <FiUser size={14} />
                <span>{t('nav.profile', 'Mon profil & paramètres')}</span>
              </Link>

              <Link
                to="/"
                target="_blank"
                onClick={() => setDropdownOpen(false)}
                className="st-btn st-btn-ghost st-btn-sm"
                style={{
                  width: '100%',
                  justifyContent: 'flex-start',
                  padding: '8px 16px',
                  borderRadius: 0,
                }}
              >
                <FiExternalLink size={14} />
                <span>Voir la page publique</span>
              </Link>

              <div style={{ borderTop: '1px solid #E2E8F0', margin: '4px 0' }} />

              <div style={{ padding: '6px 14px' }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 6 }}>
                  Changer de rôle (Test) :
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {user?.role !== 'TRANSPORTEUR' && (
                    <button
                      type="button"
                      onClick={() => {
                        loginAsDemoRole('TRANSPORTEUR');
                        setDropdownOpen(false);
                        navigate('/transporteur/dashboard');
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '5px 8px',
                        borderRadius: 4,
                        border: '1px solid #0D9488',
                        backgroundColor: '#F0FDFA',
                        color: '#0F766E',
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      <FiTruck size={13} /> <span>Transporteur</span>
                    </button>
                  )}
                  {user?.role !== 'EXPEDITEUR' && (
                    <button
                      type="button"
                      onClick={() => {
                        loginAsDemoRole('EXPEDITEUR');
                        setDropdownOpen(false);
                        navigate('/expediteur/dashboard');
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '5px 8px',
                        borderRadius: 4,
                        border: '1px solid #2563EB',
                        backgroundColor: '#EFF6FF',
                        color: '#1D4ED8',
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      <FiPackage size={13} /> <span>Expéditeur</span>
                    </button>
                  )}
                  {user?.role !== 'ADMIN' && (
                    <button
                      type="button"
                      onClick={() => {
                        loginAsDemoRole('ADMIN');
                        setDropdownOpen(false);
                        navigate('/admin/dashboard');
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '5px 8px',
                        borderRadius: 4,
                        border: '1px solid #7C3AED',
                        backgroundColor: '#F5F3FF',
                        color: '#6D28D9',
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      <FiShield size={13} /> <span>Administrateur</span>
                    </button>
                  )}
                </div>
              </div>

              <div style={{ borderTop: '1px solid #E2E8F0', margin: '4px 0' }} />

              <button
                type="button"
                onClick={() => {
                  setDropdownOpen(false);
                  logout();
                }}
                className="st-btn st-btn-ghost st-btn-sm"
                style={{
                  width: '100%',
                  justifyContent: 'flex-start',
                  padding: '8px 16px',
                  borderRadius: 0,
                  color: '#C62828',
                }}
              >
                <FiLogOut size={14} />
                <span>{t('nav.logout', 'Déconnexion')}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
