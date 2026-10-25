import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  FiMapPin,
  FiCalendar,
  FiCheckCircle,
  FiArrowRight,
  FiArrowLeft,
  FiInfo,
  FiTrendingUp,
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import transporteurService from '../../api/services/transporteurService';
import { parseApiError } from '../../utils/parseApiError';
import { formatNumber, formatDate } from '../../utils/format';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Stepper from '../../components/common/Stepper';
import Card from '../../components/common/Card';
import DemoBadge from '../../components/common/DemoBadge';
import TarificationEstimatorModal from '../../components/tarification/TarificationEstimatorModal';

const schema = yup.object({
  villeDepart: yup.string().required('La ville de départ est obligatoire'),
  villeArrivee: yup.string().required("La ville d'arrivée est obligatoire"),
  dateDepart: yup.string().required('La date de départ est obligatoire'),
  dateArrivee: yup.string().nullable(),
  camionId: yup.string().required('Veuillez sélectionner un camion'),
  poidsDisponible: yup
    .number()
    .typeError('Le poids doit être un nombre')
    .positive('Le poids doit être supérieur à zéro')
    .required('Le poids disponible est obligatoire'),
  volumeDisponible: yup
    .number()
    .typeError('Le volume doit être un nombre')
    .positive('Le volume doit être supérieur à zéro')
    .nullable(),
  typeTarification: yup.string().required('Le type de tarification est obligatoire'),
  prixKg: yup.number().nullable().typeError('Le prix doit être un nombre'),
  conditions: yup.string().nullable(),
});

export const PublierTrajetPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [villes, setVilles] = useState([]);
  const [camions, setCamions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEstimatorOpen, setIsEstimatorOpen] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      villeDepart: '',
      villeArrivee: '',
      dateDepart: '',
      dateArrivee: '',
      camionId: '',
      poidsDisponible: 5000,
      volumeDisponible: 25,
      typeTarification: 'PRIX_FIXE_KG',
      prixKg: 0.65,
      conditions: '',
    },
  });

  const formData = watch();

  useEffect(() => {
    // Charger villes et camions
    transporteurService.getVilles().then(setVilles).catch(() => {});
    transporteurService.getMesCamions().then((res) => {
      const list = res?.content || (Array.isArray(res) ? res : []);
      setCamions(list);
      if (list.length > 0) {
        setValue('camionId', String(list[0].id));
      }
    }).catch(() => {});
  }, [setValue]);

  const steps = [
    { title: 'Itinéraire', subtitle: 'Départ & Arrivée' },
    { title: 'Dates', subtitle: 'Horaires du trajet' },
    { title: 'Véhicule', subtitle: 'Camion assigné' },
    { title: 'Capacité', subtitle: 'Charge & Tarifs' },
    { title: 'Confirmation', subtitle: 'Validation finale' },
  ];

  const formatDateTime = (val) => {
    if (!val) return null;
    return val.length === 16 ? `${val}:00` : val;
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const payload = {
        villeDepart: data.villeDepart,
        villeArrivee: data.villeArrivee,
        dateDepart: formatDateTime(data.dateDepart),
        dateArriveeEstimee: formatDateTime(data.dateArrivee),
        dateArrivee: formatDateTime(data.dateArrivee),
        camionId: Number(data.camionId),
        poidsDisponible: Number(data.poidsDisponible),
        volumeDisponible: data.volumeDisponible ? Number(data.volumeDisponible) : null,
        poidsTotal: Number(data.poidsDisponible),
        volumeTotal: data.volumeDisponible ? Number(data.volumeDisponible) : 30,
        typeTarification: data.typeTarification || 'PRIX_FIXE_KG',
        prixParKg: data.prixKg ? Number(data.prixKg) : null,
        prix: data.prixKg ? Number(data.prixKg) : null,
        prixKg: data.prixKg ? Number(data.prixKg) : null,
        conditions: data.conditions,
      };

      await transporteurService.publierTrajet(payload);
      toast.success('Votre trajet a été publié avec succès !');
      navigate('/transporteur/trajets');
    } catch (err) {
      parseApiError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  const selectedCamion = camions.find((c) => String(c.id) === String(formData.camionId));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1A3A5C', margin: 0 }}>
              Publier un nouveau trajet
            </h1>
            <DemoBadge />
          </div>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#718096' }}>
            Renseignez votre itinéraire et vos disponibilités pour recevoir des offres d'expéditeurs.
          </p>
        </div>

        <Link to="/transporteur/trajets" style={{ textDecoration: 'none' }}>
          <Button variant="outline" size="sm" icon={<FiArrowLeft />}>
            Retour aux trajets
          </Button>
        </Link>
      </div>

      {/* STEPPER EN TÊTE */}
      <Card style={{ padding: '20px 24px' }}>
        <Stepper steps={steps} currentStep={currentStep} onStepClick={setCurrentStep} />
      </Card>

      {/* DISPOSITION 2 COLONNES : FORMULAIRE À GAUCHE (7 COLONNES), APERÇU STICKY À DROITE (5 COLONNES) */}
      <div style={{ display: 'grid', gridTemplateColumns: '7fr 5fr', gap: 24, alignItems: 'start' }}>
        {/* COLONNE GAUCHE : FORMULAIRE MULTI-ÉTAPES */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: 8, border: '1px solid #E2E8F0', padding: 24 }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* ÉTAPE 0 : ITINÉRAIRE */}
            {currentStep === 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1A3A5C', margin: 0 }}>
                  1. Itinéraire de transport
                </h3>
                <p style={{ fontSize: 13, color: '#718096', margin: 0 }}>
                  Sélectionnez les villes de départ et de destination au Maroc.
                </p>

                <Select
                  label="Ville de départ"
                  required={true}
                  placeholder="Choisissez une ville de départ..."
                  error={errors.villeDepart?.message}
                  {...register('villeDepart')}
                >
                  {villes.map((v) => (
                    <option key={`dep-${v.id}`} value={v.nom}>
                      {v.nom} ({v.region || 'Maroc'})
                    </option>
                  ))}
                </Select>

                <Select
                  label="Ville d'arrivée"
                  required={true}
                  placeholder="Choisissez une ville d'arrivée..."
                  error={errors.villeArrivee?.message}
                  {...register('villeArrivee')}
                >
                  {villes.map((v) => (
                    <option key={`arr-${v.id}`} value={v.nom}>
                      {v.nom} ({v.region || 'Maroc'})
                    </option>
                  ))}
                </Select>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
                  <Button variant="primary" icon={<FiArrowRight />} onClick={nextStep}>
                    Étape suivante : Dates
                  </Button>
                </div>
              </div>
            )}

            {/* ÉTAPE 1 : DATES & HORAIRES */}
            {currentStep === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1A3A5C', margin: 0 }}>
                  2. Dates et horaires
                </h3>
                <p style={{ fontSize: 13, color: '#718096', margin: 0 }}>
                  Indiquez la date prévue pour le chargement et le départ.
                </p>

                <Input
                  label="Date et heure de départ"
                  type="datetime-local"
                  required={true}
                  error={errors.dateDepart?.message}
                  {...register('dateDepart')}
                />

                <Input
                  label="Date et heure d'arrivée estimée (optionnel)"
                  type="datetime-local"
                  helperText="Permet aux expéditeurs de planifier leur réception."
                  error={errors.dateArrivee?.message}
                  {...register('dateArrivee')}
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
                  <Button variant="outline" icon={<FiArrowLeft />} onClick={prevStep}>
                    Précédent
                  </Button>
                  <Button variant="primary" icon={<FiArrowRight />} onClick={nextStep}>
                    Étape suivante : Véhicule
                  </Button>
                </div>
              </div>
            )}

            {/* ÉTAPE 2 : VÉHICULE & CAMION */}
            {currentStep === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1A3A5C', margin: 0 }}>
                  3. Camion affecté
                </h3>
                <p style={{ fontSize: 13, color: '#718096', margin: 0 }}>
                  Associez un camion de votre flotte à cette liaison.
                </p>

                {camions.length === 0 ? (
                  <div style={{ padding: 14, backgroundColor: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 6, fontSize: 13, color: '#92400E' }}>
                    <p style={{ margin: '0 0 8px 0', fontWeight: 600 }}>Aucun camion enregistré dans votre flotte.</p>
                    <p style={{ margin: '0 0 12px 0' }}>
                      Pour publier un trajet, vous devez d'abord ajouter un véhicule dans votre parc automobile.
                    </p>
                    <Link to="/transporteur/camions/new" style={{ textDecoration: 'none' }}>
                      <Button variant="primary" size="sm">
                        + Ajouter un camion maintenant
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <label className="st-label required" style={{ margin: 0 }}>Sélectionner le camion</label>
                      <Link to="/transporteur/camions/new" style={{ fontSize: 12, color: '#0D9488', fontWeight: 600, textDecoration: 'underline' }}>
                        + Ajouter un autre camion
                      </Link>
                    </div>
                    <Select
                      required={true}
                      error={errors.camionId?.message}
                      {...register('camionId')}
                    >
                      {camions.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.marque} {c.modele} ({c.immatriculation}) - {c.type || c.typeCamion}
                        </option>
                      ))}
                    </Select>
                  </div>
                )}

                {selectedCamion && (
                  <div style={{ backgroundColor: '#F8FAFC', padding: 14, borderRadius: 6, border: '1px solid #E2E8F0', marginTop: 12 }}>
                    <div style={{ fontSize: 12, color: '#718096' }}>Détails du véhicule sélectionné :</div>
                    <strong style={{ fontSize: 14, color: '#1A3A5C' }}>
                      {selectedCamion.marque} {selectedCamion.modele} ({selectedCamion.immatriculation})
                    </strong>
                    <div style={{ display: 'flex', gap: 16, marginTop: 6, fontSize: 12, color: '#4A5568' }}>
                      <span>Charge max : <strong>{formatNumber(selectedCamion.capacite ?? selectedCamion.chargeUtileKg)} kg</strong></span>
                      <span>Volume : <strong>{selectedCamion.volumeCapacite ?? selectedCamion.volumeM3} m³</strong></span>
                      <span>Catégorie : <strong>{selectedCamion.type || selectedCamion.typeCamion}</strong></span>
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
                  <Button variant="outline" icon={<FiArrowLeft />} onClick={prevStep}>
                    Précédent
                  </Button>
                  <Button variant="primary" icon={<FiArrowRight />} onClick={nextStep}>
                    Étape suivante : Capacité
                  </Button>
                </div>
              </div>
            )}

            {/* ÉTAPE 3 : CAPACITÉ & TARIFS */}
            {currentStep === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1A3A5C', margin: 0 }}>
                  4. Capacité disponible & Tarification
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <Input
                    label="Poids disponible (kg)"
                    type="number"
                    required={true}
                    error={errors.poidsDisponible?.message}
                    {...register('poidsDisponible')}
                  />
                  <Input
                    label="Volume disponible (m³)"
                    type="number"
                    error={errors.volumeDisponible?.message}
                    {...register('volumeDisponible')}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#2D3748' }}>Moteur d'estimation :</label>
                  <button
                    type="button"
                    onClick={() => setIsEstimatorOpen(true)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#1A3A5C',
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      textDecoration: 'underline',
                    }}
                  >
                    <FiTrendingUp /> Estimer le tarif conseillé
                  </button>
                </div>

                <Select
                  label="Type de tarification"
                  required={true}
                  error={errors.typeTarification?.message}
                  {...register('typeTarification')}
                >
                  <option value="PRIX_FIXE_KG">Prix fixe au kilogramme (DH/kg)</option>
                  <option value="PRIX_FIXE_M3">Prix fixe au m³ (DH/m³)</option>
                  <option value="OFFRES">Négociation libre (sur devis/offres)</option>
                </Select>

                {formData.typeTarification === 'PRIX_FIXE_KG' && (
                  <Input
                    label="Tarif par kilogramme (DH HT)"
                    type="number"
                    step="0.05"
                    error={errors.prixKg?.message}
                    {...register('prixKg')}
                  />
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
                  <Button variant="outline" icon={<FiArrowLeft />} onClick={prevStep}>
                    Précédent
                  </Button>
                  <Button variant="primary" icon={<FiArrowRight />} onClick={nextStep}>
                    Étape suivante : Récapitulatif
                  </Button>
                </div>
              </div>
            )}

            {/* ÉTAPE 4 : CONDITIONS & VALIDATION FINALE */}
            {currentStep === 4 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1A3A5C', margin: 0 }}>
                  5. Conditions particulières et validation
                </h3>

                <div className="st-form-group">
                  <label className="st-label">Conditions ou consignes de chargement</label>
                  <textarea
                    className="st-textarea"
                    rows={4}
                    placeholder="Ex : Palettes sanglées uniquement, chargement à quai requis..."
                    {...register('conditions')}
                  />
                </div>

                <div style={{ backgroundColor: '#E8F5E9', border: '1px solid #C8E6C9', padding: 14, borderRadius: 6, fontSize: 13, color: '#2E7D32' }}>
                  ✓ Dès validation, ce trajet sera visible par l'ensemble des expéditeurs professionnels sur la plateforme.
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
                  <Button variant="outline" icon={<FiArrowLeft />} onClick={prevStep}>
                    Précédent
                  </Button>
                  <Button
                    type="submit"
                    variant="secondary"
                    icon={<FiCheckCircle />}
                    isLoading={isSubmitting}
                  >
                    Confirmer et Publier le trajet
                  </Button>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* COLONNE DROITE : APERÇU EN DIRECT STICKY */}
        <div style={{ position: 'sticky', top: 88 }}>
          <Card title="Aperçu du trajet en direct" subtitle="Fiche telle qu'elle apparaîtra aux expéditeurs">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* ITINÉRAIRE APERÇU */}
              <div style={{ backgroundColor: '#F8FAFC', borderRadius: 8, padding: 14, border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FiMapPin size={18} color="#1A3A5C" />
                  <strong style={{ fontSize: 15, color: '#1A202C' }}>
                    {formData.villeDepart || 'Ville départ'} → {formData.villeArrivee || 'Ville arrivée'}
                  </strong>
                </div>
                <div style={{ fontSize: 12, color: '#718096', marginTop: 6 }}>
                  <FiCalendar size={13} style={{ marginRight: 4 }} />
                  {formData.dateDepart ? formatDate(formData.dateDepart) : 'Date à définir'}
                </div>
              </div>

              {/* DÉTAILS DU VÉHICULE & CHARGE */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#718096' }}>Camion :</span>
                  <strong>{selectedCamion ? `${selectedCamion.marque} (${selectedCamion.typeCamion})` : 'Sélectionner...'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#718096' }}>Capacité proposée :</span>
                  <strong style={{ color: '#2E7D32' }}>{formatNumber(formData.poidsDisponible)} kg</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#718096' }}>Volume :</span>
                  <strong>{formData.volumeDisponible || 0} m³</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#718096' }}>Tarification :</span>
                  <strong>
                    {formData.typeTarification === 'PRIX_FIXE_KG'
                      ? `${formData.prixKg || 0} DH / kg`
                      : formData.typeTarification === 'PRIX_FIXE_M3'
                      ? 'Tarif au m³'
                      : 'Sur offre libre'}
                  </strong>
                </div>
              </div>

              {/* CARTE D'INFO RAPIDE */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 10, backgroundColor: '#EDF2F7', borderRadius: 6, fontSize: 12, color: '#4A5568' }}>
                <FiInfo size={16} />
                <span>Validation immédiate après soumission.</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* MODAL ESTIMATEUR DE PRIX CONSEILLÉ */}
      <TarificationEstimatorModal
        isOpen={isEstimatorOpen}
        onClose={() => setIsEstimatorOpen(false)}
        defaultDepart={formData.villeDepart}
        defaultArrivee={formData.villeArrivee}
        onSelectPrix={(conseille) => {
          const p = Number(formData.poidsDisponible) || 1000;
          const prixKgEstime = (conseille / p).toFixed(2);
          setValue('typeTarification', 'PRIX_FIXE_KG');
          setValue('prixKg', Number(prixKgEstime));
          toast.success(`Tarif conseillé appliqué : ${prixKgEstime} DH/kg (${conseille} DH total)`);
        }}
      />
    </div>
  );
};

export default PublierTrajetPage;
