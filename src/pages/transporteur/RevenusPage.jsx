import React, { useState, useEffect } from 'react';
import {
  FiCreditCard,
  FiArrowUpRight,
  FiArrowDownLeft,
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
import { formatCurrency, formatDate } from '../../utils/format';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import DataTable from '../../components/common/DataTable';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import DemoBadge from '../../components/common/DemoBadge';

export const RevenusPage = () => {
  const [finances, setFinances] = useState(null);
  const [revenusSemaines, setRevenusSemaines] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal de retrait bancaire
  const [retraitModalOpen, setRetraitModalOpen] = useState(false);
  const [montantRetrait, setMontantRetrait] = useState('');
  const [ibanRetrait, setIbanRetrait] = useState('');
  const [isSubmittingRetrait, setIsSubmittingRetrait] = useState(false);

  const fetchFinances = async () => {
    setIsLoading(true);
    try {
      const [resFinances, resSemaines, resTx] = await Promise.all([
        transporteurService.getFinancesResume(),
        transporteurService.getRevenusSemaine(),
        transporteurService.getTransactions({ page: 0, size: 10 }),
      ]);
      setFinances(resFinances);
      setRevenusSemaines(resSemaines);
      setTransactions(resTx.content || []);
      if (resFinances?.compteBancaire?.rib) {
        setIbanRetrait(resFinances.compteBancaire.rib);
      }
    } catch (err) {
      parseApiError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFinances();
  }, []);

  const handleDemanderRetrait = async () => {
    if (!montantRetrait || Number(montantRetrait) <= 0) {
      toast.error('Veuillez saisir un montant de retrait valide.');
      return;
    }
    const solde = finances?.soldeDisponible || 0;
    if (Number(montantRetrait) > solde) {
      toast.error('Le montant demandé dépasse votre solde disponible.');
      return;
    }

    setIsSubmittingRetrait(true);
    try {
      await transporteurService.demanderRetrait(Number(montantRetrait), ibanRetrait);
      toast.success(`Demande de virement de ${formatCurrency(montantRetrait)} transmise avec succès !`);
      setRetraitModalOpen(false);
      setMontantRetrait('');
      // Mise à jour solde
      setFinances((prev) => ({
        ...prev,
        soldeDisponible: (prev?.soldeDisponible || 0) - Number(montantRetrait),
      }));
    } catch (err) {
      parseApiError(err);
    } finally {
      setIsSubmittingRetrait(false);
    }
  };

  const columns = [
    {
      key: 'reference',
      header: 'Réf. Transaction',
      width: '130px',
      render: (val) => <strong>#{val}</strong>,
    },
    {
      key: 'description',
      header: 'Description & Libellé',
    },
    {
      key: 'date',
      header: 'Date & Heure',
      render: (val) => formatDate(val),
    },
    {
      key: 'type',
      header: 'Type',
      render: (val) => (
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            padding: '2px 8px',
            borderRadius: 4,
            backgroundColor: val === 'PAIEMENT' ? '#E8F5E9' : val === 'COMMISSION' ? '#FFF3E0' : '#EDF2F7',
            color: val === 'PAIEMENT' ? '#2E7D32' : val === 'COMMISSION' ? '#D97706' : '#4A5568',
          }}
        >
          {val}
        </span>
      ),
    },
    {
      key: 'montant',
      header: 'Montant (DH)',
      align: 'right',
      render: (val, row) => {
        const isCredit = row.sens === 'CREDIT';
        return (
          <span
            style={{
              fontWeight: 700,
              color: isCredit ? '#2E7D32' : '#C62828',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            {isCredit ? <FiArrowDownLeft size={14} /> : <FiArrowUpRight size={14} />}
            {isCredit ? `+${formatCurrency(val)}` : `-${formatCurrency(val)}`}
          </span>
        );
      },
    },
    {
      key: 'statut',
      header: 'Statut',
      width: '120px',
      render: (val) => <Badge status={val} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
          {row.methodePaiement === 'CASH' && row.statut !== 'PAYE' && (
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                try {
                  await transporteurService.confirmerCash(row.id);
                  toast.success('Paiement en espèces confirmé par le transporteur.');
                  fetchFinances();
                } catch {
                  toast.error('Erreur lors de la confirmation cash.');
                }
              }}
            >
              Confirmer Cash
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1A3A5C', margin: 0 }}>
              Revenus & Gestion Financière
            </h1>
            <DemoBadge />
          </div>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#718096' }}>
            Consultez votre solde, suivez vos gains et effectuez des virements bancaires vers votre compte.
          </p>
        </div>

        <Button
          variant="secondary"
          icon={<FiCreditCard />}
          onClick={() => setRetraitModalOpen(true)}
        >
          Demander un virement bancaire
        </Button>
      </div>

      {/* 3 CARTES DE SOLDE FINANCIER */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
        {/* SOLDE DISPONIBLE */}
        <div
          style={{
            backgroundColor: '#1A3A5C',
            color: '#FFFFFF',
            borderRadius: 8,
            padding: 24,
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <span style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.75)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Solde disponible au retrait
            </span>
            <div style={{ fontSize: 28, fontWeight: 700, marginTop: 6, letterSpacing: '-0.02em' }}>
              {formatCurrency(finances?.soldeDisponible || 18450)}
            </div>
          </div>
          <div style={{ marginTop: 16, fontSize: 12, color: 'rgba(255, 255, 255, 0.7)' }}>
            ✓ Virement automatique ou sur demande sous 24-48h.
          </div>
        </div>

        {/* EN ATTENTE DE LIBÉRATION */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: 8,
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <span style={{ fontSize: 12, color: '#718096', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              En attente de libération
            </span>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#F57C00', marginTop: 6 }}>
              {formatCurrency(finances?.enAttenteLiberation || 7200)}
            </div>
          </div>
          <div style={{ marginTop: 16, fontSize: 12, color: '#718096' }}>
            Fonds consignés libérés dès confirmation de livraison par le client.
          </div>
        </div>

        {/* TOTAL GAGNÉ CE MOIS */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: 8,
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <span style={{ fontSize: 12, color: '#718096', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Total brut gagné ce mois
            </span>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#2E7D32', marginTop: 6 }}>
              {formatCurrency(finances?.totalGagneMois || 42800)}
            </div>
          </div>
          <div style={{ marginTop: 16, fontSize: 12, color: '#718096' }}>
            Commission plateforme standard : 10 % déduite automatiquement.
          </div>
        </div>
      </div>

      {/* GRAPHIQUE ÉVOLUTION DES GAINS */}
      <Card
        title="Historique des gains par semaine"
        subtitle="Progression hebdomadaire de vos recettes de fret"
      >
        <div style={{ width: '100%', height: 260, marginTop: 12 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={revenusSemaines}
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
                formatter={(val) => [formatCurrency(val), 'Gains']}
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 6,
                  border: '1px solid #E2E8F0',
                  fontSize: 12,
                }}
              />
              <Bar dataKey="montant" fill="#F57C00" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* HISTORIQUE DES TRANSACTIONS */}
      <div>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: '#1A202C', marginBottom: 12 }}>
          Historique détaillé des transactions
        </h2>

        <DataTable
          columns={columns}
          data={transactions}
          isLoading={isLoading}
          totalElements={transactions.length}
          pageSize={10}
        />
      </div>

      {/* MODAL DE DEMANDE DE RETRAIT */}
      <Modal
        isOpen={retraitModalOpen}
        onClose={() => setRetraitModalOpen(false)}
        title="Demander un virement bancaire"
        subtitle="Transférez vos gains disponibles vers votre compte bancaire marocain."
        actions={
          <>
            <Button variant="outline" onClick={() => setRetraitModalOpen(false)}>
              Annuler
            </Button>
            <Button
              variant="secondary"
              icon={<FiCreditCard />}
              onClick={handleDemanderRetrait}
              isLoading={isSubmittingRetrait}
            >
              Confirmer le virement
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ padding: 12, backgroundColor: '#F8FAFC', borderRadius: 6, fontSize: 13 }}>
            <div>Solde disponible : <strong>{formatCurrency(finances?.soldeDisponible || 18450)}</strong></div>
            <div style={{ color: '#718096', fontSize: 12, marginTop: 4 }}>
              Banque : {finances?.compteBancaire?.nomBanque || 'Attijariwafa Bank'}
            </div>
          </div>

          <Input
            label="Montant à virer (DH)"
            type="number"
            required={true}
            placeholder="Ex : 10000"
            value={montantRetrait}
            onChange={(e) => setMontantRetrait(e.target.value)}
            helperText="Le virement sera exécuté sans frais supplémentaires."
          />

          <Input
            label="Relevé d'Identité Bancaire (RIB - 24 chiffres)"
            required={true}
            placeholder="007 780 0001234567890123 45"
            value={ibanRetrait}
            onChange={(e) => setIbanRetrait(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
};

export default RevenusPage;
