import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  FiUsers,
  FiSearch,
  FiDownload,
  FiPlus,
  FiSlash,
  FiCheckCircle,
  FiXCircle,
  FiUserCheck,
  FiMail,
  FiPhone,
  FiMapPin,
  FiEdit3,
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import adminService from '../../../api/services/adminService';
import { parseApiError } from '../../../utils/parseApiError';
import { formatDate } from '../../../utils/format';
import Button from '../../../components/common/Button';
import DataTable from '../../../components/common/DataTable';
import Badge from '../../../components/common/Badge';
import Tabs from '../../../components/common/Tabs';
import SidePanel from '../../../components/common/SidePanel';
import Modal from '../../../components/common/Modal';
import DemoBadge from '../../../components/common/DemoBadge';

export const UsersPage = () => {
  const [activeTab, setActiveTab] = useState('TOUS');
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10;
  const [isLoading, setIsLoading] = useState(true);

  // SidePanel
  const [selectedUser, setSelectedUser] = useState(null);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [notesAdminInput, setNotesAdminInput] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  // Modal suspension
  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [motifSuspension, setMotifSuspension] = useState('');
  const [isActionLoading, setIsActionLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await adminService.getUsers({
        page,
        size: pageSize,
        role: activeTab === 'EN_ATTENTE_VERIFICATION' ? '' : activeTab,
        statut: activeTab === 'EN_ATTENTE_VERIFICATION' ? 'EN_ATTENTE_VERIFICATION' : '',
        search,
      });

      const list = res?.content || (Array.isArray(res) ? res : []);
      setUsers(list);
      setTotalElements(res?.totalElements ?? list.length);
    } catch (err) {
      parseApiError(err);
    } finally {
      setIsLoading(false);
    }
  }, [page, activeTab, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleOpenDetail = (user) => {
    setSelectedUser(user);
    setNotesAdminInput(user.notesAdmin || '');
    setIsSidePanelOpen(true);
  };

  const handleSaveNotes = async () => {
    if (!selectedUser) return;
    setIsSavingNotes(true);
    try {
      await adminService.updateNotesAdmin(selectedUser.id, notesAdminInput);
      toast.success('Notes administratives mises à jour.');
      setSelectedUser((prev) => ({ ...prev, notesAdmin: notesAdminInput }));
      fetchUsers();
    } catch (err) {
      parseApiError(err);
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handleSuspendre = async () => {
    if (!selectedUser) return;
    setIsActionLoading(true);
    try {
      await adminService.suspendreUser(selectedUser.id, motifSuspension);
      toast.warning(`Compte de ${selectedUser.nom} suspendu.`);
      setSuspendModalOpen(false);
      setMotifSuspension('');
      fetchUsers();
      setIsSidePanelOpen(false);
    } catch (err) {
      parseApiError(err);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleReactiver = async (user) => {
    setIsActionLoading(true);
    try {
      await adminService.reactiverUser(user.id);
      toast.success(`Compte de ${user.nom} réactivé.`);
      fetchUsers();
      if (selectedUser?.id === user.id) {
        setSelectedUser((prev) => ({ ...prev, statutUser: 'ACTIF' }));
      }
    } catch (err) {
      parseApiError(err);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleExportCsv = async () => {
    try {
      const blob = await adminService.exportUsersCsv();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `utilisateurs-${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Export CSV téléchargé.');
    } catch (err) {
      parseApiError(err);
    }
  };

  const columns = [
    {
      key: 'id',
      header: 'ID',
      width: '70px',
      render: (val) => <strong>#{val}</strong>,
    },
    {
      key: 'utilisateur',
      header: 'Utilisateur',
      render: (_, row) => (
        <div>
          <strong style={{ fontSize: 14, color: '#1A202C' }}>
            {row.prenom} {row.nom}
          </strong>
          <div style={{ fontSize: 11, color: '#718096' }}>{row.email}</div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Rôle',
      width: '130px',
      render: (val) => <Badge status={val} />,
    },
    {
      key: 'telephone',
      header: 'Contact',
      render: (val, row) => (
        <div style={{ fontSize: 12, color: '#4A5568' }}>
          <div>{val || '—'}</div>
          <div style={{ fontSize: 11, color: '#718096' }}>{row.ville || 'Maroc'}</div>
        </div>
      ),
    },
    {
      key: 'statutUser',
      header: 'Statut compte',
      width: '140px',
      render: (val) => <Badge status={val} />,
    },
    {
      key: 'createdAt',
      header: 'Inscrit le',
      render: (val) => formatDate(val),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
          <Button variant="outline" size="sm" onClick={() => handleOpenDetail(row)}>
            Gérer
          </Button>

          {row.statutUser === 'SUSPENDU' && (
            <Button
              variant="secondary"
              size="sm"
              icon={<FiCheckCircle />}
              onClick={() => handleReactiver(row)}
            >
              Réactiver
            </Button>
          )}
        </div>
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
              Gestion des Utilisateurs
            </h1>
            <DemoBadge />
          </div>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#718096' }}>
            Contrôlez les accès, modérez les comptes suspects et auditez la conformité des profils.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="outline" size="md" icon={<FiDownload />} onClick={handleExportCsv}>
            Exporter CSV
          </Button>
          <Link to="/admin/users/new" style={{ textDecoration: 'none' }}>
            <Button variant="primary" size="md" icon={<FiPlus />}>
              Créer un compte
            </Button>
          </Link>
        </div>
      </div>

      {/* ONGLETS RÔLES */}
      <Tabs
        tabs={[
          { id: 'TOUS', label: 'Tous les comptes' },
          { id: 'TRANSPORTEUR', label: 'Transporteurs' },
          { id: 'EXPEDITEUR', label: 'Expéditeurs' },
          { id: 'ADMIN', label: 'Administrateurs' },
          { id: 'EN_ATTENTE_VERIFICATION', label: 'En attente de validation' },
        ]}
        activeTab={activeTab}
        onChange={(tabId) => {
          setActiveTab(tabId);
          setPage(0);
        }}
      />

      {/* RECHERCHE */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 360 }}>
          <FiSearch size={15} style={{ position: 'absolute', left: 12, top: 11, color: '#718096' }} />
          <input
            type="text"
            className="st-input"
            style={{ paddingLeft: 36 }}
            placeholder="Rechercher par nom, email, ville..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* TABLEAU */}
      <DataTable
        columns={columns}
        data={users}
        isLoading={isLoading}
        pagination={{
          page,
          pageSize,
          totalElements,
          onPageChange: (newPage) => setPage(newPage),
        }}
        emptyMessage="Aucun utilisateur ne correspond à ce filtre."
      />

      {/* SIDEPANEL DÉTAIL UTILISATEUR */}
      <SidePanel
        isOpen={isSidePanelOpen}
        onClose={() => setIsSidePanelOpen(false)}
        title={selectedUser ? `${selectedUser.prenom} ${selectedUser.nom}` : 'Profil'}
        subtitle={`Rôle : ${selectedUser?.role || ''} • ID #${selectedUser?.id || ''}`}
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            {selectedUser?.statutUser === 'ACTIF' ? (
              <Button
                variant="danger"
                icon={<FiSlash />}
                onClick={() => setSuspendModalOpen(true)}
              >
                Suspendre le compte
              </Button>
            ) : (
              <Button
                variant="secondary"
                icon={<FiCheckCircle />}
                onClick={() => handleReactiver(selectedUser)}
                isLoading={isActionLoading}
              >
                Réactiver le compte
              </Button>
            )}

            <Button variant="outline" onClick={() => setIsSidePanelOpen(false)}>
              Fermer
            </Button>
          </div>
        }
      >
        {selectedUser && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* STATUT & RÔLE */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Badge status={selectedUser.statutUser} />
              <Badge status={selectedUser.role} />
            </div>

            {/* COORDONNÉES */}
            <div style={{ backgroundColor: '#F8FAFC', borderRadius: 8, padding: 16, border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#718096', textTransform: 'uppercase' }}>
                Coordonnées de contact
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
                <FiMail color="#718096" />
                <span>{selectedUser.email}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
                <FiPhone color="#718096" />
                <span>{selectedUser.telephone || 'Non renseigné'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
                <FiMapPin color="#718096" />
                <span>{selectedUser.ville || 'Maroc'}</span>
              </div>
            </div>

            {/* NOTES ADMINISTRATIVES */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#718096', textTransform: 'uppercase' }}>
                  Notes internes de modération
                </span>
                <Button variant="ghost" size="sm" icon={<FiEdit3 />} onClick={handleSaveNotes} isLoading={isSavingNotes}>
                  Enregistrer
                </Button>
              </div>
              <textarea
                className="st-textarea"
                rows={4}
                placeholder="Ajouter une note administrative sur cet utilisateur..."
                value={notesAdminInput}
                onChange={(e) => setNotesAdminInput(e.target.value)}
              />
            </div>

            {/* LIEN VÉRIFICATION SI DOSSIER DÉPOSÉ */}
            {selectedUser.statutUser === 'EN_ATTENTE_VERIFICATION' && (
              <div style={{ padding: 14, backgroundColor: '#FFFBEB', borderRadius: 6, border: '1px solid #FDE68A', fontSize: 13, color: '#92400E' }}>
                <p style={{ margin: '0 0 6px 0', fontWeight: 600 }}>Dossier documentaire en attente d'approbation</p>
                <Link to="/admin/verifications" style={{ color: '#0D9488', fontWeight: 700 }}>
                  Accéder à la file de vérification →
                </Link>
              </div>
            )}
          </div>
        )}
      </SidePanel>

      {/* MODAL SUSPENSION */}
      <Modal
        isOpen={suspendModalOpen}
        onClose={() => setSuspendModalOpen(false)}
        title="Suspendre l'utilisateur"
        subtitle={`Cette action bloquera immédiatement les accès de ${selectedUser?.prenom} ${selectedUser?.nom}.`}
        actions={
          <>
            <Button variant="outline" onClick={() => setSuspendModalOpen(false)}>
              Annuler
            </Button>
            <Button variant="danger" onClick={handleSuspendre} isLoading={isActionLoading}>
              Confirmer la suspension
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <label className="st-label required">Motif de suspension</label>
          <textarea
            className="st-textarea"
            rows={3}
            placeholder="Ex : Non-respect des engagements de livraison, documents expirés..."
            value={motifSuspension}
            onChange={(e) => setMotifSuspension(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
};

export default UsersPage;