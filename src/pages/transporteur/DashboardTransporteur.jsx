import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiTruck,
  FiDollarSign,
  FiPackage,
  FiStar,
  FiMapPin,
  FiClock,
  FiArrowRight,
  FiActivity,
  FiCheck,
  FiX,
  FiNavigation,
  FiPlus,
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
import { toast } from 'react-toastify';
import transporteurService from '../../api/services/transporteurService';
import { parseApiError } from '../../utils/parseApiError';
import { formatCurrency, formatNumber, formatDate, formatPercent } from '../../utils/format';
import KpiCard from '../../components/common/KpiCard';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Skeleton from '../../components/common/Skeleton';
import DemoBadge from '../../components/common/DemoBadge';

export const DashboardTransporteur = () => {
  const [dashboard, setDashboard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboard = async () => {
    setIsLoading(true);
    try {
      const data = await transporteurService.getDashboard();
      setDashboard(data);
    } catch (err) {
      parseApiError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleAccepterOffre = async (id) => {
    try {
      await transporteurService.accepterOffre(id);
      toast.success('Offre acceptée avec succès !');
      // UI optimiste
      setDashboard((prev) => ({
        ...prev,
        dernieresOffres: prev.dernieresOffres.map((o) =>
          o.id === id || o.idOffre === id ? { ...o, statutOffre: 'ACCEPTEE' } : o
        ),
      }));
    } catch (err) {
      parseApiError(err);
    }
  };

  const handleRefuserOffre = async (id) => {
    try {
      await transporteurService.refuserOffre(id);
      toast.info('Offre refusée.');
      setDashboard((prev) => ({
        ...prev,
        dernieresOffres: prev.dernieresOffres.map((o) =>
          o.id === id || o.idOffre === id ? { ...o, statutOffre: 'REFUSEE' } : o
        ),
      }));
    } catch (err) {
      parseApiError(err);
    }
  };

  if (isLoading && !dashboard) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <Skeleton height={80} borderRadius={8} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          <Skeleton height={110} />
          <Skeleton height={110} />
          <Skeleton height={110} />
          <Skeleton height={110} />
        </div>
        <Skeleton height={320} />
      </div>
    );
  }

  const trajetEnCours = dashboard?.trajetEnCours;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* ENTÊTE AVEC TITRE ET ACTION PRINCIPALE */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1A3A5C', margin: 0 }}>
              Tableau de bord Transporteur
            </h1>
            <DemoBadge />
          </div>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#718096' }}>
            Suivi en temps réel de vos opérations logistiques et revenus.
          </p>
        </div>

        <Link to="/transporteur/trajets/new" style={{ textDecoration: 'none' }}>
          <Button variant="secondary" icon={<FiPlus />}>
            Publier un nouveau trajet
          </Button>
        </Link>
      </div>

      {/* BANNIÈRE ORANGE DYNAMIQUE "TRAJET EN COURS" */}
      {trajetEnCours && (
        <div
          style={{
            backgroundColor: '#FFF3E0',
            border: '1.5px solid #F57C00',
            borderRadius: 8,
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16,
            boxShadow: '0 2px 4px rgba(245, 124, 0, 0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 8,
                backgroundColor: '#F57C00',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 22,
                flexShrink: 0,
              }}
            >
              <FiNavigation />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span
                  style={{
                    backgroundColor: '#F57C00',
                    color: '#FFFFFF',
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    padding: '2px 8px',
                    borderRadius: 4,
                  }}
                >
                  Trajet en cours
                </span>
                <strong style={{ fontSize: 15, color: '#1A202C' }}>
                  {trajetEnCours.villeDepart} → {trajetEnCours.villeArrivee}
                </strong>
                {trajetEnCours.immatriculationCamion && (
                  <span style={{ fontSize: 12, color: '#718096' }}>
                    ({trajetEnCours.immatriculationCamion})
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 4, fontSize: 12, color: '#4A5568' }}>
                <span>
                  Taux de chargement : <strong>{formatPercent(trajetEnCours.tauxRemplissage || 80)}</strong>
                </span>
                <span>•</span>
                <span>
                  Dispo : <strong>{formatNumber(trajetEnCours.poidsDisponible || 1800)} kg</strong> restants
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Link
              to={`/transporteur/suivi/${trajetEnCours.id || trajetEnCours.idTrajet || 101}`}
              style={{ textDecoration: 'none' }}
            >
              <Button variant="secondary" size="sm" icon={<FiMapPin />}>
                Ouvrir le suivi GPS
              </Button>
            </Link>

            <Link
              to={`/transporteur/trajets`}
              style={{ textDecoration: 'none' }}
            >
              <Button variant="outline" size="sm">
                Voir le détail
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* SECTION KPIS (4 CARTES) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
        <KpiCard
          label="Revenus du mois"
          value={formatCurrency(dashboard?.revenusMois || 42800)}
          trend={dashboard?.tendanceRevenusPct || 14.5}
          trendLabel="vs mois précédent"
          icon={<FiDollarSign />}
        />

        <KpiCard
          label="Trajets réalisés"
          value={formatNumber(dashboard?.trajetsMoisTotal || 28)}
          subtext={`${dashboard?.trajetsAVenir || 6} trajets programmés à venir`}
          icon={<FiTruck />}
        />

        <KpiCard
          label="Taux de remplissage moyen"
          value={formatPercent(dashboard?.tauxRemplissageMoyen || 82.5)}
          trend={12.0}
          trendLabel={`Moy. plateforme : ${formatPercent(dashboard?.tauxRemplissagePlateforme || 68)}`}
          icon={<FiPackage />}
        />

        <KpiCard
          label="Réputation & Note"
          value={`${dashboard?.noteMoyenne || 4.8} / 5`}
          subtext={`Basé sur ${dashboard?.nombreAvis || 43} avis vérifiés`}
          icon={<FiStar />}
        />
      </div>

      {/* GRAPHIQUE DES REVENUS ET PROCHAINS TRAJETS */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        {/* GRAPHIQUE DES REVENUS PAR SEMAINE */}
        <Card
          title="Évolution des revenus (8 dernières semaines)"
          subtitle="Montants bruts générés sur la plateforme en Dirhams (DH)"
        >
          <div style={{ width: '100%', height: 260, marginTop: 12 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dashboard?.revenus8DernieresSemaines || []}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="semaine" tick={{ fontSize: 12, fill: '#718096' }} stroke="#E2E8F0" />
                <YAxis
                  tick={{ fontSize: 11, fill: '#718096' }}
                  tickFormatter={(val) => `${val / 1000}k`}
                  stroke="#E2E8F0"
                />
                <Tooltip
                  formatter={(val) => [formatCurrency(val), 'Revenu']}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 6,
                    border: '1px solid #E2E8F0',
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="montant" fill="#1A3A5C" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* ACTIVITÉ RÉCENTE */}
        <Card title="Activité récente" subtitle="Historique des dernières actions">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
            {(dashboard?.activiteRecente || []).map((act, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  fontSize: 13,
                  color: '#4A5568',
                  paddingBottom: 10,
                  borderBottom: index < (dashboard?.activiteRecente?.length || 0) - 1 ? '1px solid #EDF2F7' : 'none',
                }}
              >
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    backgroundColor: '#E8EEF5',
                    color: '#1A3A5C',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                >
                  <FiActivity />
                </div>
                <span style={{ lineHeight: 1.4 }}>{act}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* OFFRES RÉCENTES À TRAITER & PROCHAINS TRAJETS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* DERNIÈRES OFFRES REÇUES */}
        <Card
          title="Dernières offres reçues"
          subtitle="Offres de chargement en attente de réponse"
          actions={
            <Link to="/transporteur/reservations" style={{ textDecoration: 'none' }}>
              <Button variant="ghost" size="sm">
                <span>Voir tout</span>
                <FiArrowRight size={14} />
              </Button>
            </Link>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {(dashboard?.dernieresOffres || []).slice(0, 3).map((offre) => (
              <div
                key={offre.id || offre.idOffre}
                style={{
                  border: '1px solid #E2E8F0',
                  borderRadius: 6,
                  padding: 14,
                  backgroundColor: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <strong style={{ fontSize: 14, color: '#1A202C' }}>
                      {offre.expediteurNom}
                    </strong>
                    <Badge status={offre.statutOffre} />
                  </div>
                  <div style={{ fontSize: 12, color: '#718096', marginTop: 4 }}>
                    {offre.trajetRoute} • {formatNumber(offre.poidsKg)} kg ({offre.volumeM3} m³)
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#1A3A5C', marginTop: 4 }}>
                    {formatCurrency(offre.prixPropose)}
                  </div>
                </div>

                {offre.statutOffre === 'EN_ATTENTE' && (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      type="button"
                      onClick={() => handleAccepterOffre(offre.id || offre.idOffre)}
                      className="st-btn st-btn-sm"
                      style={{
                        backgroundColor: '#2E7D32',
                        color: 'white',
                        padding: '6px 10px',
                      }}
                      title="Accepter l'offre"
                    >
                      <FiCheck size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRefuserOffre(offre.id || offre.idOffre)}
                      className="st-btn st-btn-outline st-btn-sm"
                      style={{ color: '#C62828', padding: '6px 10px' }}
                      title="Refuser"
                    >
                      <FiX size={14} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* PROCHAINS DÉPARTS */}
        <Card
          title="Prochains départs planifiés"
          subtitle="Vos trajets programmés dans les prochains jours"
          actions={
            <Link to="/transporteur/trajets" style={{ textDecoration: 'none' }}>
              <Button variant="ghost" size="sm">
                <span>Tous mes trajets</span>
                <FiArrowRight size={14} />
              </Button>
            </Link>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {(dashboard?.prochainsTrajets || []).map((tr) => (
              <div
                key={tr.id || tr.idTrajet}
                style={{
                  border: '1px solid #E2E8F0',
                  borderRadius: 6,
                  padding: 14,
                  backgroundColor: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <strong style={{ fontSize: 14, color: '#1A202C' }}>
                      {tr.villeDepart} → {tr.villeArrivee}
                    </strong>
                    <Badge status={tr.statutTrajet} />
                  </div>
                  <div style={{ fontSize: 12, color: '#718096', marginTop: 4 }}>
                    <FiClock size={12} style={{ marginRight: 4 }} />
                    Départ : {formatDate(tr.dateDepart)}
                  </div>
                  <div style={{ fontSize: 12, color: '#4A5568', marginTop: 2 }}>
                    Capacité restante : <strong>{formatNumber(tr.poidsDisponible)} kg</strong>
                  </div>
                </div>

                <Link
                  to={`/transporteur/trajets`}
                  style={{ textDecoration: 'none' }}
                >
                  <Button variant="outline" size="sm">
                    Gérer
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

export default DashboardTransporteur;
