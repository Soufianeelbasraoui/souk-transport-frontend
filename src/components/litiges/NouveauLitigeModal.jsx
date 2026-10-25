import React, { useState } from 'react';
import { FiAlertTriangle, FiUpload, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import litigeService from '../../api/services/litigeService';
import Button from '../common/Button';

export const NouveauLitigeModal = ({ isOpen, onClose, offreId, onCreated }) => {
  const [motif, setMotif] = useState('');
  const [description, setDescription] = useState('');
  const [montantEnJeu, setMontantEnJeu] = useState('');
  const [urgent, setUrgent] = useState(false);
  const [fichierPreuve, setFichierPreuve] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!motif || !description) {
      toast.warning('Veuillez renseigner le motif et la description du litige.');
      return;
    }
    setSubmitting(true);
    try {
      const created = await litigeService.creerLitige({
        offreId: Number(offreId || 201),
        motif,
        description,
        montantEnJeu: montantEnJeu ? Number(montantEnJeu) : null,
        urgent,
      });

      if (fichierPreuve) {
        await litigeService.ajouterPreuve(created.id, fichierPreuve);
      }

      toast.success('Dossier de litige ouvert. Un arbitre SoukTransport a été notifié.');
      if (onCreated) onCreated(created);
      onClose();
    } catch {
      toast.error("Erreur lors de l'ouverture du litige.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="st-modal-backdrop" onClick={onClose} style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
    }}>
      <div className="st-modal-card" onClick={(e) => e.stopPropagation()} style={{
        backgroundColor: '#FFFFFF', borderRadius: '12px', maxWidth: '580px', width: '100%',
        maxHeight: '90vh', overflowY: 'auto', padding: '24px', border: '1px solid #E2E8F0',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0', paddingBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: '#FFF5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E53E3E' }}>
              <FiAlertTriangle size={22} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#1A202C' }}>
                Déclarer un Litige / Réclamation
              </h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#718096' }}>
                Médiation impartiale et protection du séquestre de paiement
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#A0AEC0' }}>
            <FiX size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
              Motif de la réclamation *
            </label>
            <select
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              required
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E0', fontSize: '0.9rem' }}
            >
              <option value="">Sélectionnez un motif...</option>
              <option value="Marchandise endommagée">Marchandise endommagée / Avarie</option>
              <option value="Colis manquant / Perte">Colis manquant / Perte partielle</option>
              <option value="Retard de livraison excessif">Retard de livraison excessif sans préavis</option>
              <option value="Non-conformité du véhicule">Non-conformité du véhicule (absence frigo, bâche trouée)</option>
              <option value="Désaccord sur le montant facturé">Désaccord sur le montant facturé</option>
              <option value="Autre litige">Autre litige logistique</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
              Description détaillée des faits *
            </label>
            <textarea
              rows={4}
              required
              placeholder="Précisez les circonstances, l'état à la livraison, les réserves inscrites sur la lettre de voiture (CMR)..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E0', fontSize: '0.9rem' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                Montant du préjudice estimé (MAD)
              </label>
              <input
                type="number"
                placeholder="Ex: 4500"
                value={montantEnJeu}
                onChange={(e) => setMontantEnJeu(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E0', fontSize: '0.9rem' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                Pièce justificative (Constat, Photo, BL)
              </label>
              <input
                type="file"
                onChange={(e) => setFichierPreuve(e.target.files[0])}
                style={{ width: '100%', padding: '7px 10px', borderRadius: '8px', border: '1px solid #CBD5E0', fontSize: '0.85rem' }}
              />
            </div>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#4A5568', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={urgent}
              onChange={(e) => setUrgent(e.target.checked)}
            />
            Signaler ce litige comme URGENT (priorité sous 24h)
          </label>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid #E2E8F0', paddingTop: '16px' }}>
            <Button type="button" variant="secondary" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" variant="danger" loading={submitting}>
              Ouvrir le dossier de litige
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NouveauLitigeModal;
