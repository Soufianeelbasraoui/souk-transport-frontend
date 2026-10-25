import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  FiDollarSign,
  FiCreditCard,
  FiTrendingDown,
  FiDownload,
  FiClock,
  FiShield,
  FiLock,
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
import expediteurService from '../../api/services/expediteurService';
import factureService from '../../api/services/factureService';
import { formatCurrency, formatNumber, formatDate } from '../../utils/format';
import KpiCard from '../../components/common/KpiCard';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import Skeleton from '../../components/common/Skeleton';
import DemoBadge from '../../components/common/DemoBadge';

export const Paiement = () => {
  const [searchParams] = useSearchParams();
  const initialReservationId = searchParams.get('reservationId');

  const [resume, setResume] = useState(null);
  const [depensesMois, setDepensesMois] = useState([]);
  const [factures, setFactures] = useState([]);
  const [page, setPage] = useState(0);
  const [totalFactures, setTotalFactures] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Modal Simulateur CMI
  const [cmiModalOpen, setCmiModalOpen] = useState(false);
  const [selectedFacture, setSelectedFacture] = useState(null);
  const [isProcessingCmi, setIsProcessingCmi] = useState(false);
  const [cardForm, setCardForm] = useState({
    numero: '4242 •••• •••• 4242',
    nom: 'SOCIETE ATLAS FRET',
    expiration: '12/28',
    cvv: '888',
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [resumeData, depensesData, facturesData] = await Promise.all([
        expediteurService.getFinancesResume('MOIS'),
        expediteurService.getDepensesParMois(),
        expediteurService.getFactures({ page, size: 10 }),
      ]);

      setResume(resumeData);
      setDepensesMois(depensesData);
      const list = facturesData?.content || (Array.isArray(facturesData) ? facturesData : []);
      setFactures(list);
      setTotalFactures(facturesData?.totalElements ?? list.length);

      if (initialReservationId) {
        setCmiModalOpen(true);
      }
    } catch (err) {
      console.error('Erreur finances expéditeur:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page]);

  const handleOpenCmi = (facture) => {
    setSelectedFacture(facture);
    setCmiModalOpen(true);
  };

  const handleValiderPaiementCmi = async () => {
    setIsProcessingCmi(true);
    try {
      const factureId = selectedFacture?.id || 1;
      await expediteurService.validerPaiementCmi(factureId);
      toast.success('Paiement CMI validé avec succès ! Facture acquittée.');
      setCmiModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error('Échec de la validation CMI : ' + err.message);
    } finally {
      setIsProcessingCmi(false);
    }
  };

  const handleDownloadPdf = async (facture) => {
    try {
      toast.info(`Téléchargement de la facture ${facture.numeroFacture || `#${facture.id}`}...`);
      const blob = await factureService.telechargerFacturePdf(facture.id || 1);
      factureService.declencherTelechargement(blob, `facture_${facture.numeroFacture || facture.id}.pdf`);
      toast.success('Facture PDF téléchargée.');
    } catch {
      toast.error('Erreur lors du téléchargement de la facture.');
    }
  };

  const columns = [
    {
      key: 'numeroFacture',
      header: 'N° Facture',
      width: '140px',
      render: (val, row) => <strong>{val || `FAC-2025-0${row.id}`}</strong>,
    },
    {
      key: 'dateEmission',
      header: 'Date d’émission',
      render: (val) => formatDate(val),
    },
    {
      key: 'trajetRoute',
      header: 'Prestation & Trajet',
      render: (val) => <strong>{val || 'Acheminement national'}</strong>,
    },
    {
      key: 'montantTTC',
      header: 'Montant TTC',
      align: 'right',
      render: (val) => <strong>{formatCurrency(val)}</strong>,
    },
    {
      key: 'statutPaiement',
      header: 'Statut',
      width: '130px',
      render: (val) => <Badge status={val} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
          <Button
            variant="ghost"
            size="sm"
            icon={<FiDownload />}
            title="Télécharger la facture PDF"
            onClick={() => handleDownloadPdf(row)}
          >
            PDF
          </Button>

          {row.statutPaiement === 'EN_ATTENTE' && (
            <Button
              variant="primary"
              size="sm"
              icon={<FiCreditCard />}
              onClick={() => handleOpenCmi(row)}
            >
              Régler
            </Button>
          )}
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <Skeleton variant="text" width={220} height={28} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="card" height={100} />
          ))}
        </div>
        <Skeleton variant="card" height={320} />
      </div>
    );
  }

  const {
    depensesMois: totalDepenses = 36400,
    economiesVsMarche = 8250,
    totalFacturesEnAttente = 2,
    montantEnAttentePaiement = 6200,
  } = resume || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1A3A5C', margin: 0 }}>
              Finances & Paiements Expéditeur
            </h1>
            <DemoBadge />
          </div>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#718096' }}>
            Consultez votre historique de facturation, réglez vos expéditions par CMI et téléchargez vos justificatifs fiscaux.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/expediteur/cargaisons" style={{ textDecoration: 'none' }}>
            <Button variant="outline" size="md">
              Voir mes expéditions
            </Button>
          </Link>
        </div>
      </div>

      {/* 3 KPI CARDS */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 16,
        }}
      >
        <KpiCard
          title="Dépenses globales du mois"
          value={formatCurrency(totalDepenses)}
          icon={<FiDollarSign />}
          color="#1A3A5C"
          subtitle="Toutes taxes comprises (TTC)"
        />
        <KpiCard
          title="Économies réalisées"
          value={formatCurrency(economiesVsMarche)}
          icon={<FiTrendingDown />}
          color="#2E7D32"
          badge={{ text: 'Optimisation fret', color: '#2E7D32' }}
        />
        <KpiCard
          title="Factures en attente de règlement"
          value={formatCurrency(montantEnAttentePaiement)}
          icon={<FiClock />}
          color="#F57C00"
          subtitle={`${totalFacturesEnAttente} facture(s) à acquitter`}
        />
      </div>

      {/* GRAPHIQUE RECHARTS DÉPENSES MENSUELLES */}
      <Card
        title="Évolution des dépenses logistiques"
        subtitle="Historique des montants facturés sur les 4 derniers mois (MAD)"
      >
        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={depensesMois} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="mois" tick={{ fontSize: 12, fill: '#718096' }} />
              <YAxis tick={{ fontSize: 12, fill: '#718096' }} tickFormatter={(val) => `${val / 1000}k`} />
              <Tooltip
                formatter={(val) => [`${formatNumber(val)} DH`, 'Dépenses TTC']}
                contentStyle={{ backgroundColor: '#1A3A5C', borderRadius: 6, color: '#fff' }}
              />
              <Bar dataKey="montant" fill="#0D9488" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* TABLEAU DES FACTURES */}
      <Card
        title="Factures & Justificatifs fiscaux"
        subtitle="Factures émises avec TVA marocaine déductible de 20%"
      >
        <DataTable
          columns={columns}
          data={factures}
          isLoading={isLoading}
          pagination={{
            page,
            pageSize: 10,
            totalElements: totalFactures,
            onPageChange: (newPage) => setPage(newPage),
          }}
          emptyMessage="Aucune facture disponible pour le moment."
        />
      </Card>

      {/* MODAL SIMULATEUR DE PAIEMENT CMI (MAROC) */}
      <Modal
        isOpen={cmiModalOpen}
        onClose={() => setCmiModalOpen(false)}
        title="Passerelle de Paiement CMI Maroc"
        subtitle="Paiement sécurisé par carte bancaire marocaine (Centre Monétique Interbancaire)"
        actions={
          <>
            <Button variant="outline" onClick={() => setCmiModalOpen(false)}>
              Annuler
            </Button>
            <Button
              variant="primary"
              icon={<FiLock />}
              onClick={handleValiderPaiementCmi}
              isLoading={isProcessingCmi}
            >
              Payer {selectedFacture ? formatCurrency(selectedFacture.montantTTC) : '3 360 MAD'} via CMI
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* BANDEAU SÉCURITÉ */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: 12,
              backgroundColor: '#F0FDF4',
              borderRadius: 6,
              border: '1px solid #BBF7D0',
              fontSize: 13,
              color: '#166534',
            }}
          >
            <FiShield size={22} color="#166534" />
            <div>
              <strong>Transaction 100% Chiffrée (SSL / 3D-Secure)</strong>
              <div style={{ fontSize: 11, color: '#15803D' }}>
                Les fonds sont placés en compte séquestre garanti jusqu'à confirmation de livraison.
              </div>
            </div>
          </div>

          {/* VISUEL CARTE BANCAIRE */}
          <div
            style={{
              background: 'linear-gradient(135deg, #1A3A5C 0%, #0D9488 100%)',
              color: '#FFFFFF',
              borderRadius: 12,
              padding: 20,
              boxShadow: '0 4px 12px rgba(26, 58, 92, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              height: 160,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: 1 }}>CMI MAROC</span>
              <FiCreditCard size={24} />
            </div>

            <div style={{ fontSize: 18, letterSpacing: 3, fontWeight: 600, fontFamily: 'monospace' }}>
              {cardForm.numero}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
              <div>
                <span style={{ color: '#94A3B8', display: 'block' }}>TITULAIRE</span>
                <strong>{cardForm.nom}</strong>
              </div>
              <div>
                <span style={{ color: '#94A3B8', display: 'block' }}>EXPIRE</span>
                <strong>{cardForm.expiration}</strong>
              </div>
            </div>
          </div>

          {/* FORMULAIRE CARTE */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label className="st-label required">Numéro de carte bancaire</label>
              <input
                type="text"
                className="st-input"
                value={cardForm.numero}
                onChange={(e) => setCardForm({ ...cardForm, numero: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label className="st-label required">Date d'expiration</label>
                <input
                  type="text"
                  className="st-input"
                  value={cardForm.expiration}
                  onChange={(e) => setCardForm({ ...cardForm, expiration: e.target.value })}
                />
              </div>
              <div>
                <label className="st-label required">CVV / CVC (3 chiffres)</label>
                <input
                  type="password"
                  maxLength={3}
                  className="st-input"
                  value={cardForm.cvv}
                  onChange={(e) => setCardForm({ ...cardForm, cvv: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Paiement;