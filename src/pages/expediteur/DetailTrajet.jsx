import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FiArrowLeft,
  FiMapPin,
  FiTruck,
  FiShield,
  FiStar,
  FiCheckCircle,
  FiMessageSquare,
  FiHeart,
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import expediteurService from '../../api/services/expediteurService';
import favoriService from '../../api/services/favoriService';
import { parseApiError } from '../../utils/parseApiError';
import { formatCurrency, formatNumber, formatDate } from '../../utils/format';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Card from '../../components/common/Card';
import ProgressBar from '../../components/common/ProgressBar';
import Skeleton from '../../components/common/Skeleton';
import Modal from '../../components/common/Modal';
import DemoBadge from '../../components/common/DemoBadge';

export const DetailTrajet = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [trajet, setTrajet] = useState(null);
  const [cargaisons, setCargaisons] = useState([]);
  const [selectedCargaisonId, setSelectedCargaisonId] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Formulaire de devis
  const [poids, setPoids] = useState(1000);
  const [volume, setVolume] = useState(4);
  const [withAssurance, setWithAssurance] = useState(true);
  const [valeurDeclaree, setValeurDeclaree] = useState(25000);
  const [devis, setDevis] = useState(null);
  const [isCalculatingDevis, setIsCalculatingDevis] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal de négociation
  const [negocierModalOpen, setNegocierModalOpen] = useState(false);
  const [prixNegocie, setPrixNegocie] = useState('');
  const [messageNegociation, setMessageNegociation] = useState('');
  const [isFavori, setIsFavori] = useState(false);

  const handleToggleFavori = async () => {
    const transporteurId = trajet?.transporteurId || 1;
    try {
      if (isFavori) {
        await favoriService.supprimerFavori(transporteurId);
        setIsFavori(false);
        toast.info('Transporteur retiré de vos favoris.');
      } else {
        await favoriService.ajouterFavori(transporteurId);
        setIsFavori(true);
        toast.success('Transporteur ajouté à vos favoris !');
      }
    } catch {
      toast.error('Erreur lors de la mise à jour des favoris.');
    }
  };

  // 1. Charger les données du trajet et les cargaisons de l'expéditeur
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const targetId = (!id || id === 'undefined' || isNaN(Number(id))) ? null : Number(id);
        const [trajetData, cargaisonsData] = await Promise.all([
          expediteurService.getTrajetDetail(targetId),
          expediteurService.getMesCargaisonsDisponibles(),
        ]);
        setTrajet(trajetData);
        setCargaisons(cargaisonsData || []);

        if (cargaisonsData && cargaisonsData.length > 0) {
          setSelectedCargaisonId(String(cargaisonsData[0].id));
          if (cargaisonsData[0].poids) setPoids(cargaisonsData[0].poids);
          if (cargaisonsData[0].valeurDeclaree) setValeurDeclaree(cargaisonsData[0].valeurDeclaree);
        }
      } catch (err) {
        parseApiError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // 2. Calcul automatique du devis dès qu'un paramètre change
  useEffect(() => {
    if (!trajet) return;

    const computeDevis = async () => {
      setIsCalculatingDevis(true);
      try {
        const targetId = trajet?.id || trajet?.trajetId || id;
        const res = await expediteurService.calculerDevis({
          trajetId: targetId,
          poids,
          volume,
          assurance: withAssurance,
          valeurDeclaree: withAssurance ? valeurDeclaree : 0,
        });
        setDevis(res);
      } catch (err) {
        console.error('Erreur calcul devis:', err);
      } finally {
        setIsCalculatingDevis(false);
      }
    };

    const timer = setTimeout(computeDevis, 250);
    return () => clearTimeout(timer);
  }, [id, trajet, poids, volume, withAssurance, valeurDeclaree]);

  // Sélection d'une cargaison existante
  const handleCargaisonSelect = (cargId) => {
    setSelectedCargaisonId(cargId);
    const found = cargaisons.find((c) => String(c.id) === String(cargId));
    if (found) {
      if (found.poids) setPoids(found.poids);
      if (found.volume) setVolume(found.volume);
      if (found.valeurDeclaree) setValeurDeclaree(found.valeurDeclaree);
    }
  };

  // Confirmation directe de la réservation
  const handleConfirmerReservation = async () => {
    if (!selectedCargaisonId) {
      toast.error('Veuillez sélectionner ou créer une cargaison avant de réserver.');
      return;
    }

    setIsSubmitting(true);
    try {
      await expediteurService.creerReservation({
        cargaisonId: Number(selectedCargaisonId),
        trajetId: Number(id),
        prixConvenu: devis?.totalTTC || null,
      });

      toast.success('Votre réservation a été confirmée avec succès !');
      navigate('/expediteur/cargaisons');
    } catch (err) {
      parseApiError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Soumission d'une offre négociée
  const handleEnvoyerOffreNegociee = async () => {
    if (!prixNegocie) {
      toast.error('Veuillez indiquer un tarif proposé.');
      return;
    }

    setIsSubmitting(true);
    try {
      await expediteurService.creerOffre({
        trajetId: Number(id),
        cargaisonId: selectedCargaisonId ? Number(selectedCargaisonId) : null,
        prixPropose: Number(prixNegocie),
        message: messageNegociation,
      });

      toast.success('Votre proposition a été transmise au transporteur.');
      setNegocierModalOpen(false);
      navigate('/expediteur/cargaisons');
    } catch (err) {
      parseApiError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <Skeleton variant="text" width={200} height={30} />
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: 24 }}>
          <Skeleton variant="card" height={400} />
          <Skeleton variant="card" height={400} />
        </div>
      </div>
    );
  }

  if (!trajet) {
    return (
      <div style={{ textAlign: 'center', padding: 40 }}>
        <h3>Trajet introuvable</h3>
        <Link to="/expediteur/trajets">
          <Button variant="outline">Retour aux trajets disponibles</Button>
        </Link>
      </div>
    );
  }

  const tarifBase = trajet.prixParKg ?? trajet.prixKg ?? trajet.prix ?? 0.75;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* BOUTON RETOUR & TITRE */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Link to="/expediteur/trajets" style={{ textDecoration: 'none' }}>
          <Button variant="ghost" size="sm" icon={<FiArrowLeft />}>
            Retour aux trajets
          </Button>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1A3A5C', margin: 0 }}>
            {trajet.villeDepart} → {trajet.villeArrivee}
          </h1>
          <DemoBadge />
        </div>
      </div>

      {/* DISPOSITION 2 COLONNES */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: 24,
          alignItems: 'start',
        }}
      >
        {/* COLONNE GAUCHE : DÉTAILS DU TRAJET & TRANSPORTEUR */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* CARTE ITINÉRAIRE */}
          <Card title="Détails de l'acheminement" subtitle={`Référence : ${trajet.reference || `#TR-${trajet.id}`}`}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* TIMELINE DÉPART / ARRIVÉE */}
              <div style={{ backgroundColor: '#F8FAFC', borderRadius: 8, padding: 16, border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <FiMapPin size={20} color="#1A3A5C" style={{ marginTop: 2 }} />
                  <div>
                    <strong style={{ fontSize: 16, color: '#1A3A5C' }}>{trajet.villeDepart}</strong>
                    <div style={{ fontSize: 13, color: '#718096' }}>
                      Départ programmé : <strong>{formatDate(trajet.dateDepart)}</strong>
                    </div>
                  </div>
                </div>

                <div style={{ borderLeft: '2px dashed #CBD5E0', height: 28, marginLeft: 9, margin: '6px 0' }} />

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <FiMapPin size={20} color="#0D9488" style={{ marginTop: 2 }} />
                  <div>
                    <strong style={{ fontSize: 16, color: '#0D9488' }}>{trajet.villeArrivee}</strong>
                    <div style={{ fontSize: 13, color: '#718096' }}>
                      Arrivée estimée : <strong>{formatDate(trajet.dateArriveeEstimee || trajet.dateArrivee)}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* REMPLISSAGE */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#4A5568', marginBottom: 6 }}>
                  <span>Disponibilité restante dans le camion</span>
                  <strong style={{ color: '#2E7D32' }}>{formatNumber(trajet.poidsDisponible || 4500)} kg disponibles</strong>
                </div>
                <ProgressBar
                  value={trajet.tauxRemplissage || 45}
                  color={trajet.tauxRemplissage > 80 ? '#2E7D32' : '#F57C00'}
                  height={8}
                />
              </div>

              {/* SPÉCIFICATIONS VÉHICULE */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 12,
                  padding: 12,
                  backgroundColor: '#FFFFFF',
                  borderRadius: 6,
                  border: '1px solid #E2E8F0',
                }}
              >
                <div>
                  <span style={{ fontSize: 11, color: '#718096' }}>Type véhicule</span>
                  <div style={{ fontWeight: 600, fontSize: 13, color: '#1A3A5C' }}>
                    {trajet.typeCamion || 'Semi-remorque'}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: 11, color: '#718096' }}>Température</span>
                  <div style={{ fontWeight: 600, fontSize: 13, color: trajet.refrigere ? '#0D9488' : '#4A5568' }}>
                    {trajet.refrigere ? '❄️ Contrôlée' : 'Ambiante'}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: 11, color: '#718096' }}>Distance</span>
                  <div style={{ fontWeight: 600, fontSize: 13, color: '#1A3A5C' }}>
                    {trajet.distanceKm ? `${trajet.distanceKm} km` : '~340 km'}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* PROFIL TRANSPORTEUR */}
          <Card title="Transporteur vérifié">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 10,
                    backgroundColor: '#E6FFFA',
                    color: '#0D9488',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 22,
                  }}
                >
                  <FiTruck />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <strong style={{ fontSize: 15, color: '#1A202C' }}>
                      {trajet.transporteurNom || 'Mohamed El Fassi Transport'}
                    </strong>
                    <span title="Transporteur certifié avec vérification légale CIN & ICE">
                      <FiShield color="#2E7D32" size={16} />
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#718096', marginTop: 2 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3, color: '#D97706', fontWeight: 600 }}>
                      <FiStar size={13} fill="#D97706" /> {trajet.transporteurNote || 4.9} (48 avis)
                    </span>
                    <span>•</span>
                    <span>124 trajets réussis</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  type="button"
                  onClick={handleToggleFavori}
                  title={isFavori ? "Retirer de mes favoris" : "Ajouter aux transporteurs favoris"}
                  style={{
                    backgroundColor: isFavori ? '#FEE2E2' : '#F1F5F9',
                    border: '1px solid',
                    borderColor: isFavori ? '#FCA5A5' : '#CBD5E1',
                    borderRadius: '50%',
                    width: 36,
                    height: 36,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: isFavori ? '#DC2626' : '#64748B',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <FiHeart size={16} fill={isFavori ? '#DC2626' : 'none'} />
                </button>
                <Badge status="VERIFIE" label="Certifié SoukTransport" />
              </div>
            </div>
          </Card>

          {/* SÉLECTION OU CRÉATION DE CARGAISON */}
          <Card title="Marchandise à expédier">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#4A5568' }}>
                Associer l'une de vos cargaisons prêtes :
              </label>

              {cargaisons.length > 0 ? (
                <select
                  className="st-input"
                  value={selectedCargaisonId}
                  onChange={(e) => handleCargaisonSelect(e.target.value)}
                >
                  {cargaisons.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.reference} - {c.description} ({formatNumber(c.poids)} kg)
                    </option>
                  ))}
                </select>
              ) : (
                <div style={{ padding: 12, backgroundColor: '#FFFBEB', borderRadius: 6, fontSize: 13, color: '#92400E' }}>
                  Vous n'avez pas encore de cargaison créée.{' '}
                  <Link to="/expediteur/cargaisons" style={{ color: '#0D9488', fontWeight: 600 }}>
                    Créer une cargaison
                  </Link>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* COLONNE DROITE : CALCULATEUR DE DEVIS & CONFIRMATION RÉSERVATION */}
        <div
          style={{
            position: 'sticky',
            top: 84,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 10,
              border: '2px solid #0D9488',
              boxShadow: '0 4px 12px rgba(13, 148, 136, 0.08)',
              overflow: 'hidden',
            }}
          >
            {/* EN-TÊTE DU DEVIS */}
            <div
              style={{
                backgroundColor: '#1A3A5C',
                color: '#FFFFFF',
                padding: '16px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <strong style={{ fontSize: 16, display: 'block' }}>Devis instantané</strong>
                <span style={{ fontSize: 12, color: '#94A3B8' }}>
                  Calcul transparent garanti sans frais cachés
                </span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: 11, color: '#94A3B8' }}>Tarif de base</span>
                <div style={{ fontSize: 15, fontWeight: 700 }}>{tarifBase} DH / kg</div>
              </div>
            </div>

            {/* PARAMÈTRES DU CALCULATEUR */}
            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* POIDS EN KG */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#718096', textTransform: 'uppercase' }}>
                  Poids à transporter (kg)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
                  <input
                    type="number"
                    className="st-input"
                    value={poids}
                    min={1}
                    max={trajet.poidsDisponible || 10000}
                    onChange={(e) => setPoids(Number(e.target.value))}
                  />
                  <span style={{ fontSize: 13, color: '#718096', minWidth: 24 }}>kg</span>
                </div>
              </div>

              {/* OPTION ASSURANCE */}
              <div
                style={{
                  padding: 12,
                  backgroundColor: '#F8FAFC',
                  borderRadius: 6,
                  border: '1px solid #E2E8F0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: '#1A3A5C', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={withAssurance}
                    onChange={(e) => setWithAssurance(e.target.checked)}
                  />
                  <span>🛡️ Assurance Marchandise Tous Risques (0.5%)</span>
                </label>

                {withAssurance && (
                  <div style={{ paddingLeft: 24 }}>
                    <span style={{ fontSize: 11, color: '#718096' }}>Valeur déclarée de la marchandise (MAD) :</span>
                    <input
                      type="number"
                      className="st-input"
                      style={{ marginTop: 4 }}
                      value={valeurDeclaree}
                      onChange={(e) => setValeurDeclaree(Number(e.target.value))}
                    />
                  </div>
                )}
              </div>

              {/* DÉCOMPOSITION FINANCIÈRE DÉTAILLÉE */}
              <div
                style={{
                  borderTop: '1px solid #EDF2F7',
                  paddingTop: 12,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  fontSize: 13,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4A5568' }}>
                  <span>Fret de transport ({formatNumber(poids)} kg)</span>
                  <span>{formatCurrency(devis?.montantTransport || 0)}</span>
                </div>

                {withAssurance && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4A5568' }}>
                    <span>Prime d'assurance (0.5%)</span>
                    <span>{formatCurrency(devis?.montantAssurance || 0)}</span>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4A5568' }}>
                  <span>Frais de service & séquestre (10%)</span>
                  <span>{formatCurrency(devis?.montantCommission || 0)}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4A5568' }}>
                  <span>TVA marocaine (20%)</span>
                  <span>{formatCurrency(devis?.montantTva || 0)}</span>
                </div>

                {/* TOTAL FINAL TTC */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTop: '2px solid #E2E8F0',
                    paddingTop: 12,
                    marginTop: 4,
                  }}
                >
                  <strong style={{ fontSize: 16, color: '#1A3A5C' }}>Total TTC à régler</strong>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#0D9488' }}>
                    {isCalculatingDevis ? 'Calcul...' : formatCurrency(devis?.totalTTC || 0)}
                  </div>
                </div>
              </div>

              {/* BOUTONS D'ACTION */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
                <Button
                  variant="primary"
                  size="lg"
                  icon={<FiCheckCircle />}
                  onClick={handleConfirmerReservation}
                  isLoading={isSubmitting}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  Confirmer la réservation
                </Button>

                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setNegocierModalOpen(true)}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  Proposer un tarif différent
                </Button>

                <Button
                  variant="ghost"
                  size="md"
                  icon={<FiMessageSquare />}
                  onClick={() => navigate(`/chat?trajetId=${trajet.id}`)}
                  style={{ width: '100%', justifyContent: 'center', color: '#0D9488', fontWeight: 600 }}
                >
                  Poser une question en direct
                </Button>
              </div>

              <div style={{ fontSize: 11, color: '#718096', textAlign: 'center', marginTop: 4 }}>
                🔒 Paiement sécurisé sous séquestre : les fonds ne sont libérés au transporteur qu'après confirmation de la livraison.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL DE NÉGOCIATION / CONTRE-OFFRE */}
      <Modal
        isOpen={negocierModalOpen}
        onClose={() => setNegocierModalOpen(false)}
        title="Faire une proposition au transporteur"
        subtitle="Indiquez le montant global que vous proposez pour ce transport."
        actions={
          <>
            <Button variant="outline" onClick={() => setNegocierModalOpen(false)}>
              Annuler
            </Button>
            <Button variant="primary" onClick={handleEnvoyerOffreNegociee} isLoading={isSubmitting}>
              Envoyer la proposition
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label className="st-label required">Montant total proposé (MAD)</label>
            <input
              type="number"
              className="st-input"
              placeholder="Ex : 2500"
              value={prixNegocie}
              onChange={(e) => setPrixNegocie(e.target.value)}
            />
          </div>

          <div>
            <label className="st-label">Message ou conditions particulières (optionnel)</label>
            <textarea
              className="st-textarea"
              rows={3}
              placeholder="Ex : Chargement prévu tôt le matin, besoin de hayon élévateur..."
              value={messageNegociation}
              onChange={(e) => setMessageNegociation(e.target.value)}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DetailTrajet;