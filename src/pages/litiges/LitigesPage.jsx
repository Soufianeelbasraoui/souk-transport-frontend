import React, { useState, useEffect } from 'react';
import {
  FiAlertTriangle,
  FiMessageSquare,
  FiPaperclip,
  FiCheckCircle,
  FiClock,
  FiSend,
  FiPlus,
  FiDownload,
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import litigeService from '../../api/services/litigeService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import NouveauLitigeModal from '../../components/litiges/NouveauLitigeModal';

export const LitigesPage = () => {
  const [litiges, setLitiges] = useState([]);
  const [selectedLitige, setSelectedLitige] = useState(null);
  const [loading, setLoading] = useState(true);
  const [nouveauMessage, setNouveauMessage] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchLitiges = async () => {
    setLoading(true);
    try {
      const data = await litigeService.getMesLitiges();
      setLitiges(data);
      if (data.length > 0 && !selectedLitige) {
        setSelectedLitige(data[0]);
      }
    } catch {
      toast.error('Erreur lors du chargement des litiges.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLitiges();
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!nouveauMessage.trim() || !selectedLitige) return;
    setSendingMsg(true);
    try {
      const msg = await litigeService.ajouterMessage(selectedLitige.id, nouveauMessage);
      setSelectedLitige((prev) => ({
        ...prev,
        messages: [...(prev.messages || []), msg],
      }));
      setNouveauMessage('');
      toast.success('Argument contradictoire ajouté au dossier.');
    } catch {
      toast.error("Impossible d'ajouter le message.");
    } finally {
      setSendingMsg(false);
    }
  };

  const handleUploadPreuve = async (e) => {
    const file = e.target.files[0];
    if (!file || !selectedLitige) return;
    try {
      await litigeService.ajouterPreuve(selectedLitige.id, file);
      setSelectedLitige((prev) => ({
        ...prev,
        preuves: [...(prev.preuves || []), file.name],
      }));
      toast.success('Justificatif ajouté au dossier.');
    } catch {
      toast.error("Erreur lors de l'envoi de la preuve.");
    }
  };

  const getStatusBadgeVariant = (statut) => {
    switch (statut) {
      case 'OUVERT':
        return 'danger';
      case 'EN_COURS':
        return 'warning';
      case 'RESOLU':
        return 'success';
      default:
        return 'info';
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px' }}>
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1A202C', margin: '0 0 6px 0' }}>
            Mes Litiges & Réclamations
          </h1>
          <p style={{ margin: 0, color: '#718096', fontSize: '0.95rem' }}>
            Suivi des dossiers d'avarie, arbitrage SoukTransport et séquestre financier sécurisé.
          </p>
        </div>

        <Button variant="danger" onClick={() => setIsModalOpen(true)} style={{ gap: 8 }}>
          <FiPlus /> Déclarer un nouveau litige
        </Button>
      </div>

      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: '#718096' }}>Chargement de vos dossiers...</div>
      ) : litiges.length === 0 ? (
        <Card style={{ padding: '48px', textAlign: 'center' }}>
          <FiCheckCircle size={46} color="#38A169" style={{ margin: '0 auto 12px auto' }} />
          <h3 style={{ fontSize: '1.15rem', color: '#2D3748', margin: '0 0 6px 0' }}>Aucun litige en cours</h3>
          <p style={{ color: '#718096', margin: '0 0 16px 0' }}>
            Toutes vos expéditions et livraisons se sont déroulées sans réclamation active.
          </p>
          <Button variant="outline" onClick={() => setIsModalOpen(true)}>
            Déclarer une anomalie si nécessaire
          </Button>
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '24px' }}>
          {/* LISTE GAUCHE */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {litiges.map((lit) => {
              const isSelected = selectedLitige?.id === lit.id;
              return (
                <div
                  key={lit.id}
                  onClick={() => setSelectedLitige(lit)}
                  style={{
                    padding: '16px',
                    borderRadius: '10px',
                    backgroundColor: isSelected ? '#FFFFFF' : '#F8FAFC',
                    border: isSelected ? '2px solid #E53E3E' : '1px solid #E2E8F0',
                    cursor: 'pointer',
                    boxShadow: isSelected ? '0 4px 6px -1px rgba(0,0,0,0.08)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#E53E3E' }}>
                      {lit.reference}
                    </span>
                    <Badge variant={getStatusBadgeVariant(lit.statut)}>{lit.statut}</Badge>
                  </div>

                  <h4 style={{ margin: '0 0 6px 0', fontSize: '0.95rem', fontWeight: 600, color: '#2D3748' }}>
                    {lit.motif}
                  </h4>

                  <div style={{ fontSize: '0.8rem', color: '#718096', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Montant : {lit.montantEnJeu ? `${lit.montantEnJeu} MAD` : 'À évaluer'}</span>
                    <span>{new Date(lit.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* DÉTAIL DROITE */}
          {selectedLitige && (
            <Card style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #E2E8F0', paddingBottom: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#1A202C' }}>
                      {selectedLitige.motif}
                    </h2>
                    <Badge variant={getStatusBadgeVariant(selectedLitige.statut)}>
                      {selectedLitige.statut}
                    </Badge>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#718096' }}>
                    Dossier {selectedLitige.reference} • Offre associée #{selectedLitige.offreId} • Ouvert le {new Date(selectedLitige.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.8rem', color: '#718096' }}>Préjudice déclaré :</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#E53E3E' }}>
                    {selectedLitige.montantEnJeu ? `${selectedLitige.montantEnJeu} MAD` : 'En expertise'}
                  </div>
                </div>
              </div>

              {/* DESCRIPTION & PREUVES */}
              <div style={{ backgroundColor: '#FFF5F5', padding: '16px', borderRadius: '8px', border: '1px solid #FED7D7' }}>
                <strong style={{ fontSize: '0.85rem', color: '#9B2C2C', display: 'block', marginBottom: '4px' }}>Description initiale :</strong>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#4A5568' }}>{selectedLitige.description}</p>
              </div>

              {/* PIÈCES JUSTIFICATIVES */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#2D3748', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FiPaperclip /> Justificatifs & Pièces versées ({selectedLitige.preuves?.length || 0})
                  </h4>
                  <label style={{ fontSize: '0.8rem', color: '#1A3A5C', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <FiPlus /> Ajouter un fichier
                    <input type="file" onChange={handleUploadPreuve} style={{ display: 'none' }} />
                  </label>
                </div>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {selectedLitige.preuves && selectedLitige.preuves.length > 0 ? (
                    selectedLitige.preuves.map((prv, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          backgroundColor: '#EDF2F7',
                          fontSize: '0.8rem',
                          color: '#2D3748',
                        }}
                      >
                        <FiPaperclip size={12} />
                        <span>{prv}</span>
                      </div>
                    ))
                  ) : (
                    <span style={{ fontSize: '0.85rem', color: '#A0AEC0' }}>Aucun fichier joint au dossier.</span>
                  )}
                </div>
              </div>

              {/* FIL CONTRADICTOIRE & MÉDIATION */}
              <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '16px' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '0.95rem', color: '#2D3748', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FiMessageSquare /> Échanges contradictoires & Arbitrage
                </h4>

                <div style={{
                  maxHeight: '260px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  padding: '12px',
                  backgroundColor: '#F7FAFC',
                  borderRadius: '8px',
                  marginBottom: '14px',
                }}>
                  {selectedLitige.messages && selectedLitige.messages.length > 0 ? (
                    selectedLitige.messages.map((msg, i) => (
                      <div
                        key={i}
                        style={{
                          padding: '10px 14px',
                          backgroundColor: msg.estMoi ? '#EBF8FF' : '#FFFFFF',
                          borderRadius: '8px',
                          border: '1px solid #E2E8F0',
                          fontSize: '0.85rem',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.75rem', color: '#718096' }}>
                          <strong>{msg.auteurNom}</strong>
                          <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div style={{ color: '#2D3748' }}>{msg.contenu}</div>
                      </div>
                    ))
                  ) : (
                    <div style={{ textAlign: 'center', color: '#A0AEC0', padding: '16px' }}>
                      Aucun message échangé pour le moment.
                    </div>
                  )}
                </div>

                {/* FORMULAIRE DE RÉPONSE */}
                <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="text"
                    placeholder="Ajouter une explication ou précision contradictoire..."
                    value={nouveauMessage}
                    onChange={(e) => setNouveauMessage(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E0',
                      fontSize: '0.875rem',
                    }}
                  />
                  <Button type="submit" variant="primary" loading={sendingMsg} disabled={!nouveauMessage.trim()}>
                    <FiSend style={{ marginRight: 6 }} /> Envoyer
                  </Button>
                </form>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* MODAL OUVERTURE LITIGE */}
      <NouveauLitigeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={(newLit) => {
          setLitiges((prev) => [newLit, ...prev]);
          setSelectedLitige(newLit);
        }}
      />
    </div>
  );
};

export default LitigesPage;
