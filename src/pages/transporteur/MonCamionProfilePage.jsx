import React, { useState, useEffect, useCallback } from 'react';
import {
  FiTruck,
  FiUser,
  FiSave,
  FiCheck,
  FiMapPin,
  FiLock,
  FiFileText,
  FiUploadCloud,
  FiCreditCard,
  FiPlus,
  FiTrash2,
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import transporteurService from '../../api/services/transporteurService';
import camionService from '../../api/services/camionService';
import documentService from '../../api/services/documentService';
import client from '../../api/client';
import { parseApiError } from '../../utils/parseApiError';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Tabs from '../../components/common/Tabs';
import DemoBadge from '../../components/common/DemoBadge';
import Badge from '../../components/common/Badge';
import AjouterCamionModal from '../../components/camion/AjouterCamionModal';

export const MonCamionProfilePage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('camion');
  const [camions, setCamions] = useState([]);
  const [selectedCamion, setSelectedCamion] = useState(null);
  const [isAddCamionModalOpen, setIsAddCamionModalOpen] = useState(false);

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

  const [ancienMdp, setAncienMdp] = useState('');
  const [nouveauMdp, setNouveauMdp] = useState('');

  // Documents KYC
  const [documents, setDocuments] = useState([]);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [nouveauDocType, setNouveauDocType] = useState('ASSURANCE');

  // Coordonnées Bancaires / RIB
  const [nomBanque, setNomBanque] = useState('Attijariwafa Bank');
  const [titulaireRib, setTitulaireRib] = useState('Mohamed El Fassi Transport');
  const [ribCode, setRibCode] = useState('007 780 0001234567890123 45');
  const [isSavingRib, setIsSavingRib] = useState(false);

  const [isLoading, setIsLoading] = useState(true);

  const selectCamion = useCallback((c) => {
    if (!c) {
      setSelectedCamion(null);
      return;
    }
    setSelectedCamion(c);
    setCamionMarque(c.marque || '');
    setCamionModele(c.modele || '');
    setCamionImmat(c.immatriculation || '');
    setCamionType(c.type || c.typeCamion || 'SEMI');
    setCamionCharge(c.capacite ?? c.chargeUtileKg ?? 24000);
    setCamionVolume(c.volumeCapacite ?? c.volumeM3 ?? 85);
    if (c.equipements) setEquipements(c.equipements);
    if (c.zonesPreferentielles || c.zonesDesservies) {
      setZones(c.zonesPreferentielles || c.zonesDesservies);
    }
  }, []);

  const fetchCamions = useCallback(async () => {
    try {
      const resCamions = await camionService.getMesCamions({ page: 0, size: 20 });
      const list = resCamions.content || (Array.isArray(resCamions) ? resCamions : []);
      setCamions(list);
      if (list.length > 0) {
        setSelectedCamion((prev) => {
          const found = list.find((item) => item.id === prev?.id) || list[0];
          selectCamion(found);
          return found;
        });
      } else {
        setSelectedCamion(null);
      }
      return list;
    } catch (err) {
      console.warn('Erreur chargement camions:', err);
      return [];
    }
  }, [selectCamion]);

  useEffect(() => {
    Promise.all([
      fetchCamions(),
      documentService.getMesDocuments(),
    ]).then(([_, resDocs]) => {
      setDocuments(Array.isArray(resDocs) ? resDocs : []);
      setIsLoading(false);
    });
  }, [fetchCamions]);

  const handleDeleteCamion = async (camionId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer définitivement ce camion de votre flotte ?")) return;
    try {
      await camionService.supprimerCamion(camionId);
      toast.success("Camion supprimé de votre flotte.");
      await fetchCamions();
    } catch (err) {
      parseApiError(err);
    }
  };

  const handleUploadDocument = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploadingDoc(true);
    try {
      const uploadRes = await documentService.uploadFichier(file);
      const doc = await documentService.enregistrerDocument({
        typeDocument: nouveauDocType,
        nomFichier: uploadRes.nomFichier || file.name,
        urlFichier: uploadRes.url || '#',
      });
      setDocuments((prev) => [...prev, doc]);
      toast.success(`Document ${nouveauDocType} soumis pour validation par l'administration.`);
    } catch {
      toast.error("Erreur lors de l'envoi du document.");
    } finally {
      setIsUploadingDoc(false);
    }
  };

  const handleSaveRib = async (e) => {
    e.preventDefault();
    setIsSavingRib(true);
    try {
      await transporteurService.enregistrerCompteBancaire({
        nomBanque,
        titulaire: titulaireRib,
        rib: ribCode,
      });
      toast.success('Coordonnées bancaires enregistrées pour vos virements de fret.');
    } catch {
      toast.error("Erreur lors de l'enregistrement du RIB.");
    } finally {
      setIsSavingRib(false);
    }
  };

  // 1. Sauvegarde Informations Générales Camion (PUT /api/camions/{id})
  const handleSaveGeneral = async (e) => {
    e.preventDefault();
    if (!selectedCamion?.id) {
      toast.error("Aucun camion sélectionné à modifier. Cliquez sur 'Ajouter un camion'.");
      return;
    }
    setIsSavingGeneral(true);
    try {
      await camionService.modifierCamion(selectedCamion.id, {
        marque: camionMarque,
        modele: camionModele,
        immatriculation: camionImmat,
        type: camionType,
        capacite: Number(camionCharge),
        volumeCapacite: Number(camionVolume),
        equipements,
        zonesPreferentielles: zones,
      });
      toast.success('Informations du camion sauvegardées dans la base de données !');
      await fetchCamions();
    } catch (err) {
      parseApiError(err);
    } finally {
      setIsSavingGeneral(false);
    }
  };

  // 2. Sauvegarde Équipements (PATCH /api/camions/{id}/equipements)
  const handleSaveEquipements = async () => {
    if (!selectedCamion?.id) {
      toast.error("Veuillez sélectionner un camion.");
      return;
    }
    setIsSavingEquipements(true);
    try {
      await camionService.modifierEquipements(selectedCamion.id, equipements);
      toast.success('Équipements du véhicule mis à jour dans la base de données.');
      await fetchCamions();
    } catch (err) {
      parseApiError(err);
    } finally {
      setIsSavingEquipements(false);
    }
  };

  // 3. Sauvegarde Zones Régionales (PATCH /api/camions/{id}/zones)
  const handleSaveZones = async () => {
    if (!selectedCamion?.id) {
      toast.error("Veuillez sélectionner un camion.");
      return;
    }
    setIsSavingZones(true);
    try {
      await camionService.modifierZones(selectedCamion.id, zones);
      toast.success("Zones régionales d'activité mises à jour dans la base de données.");
      await fetchCamions();
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1A3A5C', margin: 0 }}>
              Mon Camion & Flotte ({camions.length} véhicules)
            </h1>
            <DemoBadge />
          </div>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#718096' }}>
            Gestion de vos véhicules, équipements certifiés et coordonnées professionnelles.
          </p>
        </div>

        <Button
          variant="primary"
          icon={<FiPlus />}
          onClick={() => setIsAddCamionModalOpen(true)}
        >
          Ajouter un camion
        </Button>
      </div>

      {/* TABS */}
      <Tabs
        tabs={[
          { id: 'camion', label: `Flotte & Véhicules (${camions.length})`, icon: <FiTruck /> },
          { id: 'profil', label: 'Profil & Coordonnées Bancaires', icon: <FiUser /> },
          { id: 'documents', label: 'Documents KYC & Conformité', icon: <FiFileText /> },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* VUE 1 : MON CAMION (SAUVEGARDE PAR SECTION) */}
      {activeTab === 'camion' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* GESTION COMPLÈTE DE LA FLOTTE */}
          <Card
            title="Flotte de véhicules enregistrés"
            subtitle={`${camions.length} véhicule(s) dans votre parc automobile`}
            actions={
              <Button
                variant="outline"
                size="sm"
                icon={<FiPlus />}
                onClick={() => setIsAddCamionModalOpen(true)}
              >
                Nouveau véhicule
              </Button>
            }
          >
            {camions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px 20px', backgroundColor: '#F8FAFC', borderRadius: 8 }}>
                <FiTruck size={42} color="#94A3B8" style={{ marginBottom: 12 }} />
                <h3 style={{ margin: '0 0 6px', fontSize: 16, color: '#1E293B' }}>
                  Aucun camion enregistré dans votre flotte
                </h3>
                <p style={{ margin: '0 0 16px', fontSize: 13, color: '#64748B', maxWidth: 440, marginLeft: 'auto', marginRight: 'auto' }}>
                  Pour publier des annonces de trajets et être contacté par des expéditeurs, ajoutez votre premier camion.
                </p>
                <Button
                  variant="primary"
                  icon={<FiPlus />}
                  onClick={() => setIsAddCamionModalOpen(true)}
                >
                  Ajouter mon premier camion
                </Button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
                {camions.map((c) => {
                  const isSelected = selectedCamion?.id === c.id;
                  return (
                    <div
                      key={c.id}
                      style={{
                        padding: 16,
                        borderRadius: 8,
                        border: `2px solid ${isSelected ? '#0D9488' : '#E2E8F0'}`,
                        backgroundColor: isSelected ? '#F0FDFA' : '#FFFFFF',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 10,
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <strong style={{ fontSize: 15, color: '#1A3A5C', display: 'block' }}>
                            {c.marque} {c.modele}
                          </strong>
                          <span
                            style={{
                              display: 'inline-block',
                              marginTop: 4,
                              fontSize: 12,
                              fontWeight: 700,
                              letterSpacing: 1,
                              backgroundColor: '#1E293B',
                              color: '#F8FAFC',
                              padding: '2px 8px',
                              borderRadius: 4,
                            }}
                          >
                            {c.immatriculation}
                          </span>
                        </div>
                        <Badge status={c.disponible !== false ? 'DISPONIBLE' : 'ARCHIVE'} label={c.disponible !== false ? 'Actif' : 'Indisponible'} />
                      </div>

                      <div style={{ fontSize: 12, color: '#64748B', display: 'flex', gap: 12 }}>
                        <span>Charge : <strong>{(c.capacite ?? c.chargeUtileKg)?.toLocaleString()} kg</strong></span>
                        <span>•</span>
                        <span>Volume : <strong>{c.volumeCapacite ?? c.volumeM3} m³</strong></span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4, borderTop: '1px solid #E2E8F0', paddingTop: 10 }}>
                        <button
                          type="button"
                          onClick={() => selectCamion(c)}
                          style={{
                            background: 'none',
                            border: 'none',
                            padding: 0,
                            fontSize: 12,
                            fontWeight: 600,
                            color: isSelected ? '#0D9488' : '#1A3A5C',
                            cursor: 'pointer',
                            textDecoration: 'underline',
                          }}
                        >
                          {isSelected ? '✓ En cours d’édition' : 'Sélectionner pour modifier'}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteCamion(c.id)}
                          title="Supprimer ce camion"
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#EF4444',
                            cursor: 'pointer',
                            padding: 4,
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          <FiTrash2 size={15} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* SECTION 1 : INFORMATIONS GÉNÉRALES & CAPACITÉ DU CAMION SÉLECTIONNÉ */}
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

          {/* COORDONNÉES BANCAIRES / VIREMENTS DE FRET */}
          <Card title="Coordonnées Bancaires pour Règlements" subtitle="RIB marocain (24 caractères) utilisé pour recevoir vos gains de fret">
            <form onSubmit={handleSaveRib}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
                <Input
                  label="Établissement bancaire"
                  value={nomBanque}
                  onChange={(e) => setNomBanque(e.target.value)}
                  placeholder="Ex: Attijariwafa Bank, BMCE Bank, Banque Populaire"
                />
                <Input
                  label="Titulaire du compte"
                  value={titulaireRib}
                  onChange={(e) => setTitulaireRib(e.target.value)}
                  placeholder="Nom de l'entreprise ou titulaire"
                />
                <Input
                  label="Relevé d'Identité Bancaire (RIB)"
                  value={ribCode}
                  onChange={(e) => setRibCode(e.target.value)}
                  placeholder="007 780 0001234567890123 45"
                  helperText="Format standard marocain à 24 chiffres."
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
                <Button type="submit" variant="primary" icon={<FiCreditCard />} isLoading={isSavingRib}>
                  Mettre à jour mes coordonnées bancaires
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* VUE 3 : DOCUMENTS KYC & CONFORMITÉ */}
      {activeTab === 'documents' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* CARTE ÉTAT DU DOSSIER */}
          <Card title="Dossier Administratif Transporteur" subtitle="Conformité réglementaire et validation par les équipes SoukTransport">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <span style={{ fontSize: 13, color: '#718096', display: 'block' }}>Statut général du compte :</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                  <Badge variant="success">Compte Vérifié & Autorisé</Badge>
                  <span style={{ fontSize: 13, color: '#4A5568' }}>Toutes les pièces obligatoires sont en règle.</span>
                </div>
              </div>
            </div>
          </Card>

          {/* LISTE DES DOCUMENTS */}
          <Card title="Pièces Déposées au Dossier" subtitle="Consultez l'état de validation de vos pièces légales">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 16px',
                    borderRadius: 8,
                    border: '1px solid #E2E8F0',
                    backgroundColor: '#F8FAFC',
                    flexWrap: 'wrap',
                    gap: 12,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 6, backgroundColor: '#EBF4FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1A3A5C' }}>
                      <FiFileText size={18} />
                    </div>
                    <div>
                      <strong style={{ fontSize: 14, color: '#1A202C' }}>{doc.typeDocument}</strong>
                      <span style={{ fontSize: 12, color: '#718096', display: 'block' }}>{doc.nomFichier}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {doc.dateExpiration && (
                      <span style={{ fontSize: 12, color: '#718096' }}>
                        Expire le : {new Date(doc.dateExpiration).toLocaleDateString()}
                      </span>
                    )}
                    <Badge variant={doc.statut === 'VALIDE' ? 'success' : doc.statut === 'REJETE' ? 'danger' : 'warning'}>
                      {doc.statut}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* FORMULAIRE DE SOUMISSION D'UN NOUVEAU DOCUMENT */}
          <Card title="Ajouter ou Renouveler un Document Officiel" subtitle="Téléversez vos justificatifs au format PDF ou image (CIN, RC, Police d'assurance fret, Permis)">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, alignItems: 'flex-end' }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Type de document :</label>
                <select
                  value={nouveauDocType}
                  onChange={(e) => setNouveauDocType(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #CBD5E0', fontSize: 14 }}
                >
                  <option value="ASSURANCE">Police d'assurance marchandises transportées</option>
                  <option value="CARTE_GRISE">Carte grise du camion</option>
                  <option value="PERMIS">Permis de conduire catégorie EC</option>
                  <option value="RC">Registre de Commerce (Modèle 7)</option>
                  <option value="CIN">Carte d'Identité Nationale (Gérant / Chauffeur)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Fichier à téléverser (PDF, PNG, JPG) :</label>
                <input
                  type="file"
                  onChange={handleUploadDocument}
                  disabled={isUploadingDoc}
                  style={{ width: '100%', padding: '7px 10px', borderRadius: 8, border: '1px solid #CBD5E0', fontSize: 13 }}
                />
              </div>
            </div>

            {isUploadingDoc && (
              <div style={{ marginTop: 12, fontSize: 13, color: '#2B6CB0' }}>
                Envoi et chiffrement du document en cours...
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Modal d'ajout d'un nouveau camion */}
      <AjouterCamionModal
        isOpen={isAddCamionModalOpen}
        onClose={() => setIsAddCamionModalOpen(false)}
        onCamionAjoute={() => fetchCamions()}
      />
    </div>
  );
};

export default MonCamionProfilePage;

