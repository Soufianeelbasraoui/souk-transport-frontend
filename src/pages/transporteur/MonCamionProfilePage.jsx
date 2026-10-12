import React, { useState, useEffect } from 'react';
import {
  FiTruck,
  FiUser,
  FiSave,
  FiCheck,
  FiMapPin,
  FiLock,
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import transporteurService from '../../api/services/transporteurService';
import client from '../../api/client';
import { parseApiError } from '../../utils/parseApiError';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Tabs from '../../components/common/Tabs';
import DemoBadge from '../../components/common/DemoBadge';

export const MonCamionProfilePage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('camion');
  const [camions, setCamions] = useState([]);
  const [selectedCamion, setSelectedCamion] = useState(null);

  // États pour les sauvegardes par section
  const [isSavingGeneral, setIsSavingGeneral] = useState(false);
  const [isSavingEquipements, setIsSavingEquipements] = useState(false);
  const [isSavingZones, setIsSavingZones] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // Formulaire Camion
  const [camionMarque, setCamionMarque] = useState('');
  const [camionModele, setCamionModele] = useState('');
  const [camionImmat, setCamionImmat] = useState('');
  const [camionType, setCamionType] = useState('SEMI');
  const [camionCharge, setCamionCharge] = useState(24000);
  const [camionVolume, setCamionVolume] = useState(85);

  // Équipements sélectionnés (Set/Array)
  const [equipements, setEquipements] = useState(['GPS', 'HAYON']);
  const allEquipements = [
    { id: 'HAYON', label: 'Hayon élévateur' },
    { id: 'REFRIGERATION', label: 'Groupe frigorifique (-20°C / +4°C)' },
    { id: 'GPS', label: 'Traceur GPS connecté' },
    { id: 'BACHE', label: 'Bâche coulissante (Rideaux)' },
  ];

  // Zones régionales sélectionnées
  const [zones, setZones] = useState(['Casablanca-Settat', 'Tanger-Tétouan-Al Hoceïma']);
  const allRegions = [
    'Casablanca-Settat',
    'Tanger-Tétouan-Al Hoceïma',
    'Rabat-Salé-Kénitra',
    'Marrakech-Safi',
    'Fès-Meknès',
    'Souss-Massa',
    'Oriental',
    'Béni Mellal-Khénifra',
  ];

  // Formulaire Profil Personnel
  const [nom, setNom] = useState(user?.nom || 'El Fassi');
  const [prenom, setPrenom] = useState(user?.prenom || 'Mohamed');
  const [email] = useState(user?.email || 'contact@transport-atlas.ma');
  const [telephone, setTelephone] = useState('0661234567');
  const [ville, setVille] = useState('Casablanca');
  const [nomEntreprise, setNomEntreprise] = useState('Atlas Express Logistique SARL');
  const [ice] = useState('002345678000092');
  const [cin] = useState('BK123456');

  // Formulaire Mot de passe
  const [ancienMdp, setAncienMdp] = useState('');
  const [nouveauMdp, setNouveauMdp] = useState('');

  useEffect(() => {
    transporteurService.getMesCamions().then((res) => {
      const list = res.content || [];
      setCamions(list);
      if (list.length > 0) {
        const c = list[0];
        setSelectedCamion(c);
        setCamionMarque(c.marque || 'Volvo');
        setCamionModele(c.modele || 'FH 500');
        setCamionImmat(c.immatriculation || '12345-A-6');
        setCamionType(c.typeCamion || 'SEMI');
        setCamionCharge(c.chargeUtileKg || 24000);
        setCamionVolume(c.volumeM3 || 85);
        if (c.equipements) setEquipements(c.equipements);
        if (c.zonesDesservies) setZones(c.zonesDesservies);
      }
      setIsLoading(false);
    });
  }, []);

  // 1. Sauvegarde Informations Générales Camion
  const handleSaveGeneral = async (e) => {
    e.preventDefault();
    setIsSavingGeneral(true);
    try {
      if (selectedCamion?.id) {
        await client.put(`/api/camions/${selectedCamion.id}`, {
          marque: camionMarque,
          modele: camionModele,
          immatriculation: camionImmat,
          typeCamion: camionType,
          chargeUtileKg: Number(camionCharge),
          volumeM3: Number(camionVolume),
        }).catch(() => {});
      }
      toast.success('Informations du camion sauvegardées avec succès !');
    } catch (err) {
      parseApiError(err);
    } finally {
      setIsSavingGeneral(false);
    }
  };

  // 2. Sauvegarde Équipements
  const handleSaveEquipements = async () => {
    setIsSavingEquipements(true);
    try {
      if (selectedCamion?.id) {
        await client.patch(`/api/camions/${selectedCamion.id}/equipements`, equipements).catch(() => {});
      }
      toast.success('Équipements du véhicule mis à jour.');
    } catch (err) {
      parseApiError(err);
    } finally {
      setIsSavingEquipements(false);
    }
  };

  // 3. Sauvegarde Zones Régionales
  const handleSaveZones = async () => {
    setIsSavingZones(true);
    try {
      if (selectedCamion?.id) {
        await client.patch(`/api/camions/${selectedCamion.id}/zones`, zones).catch(() => {});
      }
      toast.success("Zones régionales d'activité mises à jour.");
    } catch (err) {
      parseApiError(err);
    } finally {
      setIsSavingZones(false);
    }
  };

  // 4. Sauvegarde Profil
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      await client.put('/api/me', {
        nom,
        prenom,
        telephone,
        ville,
        nomEntreprise,
      }).catch(() => {});
      toast.success('Votre profil a été mis à jour.');
    } catch (err) {
      parseApiError(err);
    } finally {
      setIsSavingProfile(false);
    }
  };

  // 5. Sauvegarde Mot de passe
  const handleSavePassword = async (e) => {
    e.preventDefault();
    if (nouveauMdp.length < 6) {
      toast.error('Le mot de passe doit comporter au moins 6 caractères.');
      return;
    }
    setIsSavingPassword(true);
    try {
      await client.put('/api/me/password', {
        ancienMotDePasse: ancienMdp,
        nouveauMotDePasse: nouveauMdp,
      });
      toast.success('Mot de passe changé avec succès !');
      setAncienMdp('');
      setNouveauMdp('');
    } catch (err) {
      parseApiError(err);
    } finally {
      setIsSavingPassword(false);
    }
  };

  const toggleEquipement = (eqId) => {
    setEquipements((prev) =>
      prev.includes(eqId) ? prev.filter((id) => id !== eqId) : [...prev, eqId]
    );
  };

  const toggleZone = (zName) => {
    setZones((prev) =>
      prev.includes(zName) ? prev.filter((name) => name !== zName) : [...prev, zName]
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1A3A5C', margin: 0 }}>
              Mon Camion & Profil Professionnel
            </h1>
            <DemoBadge />
          </div>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#718096' }}>
            Gestion de vos véhicules, équipements certifiés et coordonnées d'entreprise.
          </p>
        </div>
      </div>

      {/* TABS */}
      <Tabs
        tabs={[
          { id: 'camion', label: 'Mon Camion & Flotte', icon: <FiTruck /> },
          { id: 'profil', label: 'Profil Transporteur & Sécurité', icon: <FiUser /> },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* VUE 1 : MON CAMION (SAUVEGARDE PAR SECTION) */}
      {activeTab === 'camion' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* SÉLECTEUR DE CAMION SI MULTIPLES */}
          {camions.length > 1 && (
            <div style={{ display: 'flex', gap: 12 }}>
              {camions.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCamion(c)}
                  className="st-btn"
                  style={{
                    backgroundColor: selectedCamion?.id === c.id ? '#1A3A5C' : '#FFFFFF',
                    color: selectedCamion?.id === c.id ? '#FFFFFF' : '#1A202C',
                    border: '1px solid #E2E8F0',
                  }}
                >
                  <FiTruck size={14} />
                  <span>{c.marque} {c.modele} ({c.immatriculation})</span>
                </button>
              ))}
            </div>
          )}

          {/* SECTION 1 : INFORMATIONS GÉNÉRALES & CAPACITÉ */}
          <Card title="1. Informations générales du véhicule" subtitle="Marque, immatriculation et type technique">
            <form onSubmit={handleSaveGeneral}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                <Input
                  label="Marque"
                  required={true}
                  value={camionMarque}
                  onChange={(e) => setCamionMarque(e.target.value)}
                />
                <Input
                  label="Modèle"
                  required={true}
                  value={camionModele}
                  onChange={(e) => setCamionModele(e.target.value)}
                />
                <Input
                  label="Immatriculation (Maroc)"
                  required={true}
                  value={camionImmat}
                  onChange={(e) => setCamionImmat(e.target.value)}
                />
                <Select
                  label="Type de camion"
                  value={camionType}
                  onChange={(e) => setCamionType(e.target.value)}
                >
                  <option value="SEMI">Semi-remorque (38t-40t)</option>
                  <option value="CAMION_10T">Porteur 10t</option>
                  <option value="CAMION_5T">Camion 5t</option>
                  <option value="FOURGON">Fourgon 1,5t</option>
                  <option value="FRIGORIFIQUE">Frigorifique</option>
                  <option value="PLATEAU">Plateau</option>
                </Select>
                <Input
                  label="Charge utile max (kg)"
                  type="number"
                  value={camionCharge}
                  onChange={(e) => setCamionCharge(e.target.value)}
                />
                <Input
                  label="Volume utile (m³)"
                  type="number"
                  value={camionVolume}
                  onChange={(e) => setCamionVolume(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
                <Button type="submit" variant="primary" icon={<FiSave />} isLoading={isSavingGeneral}>
                  Sauvegarder les informations du véhicule
                </Button>
              </div>
            </form>
          </Card>

          {/* SECTION 2 : ÉQUIPEMENTS DU CAMION */}
          <Card
            title="2. Équipements certifiés"
            subtitle="Cochez les options disponibles pour attirer les expéditeurs ciblés"
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
              {allEquipements.map((eq) => {
                const isChecked = equipements.includes(eq.id);
                return (
                  <label
                    key={eq.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: 14,
                      borderRadius: 6,
                      border: isChecked ? '1.5px solid #1A3A5C' : '1px solid #E2E8F0',
                      backgroundColor: isChecked ? '#E8EEF5' : '#FFFFFF',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleEquipement(eq.id)}
                      style={{ cursor: 'pointer' }}
                    />
                    <strong style={{ fontSize: 13, color: '#1A202C' }}>{eq.label}</strong>
                  </label>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
              <Button
                variant="primary"
                icon={<FiSave />}
                onClick={handleSaveEquipements}
                isLoading={isSavingEquipements}
              >
                Sauvegarder les équipements
              </Button>
            </div>
          </Card>

          {/* SECTION 3 : ZONES RÉGIONALES DESSERVIES */}
          <Card
            title="3. Régions et axes de circulation préférentiels"
            subtitle="Vos liaisons habituelles pour recevoir des alertes de fret pertinentes"
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {allRegions.map((reg) => {
                const isSelected = zones.includes(reg);
                return (
                  <button
                    key={reg}
                    type="button"
                    onClick={() => toggleZone(reg)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: 20,
                      border: isSelected ? '1px solid #F57C00' : '1px solid #CBD5E0',
                      backgroundColor: isSelected ? '#FFF3E0' : '#FFFFFF',
                      color: isSelected ? '#F57C00' : '#4A5568',
                      fontWeight: isSelected ? 600 : 500,
                      fontSize: 13,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <FiMapPin size={13} />
                    <span>{reg}</span>
                    {isSelected && <FiCheck size={13} />}
                  </button>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
              <Button
                variant="primary"
                icon={<FiSave />}
                onClick={handleSaveZones}
                isLoading={isSavingZones}
              >
                Sauvegarder les zones desservies
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* VUE 2 : PROFIL TRANSPORTEUR & SÉCURITÉ */}
      {activeTab === 'profil' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* COORDONNÉES PERSONNELLES & ENTREPRISE */}
          <Card title="Identité professionnelle & Légale" subtitle="Informations déclarées à l'inscription">
            <form onSubmit={handleSaveProfile}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
                <Input
                  label="Nom de famille"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                />
                <Input
                  label="Prénom"
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
                />
                <Input
                  label="Adresse Email"
                  disabled={true}
                  value={email}
                  helperText="Non modifiable (identifiant unique de compte)."
                />
                <Input
                  label="Téléphone de contact"
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                />
                <Input
                  label="Ville de rattachement"
                  value={ville}
                  onChange={(e) => setVille(e.target.value)}
                />
                <Input
                  label="Raison sociale / Entreprise"
                  value={nomEntreprise}
                  onChange={(e) => setNomEntreprise(e.target.value)}
                />
                <Input
                  label="Identifiant Commun Entreprise (ICE)"
                  disabled={true}
                  value={ice}
                  helperText="Vérifié par l'administration."
                />
                <Input
                  label="Numéro CIN"
                  disabled={true}
                  value={cin}
                  helperText="Vérifié par l'administration."
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
                <Button type="submit" variant="primary" icon={<FiSave />} isLoading={isSavingProfile}>
                  Enregistrer les modifications du profil
                </Button>
              </div>
            </form>
          </Card>

          {/* SÉCURITÉ & CHANGEMENT DE MOT DE PASSE */}
          <Card title="Sécurité du compte" subtitle="Mettre à jour votre mot de passe de connexion">
            <form onSubmit={handleSavePassword} style={{ maxWidth: 440 }}>
              <Input
                label="Mot de passe actuel"
                type="password"
                required={true}
                value={ancienMdp}
                onChange={(e) => setAncienMdp(e.target.value)}
                placeholder="••••••••"
              />

              <Input
                label="Nouveau mot de passe"
                type="password"
                required={true}
                value={nouveauMdp}
                onChange={(e) => setNouveauMdp(e.target.value)}
                placeholder="••••••••"
                helperText="Au moins 6 caractères recommandés."
              />

              <div style={{ marginTop: 16 }}>
                <Button type="submit" variant="secondary" icon={<FiLock />} isLoading={isSavingPassword}>
                  Modifier mon mot de passe
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default MonCamionProfilePage;
