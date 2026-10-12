import React from 'react';
import { useTranslation } from 'react-i18next';
import { FiSearch, FiHelpCircle, FiGrid, FiTruck, FiPackage, FiDollarSign, FiUsers, FiX } from 'react-icons/fi';
import Modal from '../../common/Modal';

export const ShortcutsHelpModal = ({ isOpen, onClose }) => {
  const { t } = useTranslation();

  const shortcutGroups = [
    {
      group: 'Navigation générale',
      items: [
        { keys: ['Ctrl', 'K'], desc: t('shortcuts.globalSearch', 'Ouvrir la palette de recherche rapide'), icon: FiSearch },
        { keys: ['?'], desc: t('shortcuts.help', 'Afficher l’aide des raccourcis clavier'), icon: FiHelpCircle },
        { keys: ['Échap'], desc: t('shortcuts.closeModal', 'Fermer les modales et tiroirs latéraux'), icon: FiX },
      ],
    },
    {
      group: 'Séquences rapides (G + touche)',
      items: [
        { keys: ['G', 'D'], desc: t('shortcuts.goToDashboard', 'Aller au Tableau de bord'), icon: FiGrid },
        { keys: ['G', 'T'], desc: t('shortcuts.goToTrips', 'Aller aux Trajets'), icon: FiTruck },
        { keys: ['G', 'C'], desc: t('shortcuts.goToCargo', 'Aller aux Cargaisons / Camions'), icon: FiPackage },
        { keys: ['G', 'R'], desc: t('shortcuts.goToEarnings', 'Aller aux Revenus / Réservations'), icon: FiDollarSign },
        { keys: ['G', 'U'], desc: t('shortcuts.goToUsers', 'Aller aux Utilisateurs (Admin)'), icon: FiUsers },
      ],
    },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth={520} title={t('shortcuts.title', 'Raccourcis Clavier')}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {shortcutGroups.map((grp, gIdx) => (
          <div key={gIdx}>
            <h4
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: '#718096',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: 10,
              }}
            >
              {grp.group}
            </h4>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                backgroundColor: '#F8FAFC',
                borderRadius: 8,
                padding: 10,
                border: '1px solid #E2E8F0',
              }}
            >
              {grp.items.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '6px 8px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Icon size={15} style={{ color: '#1A3A5C' }} />
                      <span style={{ fontSize: 13, color: '#2D3748', fontWeight: 500 }}>
                        {item.desc}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      {item.keys.map((k, kIdx) => (
                        <kbd
                          key={kIdx}
                          style={{
                            padding: '3px 8px',
                            fontSize: 11,
                            fontWeight: 700,
                            fontFamily: 'monospace',
                            backgroundColor: '#FFFFFF',
                            color: '#1A3A5C',
                            border: '1px solid #CBD5E0',
                            borderRadius: 4,
                            boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
                          }}
                        >
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        <div style={{ fontSize: 12, color: '#718096', textAlign: 'center', marginTop: 4 }}>
          Astuce : Appuyez sur <kbd style={{ padding: '2px 5px', fontSize: 11 }}>?</kbd> n’importe où dans l’application pour rouvrir cette fenêtre.
        </div>
      </div>
    </Modal>
  );
};

export default ShortcutsHelpModal;
