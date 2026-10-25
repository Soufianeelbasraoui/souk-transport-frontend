import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiUsers,
  FiDollarSign,
  FiTrendingUp,
  FiAlertTriangle,
  FiCheckSquare,
  FiArrowRight,
  FiPercent,
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
import adminService from '../../api/services/adminService';
import { formatCurrency, formatNumber } from '../../utils/format';
import KpiCard from '../../components/common/KpiCard';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Skeleton from '../../components/common/Skeleton';
import DemoBadge from '../../components/common/DemoBadge';

export const DashboardAdmin = () => {
  const [dashboard, setDashboard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboard = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getDashboard();
      setDashboard(data);
    } catch (err) {
      console.error('Erreur chargement dashboard admin:', err);
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
        <Skeleton variant="text" width={240} height={32} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} variant="card" height={110} />
          ))}
        </div>
        <Skeleton variant="card" height={300} />
      </div>
    );
  }

  const {
    gmvMois = 485000,
    revenusCommissions = 48500,
    utilisateursActifs = 142,
    totalUtilisateurs = 184,
    alertesTransporteursAVerifier = 4,
    alertesLitigesATraiter = 2,
    transactions30Jours = [],
    top10Routes = [],
    fluxActivite = [],
  } = dashboard || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* 1. HEADER PAGE */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1A3A5C', margin: 0 }}>
              Supervision Générale de la Plateforme
            </h1>
            <DemoBadge />
          </div>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#718096' }}>
            Indicateurs financiers en temps réel, modération des comptes et surveillance des flux de fret.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/admin/analytics" style={{ textDecoration: 'none' }}>
            <Button variant="outline" size="md">
              Rapports Analytics
            </Button>
          </Link>
          <Link to="/admin/verifications" style={{ textDecoration: 'none' }}>
            <Button variant="primary" size="md" icon={<FiCheckSquare />}>
              Vérifications ({alertesTransporteursAVerifier})
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. BANNIÈRES D'ALERTES PRIORITAIRES */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 14 }}>
        {alertesTransporteursAVerifier > 0 && (
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: '#FFFBEB',
              border: '1px solid #FDE68A',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <FiCheckSquare size={20} color="#D97706" />
              <div>
                <strong style={{ fontSize: 13, color: '#92400E' }}>
                  {alertesTransporteursAVerifier} dossier(s) de transporteur en attente d'approbation
                </strong>
                <div style={{ fontSize: 11, color: '#B45309' }}>
                  Vérification légale des CIN, ICE et cartes grises
                </div>
              </div>
            </div>
            <Link to="/admin/verifications" style={{ textDecoration: 'none' }}>
              <Button variant="outline" size="sm" style={{ borderColor: '#D97706', color: '#92400E' }}>
                Examiner
              </Button>
            </Link>
          </div>
        )}

        {alertesLitigesATraiter > 0 && (
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: '#FEF2F2',
              border: '1px solid #FECACA',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <FiAlertTriangle size={20} color="#DC2626" />
              <div>
                <strong style={{ fontSize: 13, color: '#991B1B' }}>
                  {alertesLitigesATraiter} litige(s) ouvert(s) nécessitant une décision
                </strong>
                <div style={{ fontSize: 11, color: '#B91C1C' }}>
                  Séquestre bloqué en attente de médiation
                </div>
              </div>
            </div>
            <Link to="/admin/litiges" style={{ textDecoration: 'none' }}>
              <Button variant="danger" size="sm">
                Résoudre
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* 3. 4 KPI CARDS */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
        }}
      >
        <KpiCard
          title="Volume d'affaires (GMV)"
          value={formatCurrency(gmvMois)}
          icon={<FiDollarSign />}
          color="#1A3A5C"
          subtitle="Cumul mensuel brut"
        />
        <KpiCard
          title="Commissions nettes (10%)"
          value={formatCurrency(revenusCommissions)}
          icon={<FiPercent />}
          color="#2E7D32"
          badge={{ text: 'Take-rate 10%', color: '#2E7D32' }}
        />
        <KpiCard
          title="Utilisateurs actifs"
          value={`${formatNumber(utilisateursActifs)} / ${formatNumber(totalUtilisateurs)}`}
          icon={<FiUsers />}
          color="#0D9488"
          subtitle="Comptes vérifiés & actifs"
        />
        <KpiCard
          title="Taux de complétion"
          value="96.8%"
          icon={<FiTrendingUp />}
          color="#F57C00"
          badge={{ text: 'Ponctualité élevée', color: '#F57C00' }}
        />
      </div>

      {/* 4. GRAPHIQUE VOLUME D'AFFAIRES VS COMMISSIONS */}
      <Card
        title="Volume d'affaires & Revenus de commission"
        subtitle="Activité financière journalière sur les 7 derniers jours (MAD)"
        action={
          <Link to="/admin/analytics" style={{ textDecoration: 'none' }}>
            <Button variant="ghost" size="sm" icon={<FiArrowRight />}>
              Rapport complet
            </Button>
          </Link>
        }
      >
        <div style={{ width: '100%', height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={transactions30Jours} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#718096' }} />
              <YAxis tick={{ fontSize: 12, fill: '#718096' }} tickFormatter={(val) => `${val / 1000}k`} />
              <Tooltip
                formatter={(val, name) => [
                  `${formatNumber(val)} DH`,
                  name === 'volume' ? 'Volume transactionné' : 'Commission perçue (10%)',
                ]}
                contentStyle={{ backgroundColor: '#1A3A5C', borderRadius: 6, color: '#fff' }}
              />
              <Bar dataKey="volume" fill="#1A3A5C" name="volume" radius={[4, 4, 0, 0]} />
              <Bar dataKey="commission" fill="#0D9488" name="commission" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* 5. TOP 5 ROUTES MAROCAINES & FLUX D'ACTIVITÉ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 20 }}>
        {/* TOP ROUTES */}
        <Card title="Axes logistiques prioritaires" subtitle="Top 5 des liaisons par volume transactionné">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {top10Routes.slice(0, 5).map((r, idx) => (
              <div
                key={r.route}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 14px',
                  backgroundColor: '#F8FAFC',
                  borderRadius: 6,
                  border: '1px solid #E2E8F0',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      backgroundColor: '#1A3A5C',
                      color: '#fff',
                      fontSize: 11,
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {idx + 1}
                  </span>
                  <div>
                    <strong style={{ fontSize: 13, color: '#1A3A5C' }}>{r.route}</strong>
                    <div style={{ fontSize: 11, color: '#718096' }}>{r.nombreTrajets} trajets effectués</div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <strong style={{ fontSize: 14, color: '#0D9488' }}>
                    {formatCurrency(r.volumeMad)}
                  </strong>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* FLUX D'ACTIVITÉ EN TEMPS RÉEL */}
        <Card title="Flux d'activité de la plateforme" subtitle="Derniers événements système et transactions">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {fluxActivite.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  padding: '8px 0',
                  borderBottom: idx < fluxActivite.length - 1 ? '1px solid #EDF2F7' : 'none',
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: '#0D9488',
                    marginTop: 6,
                    flexShrink: 0,
                  }}
                />
                <div style={{ fontSize: 13, color: '#4A5568', lineHeight: 1.5 }}>
                  {item}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DashboardAdmin;