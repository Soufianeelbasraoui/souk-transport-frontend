import React, { useState, useEffect } from 'react';
import {
  FiCheck,
  FiZap,
  FiShield,
  FiAward,
  FiTrendingUp,
  FiCheckCircle,
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import abonnementService from '../../api/services/abonnementService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';

export const AbonnementPage = () => {
  const [plans, setPlans] = useState([]);
  const [monAbonnement, setMonAbonnement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [plansData, aboData] = await Promise.all([
        abonnementService.getPlans(),
        abonnementService.getMonAbonnement(),
      ]);
      setPlans(plansData);
      setMonAbonnement(aboData);
    } catch {
      toast.error('Erreur lors du chargement des abonnements.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSouscrire = async (planCode) => {
    setSubscribing(planCode);
    try {
      const updated = await abonnementService.souscrirePlan(planCode);
      setMonAbonnement(updated);
      toast.success(`Votre formule a été mise à niveau vers ${planCode} avec succès !`);
    } catch {
      toast.error("Erreur lors de la souscription à l'abonnement.");
    } finally {
      setSubscribing(null);
    }
  };

  const activePlanCode = monAbonnement?.plan?.code || 'STANDARD';

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px' }}>
      {/* HEADER */}
      <div style={{ textAlign: 'center', marginBottom: '36px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#1A202C', margin: '0 0 10px 0' }}>
          Formules d'Abonnement Transporteur
        </h1>
        <p style={{ margin: 0, color: '#718096', fontSize: '1.05rem', maxWidth: '650px', margin: '0 auto' }}>
          Réduisez vos commissions jusqu'à 5%, bénéficiez de quotas de trajets étendus et d'une visibilité prioritaire sur le réseau national.
        </p>
      </div>

      {/* BANNIÈRE MON ABONNEMENT ACTIF */}
      {monAbonnement && (
        <Card style={{ padding: '20px 24px', backgroundColor: '#EBF4FF', border: '1px solid #BEE3F8', marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.85rem', color: '#2B6CB0', fontWeight: 700, textTransform: 'uppercase' }}>Formule active</span>
                <Badge variant="success">Actif</Badge>
              </div>
              <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: '#1A3A5C' }}>
                {monAbonnement.plan?.nom || 'Formule Pro'}
              </h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#4A5568' }}>
                Commission préférentielle : {((monAbonnement.plan?.tauxCommission || 0.07) * 100).toFixed(0)}% • Quota : {monAbonnement.plan?.trajetsActifsMax || 25} trajets simultanés
              </p>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.8rem', color: '#718096', display: 'block' }}>Renouvellement automatique :</span>
              <strong style={{ color: '#2D3748' }}>
                {monAbonnement.fin ? new Date(monAbonnement.fin).toLocaleDateString() : 'Dans 30 jours'}
              </strong>
            </div>
          </div>
        </Card>
      )}

      {/* GRILLE DES PLANS */}
      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: '#718096' }}>Chargement des plans...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {plans.map((p) => {
            const isCurrent = activePlanCode === p.code;
            const isPro = p.code === 'PRO';

            return (
              <Card
                key={p.code}
                style={{
                  padding: '32px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  border: isPro ? '2px solid #1A3A5C' : '1px solid #E2E8F0',
                  boxShadow: isPro ? '0 10px 15px -3px rgba(0,0,0,0.1)' : 'none',
                }}
              >
                {isPro && (
                  <div style={{
                    position: 'absolute',
                    top: -12,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: '#1A3A5C',
                    color: '#FFFFFF',
                    padding: '3px 14px',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>
                    Le plus populaire
                  </div>
                )}

                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1A202C', margin: '0 0 8px 0' }}>
                  {p.nom}
                </h3>
                <p style={{ margin: '0 0 20px 0', fontSize: '0.85rem', color: '#718096', minHeight: '40px' }}>
                  {p.description}
                </p>

                <div style={{ marginBottom: '24px' }}>
                  <span style={{ fontSize: '2.2rem', fontWeight: 800, color: '#1A202C' }}>
                    {p.prixMad}
                  </span>
                  <span style={{ fontSize: '0.9rem', color: '#718096', marginLeft: '6px' }}>MAD / mois</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.875rem', color: '#2D3748' }}>
                    <FiCheck color="#38A169" size={18} />
                    <span>Commission plateforme : <strong>{((p.tauxCommission || 0.10) * 100).toFixed(0)}%</strong></span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.875rem', color: '#2D3748' }}>
                    <FiCheck color="#38A169" size={18} />
                    <span>Jusqu'à <strong>{p.trajetsActifsMax}</strong> trajets actifs simultanés</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.875rem', color: '#2D3748' }}>
                    <FiCheck color="#38A169" size={18} />
                    <span>Support prioritaire : {p.supportPrioritaire ? 'Oui (WhatsApp & Tél)' : 'Standard'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.875rem', color: '#2D3748' }}>
                    <FiCheck color="#38A169" size={18} />
                    <span>Rapports analytiques & Exports comptables : {p.analyticsAvances ? 'Inclus' : 'Basique'}</span>
                  </div>
                </div>

                <Button
                  variant={isCurrent ? 'outline' : isPro ? 'primary' : 'secondary'}
                  disabled={isCurrent}
                  loading={subscribing === p.code}
                  onClick={() => handleSouscrire(p.code)}
                  style={{ width: '100%' }}
                >
                  {isCurrent ? 'Formule actuelle' : 'Choisir cette formule'}
                </Button>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AbonnementPage;
