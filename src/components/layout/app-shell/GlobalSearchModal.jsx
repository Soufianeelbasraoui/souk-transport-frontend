import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  FiSearch,
  FiTruck,
  FiPackage,
  FiDollarSign,
  FiUsers,
  FiHelpCircle,
  FiArrowRight,
  FiArrowLeft,
  FiBarChart2,
  FiCheckSquare,
} from 'react-icons/fi';
import Modal from '../../common/Modal';
import { useAuth } from '../../../context/AuthContext';

export const GlobalSearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const role = user?.role || 'TRANSPORTEUR';
  const isRtl = i18n.language === 'ar';

  useEffect(() => {
    if (isOpen) {
      setQuery('');
    }
  }, [isOpen]);

  const quickLinksByRole = {
    TRANSPORTEUR: [
      { title: t('nav.myTrips', 'Mes Trajets'), path: '/transporteur/trajets', icon: FiTruck, desc: 'Consulter et gérer les trajets' },
      { title: t('nav.publishTrip', 'Publier un trajet'), path: '/transporteur/trajets/new', icon: FiTruck, desc: 'Créer une nouvelle liaison' },
      { title: t('nav.receivedOffers', 'Offres reçues'), path: '/transporteur/reservations', icon: FiPackage, desc: 'Réservations et négociations' },
      { title: t('nav.earnings', 'Revenus & finances'), path: '/transporteur/revenus', icon: FiDollarSign, desc: 'Solde et demandes de retrait' },
      { title: t('nav.myTrucks', 'Mon camion'), path: '/transporteur/camions', icon: FiTruck, desc: 'Gestion de la flotte' },
    ],
    EXPEDITEUR: [
      { title: t('nav.searchTrips', 'Rechercher un trajet'), path: '/expediteur/trajets', icon: FiSearch, desc: 'Trouver un transporteur disponible' },
      { title: t('nav.newShipment', 'Nouvelle cargaison'), path: '/expediteur/cargaisons/new', icon: FiPackage, desc: 'Expédier des marchandises' },
      { title: t('nav.myCargo', 'Mes expéditions'), path: '/expediteur/cargaisons', icon: FiPackage, desc: 'Suivre le statut de mes envois' },
      { title: t('nav.transactions', 'Finances & Factures'), path: '/expediteur/paiements', icon: FiDollarSign, desc: 'Consulter mes factures et reçus' },
    ],
    ADMIN: [
      { title: t('nav.users', 'Gestion des Utilisateurs'), path: '/admin/users', icon: FiUsers, desc: 'Comptes transporteurs et expéditeurs' },
      { title: t('nav.verifications', 'Dossiers de vérification'), path: '/admin/verifications', icon: FiCheckSquare, desc: 'Validation CIN, permis, cartes grises' },
      { title: t('nav.disputes', 'Litiges & Médiation'), path: '/admin/litiges', icon: FiHelpCircle, desc: 'Arbitrage et remboursements' },
      { title: t('nav.analytics', 'Analytics & Rapports'), path: '/admin/analytics', icon: FiBarChart2, desc: 'Flux régionaux et volume financier' },
      { title: t('nav.transactions', 'Transactions'), path: '/admin/paiements', icon: FiDollarSign, desc: 'Flux financiers et commissions' },
    ],
  };

  const links = quickLinksByRole[role] || quickLinksByRole.TRANSPORTEUR;

  const filteredLinks = links.filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.desc.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (path) => {
    onClose();
    navigate(path);
  };

  const ArrowIcon = isRtl ? FiArrowLeft : FiArrowRight;

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth={540} title={t('common.searchPlaceholder', 'Recherche rapide')}>
      <div style={{ position: 'relative', marginBottom: 16 }}>
        <FiSearch
          size={16}
          style={{
            position: 'absolute',
            left: isRtl ? 'auto' : 12,
            right: isRtl ? 12 : 'auto',
            top: 12,
            color: '#718096',
          }}
        />
        <input
          type="text"
          autoFocus
          className="st-input"
          style={{
            paddingLeft: isRtl ? 12 : 38,
            paddingRight: isRtl ? 38 : 12,
            fontSize: 14,
            textAlign: isRtl ? 'right' : 'left',
          }}
          placeholder={t('common.searchPlaceholder', 'Rechercher une page, un trajet, une expédition...')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: '#A0AEC0',
            textTransform: 'uppercase',
            textAlign: isRtl ? 'right' : 'left',
          }}
        >
          {t('common.actions', 'Actions et navigation')}
        </span>

        {filteredLinks.length > 0 ? (
          filteredLinks.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                onClick={() => handleSelect(item.path)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  borderRadius: 6,
                  cursor: 'pointer',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  transition: 'all 0.15s ease',
                  flexDirection: isRtl ? 'row-reverse' : 'row',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#F8FAFC';
                  e.currentTarget.style.borderColor = '#CBD5E0';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                  e.currentTarget.style.borderColor = '#E2E8F0';
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    flexDirection: isRtl ? 'row-reverse' : 'row',
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 6,
                      backgroundColor: '#E8EEF5',
                      color: '#1A3A5C',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 16,
                      flexShrink: 0,
                    }}
                  >
                    <Icon />
                  </div>
                  <div style={{ textAlign: isRtl ? 'right' : 'left' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#1A202C' }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: 11, color: '#718096' }}>
                      {item.desc}
                    </div>
                  </div>
                </div>

                <ArrowIcon size={14} color="#A0AEC0" />
              </div>
            );
          })
        ) : (
          <div style={{ padding: '24px 0', textAlign: 'center', color: '#718096', fontSize: 13 }}>
            {t('common.noData', 'Aucun résultat correspondant')}
          </div>
        )}
      </div>

      <div
        style={{
          marginTop: 16,
          paddingTop: 12,
          borderTop: '1px solid #E2E8F0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: 11,
          color: '#718096',
          flexDirection: isRtl ? 'row-reverse' : 'row',
        }}
      >
        <span>
          Astuce : Utilisez les flèches du clavier ou cliquez sur un élément
        </span>
        <kbd className="st-kbd">Échap pour fermer</kbd>
      </div>
    </Modal>
  );
};

export default GlobalSearchModal;
