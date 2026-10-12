import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  FiPlus,
  FiDownload,
  FiSearch,
  FiMapPin,
  FiNavigation,
  FiCheckCircle,
  FiXCircle,
  FiPlay,
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import transporteurService from '../../api/services/transporteurService';
import { parseApiError } from '../../utils/parseApiError';
import { formatNumber, formatDate, formatPercent } from '../../utils/format';
import Button from '../../components/common/Button';
import DataTable from '../../components/common/DataTable';
import Badge from '../../components/common/Badge';
import Tabs from '../../components/common/Tabs';
import SidePanel from '../../components/common/SidePanel';
import Modal from '../../components/common/Modal';
import ProgressBar from '../../components/common/ProgressBar';
import DemoBadge from '../../components/common/DemoBadge';

export const MesTrajets = () => {
  const [activeTab, setActiveTab] = useState('TOUS');
  const [search, setSearch] = useState('');
  const [trajets, setTrajets] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [isLoading, setIsLoading] = useState(true);

  const [compteurs, setCompteurs] = useState({});

  // Panneau latéral 480px (SidePanel)
  const [selectedTrajet, setSelectedTrajet] = useState(null);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);

  // Modal d'annulation
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelMotif, setCancelMotif] = useState('');
  const [isActionLoading, setIsActionLoading] = useState(false);

  const fetchTrajets = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await transporteurService.getMesTrajets({
        page,
        size: pageSize,
        statut: activeTab,
      });
      // Extraction robuste pour MesTrajetsPageDto, Page<TrajetDto> ou tableau brut
      const list = res?.content || res?.trajets?.content || (Array.isArray(res) ? res : []);
      const total = res?.totalElements ?? res?.trajets?.totalElements ?? list.length;
      setTrajets(list);
      setTotalElements(total);
      if (res?.compteurs) {
        setCompteurs(res.compteurs);
      }
    } catch (err) {
      parseApiError(err);
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, activeTab]);

  useEffect(() => {
    fetchTrajets();
  }, [fetchTrajets]);

  // Actions de statut
  const handleDemarrer = async (id) => {
    setIsActionLoading(true);
    try {
      await transporteurService.demarrerTrajet(id);
      toast.success('Trajet démarré ! Le suivi GPS est actif.');
      fetchTrajets();
      if (selectedTrajet?.id === id) {
        setSelectedTrajet((prev) => ({ ...prev, statutTrajet: 'EN_COURS' }));
      }
    } catch (err) {
      parseApiError(err);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleTerminer = async (id) => {
    setIsActionLoading(true);
    try {
      await transporteurService.terminerTrajet(id);
      toast.success('Trajet clôturé avec succès.');
      fetchTrajets();
      if (selectedTrajet?.id === id) {
        setSelectedTrajet((prev) => ({ ...prev, statutTrajet: 'TERMINE' }));
      }
    } catch (err) {
      parseApiError(err);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleAnnuler = async () => {
    if (!selectedTrajet) return;
    setIsActionLoading(true);
    try {
      await transporteurService.annulerTrajet(selectedTrajet.id || selectedTrajet.idTrajet, cancelMotif);
      toast.warning('Trajet annulé.');
      setCancelModalOpen(false);
      setCancelMotif('');
      fetchTrajets();
      setIsSidePanelOpen(false);
    } catch (err) {
      parseApiError(err);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleExportCsv = async () => {
    try {
      const blob = await transporteurService.exportMesTrajetsCsv();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `mes-trajets-${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Export CSV téléchargé.');
    } catch (err) {
      parseApiError(err);
    }
  };

  // Filtrage local supplémentaire si recherche texte
  const filteredTrajets = trajets.filter((t) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      t.villeDepart?.toLowerCase().includes(q) ||
      t.villeArrivee?.toLowerCase().includes(q) ||
      t.camionNom?.toLowerCase().includes(q)
    );
  });

  const columns = [
    {
      key: 'id',
      header: 'Réf.',
      width: '100px',
      render: (val, row) => <strong>{row.reference || `#${val || row.idTrajet}`}</strong>,
    },
    {
      key: 'route',
      header: 'Itinéraire',
      render: (_, row) => {
        const camionInfo = row.camionNom || row.typeCamion || (row.camion ? `${row.camion.marque} ${row.camion.modele}` : null);
        return (
          <div>
            <strong style={{ fontSize: 14, color: '#1A202C' }}>
              {row.villeDepart} → {row.villeArrivee}
            </strong>
            {camionInfo && (
              <div style={{ fontSize: 11, color: '#718096' }}>{camionInfo}</div>
            )}
          </div>
        );
      },
    },
    {
      key: 'dateDepart',
      header: 'Date départ',
      render: (val) => formatDate(val),
    },
    {
      key: 'remplissage',
      header: 'Remplissage',
      width: '180px',
      render: (_, row) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <ProgressBar
            value={row.tauxRemplissage || 0}
            color={row.tauxRemplissage > 85 ? '#2E7D32' : '#F57C00'}
            height={6}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#718096' }}>
            <span>{formatPercent(row.tauxRemplissage || 0)}</span>
            <span>{formatNumber(row.poidsDisponible)} kg dispo</span>
          </div>
        </div>
      ),
    },
    {
      key: 'prixKg',
      header: 'Tarif / kg',
      align: 'right',
      render: (_, row) => {
        const val = row.prixParKg ?? row.prixKg ?? row.prix;
        return <strong>{val ? `${val} DH/kg` : 'Sur offre'}</strong>;
      },
    },
    {
      key: 'statutTrajet',
      header: 'Statut',
      width: '130px',
      render: (val) => <Badge status={val} />,
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* HEADER DE LA PAGE */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1A3A5C', margin: 0 }}>
              Mes Trajets
            </h1>
            <DemoBadge />
          </div>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#718096' }}>
            Pilotez vos départs, visualisez le taux de chargement et mettez à jour les statuts.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="outline" size="md" icon={<FiDownload />} onClick={handleExportCsv}>
            Exporter CSV
          </Button>

          <Link to="/transporteur/trajets/new" style={{ textDecoration: 'none' }}>
            <Button variant="secondary" size="md" icon={<FiPlus />}>
              Publier un trajet
            </Button>
          </Link>
        </div>
      </div>

      {/* ONGLETS DE STATUT AVEC COMPTEURS DYNAMIQUES */}
      <Tabs
        tabs={[
          { id: 'TOUS', label: `Tous les trajets${compteurs.TOUS != null ? ` (${compteurs.TOUS})` : ''}` },
          { id: 'PUBLIE', label: `Publiés${compteurs.PUBLIE != null ? ` (${compteurs.PUBLIE})` : ''}` },
          { id: 'EN_COURS', label: `En cours${compteurs.EN_COURS != null ? ` (${compteurs.EN_COURS})` : ''}` },
          { id: 'COMPLET', label: `Complets${compteurs.COMPLET != null ? ` (${compteurs.COMPLET})` : ''}` },
          { id: 'TERMINE', label: `Terminés${compteurs.TERMINE != null ? ` (${compteurs.TERMINE})` : ''}` },
          { id: 'ANNULE', label: `Annulés${compteurs.ANNULE != null ? ` (${compteurs.ANNULE})` : ''}` },
        ]}
        activeTab={activeTab}
        onChange={(tabId) => {
          setActiveTab(tabId);
          setPage(0);
        }}
      />

      {/* BARRE DE RECHERCHE & FILTRE RAPIDE */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 360 }}>
          <FiSearch size={15} style={{ position: 'absolute', left: 12, top: 11, color: '#718096' }} />
          <input
            type="text"
            className="st-input"
            style={{ paddingLeft: 36 }}
            placeholder="Rechercher par ville (départ, arrivée)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* TABLEAU DES TRAJETS */}
      <DataTable
        columns={columns}
        data={filteredTrajets}
        isLoading={isLoading}
        page={page}
        pageSize={pageSize}
        totalElements={totalElements}
        totalPages={Math.ceil(totalElements / pageSize) || 1}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        onRowClick={(row) => {
          setSelectedTrajet(row);
          setIsSidePanelOpen(true);
        }}
      />

      {/* PANNEAU LATÉRAL 480PX (SIDEPANEL) DÉTAIL TRAJET */}
      <SidePanel
        isOpen={isSidePanelOpen}
        onClose={() => setIsSidePanelOpen(false)}
        width={480}
        title={`Trajet #${selectedTrajet?.id || selectedTrajet?.idTrajet}`}
        subtitle={`${selectedTrajet?.villeDepart} → ${selectedTrajet?.villeArrivee}`}
        actions={
          <div style={{ display: 'flex', gap: 8, width: '100%', justifyContent: 'space-between' }}>
            {selectedTrajet?.statutTrajet === 'PUBLIE' && (
              <Button
                variant="primary"
                icon={<FiPlay />}
                onClick={() => handleDemarrer(selectedTrajet?.id || selectedTrajet?.idTrajet)}
                isLoading={isActionLoading}
              >
                Démarrer le trajet
              </Button>
            )}

            {selectedTrajet?.statutTrajet === 'EN_COURS' && (
              <Button
                variant="primary"
                style={{ backgroundColor: '#2E7D32' }}
                icon={<FiCheckCircle />}
                onClick={() => handleTerminer(selectedTrajet?.id || selectedTrajet?.idTrajet)}
                isLoading={isActionLoading}
              >
                Marquer comme Terminé
              </Button>
            )}

            {selectedTrajet?.statutTrajet !== 'TERMINE' && selectedTrajet?.statutTrajet !== 'ANNULE' && (
              <Button
                variant="danger"
                icon={<FiXCircle />}
                onClick={() => setCancelModalOpen(true)}
              >
                Annuler ce trajet
              </Button>
            )}

            <Button variant="outline" onClick={() => setIsSidePanelOpen(false)}>
              Fermer
            </Button>
          </div>
        }
      >
        {selectedTrajet && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* STATUT & ACTIONS RAPIDES */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Badge status={selectedTrajet.statutTrajet} />
              {selectedTrajet.statutTrajet === 'EN_COURS' && (
                <Link
                  to={`/transporteur/suivi/${selectedTrajet.id || selectedTrajet.idTrajet}`}
                  style={{ textDecoration: 'none' }}
                >
                  <Button variant="secondary" size="sm" icon={<FiNavigation />}>
                    Suivi GPS en direct
                  </Button>
                </Link>
              )}
            </div>

            {/* ITINÉRAIRE */}
            <div style={{ backgroundColor: '#F8FAFC', borderRadius: 8, padding: 16, border: '1px solid #E2E8F0' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#718096', textTransform: 'uppercase' }}>
                Itinéraire
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
                <FiMapPin size={18} color="#1A3A5C" />
                <div>
                  <strong style={{ fontSize: 14 }}>{selectedTrajet.villeDepart}</strong>
                  <div style={{ fontSize: 12, color: '#718096' }}>
                    Départ : {formatDate(selectedTrajet.dateDepart)}
                  </div>
                </div>
              </div>
              <div style={{ borderLeft: '2px dashed #CBD5E0', height: 20, marginLeft: 9, margin: '4px 0' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <FiMapPin size={18} color="#F57C00" />
                <div>
                  <strong style={{ fontSize: 14 }}>{selectedTrajet.villeArrivee}</strong>
                  <div style={{ fontSize: 12, color: '#718096' }}>
                    Arrivée prévue : {selectedTrajet.dateArrivee ? formatDate(selectedTrajet.dateArrivee) : 'Estimée'}
                  </div>
                </div>
              </div>
            </div>

            {/* REMPLISSAGE */}
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#718096', textTransform: 'uppercase' }}>
                Capacité & Remplissage
              </span>
              <div style={{ marginTop: 8 }}>
                <ProgressBar
                  value={selectedTrajet.tauxRemplissage || 0}
                  label="Taux d'occupation de la remorque"
                  showLabel={true}
                  color={selectedTrajet.tauxRemplissage > 85 ? '#2E7D32' : '#F57C00'}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
                <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', padding: 12, borderRadius: 6 }}>
                  <span style={{ fontSize: 11, color: '#718096' }}>Poids total camion</span>
                  <strong style={{ display: 'block', fontSize: 14 }}>{formatNumber(selectedTrajet.poidsTotal || 10000)} kg</strong>
                </div>
                <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', padding: 12, borderRadius: 6 }}>
                  <span style={{ fontSize: 11, color: '#718096' }}>Poids encore disponible</span>
                  <strong style={{ display: 'block', fontSize: 14, color: '#2E7D32' }}>
                    {formatNumber(selectedTrajet.poidsDisponible || 0)} kg
                  </strong>
                </div>
              </div>
            </div>

            {/* INFORMATIONS TARIFAIRES */}
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#718096', textTransform: 'uppercase' }}>
                Tarification
              </span>
              <div style={{ marginTop: 8, padding: 12, backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span>Prix fixé au kilogramme</span>
                  <strong>{selectedTrajet.prixKg ? `${selectedTrajet.prixKg} DH / kg` : 'Négociable'}</strong>
                </div>
              </div>
            </div>
          </div>
        )}
      </SidePanel>

      {/* MODAL ANNULATION DE TRAJET */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Annuler ce trajet"
        subtitle="Cette action avertira les expéditeurs ayant réservé une place sur ce trajet."
        actions={
          <>
            <Button variant="outline" onClick={() => setCancelModalOpen(false)}>
              Abandonner
            </Button>
            <Button variant="danger" onClick={handleAnnuler} isLoading={isActionLoading}>
              Confirmer l'annulation
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <label className="st-label required">Motif d'annulation</label>
          <textarea
            className="st-textarea"
            rows={3}
            placeholder="Ex : Panne mécanique survenue avant départ, conditions météo..."
            value={cancelMotif}
            onChange={(e) => setCancelMotif(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
};

export default MesTrajets;