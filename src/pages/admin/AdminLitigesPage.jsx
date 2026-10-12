import React, { useState, useEffect, useCallback } from 'react';
import {
  FiAlertTriangle,
  FiCheckCircle,
  FiDollarSign,
  FiFileText,
  FiClock,
  FiMessageSquare,
  FiShield,
  FiEye,
  FiHelpCircle,
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import adminService from '../../api/services/adminService';
import { parseApiError } from '../../utils/parseApiError';
import { formatCurrency, formatDate } from '../../utils/format';
import Button from '../../components/common/Button';
import DataTable from '../../components/common/DataTable';
import Badge from '../../components/common/Badge';
import Tabs from '../../components/common/Tabs';
import SidePanel from '../../components/common/SidePanel';
import Modal from '../../components/common/Modal';
import DemoBadge from '../../components/common/DemoBadge';

const DECISIONS = [
  { id: 'REMBOURSEMENT_TOTAL', label: 'Remboursement intégral de l’expéditeur' },
  { id: 'LIBERATION_TRANSPORTEUR', label: 'Libération totale des fonds au transporteur' },
  { id: 'REMBOURSEMENT_PARTIEL', label: 'Remboursement partiel (Partage du montant)' },
  { id: 'ESCALADE', label: 'Escalade vers contentieux juridique' },
];

export const AdminLitigesPage = () => {
  const [activeTab, setActiveTab] = useState('OUVERT');
  const [litiges, setLitiges] = useState([]);
  const [page, setPage] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10;
  const [isLoading, setIsLoading] = useState(true);

  // SidePanel Médiation
  const [selectedLitige, setSelectedLitige] = useState(null);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Modal Décision
  const [decisionModalOpen, setDecisionModalOpen] = useState(false);
  const [decision, setDecision] = useState('REMBOURSEMENT_PARTIEL');
  const [montantRembourse, setMontantRembourse] = useState('');
  const [noteAdmin, setNoteAdmin] = useState('');

  const fetchLitiges = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await adminService.getLitiges({
        page,
        size: pageSize,
        statut: activeTab,
      });

      const list = res?.content || (Array.isArray(res) ? res : []);
      setLitiges(list);
      setTotalElements(res?.totalElements ?? list.length);
    } catch (err) {
      parseApiError(err);
    } finally {
      setIsLoading(false);
    }
  }, [page, activeTab]);

  useEffect(() => {
    fetchLitiges();
  }, [fetchLitiges]);

  const handleOpenDetail = (litige) => {
    setSelectedLitige(litige);
    setIsSidePanelOpen(true);
    if (litige.montantEnJeu) {
      setMontantRembourse(String(litige.montantEnJeu / 2));
    }
  };

  const handlePrendreEnCharge = async () => {
    if (!selectedLitige) return;
    setIsActionLoading(true);
    try {
      await adminService.prendreEnChargeLitige(selectedLitige.id);
      toast.success('Dossier pris en charge pour arbitrage.');
      setSelectedLitige((prev) => ({ ...prev, statut: 'EN_COURS' }));
      fetchLitiges();
    } catch (err) {
      parseApiError(err);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleRendreDecision = async () => {
    if (!selectedLitige || !noteAdmin) {
      toast.error('Veuillez renseigner une note administrative justifiant votre arbitrage.');
      return;
    }

    setIsActionLoading(true);
    try {
      await adminService.rendreDecisionLitige(selectedLitige.id, {
        decision,
        montantRembourse: decision === 'REMBOURSEMENT_PARTIEL' ? Number(montantRembourse) : null,
        noteAdmin,
      });

      toast.success('Décision arbitrale exécutée. Les fonds séquestrés ont été transférés.');
      setDecisionModalOpen(false);
      setIsSidePanelOpen(false);
      setNoteAdmin('');
      fetchLitiges();
    } catch (err) {
      parseApiError(err);
    } finally {
      setIsActionLoading(false);
    }
  };

  const columns = [
    {
      key: 'reference',
      header: 'Réf. Litige',
      width: '120px',
      render: (val, row) => <strong>{val || `LIT-#${row.id}`}</strong>,
    },
    {
      key: 'ouvertParNom',
      header: 'Plaignant & Réclamation',
      render: (val, row) => (
        <div>
          <strong style={{ fontSize: 13, color: '#1A202C' }}>{val}</strong>
          <div style={{ fontSize: 12, color: '#4A5568', marginTop: 2 }}>{row.motif}</div>
        </div>
      ),
    },
    {
      key: 'montantEnJeu',
      header: 'Fonds sous séquestre',
      align: 'right',
      render: (val) => <strong style={{ color: '#D97706' }}>{formatCurrency(val)}</strong>,
    },
    {
      key: 'urgent',
      header: 'Priorité',
      width: '110px',
      render: (isUrgent) => (
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            padding: '3px 8px',
            borderRadius: 4,
            backgroundColor: isUrgent ? '#FEE2E2' : '#F1F5F9',
            color: isUrgent ? '#DC2626' : '#475569',
          }}
        >
          {isUrgent ? 'URGENT' : 'STANDARD'}
        </span>
      ),
    },
    {
      key: 'statut',
      header: 'Statut',
      width: '120px',
      render: (val) => <Badge status={val} />,
    },
    {
      key: 'actions',
      header: 'Arbitrage',
      align: 'right',
      render: (_, row) => (
        <Button variant="primary" size="sm" icon={<FiEye />} onClick={() => handleOpenDetail(row)}>
          Arbitrer
        </Button>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1A3A5C', margin: 0 }}>
              Gestion des Litiges & Arbitrage
            </h1>
            <DemoBadge />
          </div>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#718096' }}>
            Médiation administrative des incidents de transport et libération des fonds sous séquestre.
          </p>
        </div>
      </div>

      {/* ONGLETS */}
      <Tabs
        tabs={[
          { id: 'OUVERT', label: 'Litiges ouverts' },
          { id: 'EN_COURS', label: 'En cours de médiation' },
          { id: 'RESOLU', label: 'Dossiers résolus' },
        ]}
        activeTab={activeTab}
        onChange={(tabId) => {
          setActiveTab(tabId);
          setPage(0);
        }}
      />

      {/* TABLEAU */}
      <DataTable
        columns={columns}
        data={litiges}
        isLoading={isLoading}
        pagination={{
          page,
          pageSize,
          totalElements,
          onPageChange: (newPage) => setPage(newPage),
        }}
        emptyMessage="Aucun litige signalé pour ce statut."
      />

      {/* SIDEPANEL DE MÉDIATION */}
      <SidePanel
        isOpen={isSidePanelOpen}
        onClose={() => setIsSidePanelOpen(false)}
        title={selectedLitige?.reference || 'Détail du litige'}
        subtitle={`Déclaré le ${selectedLitige ? formatDate(selectedLitige.createdAt) : ''}`}
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            {selectedLitige?.statut === 'OUVERT' ? (
              <Button
                variant="secondary"
                icon={<FiShield />}
                onClick={handlePrendreEnCharge}
                isLoading={isActionLoading}
              >
                Prendre en charge
              </Button>
            ) : selectedLitige?.statut === 'EN_COURS' ? (
              <Button
                variant="primary"
                icon={<FiCheckCircle />}
                onClick={() => setDecisionModalOpen(true)}
              >
                Rendre une décision
              </Button>
            ) : null}

            <Button variant="outline" onClick={() => setIsSidePanelOpen(false)}>
              Fermer
            </Button>
          </div>
        }
      >
        {selectedLitige && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* STATUT & SÉQUESTRE */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Badge status={selectedLitige.statut} />
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: 11, color: '#718096' }}>Fonds bloqués</span>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#D97706' }}>
                  {formatCurrency(selectedLitige.montantEnJeu)}
                </div>
              </div>
            </div>

            {/* DESCRIPTION DU LITIGE */}
            <div style={{ backgroundColor: '#FEF2F2', padding: 14, borderRadius: 8, border: '1px solid #FECACA' }}>
              <strong style={{ fontSize: 13, color: '#991B1B' }}>{selectedLitige.motif}</strong>
              <p style={{ margin: '6px 0 0', fontSize: 13, color: '#7F1D1D', lineHeight: 1.5 }}>
                {selectedLitige.description}
              </p>
            </div>

            {/* PREUVES DÉPOSÉES */}
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#718096', textTransform: 'uppercase' }}>
                Preuves et pièces constatées
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                {(selectedLitige.preuves || []).map((preuve, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: 10,
                      backgroundColor: '#F8FAFC',
                      borderRadius: 6,
                      border: '1px solid #E2E8F0',
                      fontSize: 12,
                    }}
                  >
                    <FiFileText color="#1A3A5C" size={16} />
                    <span>{preuve}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* HISTORIQUE DE CONVERSATION */}
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#718096', textTransform: 'uppercase' }}>
                Historique des échanges contradictoires
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
                {(selectedLitige.messages || []).map((msg) => (
                  <div
                    key={msg.id}
                    style={{
                      padding: 12,
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: 6,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#718096' }}>
                      <strong>{msg.auteurNom}</strong>
                      <span>{formatDate(msg.createdAt)}</span>
                    </div>
                    <div style={{ fontSize: 13, color: '#1A202C' }}>{msg.contenu}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </SidePanel>

      {/* MODAL DÉCISION D'ARBITRAGE */}
      <Modal
        isOpen={decisionModalOpen}
        onClose={() => setDecisionModalOpen(false)}
        title="Rendre la décision administrative finale"
        subtitle="Cette décision débloquera immédiatement les fonds du compte séquestre selon vos instructions."
        actions={
          <>
            <Button variant="outline" onClick={() => setDecisionModalOpen(false)}>
              Annuler
            </Button>
            <Button variant="primary" onClick={handleRendreDecision} isLoading={isActionLoading}>
              Confirmer & Exécuter le virement
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label className="st-label required">Issue de l'arbitrage</label>
            <select
              className="st-input"
              value={decision}
              onChange={(e) => setDecision(e.target.value)}
            >
              {DECISIONS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          {decision === 'REMBOURSEMENT_PARTIEL' && (
            <div>
              <label className="st-label required">Montant remboursé à l'expéditeur (MAD)</label>
              <input
                type="number"
                className="st-input"
                value={montantRembourse}
                onChange={(e) => setMontantRembourse(e.target.value)}
              />
              <div style={{ fontSize: 11, color: '#718096', marginTop: 4 }}>
                Le solde restant ({formatCurrency((selectedLitige?.montantEnJeu || 0) - Number(montantRembourse || 0))}) sera libéré au transporteur.
              </div>
            </div>
          )}

          <div>
            <label className="st-label required">Note administrative justifiant la décision</label>
            <textarea
              className="st-textarea"
              rows={3}
              placeholder="Ex : Constat d'avarie contradictoire validé, accord sur prise en charge partagée à 50%..."
              value={noteAdmin}
              onChange={(e) => setNoteAdmin(e.target.value)}
              required
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminLitigesPage;
