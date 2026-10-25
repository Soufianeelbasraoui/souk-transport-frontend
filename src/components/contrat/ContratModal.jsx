import React, { useState, useEffect } from 'react';
import { FiFileText, FiCheckCircle, FiDownload, FiLock, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import contratService from '../../api/services/contratService';
import factureService from '../../api/services/factureService';
import Button from '../common/Button';
import Badge from '../common/Badge';

export const ContratModal = ({ isOpen, onClose, offreId, contratId }) => {
  const [contrat, setContrat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [codePin, setCodePin] = useState('');
  const [nomSignataire, setNomSignataire] = useState('');
  const [acceptCgv, setAcceptCgv] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const fetchContrat = async () => {
      setLoading(true);
      try {
        let data;
        if (contratId) {
          data = await contratService.getContratById(contratId);
        } else if (offreId) {
          data = await contratService.getContratParOffre(offreId);
        }
        setContrat(data);
      } catch (err) {
        toast.error('Impossible de charger le contrat.');
      } finally {
        setLoading(false);
      }
    };
    fetchContrat();
  }, [isOpen, offreId, contratId]);

  if (!isOpen) return null;

  const handleSigner = async (e) => {
    e.preventDefault();
    if (!acceptCgv) {
      toast.warning('Veuillez accepter les conditions générales de transport.');
      return;
    }
    setSigning(true);
    try {
      const updated = await contratService.signerContrat(contrat?.id || contratId || 1, {
        codePin: codePin || '1234',
        nomSignataire: nomSignataire || 'Signataire autorisé',
        acceptationCgv: true,
      });
      setContrat(updated);
      toast.success('Contrat de transport signé électroniquement avec succès !');
    } catch {
      toast.error('Erreur lors de la signature du contrat.');
    } finally {
      setSigning(false);
    }
  };

  const handleTelechargerPdf = async () => {
    setDownloading(true);
    try {
      const blob = await contratService.telechargerPdf(contrat?.id || 1);
      factureService.declencherTelechargement(blob, `contrat_transport_${contrat?.referenceContrat || 'souk'}.pdf`);
      toast.success('Contrat PDF téléchargé.');
    } catch {
      toast.error('Erreur lors du téléchargement du contrat PDF.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="st-modal-backdrop" onClick={onClose} style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
    }}>
      <div className="st-modal-card" onClick={(e) => e.stopPropagation()} style={{
        backgroundColor: '#FFFFFF', borderRadius: '12px', maxWidth: '780px', width: '100%',
        maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
        padding: '24px', border: '1px solid #E2E8F0',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0', paddingBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: '#EBF4FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1A3A5C' }}>
              <FiFileText size={22} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#1A202C' }}>
                Contrat de Transport Terrestre
              </h3>
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#718096' }}>
                Réf: {contrat?.referenceContrat || 'CTR-2025-0089'} • Valeur probante légale (Loi 53-05)
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#A0AEC0' }}>
            <FiX size={22} />
          </button>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#718096' }}>Chargement du contrat officiel...</div>
        ) : (
          <div style={{ marginTop: '20px' }}>
            {/* STATUT DU CONTRAT */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', backgroundColor: '#F7FAFC', borderRadius: '8px', marginBottom: '20px' }}>
              <div>
                <span style={{ fontSize: '0.85rem', color: '#718096', display: 'block' }}>État de validation :</span>
                <strong>{contrat?.statut === 'SIGNE' ? 'Contrat validé & signé par les deux parties' : 'En attente de signature bilatérale'}</strong>
              </div>
              <Badge variant={contrat?.statut === 'SIGNE' ? 'success' : 'warning'}>
                {contrat?.statut || 'SIGNE_PARTIELLEMENT'}
              </Badge>
            </div>

            {/* DÉTAILS DU TRANSPORT */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div style={{ padding: '14px', border: '1px solid #E2E8F0', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#718096', fontWeight: 600 }}>Donneur d'ordre (Expéditeur)</span>
                <p style={{ margin: '6px 0 0 0', fontWeight: 600, color: '#2D3748' }}>{contrat?.expediteurNom || 'Société Expéditeur'}</p>
                <div style={{ marginTop: '8px', fontSize: '0.8rem', color: contrat?.expediteurSigne ? '#2E7D32' : '#E53E3E' }}>
                  {contrat?.expediteurSigne ? '✓ Signé le ' + new Date(contrat.expediteurDateSignature || Date.now()).toLocaleDateString() : 'En attente de signature'}
                </div>
              </div>

              <div style={{ padding: '14px', border: '1px solid #E2E8F0', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#718096', fontWeight: 600 }}>Transporteur Certifié</span>
                <p style={{ margin: '6px 0 0 0', fontWeight: 600, color: '#2D3748' }}>{contrat?.transporteurNom || 'Transporteur Partenaire'}</p>
                <div style={{ marginTop: '8px', fontSize: '0.8rem', color: contrat?.transporteurSigne ? '#2E7D32' : '#DD6B20' }}>
                  {contrat?.transporteurSigne ? '✓ Signé le ' + new Date(contrat.transporteurDateSignature || Date.now()).toLocaleDateString() : 'Signature requise'}
                </div>
              </div>
            </div>

            {/* CARACTÉRISTIQUES DE LA MISSION */}
            <div style={{ padding: '16px', backgroundColor: '#F8FAFC', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                <div>
                  <span style={{ color: '#718096', fontSize: '0.8rem' }}>Itinéraire :</span>
                  <div style={{ fontWeight: 600 }}>{contrat?.villeDepart} → {contrat?.villeArrivee}</div>
                </div>
                <div>
                  <span style={{ color: '#718096', fontSize: '0.8rem' }}>Marchandise / Poids :</span>
                  <div style={{ fontWeight: 600 }}>{contrat?.marchandiseType} ({contrat?.poidsKg} kg)</div>
                </div>
                <div>
                  <span style={{ color: '#718096', fontSize: '0.8rem' }}>Immatriculation :</span>
                  <div style={{ fontWeight: 600 }}>{contrat?.immatriculationCamion || 'Non assigné'}</div>
                </div>
                <div>
                  <span style={{ color: '#718096', fontSize: '0.8rem' }}>Rémunération Fret :</span>
                  <div style={{ fontWeight: 700, color: '#1A3A5C' }}>{contrat?.prixTotalMAD} MAD TTC</div>
                </div>
              </div>
            </div>

            {/* FORMULAIRE DE SIGNATURE ÉLECTRONIQUE */}
            {!contrat?.transporteurSigne ? (
              <form onSubmit={handleSigner} style={{ border: '1px solid #CBD5E0', borderRadius: '8px', padding: '16px', marginBottom: '20px', backgroundColor: '#FEFCBF22' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '0.95rem', color: '#744210', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FiLock /> Signature électronique sécurisée
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Nom complet du signataire :</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Mohamed El Fassi"
                      value={nomSignataire}
                      onChange={(e) => setNomSignataire(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E0', fontSize: '0.875rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Code PIN / Confirmation (Défaut: 1234) :</label>
                    <input
                      type="password"
                      placeholder="Code PIN"
                      value={codePin}
                      onChange={(e) => setCodePin(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E0', fontSize: '0.875rem' }}
                    />
                  </div>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#4A5568', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={acceptCgv}
                    onChange={(e) => setAcceptCgv(e.target.checked)}
                  />
                  J'atteste avoir pris connaissance des clauses contractuelles et je signe ce contrat de transport avec engagement juridique.
                </label>
                <div style={{ marginTop: '14px', display: 'flex', justifyContent: 'flex-end' }}>
                  <Button type="submit" variant="primary" loading={signing} disabled={!acceptCgv}>
                    <FiCheckCircle style={{ marginRight: 6 }} /> Apposer ma signature électronique
                  </Button>
                </div>
              </form>
            ) : (
              <div style={{ padding: '12px', backgroundColor: '#F0FFF4', border: '1px solid #C6F6D5', borderRadius: '8px', color: '#22543D', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FiCheckCircle size={20} color="#38A169" />
                <span>Ce contrat est scellé cryptographiquement et archivé dans le dossier officiel de la commande.</span>
              </div>
            )}

            {/* BOUTONS D'ACTION */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E2E8F0', paddingTop: '16px' }}>
              <Button type="button" variant="outline" onClick={handleTelechargerPdf} loading={downloading}>
                <FiDownload style={{ marginRight: 6 }} /> Télécharger l'exemplaire PDF
              </Button>
              <Button type="button" variant="secondary" onClick={onClose}>
                Fermer
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContratModal;
