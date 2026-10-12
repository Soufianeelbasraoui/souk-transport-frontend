import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  FiGrid,
  FiTruck,
  FiInbox,
  FiDollarSign,
  FiStar,
  FiSettings,
  FiPlusCircle,
  FiSearch,
  FiHeart,
  FiUsers,
  FiCheckSquare,
  FiAlertTriangle,
  FiBarChart2,
  FiHelpCircle,
  FiLogOut,
  FiChevronLeft,
  FiChevronRight,
  FiPackage,
  FiCreditCard,
} from 'react-icons/fi';
import { FaShippingFast } from 'react-icons/fa';
import { useAuth } from '../../../context/AuthContext';

export const AppSidebar = ({ isCollapsed, onToggleCollapse }) => {
  const { user, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const role = user?.role || 'TRANSPORTEUR';
  const isRtl = i18n.language === 'ar';

  // Liens de navigation selon le rôle avec clés de traduction
  const navItemsByRole = {
    TRANSPORTEUR: [
      { label: t('nav.dashboard', 'Tableau de bord'), path: '/transporteur/dashboard', icon: FiGrid },
      { label: t('nav.myTrips', 'Mes Trajets'), path: '/transporteur/trajets', icon: FiTruck },
      { label: t('nav.receivedOffers', 'Offres reçues'), path: '/transporteur/reservations', icon: FiInbox },
      { label: t('nav.earnings', 'Revenus'), path: '/transporteur/revenus', icon: FiDollarSign },
      { label: t('nav.myTrucks', 'Mon camion'), path: '/transporteur/camions', icon: FiTruck },
      { label: t('nav.reviews', 'Avis & Réputation'), path: '/transporteur/avis', icon: FiStar },
      { label: t('nav.settings', 'Paramètres'), path: '/transporteur/profile', icon: FiSettings },
    ],
    EXPEDITEUR: [
      { label: t('nav.dashboard', 'Tableau de bord'), path: '/expediteur/dashboard', icon: FiGrid },
      { label: t('nav.newShipment', 'Nouvelle expédition'), path: '/expediteur/cargaisons/new', icon: FiPlusCircle },
      { label: t('nav.myCargo', 'Mes expéditions'), path: '/expediteur/cargaisons', icon: FiPackage },
      { label: t('nav.searchTrips', 'Rechercher trajets'), path: '/expediteur/trajets', icon: FiSearch },
      { label: 'Transporteurs favoris', path: '/expediteur/favoris', icon: FiHeart },
      { label: t('nav.transactions', 'Finances'), path: '/expediteur/paiements', icon: FiCreditCard },
      { label: t('nav.settings', 'Paramètres'), path: '/expediteur/profile', icon: FiSettings },
    ],
    ADMIN: [
      { label: t('nav.dashboard', 'Dashboard'), path: '/admin/dashboard', icon: FiGrid },
      { label: t('nav.users', 'Utilisateurs'), path: '/admin/users', icon: FiUsers },
      { label: t('nav.verifications', 'Vérifications'), path: '/admin/verifications', icon: FiCheckSquare },
      { label: t('nav.transactions', 'Transactions'), path: '/admin/paiements', icon: FiDollarSign },
      { label: t('nav.disputes', 'Litiges'), path: '/admin/litiges', icon: FiAlertTriangle },
      { label: t('nav.analytics', 'Analytics'), path: '/admin/analytics', icon: FiBarChart2 },
      { label: t('nav.settings', 'Paramètres'), path: '/admin/profile', icon: FiSettings },
    ],
  };

  const currentNavItems = navItemsByRole[role] || navItemsByRole.TRANSPORTEUR;

  const initial = (user?.prenom || user?.nom || user?.email || 'U').charAt(0).toUpperCase();
  const fullName = `${user?.prenom || ''} ${user?.nom || ''}`.trim() || user?.email || 'Utilisateur';

  // Inverser la flèche de collapse en mode RTL
  const CollapseIcon = isCollapsed
    ? (isRtl ? FiChevronLeft : FiChevronRight)
    : (isRtl ? FiChevronRight : FiChevronLeft);

  return (
    <aside className={`st-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* BRAND / LOGO */}
      <Link to="/" className="st-sidebar-brand" title="Retour à l'accueil public">
        <div className="st-sidebar-brand-icon">
          <FaShippingFast />
        </div>
        {!isCollapsed && (
          <div className="st-sidebar-brand-text">
            <span>SoukTransport</span>
            <span className="st-sidebar-brand-badge">B2B</span>
          </div>
        )}
      </Link>

      {/* PROFIL UTILISATEUR */}
      <div className="st-sidebar-user">
        <div className="st-avatar">{initial}</div>
        {!isCollapsed && (
          <div className="st-sidebar-user-info">
            <span className="st-sidebar-user-name" title={fullName}>
              {fullName}
            </span>
            <span className="st-sidebar-user-role">{role.toLowerCase()}</span>
          </div>
        )}
      </div>

      {/* NAVIGATION PRINCIPALE */}
      <nav className="st-sidebar-nav">
        {currentNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `st-nav-item ${isActive ? 'active' : ''}`}
              title={isCollapsed ? item.label : undefined}
            >
              <span className="st-nav-icon">
                <Icon />
              </span>
              {!isCollapsed && <span className="st-nav-text">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* FOOTER SIDEBAR (AIDE, COLLAPSE, LOGOUT) */}
      <div className="st-sidebar-footer">
        <a
          href="/#faq"
          target="_blank"
          rel="noopener noreferrer"
          className="st-nav-item"
          title={isCollapsed ? 'Centre d’aide & FAQ' : undefined}
        >
          <span className="st-nav-icon">
            <FiHelpCircle />
          </span>
          {!isCollapsed && <span className="st-nav-text">Aide & FAQ</span>}
        </a>

        <button
          type="button"
          onClick={onToggleCollapse}
          className="st-nav-item"
          style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer' }}
          title={isCollapsed ? 'Agrandir le menu' : 'Réduire le menu'}
        >
          <span className="st-nav-icon">
            <CollapseIcon />
          </span>
          {!isCollapsed && (
            <span className="st-nav-text">Réduire le menu</span>
          )}
        </button>

        <button
          type="button"
          onClick={logout}
          className="st-nav-item"
          style={{
            width: '100%',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#FF8A80',
          }}
          title={isCollapsed ? t('nav.logout', 'Déconnexion') : undefined}
        >
          <span className="st-nav-icon">
            <FiLogOut />
          </span>
          {!isCollapsed && <span className="st-nav-text">{t('nav.logout', 'Déconnexion')}</span>}
        </button>
      </div>
    </aside>
  );
};

export default AppSidebar;
