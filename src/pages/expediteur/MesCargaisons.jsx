import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  FiPlus,
  FiSearch,
  FiMapPin,
  FiCheckCircle,
  FiPhone,
  FiUser,
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import expediteurService from '../../api/services/expediteurService';
import { parseApiError } from '../../utils/parseApiError';
import { formatCurrency, formatNumber, formatDate } from '../../utils/format';
import Button from '../../components/common/Button';
import DataTable from '../../components/common/DataTable';
import Badge from '../../components/common/Badge';
import Tabs from '../../components/common/Tabs';
import SidePanel from '../../components/common/SidePanel';
import Modal from '../../components/common/Modal';
import DemoBadge from '../../components/common/DemoBadge';

const TYPES_MARCHANDISES = [
  { id: 'GENERAL', label: 'Marchandise Générale' },
  { id: 'ALIMENTAIRE', label: 'Alimentaire / Frais' },
  { id: 'INDUSTRIEL', label: 'Industriel & Machines' },
  { id: 'TEXTILE', label: 'Textile & Confection' },
  { id: 'CONSTRUCTION', label: 'Matériaux de construction' },
  { id: 'AGRICOLE', label: 'Produits Agricoles' },
];

export const MesCargaisons = () => {
  const [activeTab, setActiveTab] = useState('TOUS');
  const [search, setSearch] = useState('');
  const [cargaisons, setCargaisons] = useState([]);
  const [page, setPage] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10;
  const [isLoading, setIsLoading] = useState(true);

  // Panneau latéral (SidePanel)
  const [selectedCargaison, setSelectedCargaison] = useState(null);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);

  // Modal d'ajout de cargaison
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newCargaison, setNewCargaison] = useState({
    description: '',
    typeMarchandise: 'GENERAL',
    poids: '',
    volume: '',
    valeurDeclaree: '',
    villeDepart: 'Casablanca',
    villeArrivee: 'Tanger',
    destinataireNom: '',
    destinataireTelephone: '',
  });

  const fetchCargaisons = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await expediteurService.getMesCargaisons({
        page,
        size: pageSize,
        statut: activeTab,
      });

      const list = res?.content || (Array.isArray(res) ? res : []);
      setCargaisons(list);
      setTotalElements(res?.totalElements ?? list.length);
    } catch (err) {
      parseApiError(err);
    } finally {
      setIsLoading(false);
    }
  }, [page, activeTab]);

  useEffect(() => {
    fetchCargaisons();
  }, [fetchCargaisons]);

  const handleCreateCargaison = async (e) => {
    e.preventDefault();
    if (!newCargaison.description || !newCargaison.poids) {
      toast.error('Veuillez renseigner au moins une description et un poids.');
      return;
    }

    setIsSubmitting(true);
    try {
      await expediteurService.creerCargaison({
        ...newCargaison,
        poids: Number(newCargaison.poids),
        volume: newCargaison.volume ? Number(newCargaison.volume) : null,
        valeurDeclaree: newCargaison.valeurDeclaree ? Number(newCargaison.valeurDeclaree) : null,
      });

      toast.success('Cargaison enregistrée avec succès !');
      setAddModalOpen(false);
      setNewCargaison({
        description: '',
        typeMarchandise: 'GENERAL',
        poids: '',
        volume: '',
        valeurDeclaree: '',
        villeDepart: 'Casablanca',
        villeArrivee: 'Tanger',
        destinataireNom: '',
        destinataireTelephone: '',
      });
      fetchCargaisons();
    } catch (err) {
      parseApiError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmerLivraison = async () => {
    if (!selectedCargaison) return;
    setIsSubmitting(true);
    try {
      await expediteurService.confirmerLivraison(selectedCargaison.id);
      toast.success('Réception confirmée ! Les fonds sont libérés au transporteur.');
      fetchCargaisons();
      setIsSidePanelOpen(false);
    } catch (err) {
      parseApiError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCargaisons = cargaisons.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.reference?.toLowerCase().includes(q) ||
      c.description?.toLowerCase().includes(q) ||
      c.villeDepart?.toLowerCase().includes(q) ||
      c.villeArrivee?.toLowerCase().includes(q)
    );
  });

  const columns = [
    {
      key: 'reference',
      header: 'Réf. Expédition',
      width: '130px',
      render: (val, row) => <strong>{val || `CRG-#${row.id}`}</strong>,
    },
    {
      key: 'description',
      header: 'Marchandise',
      render: (val, row) => (
        <div>
          <strong style={{ fontSize: 13, color: '#1A202C' }}>{val}</strong>
          <div style={{ fontSize: 11, color: '#718096' }}>
            {row.typeMarchandise || 'Générale'} • {formatNumber(row.poids)} kg
          </div>
        </div>
      ),
    },
    {
      key: 'route',
      header: 'Axe logistique',
      render: (_, row) => (
        <div>
          <span style={{ fontSize: 13, fontWeight: 600 }}>
            {row.villeDepart} → {row.villeArrivee}
          </span>
          {row.dateCreation && (
            <div style={{ fontSize: 11, color: '#718096' }}>{formatDate(row.dateCreation)}</div>
          )}
        </div>
      ),
    },
    {
      key: 'valeurDeclaree',
      header: 'Valeur déclarée',
      render: (val) => (val ? formatCurrency(val) : '—'),
    },
    {
      key: 'statut',
      header: 'Statut',
      width: '130px',
      render: (val) => <Badge status={val} />,
    },
    {
      key: 'action',
      header: 'Détails',
      align: 'right',
      render: (_, row) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setSelectedCargaison(row);
            setIsSidePanelOpen(true);
          }}
        >
          Consulter
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
              Mes Cargaisons & Expéditions
            </h1>
            <DemoBadge />
          </div>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#718096' }}>
            Suivez le statut de préparation, l'acheminement en transit et confirmez la livraison de vos colis.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="primary" size="md" icon={<FiPlus />} onClick={() => setAddModalOpen(true)}>
            Nouvelle cargaison
          </Button>
        </div>
      </div>

      {/* ONGLETS */}
      <Tabs
        tabs={[
          { id: 'TOUS', label: 'Toutes les expéditions' },
          { id: 'EN_ATTENTE', label: 'En attente' },
          { id: 'EN_TRANSIT', label: 'En transit' },
          { id: 'LIVREE', label: 'Livrées' },
          { id: 'ANNULEE', label: 'Annulées' },
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
            placeholder="Rechercher par référence, description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* TABLEAU */}
      <DataTable
        columns={columns}
        data={filteredCargaisons}
        isLoading={isLoading}
        pagination={{
          page,
          pageSize,
          totalElements,
          onPageChange: (newPage) => setPage(newPage),
        }}
        emptyMessage="Aucune cargaison trouvée pour ce statut."
      />

      {/* SIDEPANEL DÉTAIL CARGAISON */}
      <SidePanel
        isOpen={isSidePanelOpen}
        onClose={() => setIsSidePanelOpen(false)}
        title={selectedCargaison?.reference || 'Détail de la cargaison'}
        subtitle={`Créée le ${selectedCargaison ? formatDate(selectedCargaison.dateCreation) : ''}`}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, width: '100%' }}>
            {selectedCargaison?.statut === 'EN_TRANSIT' && (
              <Button
                variant="primary"
                icon={<FiCheckCircle />}
                onClick={handleConfirmerLivraison}
                isLoading={isSubmitting}
              >
                Confirmer la bonne réception
              </Button>
            )}
            <Button variant="outline" onClick={() => setIsSidePanelOpen(false)}>
              Fermer
            </Button>
          </div>
        }
      >
        {selectedCargaison && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* STATUT */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Badge status={selectedCargaison.statut} />
              {selectedCargaison.statut === 'EN_ATTENTE' && (
                <Link to={`/expediteur/trajets?depart=${encodeURIComponent(selectedCargaison.villeDepart)}&arrivee=${encodeURIComponent(selectedCargaison.villeArrivee)}`}>
                  <Button variant="secondary" size="sm">
                    Trouver un camion →
                  </Button>
                </Link>
              )}
            </div>

            {/* DESCRIPTION */}
            <div style={{ backgroundColor: '#F8FAFC', padding: 16, borderRadius: 8, border: '1px solid #E2E8F0' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#718096', textTransform: 'uppercase' }}>
                Description de la marchandise
              </span>
              <p style={{ margin: '6px 0 0', fontSize: 14, fontWeight: 600, color: '#1A202C' }}>
                {selectedCargaison.description}
              </p>
            </div>

            {/* ITINÉRAIRE */}
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#718096', textTransform: 'uppercase' }}>
                Liaison géographique
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
                <FiMapPin color="#1A3A5C" size={18} />
                <div>
                  <strong>{selectedCargaison.villeDepart}</strong>
                  <div style={{ fontSize: 12, color: '#718096' }}>Lieu d'enlèvement</div>
                </div>
              </div>
              <div style={{ borderLeft: '2px dashed #CBD5E0', height: 20, marginLeft: 9, margin: '4px 0' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <FiMapPin color="#F57C00" size={18} />
                <div>
                  <strong>{selectedCargaison.villeArrivee}</strong>
                  <div style={{ fontSize: 12, color: '#718096' }}>Destination finale</div>
                </div>
              </div>
            </div>

            {/* SPÉCIFICATIONS PHYSIQUES */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', padding: 12, borderRadius: 6 }}>
                <span style={{ fontSize: 11, color: '#718096' }}>Poids total</span>
                <strong style={{ display: 'block', fontSize: 15, marginTop: 2 }}>
                  {formatNumber(selectedCargaison.poids)} kg
                </strong>
              </div>
              <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', padding: 12, borderRadius: 6 }}>
                <span style={{ fontSize: 11, color: '#718096' }}>Volume estimé</span>
                <strong style={{ display: 'block', fontSize: 15, marginTop: 2 }}>
                  {selectedCargaison.volume ? `${selectedCargaison.volume} m³` : 'Standard'}
                </strong>
              </div>
            </div>

            {/* DESTINATAIRE */}
            {selectedCargaison.destinataireNom && (
              <div style={{ borderTop: '1px solid #EDF2F7', paddingTop: 14 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#718096', textTransform: 'uppercase' }}>
                  Contact destinataire
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8, fontSize: 13 }}>
                  <FiUser color="#718096" />
                  <strong>{selectedCargaison.destinataireNom}</strong>
                </div>
                {selectedCargaison.destinataireTelephone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6, fontSize: 13, color: '#0D9488' }}>
                    <FiPhone />
                    <a href={`tel:${selectedCargaison.destinataireTelephone}`} style={{ color: '#0D9488', textDecoration: 'none' }}>
                      {selectedCargaison.destinataireTelephone}
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </SidePanel>

      {/* MODAL AJOUT DE CARGAISON */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Créer une nouvelle cargaison"
        subtitle="Renseignez les détails de votre marchandise pour pouvoir la réserver ou recevoir des offres."
        actions={
          <>
            <Button variant="outline" onClick={() => setAddModalOpen(false)}>
              Annuler
            </Button>
            <Button variant="primary" onClick={handleCreateCargaison} isLoading={isSubmitting}>
              Enregistrer la cargaison
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateCargaison} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label className="st-label required">Description du colis ou palettes</label>
            <input
              type="text"
              className="st-input"
              placeholder="Ex : 4 palettes de matériel électrique et câbles"
              value={newCargaison.description}
              onChange={(e) => setNewCargaison({ ...newCargaison, description: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="st-label required">Ville de départ</label>
              <input
                type="text"
                className="st-input"
                value={newCargaison.villeDepart}
                onChange={(e) => setNewCargaison({ ...newCargaison, villeDepart: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="st-label required">Ville d'arrivée</label>
              <input
                type="text"
                className="st-input"
                value={newCargaison.villeArrivee}
                onChange={(e) => setNewCargaison({ ...newCargaison, villeArrivee: e.target.value })}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="st-label required">Poids (kg)</label>
              <input
                type="number"
                className="st-input"
                placeholder="Ex : 1200"
                value={newCargaison.poids}
                onChange={(e) => setNewCargaison({ ...newCargaison, poids: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="st-label">Volume (m³)</label>
              <input
                type="number"
                className="st-input"
                placeholder="Ex : 4"
                value={newCargaison.volume}
                onChange={(e) => setNewCargaison({ ...newCargaison, volume: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="st-label">Type de marchandise</label>
              <select
                className="st-input"
                value={newCargaison.typeMarchandise}
                onChange={(e) => setNewCargaison({ ...newCargaison, typeMarchandise: e.target.value })}
              >
                {TYPES_MARCHANDISES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="st-label">Valeur marchande (MAD)</label>
              <input
                type="number"
                className="st-input"
                placeholder="Ex : 35000"
                value={newCargaison.valeurDeclaree}
                onChange={(e) => setNewCargaison({ ...newCargaison, valeurDeclaree: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="st-label">Nom destinataire</label>
              <input
                type="text"
                className="st-input"
                placeholder="Ex : Société Atlas Tanger"
                value={newCargaison.destinataireNom}
                onChange={(e) => setNewCargaison({ ...newCargaison, destinataireNom: e.target.value })}
              />
            </div>
            <div>
              <label className="st-label">Téléphone destinataire</label>
              <input
                type="text"
                className="st-input"
                placeholder="Ex : +212 6 00 00 00 00"
                value={newCargaison.destinataireTelephone}
                onChange={(e) => setNewCargaison({ ...newCargaison, destinataireTelephone: e.target.value })}
              />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MesCargaisons;