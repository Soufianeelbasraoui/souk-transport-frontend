import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FiTruck,
  FiArrowLeft,
  FiCheck,
  FiMapPin,
  FiShield,
  FiCalendar,
  FiBox,
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import camionService, { TYPE_CAMIONS_LABELS, EQUIPEMENTS_LABELS } from '../../api/services/camionService';
import { parseApiError } from '../../utils/parseApiError';

const MARQUES_SUGGEREES = ['Volvo', 'Scania', 'Mercedes-Benz', 'Renault Trucks', 'DAF', 'MAN', 'Iveco', 'Isuzu', 'Mitsubishi Fuso'];

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

export const AjouterCamionPage = () => {
  const navigate = useNavigate();

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
    camionService.getTypesCamion().then((types) => {
      if (Array.isArray(types) && types.length > 0) {
        setAvailableTypes(types);
      }
    });
  }, []);

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
      await camionService.ajouterCamion({
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
      navigate('/transporteur/camions');
    } catch (err) {
      parseApiError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 900, margin: '0 auto' }}>
      {/* HEADER & BOUTON RETOUR */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <Link to="/transporteur/camions" style={{ textDecoration: 'none' }}>
          <Button variant="ghost" size="sm" icon={<FiArrowLeft />}>
            Retour à ma flotte
          </Button>
        </Link>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1A3A5C', margin: 0 }}>
            Ajouter un nouveau camion
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#718096' }}>
            Renseignez les caractéristiques techniques du véhicule pour publier vos trajets sur SoukTransport.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* CARTE 1 : IDENTITÉ DU VÉHICULE */}
        <Card title="1. Identité et type du véhicule" subtitle="Marque, modèle et carrosserie">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
              <div>
                <Input
                  label="Marque constructeur"
                  required={true}
                  placeholder="Ex : Volvo, Scania, Mercedes-Benz..."
                  value={marque}
                  onChange={(e) => setMarque(e.target.value)}
                />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                  {MARQUES_SUGGEREES.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMarque(m)}
                      style={{
                        fontSize: 11,
                        padding: '3px 10px',
                        borderRadius: 14,
                        border: '1px solid #CBD5E1',
                        backgroundColor: marque === m ? '#1A3A5C' : '#F1F5F9',
                        color: marque === m ? '#FFFFFF' : '#334155',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
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
                placeholder="Ex : FH 500 Globetrotter, Actros 1845..."
                value={modele}
                onChange={(e) => setModele(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
              <Select
                label="Catégorie de camion"
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
                label="Immatriculation (Maroc)"
                required={true}
                placeholder="Ex : 12345-A-6"
                value={immatriculation}
                onChange={(e) => setImmatriculation(e.target.value.toUpperCase())}
                hint="Numéro officiel inscrit sur la carte grise"
              />
            </div>
          </div>
        </Card>

        {/* CARTE 2 : CAPACITÉS & VOLUMES */}
        <Card title="2. Capacités et caractéristiques techniques" subtitle="Tonnage utile et volume cubique">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            <Input
              label="Charge utile max (kg)"
              type="number"
              required={true}
              min={100}
              step={100}
              value={capacite}
              onChange={(e) => setCapacite(e.target.value)}
              hint="Capacité maximale transportable"
            />

            <Input
              label="Volume utile (m³)"
              type="number"
              min={1}
              step={0.5}
              value={volumeCapacite}
              onChange={(e) => setVolumeCapacite(e.target.value)}
              hint="Volume de la caisse ou remorque"
            />

            <Input
              label="Année de fabrication"
              type="number"
              min={1990}
              max={new Date().getFullYear() + 1}
              value={annee}
              onChange={(e) => setAnnee(e.target.value)}
            />
          </div>
        </Card>

        {/* CARTE 3 : ÉQUIPEMENTS & ZONES */}
        <Card title="3. Équipements certifiés & Régions d'activité" subtitle="Options embarquées pour les expéditeurs">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 10 }}>
                Équipements du véhicule :
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
                {Object.entries(EQUIPEMENTS_LABELS).map(([key, label]) => {
                  const active = equipements.includes(key);
                  return (
                    <div
                      key={key}
                      onClick={() => toggleEquipement(key)}
                      style={{
                        padding: '12px 14px',
                        borderRadius: 8,
                        border: `1.5px solid ${active ? '#0D9488' : '#E2E8F0'}`,
                        backgroundColor: active ? '#F0FDFA' : '#FFFFFF',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                      }}
                    >
                      <div
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: 4,
                          border: `2px solid ${active ? '#0D9488' : '#CBD5E1'}`,
                          backgroundColor: active ? '#0D9488' : '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#FFFFFF',
                        }}
                      >
                        {active && <FiCheck size={14} />}
                      </div>
                      <span style={{ fontSize: 13, fontWeight: active ? 600 : 400, color: active ? '#0F766E' : '#334155' }}>
                        {label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 10 }}>
                Régions habituelles de desserte :
              </span>
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
                        padding: '6px 14px',
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
                      <FiMapPin size={12} />
                      <span>{r}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </Card>

        {/* CARTE 4 : DISPONIBILITÉ & VISUEL */}
        <Card title="4. Statut & Visibilité" subtitle="Disponibilité immédiate du camion">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            <Input
              label="URL photo du camion (Optionnel)"
              placeholder="https://... ou laissez vide"
              value={photoPrincipale}
              onChange={(e) => setPhotoPrincipale(e.target.value)}
            />

            <div style={{ display: 'flex', alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginTop: 12 }}>
                <input
                  type="checkbox"
                  checked={disponible}
                  onChange={(e) => setDisponible(e.target.checked)}
                  style={{ width: 20, height: 20, accentColor: '#0D9488' }}
                />
                <span style={{ fontSize: 14, fontWeight: 600, color: '#1A202C' }}>
                  Ce véhicule est actif et disponible pour publication immédiate
                </span>
              </label>
            </div>
          </div>
        </Card>

        {/* ACTIONS */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 12 }}>
          <Link to="/transporteur/camions" style={{ textDecoration: 'none' }}>
            <Button variant="outline" type="button" disabled={isSubmitting}>
              Annuler
            </Button>
          </Link>
          <Button variant="primary" type="submit" size="lg" icon={<FiTruck />} isLoading={isSubmitting}>
            Enregistrer et ajouter à ma flotte
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AjouterCamionPage;
