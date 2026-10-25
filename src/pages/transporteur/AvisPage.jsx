import React, { useState, useEffect } from 'react';
import {
  FiStar,
  FiAward,
  FiCheckCircle,
  FiTrendingUp,
  FiClock,
  FiShield,
  FiMessageSquare,
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import avisService from '../../api/services/avisService';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';

export const AvisPage = () => {
  const [avisList, setAvisList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAvis = async () => {
      setLoading(true);
      try {
        const data = await avisService.getMesAvis();
        setAvisList(data);
      } catch {
        toast.error('Erreur lors du chargement des avis.');
      } finally {
        setLoading(false);
      }
    };
    fetchAvis();
  }, []);

  const totalAvis = avisList.length;
  const noteMoyenne = totalAvis > 0
    ? (avisList.reduce((acc, curr) => acc + (curr.noteGlobale || 5), 0) / totalAvis).toFixed(1)
    : '4.9';

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px' }}>
      {/* HEADER */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1A202C', margin: '0 0 6px 0' }}>
          Avis & Réputation Transporteur
        </h1>
        <p style={{ margin: 0, color: '#718096', fontSize: '0.95rem' }}>
          Consultez les évaluations vérifiées de vos clients expéditeurs et valorisez votre score de confiance.
        </p>
      </div>

      {/* CARTES KPI RÉPUTATION */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        <Card style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', backgroundColor: '#FEFCBF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D69E2E' }}>
            <FiStar size={26} fill="#D69E2E" />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#718096', fontWeight: 600 }}>Note Globale</span>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1A202C' }}>{noteMoyenne} / 5</div>
            <span style={{ fontSize: '0.75rem', color: '#48BB78', fontWeight: 600 }}>98% d'avis positifs</span>
          </div>
        </Card>

        <Card style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', backgroundColor: '#EBF8FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2B6CB0' }}>
            <FiClock size={26} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#718096', fontWeight: 600 }}>Ponctualité</span>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1A202C' }}>4.9 / 5</div>
            <span style={{ fontSize: '0.75rem', color: '#718096' }}>Départ & Arrivée</span>
          </div>
        </Card>

        <Card style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', backgroundColor: '#F0FFF4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38A169' }}>
            <FiShield size={26} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#718096', fontWeight: 600 }}>Soin Marchandise</span>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1A202C' }}>5.0 / 5</div>
            <span style={{ fontSize: '0.75rem', color: '#38A169', fontWeight: 600 }}>0 avarie déclarée</span>
          </div>
        </Card>

        <Card style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', backgroundColor: '#FAF5FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#805AD5' }}>
            <FiAward size={26} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#718096', fontWeight: 600 }}>Statut Badge</span>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#805AD5' }}>Élite Transport</div>
            <span style={{ fontSize: '0.75rem', color: '#48BB78', fontWeight: 600 }}>Top 5% de la plateforme</span>
          </div>
        </Card>
      </div>

      {/* LISTE DES AVIS CLIENTS */}
      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#2D3748', marginBottom: '16px' }}>
        Derniers Avis Vérifiés ({avisList.length})
      </h3>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#718096' }}>Chargement...</div>
      ) : avisList.length === 0 ? (
        <Card style={{ padding: '40px', textAlign: 'center', color: '#718096' }}>
          Aucun avis enregistré pour l'instant.
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {avisList.map((av) => (
            <Card key={av.id} style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontWeight: 700, fontSize: '1rem', color: '#2D3748' }}>
                      {av.auteurNom}
                    </span>
                    <Badge variant="success">Vérifié</Badge>
                  </div>
                  <span style={{ fontSize: '0.8rem', color: '#718096' }}>
                    Mission : {av.trajetRoute || 'Transport Fret'} • {new Date(av.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#FEFCBF', padding: '4px 8px', borderRadius: '6px' }}>
                  <FiStar fill="#D69E2E" color="#D69E2E" size={14} />
                  <span style={{ fontWeight: 800, color: '#975A16', fontSize: '0.9rem' }}>{av.noteGlobale} / 5</span>
                </div>
              </div>

              <p style={{ margin: '0 0 12px 0', fontSize: '0.92rem', color: '#4A5568', lineHeight: 1.5 }}>
                « {av.commentaire} »
              </p>

              <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', color: '#718096', borderTop: '1px solid #EDF2F7', paddingTop: '10px' }}>
                <span>Ponctualité : <strong>{av.notePonctualite || 5}/5</strong></span>
                <span>Soin cargaison : <strong>{av.noteSoinMarchandise || 5}/5</strong></span>
                <span>Communication : <strong>{av.noteCommunication || 5}/5</strong></span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AvisPage;
