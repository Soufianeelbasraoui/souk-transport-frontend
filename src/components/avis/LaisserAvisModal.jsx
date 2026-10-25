import React, { useState } from 'react';
import { FiStar, FiX, FiCheckCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';
import avisService from '../../api/services/avisService';
import Button from '../common/Button';

export const LaisserAvisModal = ({ isOpen, onClose, cargaisonId, transporteurId, transporteurNom, onCreated }) => {
  const [noteGlobale, setNoteGlobale] = useState(5);
  const [notePonctualite, setNotePonctualite] = useState(5);
  const [noteSoin, setNoteSoin] = useState(5);
  const [noteCommunication, setNoteCommunication] = useState(5);
  const [commentaire, setCommentaire] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const created = await avisService.creerAvis({
        cargaisonId: cargaisonId || 1,
        transporteurId: transporteurId || 1,
        noteGlobale,
        notePonctualite,
        noteSoinMarchandise: noteSoin,
        noteCommunication,
        commentaire,
      });
      toast.success('Merci ! Votre avis certifié a été publié.');
      if (onCreated) onCreated(created);
      onClose();
    } catch {
      toast.error("Erreur lors de l'enregistrement de votre évaluation.");
    } finally {
      setSubmitting(false);
    }
  };

  const StarSelector = ({ value, onChange, label }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: '0.85rem', color: '#4A5568', fontWeight: 500 }}>{label}</span>
      <div style={{ display: 'flex', gap: '4px' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '2px',
              color: star <= value ? '#D69E2E' : '#CBD5E0',
            }}
          >
            <FiStar size={18} fill={star <= value ? '#D69E2E' : 'none'} />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="st-modal-backdrop" onClick={onClose} style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
    }}>
      <div className="st-modal-card" onClick={(e) => e.stopPropagation()} style={{
        backgroundColor: '#FFFFFF', borderRadius: '12px', maxWidth: '520px', width: '100%',
        padding: '24px', border: '1px solid #E2E8F0',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0', paddingBottom: '14px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#1A202C' }}>
              Évaluer la prestation
            </h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#718096' }}>
              Transporteur : {transporteurNom || 'Mohamed El Fassi Transport'}
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#A0AEC0' }}>
            <FiX size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ backgroundColor: '#F8FAFC', padding: '14px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <StarSelector value={noteGlobale} onChange={setNoteGlobale} label="Note Globale *" />
            <StarSelector value={notePonctualite} onChange={setNotePonctualite} label="Ponctualité (Départ & Arrivée)" />
            <StarSelector value={noteSoin} onChange={setNoteSoin} label="Soin de la marchandise & Arrimoir" />
            <StarSelector value={noteCommunication} onChange={setNoteCommunication} label="Communication & Suivi" />
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
              Votre commentaire certifié :
            </label>
            <textarea
              rows={3}
              placeholder="Partagez votre expérience sur la qualité du transport, le respect des délais et le professionnalisme..."
              value={commentaire}
              onChange={(e) => setCommentaire(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E0', fontSize: '0.875rem' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid #E2E8F0', paddingTop: '16px' }}>
            <Button type="button" variant="secondary" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              Publier mon évaluation
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LaisserAvisModal;
