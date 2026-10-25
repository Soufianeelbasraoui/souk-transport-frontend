import React, { useState, useEffect } from 'react';
import {
  FiTruck,
  FiCheck,
  FiX,
  FiMapPin,
  FiShield,
  FiUpload,
  FiCalendar,
  FiBox,
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';
import camionService, { TYPE_CAMIONS_LABELS, EQUIPEMENTS_LABELS } from '../../api/services/camionService';
import { parseApiError } from '../../utils/parseApiError';

const MARQUES_SUGGEREES = ['Volvo', 'Scania', 'Mercedes-Benz', 'Renault Trucks', 'DAF', 'MAN', 'Iveco', 'Isuzu'];

const TOUTES_REGIONS = [
  'Casablanca-Settat',
  'Tanger-Tétouan-Al Hoceïma',
  'Rabat-Salé-Kénitra',
  'Marrakech-Safi',
  'Fès-Meknès',
  'Souss-Massa',
  'Oriental',
  'Béni Mellal-Khénifra',
  'Drâa-Tafilalet',
  'Guelmim-Oued Noun',
  'Laâyoune-Sakia El Hamra',
  'Dakhla-Oued Ed-Dahab',
];

export const AjouterCamionModal = ({ isOpen, onClose, onCamionAjoute }) => {
  const [marque, setMarque] = useState('');
  const [modele, setModele] = useState('');
  const [type, setType] = useState('SEMI');
  const [immatriculation, setImmatriculation] = useState('');
  const [capacite, setCapacite] = useState(24000);
  const [volumeCapacite, setVolumeCapacite] = useState(85);
  const [annee, setAnnee] = useState(new Date().getFullYear());
  const [photoPrincipale, setPhotoPrincipale] = useState('');
  const [disponible, setDisponible] = useState(true);
  const [equipements, setEquipements] = useState(['GPS', 'HAYON']);
  const [zones, setZones] = useState(['Casablanca-Settat', 'Tanger-Tétouan-Al Hoceïma']);

  const [availableTypes, setAvailableTypes] = useState(Object.keys(TYPE_CAMIONS_LABELS));
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      camionService.getTypesCamion().then((types) => {
        if (Array.isArray(types) && types.length > 0) {
          setAvailableTypes(types);
        }
      });
    }
  }, [isOpen]);

  const toggleEquipement = (eqKey) => {
    setEquipements((prev) =>
      prev.includes(eqKey) ? prev.filter((k) => k !== eqKey) : [...prev, eqKey]
    );
  };

  const toggleZone = (zName) => {
    setZones((prev) =>
      prev.includes(zName) ? prev.filter((k) => k !== zName) : [...prev, zName]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!marque.trim()) {
      toast.error('La marque du véhicule est obligatoire.');
      return;
    }
    if (!modele.trim()) {
      toast.error('Le modèle du camion est obligatoire.');
      return;
    }
    if (!immatriculation.trim()) {
      toast.error("L'immatriculation marocaine est obligatoire.");
      return;
    }
    if (!capacite || Number(capacite) <= 0) {
      toast.error('La capacité de charge doit être supérieure à 0 kg.');
      return;
    }

    setIsSubmitting(true);
    try {
      const nouveauCamion = await camionService.ajouterCamion({
        marque,
        modele,
        type,
        immatriculation: immatriculation.trim().toUpperCase(),
        capacite: Number(capacite),
        volumeCapacite: Number(volumeCapacite),
        annee: Number(annee),
        photoPrincipale: photoPrincipale.trim() || null,
        disponible,
        equipements,
        zonesPreferentielles: zones,
      });

      toast.success(`Camion ${marque} ${modele} (${immatriculation.toUpperCase()}) ajouté avec succès à votre flotte !`);
      
      // Réinitialiser le formulaire
      setMarque('');
      setModele('');
      setImmatriculation('');
      setCapacite(24000);
      setVolumeCapacite(85);

      if (onCamionAjoute) {
        onCamionAjoute(nouveauCamion);
      }
      onClose();
    } catch (err) {
      parseApiError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Ajouter un camion à votre flotte"
      subtitle="Enregistrez un nouveau véhicule pour publier vos trajets et accepter des cargaisons."
      maxWidth={680}
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* LIGNE 1 : MARQUE AVEC SUGGESTIONS & MODÈLE */}
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
            <div>
              <Input
                label="Marque du véhicule"
                required={true}
                placeholder="Ex : Volvo, Scania, Mercedes-Benz..."
                value={marque}
                onChange={(e) => setMarque(e.target.value)}
              />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                {MARQUES_SUGGEREES.slice(0, 5).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMarque(m)}
                    style={{
                      fontSize: 11,
                      padding: '2px 8px',
                      borderRadius: 12,
                      border: '1px solid #E2E8F0',
                      backgroundColor: marque === m ? '#1A3A5C' : '#F8FAFC',
                      color: marque === m ? '#FFFFFF' : '#4A5568',
                      cursor: 'pointer',
                    }}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <Input
              label="Modèle"
              required={true}
              placeholder="Ex : FH 500, Actros 1845, Maxity..."
              value={modele}
              onChange={(e) => setModele(e.target.value)}
            />
          </div>
        </div>

        {/* LIGNE 2 : TYPE & IMMATRICULATION */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
          <Select
            label="Type de carrosserie / tonnage"
            required={true}
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            {availableTypes.map((tKey) => (
              <option key={tKey} value={tKey}>
                {TYPE_CAMIONS_LABELS[tKey] || tKey}
              </option>
            ))}
          </Select>

          <Input
            label="Immatriculation (Format Maroc)"
            required={true}
            placeholder="Ex : 12345-A-6 ou 54321-B-26"
            value={immatriculation}
            onChange={(e) => setImmatriculation(e.target.value.toUpperCase())}
            hint="Format d'immatriculation officiel marocain"
          />
        </div>

        {/* LIGNE 3 : CHARGE UTILE, VOLUME & ANNÉE */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }}>
          <Input
            label="Capacité max (kg)"
            type="number"
            required={true}
            min={100}
            step={100}
            value={capacite}
            onChange={(e) => setCapacite(e.target.value)}
          />

          <Input
            label="Volume utile (m³)"
            type="number"
            min={1}
            step={0.5}
            value={volumeCapacite}
            onChange={(e) => setVolumeCapacite(e.target.value)}
          />

          <Input
            label="Année de mise en circulation"
            type="number"
            min={1990}
            max={new Date().getFullYear() + 1}
            value={annee}
            onChange={(e) => setAnnee(e.target.value)}
          />
        </div>

        {/* ÉQUIPEMENTS TECHNIQUES */}
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#1A202C', display: 'block', marginBottom: 8 }}>
            Équipements certifiés du véhicule
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 8 }}>
            {Object.entries(EQUIPEMENTS_LABELS).map(([key, label]) => {
              const active = equipements.includes(key);
              return (
                <div
                  key={key}
                  onClick={() => toggleEquipement(key)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: `1.5px solid ${active ? '#0D9488' : '#E2E8F0'}`,
                    backgroundColor: active ? '#F0FDFA' : '#FFFFFF',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 4,
                      border: `2px solid ${active ? '#0D9488' : '#CBD5E1'}`,
                      backgroundColor: active ? '#0D9488' : '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFFFFF',
                    }}
                  >
                    {active && <FiCheck size={12} />}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: active ? 600 : 400, color: active ? '#0F766E' : '#334155' }}>
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ZONES DE DESSERTE PRÉFÉRENTIELLES */}
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#1A202C', display: 'block', marginBottom: 8 }}>
            Régions prioritaires d'activité
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {TOUTES_REGIONS.map((r) => {
              const active = zones.includes(r);
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => toggleZone(r)}
                  style={{
                    fontSize: 12,
                    padding: '6px 12px',
                    borderRadius: 20,
                    border: `1px solid ${active ? '#1A3A5C' : '#E2E8F0'}`,
                    backgroundColor: active ? '#1A3A5C' : '#F8FAFC',
                    color: active ? '#FFFFFF' : '#475569',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <FiMapPin size={11} />
                  <span>{r}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* PHOTO PRINCIPALE & STATUT DISPONIBLE */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
          <Input
            label="Lien photo du camion (Optionnel)"
            placeholder="https://... ou laissez vide"
            value={photoPrincipale}
            onChange={(e) => setPhotoPrincipale(e.target.value)}
          />

          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginTop: 18 }}>
              <input
                type="checkbox"
                checked={disponible}
                onChange={(e) => setDisponible(e.target.checked)}
                style={{ width: 18, height: 18, accentColor: '#0D9488' }}
              />
              <span style={{ fontSize: 13, fontWeight: 600, color: '#1A202C' }}>
                Véhicule immédiatement disponible pour des missions
              </span>
            </label>
          </div>
        </div>

        {/* BOUTONS D'ACTION */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 12, borderTop: '1px solid #E2E8F0', paddingTop: 16 }}>
          <Button variant="outline" type="button" onClick={onClose} disabled={isSubmitting}>
            Annuler
          </Button>
          <Button variant="primary" type="submit" icon={<FiTruck />} isLoading={isSubmitting}>
            Enregistrer le camion
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AjouterCamionModal;
