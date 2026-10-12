import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiBox,
  FiDollarSign,
  FiTrendingDown,
  FiZap,
  FiArrowRight,
  FiTruck,
  FiMapPin,
  FiClock,
  FiPhone,
  FiStar,
  FiShield,
  FiSearch,
} from 'react-icons/fi';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import expediteurService from '../../api/services/expediteurService';
import { formatCurrency, formatNumber, formatDate } from '../../utils/format';
import KpiCard from '../../components/common/KpiCard';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Skeleton from '../../components/common/Skeleton';
import DemoBadge from '../../components/common/DemoBadge';

export const DashboardExpediteur = () => {
  const [dashboard, setDashboard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboard = async () => {
    setIsLoading(true);
    try {
      const data = await expediteurService.getDashboard();
      setDashboard(data);
    } catch (err) {
      console.error('Erreur chargement dashboard expéditeur:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <Skeleton variant="text" width={220} height={28} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} variant="card" height={110} />
          ))}
        </div>
        <Skeleton variant="card" height={260} />
      </div>
    );
  }

  const {
    expeditionsMois = 12,
    depensesMois = 36400,
    economiesVsMarche = 8250,
    co2EviteKg = 420.5,
    expeditionsActives = [],
    transporteursRecommandes = [],
    repartitionParRoute = [],
  } = dashboard || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* 1. HEADER PAGE */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1A3A5C', margin: 0 }}>
              Tableau de bord Expéditeur
            </h1>
            <DemoBadge />
          </div>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#718096' }}>
            Suivez vos expéditions en cours, trouvez des camions disponibles et maîtrisez vos coûts logistiques.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/expediteur/cargaisons" style={{ textDecoration: 'none' }}>
            <Button variant="outline" size="md" icon={<FiBox />}>
              Mes Cargaisons
            </Button>
          </Link>
          <Link to="/expediteur/trajets" style={{ textDecoration: 'none' }}>
            <Button variant="primary" size="md" icon={<FiSearch />}>
              Trouver un trajet
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. KPI CARDS */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
        }}
      >
        <KpiCard
          title="Expéditions du mois"
          value={formatNumber(expeditionsMois)}
          icon={<FiBox />}
          color="#1A3A5C"
          badge={{ text: 'Actives', color: '#1A3A5C' }}
        />
        <KpiCard
          title="Dépenses logistiques"
          value={formatCurrency(depensesMois)}
          icon={<FiDollarSign />}
          color="#F57C00"
          subtitle="Cumul du mois en cours"
        />
        <KpiCard
          title="Économies vs Marché"
          value={formatCurrency(economiesVsMarche)}
          icon={<FiTrendingDown />}
          color="#2E7D32"
          badge={{ text: '-18.5% moyen', color: '#2E7D32' }}
        />
        <KpiCard
          title="CO₂ évité (retours à vide)"
          value={`${formatNumber(co2EviteKg)} kg`}
          icon={<FiZap />}
          color="#0D9488"
          subtitle="Impact éco-responsable"
        />
      </div>

      {/* 3. EXPÉDITIONS EN TRANSIT (TEMPS RÉEL) */}
      <Card
        title="Expéditions actives en transit"
        subtitle="Suivi en temps réel de vos marchandises sur les axes routiers marocains"
        action={
          <Link to="/expediteur/cargaisons" style={{ textDecoration: 'none' }}>
            <Button variant="ghost" size="sm" icon={<FiArrowRight />}>
              Voir toutes ({expeditionsActives.length})
            </Button>
          </Link>
        }
      >
        {expeditionsActives.length === 0 ? (
          <div style={{ padding: 24, textAlign: 'center', color: '#718096', fontSize: 13 }}>
            Aucune expédition en cours actuellement.{' '}
            <Link to="/expediteur/trajets" style={{ color: '#0D9488', fontWeight: 600 }}>
              Réserver un transport
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
            {expeditionsActives.map((exp) => (
              <div
                key={exp.cargaisonId || exp.reference}
                style={{
                  border: '1px solid #E2E8F0',
                  borderRadius: 8,
                  padding: 16,
                  backgroundColor: '#FFFFFF',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ fontSize: 14, color: '#1A3A5C' }}>{exp.reference}</strong>
                  <Badge status={exp.statut || 'EN_TRANSIT'} />
                </div>

                <div style={{ fontSize: 12, color: '#4A5568', fontWeight: 500 }}>
                  {exp.description}
                </div>

                {/* Itinéraire */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                  <FiMapPin size={15} color="#1A3A5C" />
                  <strong>{exp.villeDepart}</strong>
                  <span style={{ color: '#A0AEC0' }}>→</span>
                  <FiMapPin size={15} color="#F57C00" />
                  <strong>{exp.villeArrivee}</strong>
                </div>

                {/* Info transporteur & ETA */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    backgroundColor: '#F8FAFC',
                    borderRadius: 6,
                    fontSize: 12,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <FiTruck color="#718096" />
                    <span>{exp.transporteurNom}</span>
                  </div>
                  {exp.transporteurTelephone && (
                    <a
                      href={`tel:${exp.transporteurTelephone}`}
                      style={{ color: '#0D9488', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}
                    >
                      <FiPhone size={12} />
                      <span>{exp.transporteurTelephone}</span>
                    </a>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#718096' }}>
                    <FiClock size={13} />
                    <span>Arrivée estimée : {formatDate(exp.etaDate)}</span>
                  </div>

                  {exp.trajetId && (
                    <Link to={`/transporteur/suivi/${exp.trajetId}`} style={{ textDecoration: 'none' }}>
                      <Button variant="outline" size="sm">
                        Suivi GPS
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* 4. GRAPHIQUE RÉPARTITION DES ROUTES & TRANSPORTEURS RECOMMANDÉS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 20 }}>
        {/* GRAPH DÉPENSES PAR ROUTE */}
        <Card
          title="Répartition des dépenses par axe routier"
          subtitle="Top des routes logistiques utilisées ce mois-ci (MAD)"
        >
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={repartitionParRoute} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="route" tick={{ fontSize: 11, fill: '#718096' }} interval={0} angle={-15} textAnchor="end" />
                <YAxis tick={{ fontSize: 11, fill: '#718096' }} tickFormatter={(val) => `${val / 1000}k`} />
                <Tooltip
                  formatter={(val) => [`${formatNumber(val)} DH`, 'Dépenses']}
                  contentStyle={{ backgroundColor: '#1A3A5C', borderRadius: 6, color: '#fff' }}
                />
                <Bar dataKey="montant" fill="#1A3A5C" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* TRANSPORTEURS CERTIFIÉS RECOMMANDÉS */}
        <Card
          title="Transporteurs recommandés"
          subtitle="Basé sur la ponctualité, le respect de la marchandise et la note globale"
          action={
            <Link to="/expediteur/trajets" style={{ textDecoration: 'none' }}>
              <Button variant="ghost" size="sm" icon={<FiArrowRight />}>
                Explorer
              </Button>
            </Link>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {transporteursRecommandes.map((t) => (
              <div
                key={t.transporteurId}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 12,
                  borderRadius: 6,
                  border: '1px solid #EDF2F7',
                  backgroundColor: '#FFFFFF',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 8,
                      backgroundColor: '#E6FFFA',
                      color: '#0D9488',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: 16,
                    }}
                  >
                    <FiTruck />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <strong style={{ fontSize: 14, color: '#1A202C' }}>{t.nomEntreprise || t.nom}</strong>
                      <span title="Transporteur vérifié avec documents conformes">
                        <FiShield color="#2E7D32" size={14} />
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 11, color: '#718096', marginTop: 2 }}>
                      <span>Base : {t.villeBase}</span>
                      <span>•</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 2, color: '#D97706', fontWeight: 600 }}>
                        <FiStar size={11} fill="#D97706" /> {t.noteMoyenne} ({t.nombreAvis} avis)
                      </span>
                    </div>
                  </div>
                </div>

                <Link
                  to={`/expediteur/trajets?depart=${encodeURIComponent(t.villeBase)}`}
                  style={{ textDecoration: 'none' }}
                >
                  <Button variant="outline" size="sm">
                    Voir trajets
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DashboardExpediteur;