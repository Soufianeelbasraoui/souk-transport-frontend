import React, { useState } from 'react';
import { FiTrendingUp, FiDollarSign, FiCheck, FiX, FiInfo } from 'react-icons/fi';
import { toast } from 'react-toastify';
import tarificationService from '../../api/services/tarificationService';
import Button from '../common/Button';

export const TarificationEstimatorModal = ({ isOpen, onClose, defaultDepart = '', defaultArrivee = '', onSelectPrix }) => {
  const [villeDepart, setVilleDepart] = useState(defaultDepart || 'Casablanca');
  const [villeArrivee, setVilleArrivee] = useState(defaultArrivee || 'Tanger');
  const [poids, setPoids] = useState(1500);
  const [volume, setVolume] = useState(6);
  const [typeMarchandise, setTypeMarchandise] = useState('');
  const [retourAVide, setRetourAVide] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [result, setResult] = useState(null);

  if (!isOpen) return null;

  const handleCalculer = async (e) => {
    e.preventDefault();
    if (!villeDepart || !villeArrivee) {
      toast.warning('Veuillez spécifier la ville de départ et d’arrivée.');
      return;
    }
    setCalculating(true);
    try {
      const data = await tarificationService.estimerTarif({
        villeDepart,
        villeArrivee,
        poids,
        volume,
        typeMarchandise,
        retourAVide,
      });
      setResult(data);
    } catch {
      toast.error("Erreur lors de l'estimation tarifaire.");
    } finally {
      setCalculating(false);
    }
  };

  return (
    <div className="st-modal-backdrop" onClick={onClose} style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
    }}>
      <div className="st-modal-card" onClick={(e) => e.stopPropagation()} style={{
        backgroundColor: '#FFFFFF', borderRadius: '12px', maxWidth: '600px', width: '100%',
        maxHeight: '90vh', overflowY: 'auto', padding: '24px', border: '1px solid #E2E8F0',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0', paddingBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: '#EBF8FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2B6CB0' }}>
              <FiTrendingUp size={22} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#1A202C' }}>
                Simulateur de Tarification Dynamique
              </h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#718096' }}>
                Algorithme prédictif du marché marocain du fret
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#A0AEC0' }}>
            <FiX size={22} />
          </button>
        </div>

        <form onSubmit={handleCalculer} style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Ville Départ :</label>
              <input
                type="text"
                required
                value={villeDepart}
                onChange={(e) => setVilleDepart(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E0', fontSize: '0.875rem' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Ville Arrivée :</label>
              <input
                type="text"
                required
                value={villeArrivee}
                onChange={(e) => setVilleArrivee(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E0', fontSize: '0.875rem' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Poids (kg) :</label>
              <input
                type="number"
                min="50"
                value={poids}
                onChange={(e) => setPoids(Number(e.target.value))}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E0', fontSize: '0.875rem' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Volume (m³) :</label>
              <input
                type="number"
                min="1"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E0', fontSize: '0.875rem' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Type Fret :</label>
              <select
                value={typeMarchandise}
                onChange={(e) => setTypeMarchandise(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E0', fontSize: '0.875rem' }}
              >
                <option value="">Fret Général / Standard</option>
                <option value="ALIMENTAIRE">Alimentaire & Primeurs</option>
                <option value="REFRIGERE">Frigorifique / Réfrigéré</option>
                <option value="MATERIAUX">Matériaux de construction</option>
                <option value="TEXTILE">Textile & Habillement</option>
                <option value="ELECTRONIQUE">Électronique & Matériel</option>
                <option value="FRAGILE">Marchandises fragiles</option>
                <option value="DANGEREUX">Marchandises dangereuses (ADR)</option>
              </select>
            </div>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#4A5568', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={retourAVide}
              onChange={(e) => setRetourAVide(e.target.checked)}
            />
            Appliquer la remise retour à vide (Backhaul optimization ~25% remise)
          </label>

          <Button type="submit" variant="primary" loading={calculating} style={{ width: '100%' }}>
            Lancer l'estimation algorithmique
          </Button>
        </form>

        {/* RÉSULTATS D'ESTIMATION */}
        {result && (
          <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '0.95rem', color: '#2D3748', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FiDollarSign /> Fourchette Tarifaire Conseillée (MAD TTC)
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr 1fr', gap: '10px', textAlign: 'center', marginBottom: '16px' }}>
              <div style={{ padding: '12px', backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: '0.75rem', color: '#718096', display: 'block' }}>Minimum Fret</span>
                <strong style={{ fontSize: '1.1rem', color: '#4A5568' }}>{result.estimationMin} MAD</strong>
              </div>

              <div style={{ padding: '12px', backgroundColor: '#EBF4FF', borderRadius: '8px', border: '2px solid #1A3A5C' }}>
                <span style={{ fontSize: '0.75rem', color: '#2B6CB0', fontWeight: 700, display: 'block' }}>Conseillé SoukTransport</span>
                <strong style={{ fontSize: '1.35rem', color: '#1A3A5C' }}>{result.estimationConseillee} MAD</strong>
              </div>

              <div style={{ padding: '12px', backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: '0.75rem', color: '#718096', display: 'block' }}>Plein Tarif</span>
                <strong style={{ fontSize: '1.1rem', color: '#4A5568' }}>{result.estimationMax} MAD</strong>
              </div>
            </div>

            {result.detailsCalcul && (
              <div style={{ marginBottom: '14px', fontSize: '0.8rem', color: '#4A5568', backgroundColor: '#EDF2F7', padding: '10px 14px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>Distance estimée du trajet :</span>
                  <strong>{result.detailsCalcul.distanceKm ? Math.round(result.detailsCalcul.distanceKm) : (result.detailsCalcul.distanceEstimeeKm || 320)} km</strong>
                </div>
                {result.detailsCalcul.coutDistance && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span>Coût de transport basé sur la distance :</span>
                    <span>{result.detailsCalcul.coutDistance} MAD</span>
                  </div>
                )}
                {result.detailsCalcul.majorationMarchandisePct > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', color: '#C53030' }}>
                    <span>Majoration marchandise ({result.detailsCalcul.majorationMarchandisePct}%) :</span>
                    <strong>+{result.detailsCalcul.montantMajorationMarchandise} MAD</strong>
                  </div>
                )}
                {result.detailsCalcul.reductionRetourAVidePct > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#276749' }}>
                    <span>Remise retour à vide (-{result.detailsCalcul.reductionRetourAVidePct}%) :</span>
                    <strong>-{result.detailsCalcul.montantReductionRetourAVide} MAD</strong>
                  </div>
                )}
              </div>
            )}

            {onSelectPrix && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onSelectPrix(result.estimationConseillee);
                  onClose();
                }}
                style={{ width: '100%', gap: 6 }}
              >
                <FiCheck /> Appliquer le tarif conseillé ({result.estimationConseillee} MAD)
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TarificationEstimatorModal;
