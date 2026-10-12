import React, { useState, useEffect, useCallback } from 'react';
import {
  FiCheck,
  FiX,
  FiDollarSign,
  FiPackage,
  FiMapPin,
  FiClock,
  FiUser,
  FiFilter,
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import transporteurService from '../../api/services/transporteurService';
import { parseApiError } from '../../utils/parseApiError';
import { formatCurrency, formatNumber, formatDate } from '../../utils/format';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Tabs from '../../components/common/Tabs';
import Card from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import EmptyState from '../../components/common/EmptyState';
import Skeleton from '../../components/common/Skeleton';
import DemoBadge from '../../components/common/DemoBadge';

export const OffresRecuesPage = () => {
  const [activeTab, setActiveTab] = useState('TOUS');
  const [offres, setOffres] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal de contre-offre
  const [contreOffreModal, setContreOffreModal] = useState(false);
  const [selectedOffre, setSelectedOffre] = useState(null);
  const [nouveauPrix, setNouveauPrix] = useState('');
  const [motifContreOffre, setMotifContreOffre] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchOffres = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await transporteurService.getMesOffres({
        statut: activeTab,
      });
      setOffres(res.content || []);
    } catch (err) {
      parseApiError(err);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchOffres();
  }, [fetchOffres]);

  const handleAccepter = async (id) => {
    try {
      await transporteurService.accepterOffre(id);
      toast.success('Offre acceptée ! La réservation est confirmée.');
      setOffres((prev) =>
        prev.map((o) => (o.id === id || o.idOffre === id ? { ...o, statutOffre: 'ACCEPTEE' } : o))
      );
    } catch (err) {
      parseApiError(err);
    }
  };

  const handleRefuser = async (id) => {
    try {
      await transporteurService.refuserOffre(id);
      toast.info('Offre refusée.');
      setOffres((prev) =>
        prev.map((o) => (o.id === id || o.idOffre === id ? { ...o, statutOffre: 'REFUSEE' } : o))
      );
    } catch (err) {
      parseApiError(err);
    }
  };

  const handleEnvoyerContreOffre = async () => {
    if (!selectedOffre || !nouveauPrix) return;
    setIsSubmitting(true);
    try {
      const id = selectedOffre.id || selectedOffre.idOffre;
      await transporteurService.contreOffre(id, Number(nouveauPrix), motifContreOffre);
      toast.success(`Contre-offre de ${formatCurrency(nouveauPrix)} envoyée à l'expéditeur.`);
      setOffres((prev) =>
        prev.map((o) =>
          o.id === id || o.idOffre === id
            ? { ...o, statutOffre: 'CONTRE_OFFRE', prixPropose: Number(nouveauPrix) }
            : o
        )
      );
      setContreOffreModal(false);
      setNouveauPrix('');
      setMotifContreOffre('');
    } catch (err) {
      parseApiError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1A3A5C', margin: 0 }}>
              Offres reçues & Négociations
            </h1>
            <DemoBadge />
          </div>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#718096' }}>
            Traitez les demandes de réservation déposées par les expéditeurs sur vos trajets.
          </p>
        </div>
      </div>

      {/* TABS */}
      <Tabs
        tabs={[
          { id: 'TOUS', label: 'Toutes les offres' },
          { id: 'EN_ATTENTE', label: 'En attente' },
          { id: 'CONTRE_OFFRE', label: 'Contre-offres' },
          { id: 'ACCEPTEE', label: 'Acceptées' },
          { id: 'REFUSEE', label: 'Refusées' },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* LISTE DES OFFRES */}
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Skeleton height={100} />
          <Skeleton height={100} />
          <Skeleton height={100} />
        </div>
      ) : offres.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {offres.map((offre) => {
            const id = offre.id || offre.idOffre;
            const isEnAttente = offre.statutOffre === 'EN_ATTENTE';

            return (
              <div
                key={id}
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: 8,
                  padding: 20,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 16,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                }}
              >
                {/* DÉTAILS DE L'OFFRE */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#718096' }}>
                      #{offre.numeroOffre || `OFF-${id}`}
                    </span>
                    <strong style={{ fontSize: 15, color: '#1A202C' }}>
                      {offre.expediteurNom || 'Expéditeur vérifié'}
                    </strong>
                    <Badge status={offre.statutOffre} />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 13, color: '#4A5568' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <FiMapPin size={13} color="#1A3A5C" />
                      {offre.trajetRoute || 'Casablanca → Tanger'}
                    </span>
                    <span>•</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <FiPackage size={13} color="#F57C00" />
                      {formatNumber(offre.poidsKg)} kg ({offre.volumeM3 || 0} m³) - {offre.typeMarchandise}
                    </span>
                  </div>

                  <div style={{ fontSize: 12, color: '#718096' }}>
                    <FiClock size={12} style={{ marginRight: 4 }} />
                    Reçue le {formatDate(offre.dateCreation || new Date().toISOString())}
                  </div>
                </div>

                {/* MONTANT & ACTIONS */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: 11, color: '#718096', textTransform: 'uppercase' }}>
                      Prix proposé
                    </span>
                    <div style={{ fontSize: 20, fontWeight: 700, color: '#1A3A5C' }}>
                      {formatCurrency(offre.prixPropose)}
                    </div>
                  </div>

                  {isEnAttente && (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Button
                        variant="primary"
                        style={{ backgroundColor: '#2E7D32' }}
                        size="sm"
                        icon={<FiCheck />}
                        onClick={() => handleAccepter(id)}
                      >
                        Accepter
                      </Button>

                      <Button
                        variant="secondary"
                        size="sm"
                        icon={<FiDollarSign />}
                        onClick={() => {
                          setSelectedOffre(offre);
                          setNouveauPrix(String(offre.prixPropose || ''));
                          setContreOffreModal(true);
                        }}
                      >
                        Contre-offre
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        style={{ color: '#C62828' }}
                        icon={<FiX />}
                        onClick={() => handleRefuser(id)}
                      >
                        Refuser
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="Aucune offre reçue"
          description="Vous n'avez aucune offre de chargement correspondant à ce statut pour l'instant."
        />
      )}

      {/* MODAL DE CONTRE-OFFRE */}
      <Modal
        isOpen={contreOffreModal}
        onClose={() => setContreOffreModal(false)}
        title="Proposer une contre-offre"
        subtitle={`Négociation sur l'offre #${selectedOffre?.numeroOffre || selectedOffre?.id}`}
        actions={
          <>
            <Button variant="outline" onClick={() => setContreOffreModal(false)}>
              Annuler
            </Button>
            <Button
              variant="secondary"
              icon={<FiDollarSign />}
              onClick={handleEnvoyerContreOffre}
              isLoading={isSubmitting}
            >
              Envoyer la contre-offre
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ padding: 12, backgroundColor: '#F8FAFC', borderRadius: 6, fontSize: 13 }}>
            <div>Expéditeur : <strong>{selectedOffre?.expediteurNom}</strong></div>
            <div>Prix initial proposé : <strong>{formatCurrency(selectedOffre?.prixPropose)}</strong></div>
          </div>

          <Input
            label="Votre nouveau prix proposé (DH HT)"
            type="number"
            required={true}
            value={nouveauPrix}
            onChange={(e) => setNouveauPrix(e.target.value)}
            helperText="Le prix net que vous demandez pour transporter cette marchandise."
          />

          <div className="st-form-group">
            <label className="st-label">Message / justification (optionnel)</label>
            <textarea
              className="st-textarea"
              rows={3}
              placeholder="Ex : Majoration en raison des conditions particulières de déchargement..."
              value={motifContreOffre}
              onChange={(e) => setMotifContreOffre(e.target.value)}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default OffresRecuesPage;
