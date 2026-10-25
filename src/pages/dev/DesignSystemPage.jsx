import React, { useState } from 'react';
import {
  FiTruck,
  FiPackage,
  FiDollarSign,
  FiMail,
  FiLock,
  FiPlus,
} from 'react-icons/fi';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Badge from '../../components/common/Badge';
import Card from '../../components/common/Card';
import KpiCard from '../../components/common/KpiCard';
import Tabs from '../../components/common/Tabs';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import SidePanel from '../../components/common/SidePanel';
import Stepper from '../../components/common/Stepper';
import ProgressBar from '../../components/common/ProgressBar';
import DemoBadge from '../../components/common/DemoBadge';
import { formatCurrency, formatNumber, formatDate, formatWeight, formatPercent } from '../../utils/format';

export const DesignSystemPage = () => {
  const [activeTab, setActiveTab] = useState('components');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [stepperStep, setStepperStep] = useState(1);
  const [tableLoading, setTableLoading] = useState(false);
  const [tablePage, setTablePage] = useState(0);
  const [tablePageSize, setTablePageSize] = useState(10);

  // Exemple de données pour DataTable
  const sampleData = [
    { id: 'TR-101', route: 'Casablanca → Tanger', date: '2025-01-15', transporteur: 'Atlas Express Logistique', prix: 3800, statut: 'PUBLIE' },
    { id: 'TR-102', route: 'Marrakech → Agadir', date: '2025-01-16', transporteur: 'Souss Fret S.A.R.L.', prix: 2400, statut: 'EN_COURS' },
    { id: 'TR-103', route: 'Fès → Oujda', date: '2025-01-17', transporteur: 'Oriental Transport', prix: 1950, statut: 'COMPLET' },
    { id: 'TR-104', route: 'Tanger → Casablanca', date: '2025-01-18', transporteur: 'Nord Trans Cargo', prix: 4200, statut: 'TERMINE' },
    { id: 'TR-105', route: 'Rabat → Marrakech', date: '2025-01-19', transporteur: 'Fast Fret Maroc', prix: 3100, statut: 'ANNULE' },
  ];

  const columns = [
    { key: 'id', header: 'Réf. Trajet', width: '120px', render: (val) => <strong>#{val}</strong> },
    { key: 'route', header: 'Liaison & Trajet', sortable: true },
    { key: 'transporteur', header: 'Transporteur' },
    { key: 'date', header: 'Départ', render: (val) => formatDate(val) },
    { key: 'prix', header: 'Prix HT', align: 'right', render: (val) => <strong>{formatCurrency(val)}</strong> },
    { key: 'statut', header: 'Statut', width: '140px', render: (val) => <Badge status={val} /> },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {/* HEADER SECTION */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#1A3A5C' }}>
            Design System & Composants B2B
          </h1>
          <DemoBadge force={true} />
        </div>
        <p style={{ margin: '6px 0 0', color: '#718096', fontSize: 14 }}>
          Spécifications graphiques, tokens CSS (.app-shell) et bibliothèque de composants pour SoukTransport.
        </p>
      </div>

      {/* ONGLETS */}
      <Tabs
        tabs={[
          { id: 'components', label: 'Composants atomiques', count: 12 },
          { id: 'tokens', label: 'Tokens & Couleurs' },
          { id: 'formatters', label: 'Formatage & Règles B2B' },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* VUE 1 : COMPOSANTS ATOMIQUES */}
      {activeTab === 'components' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          {/* KPI CARDS */}
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: '#1A202C', marginBottom: 16 }}>
              Cartes KPI & Métriques
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
              <KpiCard
                label="Revenus du mois"
                value={formatCurrency(48650)}
                trend={14.8}
                icon={<FiDollarSign />}
              />
              <KpiCard
                label="Trajets réalisés"
                value={formatNumber(124)}
                trend={8.2}
                icon={<FiTruck />}
              />
              <KpiCard
                label="Taux de remplissage"
                value={formatPercent(82)}
                trend={-2.4}
                icon={<FiPackage />}
              />
              <KpiCard
                label="Chargement (Skeleton)"
                isLoading={true}
              />
            </div>
          </div>

          {/* BOUTONS */}
          <Card title="Boutons (.st-btn)">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
              <Button variant="primary">Bouton Principal</Button>
              <Button variant="secondary" icon={<FiPlus />}>Action Secondaire</Button>
              <Button variant="outline">Contour neutre</Button>
              <Button variant="ghost">Bouton Fantôme</Button>
              <Button variant="danger">Action Critique</Button>
              <Button variant="primary" isLoading={true}>Chargement...</Button>
              <Button variant="primary" size="sm">Petit (sm)</Button>
              <Button variant="primary" size="lg">Grand (lg)</Button>
            </div>
          </Card>

          {/* FORMULAIRES & INPUTS */}
          <Card title="Champs de saisie & Formulaires">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
              <Input
                label="Adresse Email professionnelle"
                required={true}
                placeholder="transporteur@entreprise.ma"
                icon={<FiMail />}
                helperText="Votre email de connexion principal."
              />
              <Input
                label="Mot de passe"
                type="password"
                required={true}
                icon={<FiLock />}
                placeholder="••••••••"
                error="Le mot de passe doit comporter au moins 6 caractères."
              />
              <Select
                label="Type de marchandise"
                placeholder="Sélectionnez un type..."
                options={[
                  { value: 'ALIMENTAIRE', label: 'Alimentaire' },
                  { value: 'ELECTRONIQUE', label: 'Électronique & High-Tech' },
                  { value: 'FRAGILE', label: 'Marchandise fragile' },
                ]}
              />
            </div>
          </Card>

          {/* BADGES & STATUTS */}
          <Card title="Badges de statuts (automatiques via statusMap)">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
              <Badge status="PUBLIE" />
              <Badge status="EN_COURS" />
              <Badge status="COMPLET" />
              <Badge status="TERMINE" />
              <Badge status="ANNULE" />
              <Badge status="EN_ATTENTE" />
              <Badge status="CONTRE_OFFRE" />
              <Badge status="ACCEPTEE" />
              <Badge status="REFUSEE" />
              <Badge status="PAYE" />
              <Badge status="LITIGE" />
            </div>
          </Card>

          {/* PROGRESSION & STEPPER */}
          <Card title="Stepper & Barre de progression">
            <Stepper
              steps={[
                { title: 'Départ & Arrivée' },
                { title: 'Date & Horaires' },
                { title: 'Capacité & Prix' },
                { title: 'Confirmation' },
              ]}
              currentStep={stepperStep}
              onStepClick={setStepperStep}
            />

            <div style={{ marginTop: 24 }}>
              <ProgressBar value={78} showLabel={true} label="Taux de remplissage actuel" />
            </div>
          </Card>

          {/* DATA TABLE */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: '#1A202C', margin: 0 }}>
                Tableau de données paginé (DataTable)
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTableLoading(!tableLoading)}
              >
                Basculer Skeleton ({tableLoading ? 'Actif' : 'Inactif'})
              </Button>
            </div>

            <DataTable
              columns={columns}
              data={sampleData}
              isLoading={tableLoading}
              page={tablePage}
              pageSize={tablePageSize}
              totalElements={sampleData.length}
              totalPages={1}
              onPageChange={setTablePage}
              onPageSizeChange={setTablePageSize}
            />
          </div>

          {/* MODALS & DRAWERS */}
          <Card title="Fenêtres modales & Panneaux latéraux (Drawers)">
            <div style={{ display: 'flex', gap: 12 }}>
              <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                Ouvrir Modal (560px)
              </Button>
              <Button variant="secondary" onClick={() => setIsSidePanelOpen(true)}>
                Ouvrir Panneau latéral (480px)
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* VUE 2 : TOKENS ET COULEURS */}
      {activeTab === 'tokens' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <Card title="Palette de Couleurs Officielles">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              {[
                { name: 'Primary (Navy)', hex: '#1A3A5C', text: '#FFFFFF' },
                { name: 'Secondary (Orange)', hex: '#F57C00', text: '#FFFFFF' },
                { name: 'Success (Vert)', hex: '#2E7D32', text: '#FFFFFF' },
                { name: 'Danger (Rouge)', hex: '#C62828', text: '#FFFFFF' },
                { name: 'Warning (Jaune)', hex: '#F9A825', text: '#1A202C' },
                { name: 'Background (Fond)', hex: '#F0F2F5', text: '#1A202C' },
                { name: 'Surface (Blanc)', hex: '#FFFFFF', text: '#1A202C', border: true },
                { name: 'Border (Bordure)', hex: '#E2E8F0', text: '#1A202C' },
                { name: 'Text (Texte)', hex: '#1A202C', text: '#FFFFFF' },
                { name: 'Text Secondary', hex: '#718096', text: '#FFFFFF' },
              ].map((c) => (
                <div
                  key={c.name}
                  style={{
                    backgroundColor: c.hex,
                    color: c.text,
                    padding: 16,
                    borderRadius: 8,
                    border: c.border ? '1px solid #E2E8F0' : 'none',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                  }}
                >
                  <strong style={{ display: 'block', fontSize: 14 }}>{c.name}</strong>
                  <code style={{ fontSize: 12, opacity: 0.9 }}>{c.hex}</code>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* VUE 3 : RÈGLES DE FORMATAGE B2B */}
      {activeTab === 'formatters' && (
        <Card title="Validation des utilitaires utils/format.js">
          <table className="st-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Entrée brute</th>
                <th>Résultat formaté</th>
                <th>Exigence design</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Nombres</td>
                <td><code>1247</code></td>
                <td><strong>{formatNumber(1247)}</strong></td>
                <td>1 247 (espace insécable)</td>
              </tr>
              <tr>
                <td>Monnaie</td>
                <td><code>1200</code></td>
                <td><strong>{formatCurrency(1200)}</strong></td>
                <td>1 200 DH</td>
              </tr>
              <tr>
                <td>Dates</td>
                <td><code>2025-01-15T14:30:00</code></td>
                <td><strong>{formatDate('2025-01-15T14:30:00')}</strong></td>
                <td>15 janvier 2025</td>
              </tr>
              <tr>
                <td>Poids</td>
                <td><code>2500</code></td>
                <td><strong>{formatWeight(2500)}</strong></td>
                <td>2,5 t</td>
              </tr>
              <tr>
                <td>Pourcentage</td>
                <td><code>78.4</code></td>
                <td><strong>{formatPercent(78.4)}</strong></td>
                <td>78 %</td>
              </tr>
            </tbody>
          </table>
        </Card>
      )}

      {/* MODAL DE DEMO (560px) */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Détail de la réservation #RES-892"
        subtitle="Vérifiez les conditions avant de confirmer le départ."
        actions={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Annuler</Button>
            <Button variant="primary" onClick={() => setIsModalOpen(false)}>Confirmer</Button>
          </>
        }
      >
        <p style={{ margin: 0, fontSize: 13, color: '#4A5568' }}>
          Ce modal a une largeur calibrée de 560px maximum, un fond translucide flouté et s'adapte à la charte graphique de SoukTransport.
        </p>
      </Modal>

      {/* SIDE PANEL DE DEMO (480px) */}
      <SidePanel
        isOpen={isSidePanelOpen}
        onClose={() => setIsSidePanelOpen(false)}
        title="Détail du trajet Casablanca → Tanger"
        subtitle="Informations complètes du camion et des réservations"
        actions={
          <>
            <Button variant="outline" onClick={() => setIsSidePanelOpen(false)}>Fermer</Button>
            <Button variant="secondary" onClick={() => setIsSidePanelOpen(false)}>Modifier</Button>
          </>
        }
      >
        <p style={{ margin: 0, fontSize: 13, color: '#4A5568' }}>
          Ce panneau coulissant latéral (480px) permet de consulter ou modifier les fiches sans quitter la page active.
        </p>
      </SidePanel>
    </div>
  );
};

export default DesignSystemPage;
