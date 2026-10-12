import React, { useState, useEffect, useCallback } from 'react';
import {
  FiCheckSquare,
  FiFileText,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiUser,
  FiPhone,
  FiMail,
  FiEye,
  FiShield,
  FiAlertCircle,
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import adminService from '../../api/services/adminService';
import { parseApiError } from '../../utils/parseApiError';
import { formatDate } from '../../utils/format';
import Button from '../../components/common/Button';
import DataTable from '../../components/common/DataTable';
import Badge from '../../components/common/Badge';
import Tabs from '../../components/common/Tabs';
import Modal from '../../components/common/Modal';
import DemoBadge from '../../components/common/DemoBadge';

const MOTIFS_REJET = [
  { id: 'CIN_ILLISIBLE', label: 'Carte d’identité (CIN) illisible ou tronquée' },
  { id: 'RC_NON_CONFORME', label: 'Registre de commerce (RC) non conforme ou obsolète' },
  { id: 'ASSURANCE_EXPIREE', label: 'Police d’assurance marchandises expirée' },
  { id: 'CARTE_GRISE_MANQUANTE', label: 'Carte grise ou visite technique manquante' },
  { id: 'AUTRE', label: 'Autre motif administratif' },
];

export const AdminVerificationsPage = () => {
  const [activeTab, setActiveTab] = useState('EN_ATTENTE');
  const [verifications, setVerifications] = useState([]);
  const [page, setPage] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10;
  const [isLoading, setIsLoading] = useState(true);

  // Modal d'audit documentaire
  const [selectedDossier, setSelectedDossier] = useState(null);
  const [auditModalOpen, setAuditModalOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Modal de rejet
  const [rejetModalOpen, setRejetModalOpen] = useState(false);
  const [motifRejet, setMotifRejet] = useState('CIN_ILLISIBLE');
  const [messageRejet, setMessageRejet] = useState('');

  const fetchVerifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await adminService.getVerifications({
        page,
        size: pageSize,
        statut: activeTab,
      });

      const list = res?.content || (Array.isArray(res) ? res : []);
      setVerifications(list);
      setTotalElements(res?.totalElements ?? list.length);
    } catch (err) {
      parseApiError(err);
    } finally {
      setIsLoading(false);
    }
  }, [page, activeTab]);

  useEffect(() => {
    fetchVerifications();
  }, [fetchVerifications]);

  const handleOpenAudit = (dossier) => {
    setSelectedDossier(dossier);
    setAuditModalOpen(true);
  };

  const handleValiderDoc = async (docId) => {
    try {
      await adminService.validerDocument(docId);
      toast.success('Document validé.');
      setSelectedDossier((prev) => ({
        ...prev,
        documents: prev.documents.map((d) => (d.id === docId ? { ...d, statut: 'VALIDE' } : d)),
      }));
    } catch (err) {
      parseApiError(err);
    }
  };

  const handleRejeterDoc = async (docId) => {
    try {
      await adminService.rejeterDocument(docId, 'Non conforme');
      toast.warning('Document marqué comme rejeté.');
      setSelectedDossier((prev) => ({
        ...prev,
        documents: prev.documents.map((d) => (d.id === docId ? { ...d, statut: 'REJETE' } : d)),
      }));
    } catch (err) {
      parseApiError(err);
    }
  };

  const handleApprouverDossier = async () => {
    if (!selectedDossier) return;
    setIsActionLoading(true);
    try {
      await adminService.approuverVerification(selectedDossier.id);
      toast.success(`Dossier de ${selectedDossier.transporteurNom} approuvé avec succès ! Compte activé.`);
      setAuditModalOpen(false);
      fetchVerifications();
    } catch (err) {
      parseApiError(err);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleRejeterDossier = async () => {
    if (!selectedDossier) return;
    setIsActionLoading(true);
    try {
      await adminService.rejeterVerification(selectedDossier.id, {
        motifRejet,
        messageRejet,
      });
      toast.error('Dossier rejeté. Notification transmise au transporteur.');
      setRejetModalOpen(false);
      setAuditModalOpen(false);
      fetchVerifications();
    } catch (err) {
      parseApiError(err);
    } finally {
      setIsActionLoading(false);
    }
  };

  const columns = [
    {
      key: 'id',
      header: 'Dossier',
      width: '90px',
      render: (val) => <strong>#VER-{val}</strong>,
    },
    {
      key: 'transporteurNom',
      header: 'Transporteur & Société',
      render: (val, row) => (
        <div>
          <strong style={{ fontSize: 14, color: '#1A202C' }}>{val}</strong>
          <div style={{ fontSize: 11, color: '#718096' }}>
            {row.transporteurEntreprise || 'Indépendant'} • {row.transporteurEmail}
          </div>
        </div>
      ),
    },
    {
      key: 'documents',
      header: 'Pièces déposées',
      render: (docs) => (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {(docs || []).map((d) => (
            <span
              key={d.id}
              style={{
                fontSize: 10,
                fontWeight: 700,
                padding: '2px 6px',
                borderRadius: 4,
                backgroundColor: d.statut === 'VALIDE' ? '#DCFCE7' : '#F1F5F9',
                color: d.statut === 'VALIDE' ? '#166534' : '#475569',
              }}
            >
              {d.typeDocument}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: 'ancienneteJours',
      header: 'Ancienneté (FIFO)',
      render: (val, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <FiClock color={val > 2 ? '#DC2626' : '#D97706'} size={14} />
          <strong style={{ color: val > 2 ? '#DC2626' : '#1A202C' }}>
            {val ? `${val} j` : '< 24h'}
          </strong>
          <span style={{ fontSize: 11, color: '#718096' }}>({formatDate(row.soumisLe)})</span>
        </div>
      ),
    },
    {
      key: 'statut',
      header: 'Statut',
      width: '130px',
      render: (val) => <Badge status={val} />,
    },
    {
      key: 'actions',
      header: 'Audit',
      align: 'right',
      render: (_, row) => (
        <Button variant="primary" size="sm" icon={<FiEye />} onClick={() => handleOpenAudit(row)}>
          Examiner
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
              File de Vérification des Documents
            </h1>
            <DemoBadge />
          </div>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#718096' }}>
            Audit légal et conformité réglementaire marocaine (CIN, ICE, Registre du Commerce, Assurance marchandises).
          </p>
        </div>
      </div>

      {/* ONGLETS */}
      <Tabs
        tabs={[
          { id: 'EN_ATTENTE', label: 'En attente de revue (FIFO)' },
          { id: 'APPROUVE', label: 'Dossiers approuvés' },
          { id: 'REJETE', label: 'Dossiers rejetés' },
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
        data={verifications}
        isLoading={isLoading}
        pagination={{
          page,
          pageSize,
          totalElements,
          onPageChange: (newPage) => setPage(newPage),
        }}
        emptyMessage="Aucun dossier en attente pour ce statut."
      />

      {/* MODAL AUDIT DOCUMENTAIRE */}
      <Modal
        isOpen={auditModalOpen}
        onClose={() => setAuditModalOpen(false)}
        title={`Audit du dossier : ${selectedDossier?.transporteurNom}`}
        subtitle={`Entreprise : ${selectedDossier?.transporteurEntreprise || 'Indépendant'} • Tél : ${selectedDossier?.transporteurTelephone || ''}`}
        actions={
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <Button
              variant="danger"
              icon={<FiXCircle />}
              onClick={() => setRejetModalOpen(true)}
            >
              Rejeter le dossier
            </Button>

            <div style={{ display: 'flex', gap: 10 }}>
              <Button variant="outline" onClick={() => setAuditModalOpen(false)}>
                Fermer
              </Button>
              <Button
                variant="primary"
                icon={<FiCheckCircle />}
                onClick={handleApprouverDossier}
                isLoading={isActionLoading}
              >
                Approuver & Activer le compte
              </Button>
            </div>
          </div>
        }
      >
        {selectedDossier && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ padding: 12, backgroundColor: '#F8FAFC', borderRadius: 6, border: '1px solid #E2E8F0', fontSize: 13 }}>
              <strong>Notes internes : </strong>
              <span style={{ color: '#4A5568' }}>{selectedDossier.notesInternes || 'Aucune note particulière.'}</span>
            </div>

            <div style={{ fontSize: 13, fontWeight: 700, color: '#1A3A5C', textTransform: 'uppercase' }}>
              Pièces justificatives déposées :
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(selectedDossier.documents || []).map((doc) => (
                <div
                  key={doc.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 12,
                    borderRadius: 6,
                    border: '1px solid #E2E8F0',
                    backgroundColor: '#FFFFFF',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <FiFileText size={20} color="#1A3A5C" />
                    <div>
                      <strong style={{ fontSize: 13 }}>{doc.typeDocument}</strong>
                      <div style={{ fontSize: 11, color: '#718096' }}>{doc.nomFichier}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: 4,
                        backgroundColor: doc.statut === 'VALIDE' ? '#DCFCE7' : doc.statut === 'REJETE' ? '#FEE2E2' : '#FEF3C7',
                        color: doc.statut === 'VALIDE' ? '#166534' : doc.statut === 'REJETE' ? '#991B1B' : '#92400E',
                      }}
                    >
                      {doc.statut}
                    </span>

                    <Button variant="ghost" size="sm" onClick={() => handleValiderDoc(doc.id)} title="Valider ce document">
                      ✓ Valider
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleRejeterDoc(doc.id)} title="Rejeter ce document" style={{ color: '#DC2626' }}>
                      ✕ Rejeter
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL MOTIF REJET */}
      <Modal
        isOpen={rejetModalOpen}
        onClose={() => setRejetModalOpen(false)}
        title="Rejet du dossier d'inscription"
        subtitle="Un email explicatif sera automatiquement envoyé au transporteur pour qu'il puisse corriger ses pièces."
        actions={
          <>
            <Button variant="outline" onClick={() => setRejetModalOpen(false)}>
              Annuler
            </Button>
            <Button variant="danger" onClick={handleRejeterDossier} isLoading={isActionLoading}>
              Confirmer le rejet
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label className="st-label required">Motif principal de rejet</label>
            <select
              className="st-input"
              value={motifRejet}
              onChange={(e) => setMotifRejet(e.target.value)}
            >
              {MOTIFS_REJET.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="st-label required">Message explicatif pour l'utilisateur</label>
            <textarea
              className="st-textarea"
              rows={3}
              placeholder="Ex : La copie de votre carte grise est floue et la date de validité de votre assurance marchandises est expirée..."
              value={messageRejet}
              onChange={(e) => setMessageRejet(e.target.value)}
              required
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminVerificationsPage;
