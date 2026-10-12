import React from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';

// Pages Publiques & Landing
import HomePage from '../pages/HomePage';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import Unauthorized from '../pages/unauthorized';
import NotFoundPage from '../pages/NotFoundPage';

// Routes de protection & Layout
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';
import PublicRoute from './PublicRoute';
import AppLayout from '../components/layout/app-shell/AppLayout';

// Page de développement Design System
import DesignSystemPage from '../pages/dev/DesignSystemPage';

// Pages Admin
import DashboardAdmin from '../pages/admin/DashboardAdmin';
import CamionsPage from '../pages/admin/CamionsPage';
import UsersPage from '../pages/admin/users/UsersPage';
import AjouterUser from '../pages/admin/users/Ajouter';
import ModifierUser from '../pages/admin/users/Modifier';
import ConsulterUser from '../pages/admin/users/Consulter';
import AjouterCamion from '../components/camion/AjouterCamion';
import ModifierCamion from '../components/camion/ModifierCamion';
import ConsulterCamion from '../components/camion/Consulter';
import TrajetsPage from '../pages/admin/TrajetsPage';
import PublierTrajet from '../components/trajet/PublierTrajet';
import ModifierTrajet from '../components/trajet/ModifierTrajet';
import ConsulterTrajet from '../components/trajet/Consulter';
import CargaisonsPage from '../pages/admin/CargaisonsPage';
import CreerCargaison from '../components/cargaison/CreerCargaison';
import ConsulterCargaison from '../components/cargaison/Consulter';
import ModifierCargaison from '../components/cargaison/ModifierCargaison';
import ReservationsPage from '../pages/admin/Reservations';
import ConsulterReservation from '../pages/admin/ConsulterReservation';
import PaiementsPage from '../pages/admin/PaiementsPage';
import ProfileAdmin from '../pages/admin/Profile';
import AdminVerificationsPage from '../pages/admin/AdminVerificationsPage';
import AdminLitigesPage from '../pages/admin/AdminLitigesPage';
import AdminAnalyticsPage from '../pages/admin/AdminAnalyticsPage';

// Pages Transporteur
import DashboardTransporteur from '../pages/transporteur/DashboardTransporteur';
import MesTrajets from '../pages/transporteur/MesTrajets';
import PublierTrajetPage from '../pages/transporteur/PublierTrajetPage';
import OffresRecuesPage from '../pages/transporteur/OffresRecuesPage';
import SuiviGpsPage from '../pages/transporteur/SuiviGpsPage';
import RevenusPage from '../pages/transporteur/RevenusPage';
import MonCamionProfilePage from '../pages/transporteur/MonCamionProfilePage';

// Pages Expéditeur
import DashboardExpediteur from '../pages/expediteur/DashboardExpediteur';
import TrajetsDisponibles from '../pages/expediteur/TrajetsDisponibles';
import DetailTrajet from '../pages/expediteur/DetailTrajet';
import MesCargaisons from '../pages/expediteur/MesCargaisons';
import MesReservations from '../pages/expediteur/MesReservations';
import DetailReservation from '../pages/expediteur/DetailReservation';
import Paiement from '../pages/expediteur/Paiement';
import ProfileExpediteur from '../pages/expediteur/Profile';
import SuiviCargaison from '../pages/expediteur/SuiviCargaison';


function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* LANDING PAGE : TOTALEMENT GELÉE ET HORS APPLAYOUT */}
        <Route path="/" element={<HomePage />} />

        {/* AUTH PUBLIQUE */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* PAGE DESIGN SYSTEM (DEV) */}
        <Route
          path="/design-system"
          element={
            <AppLayout>
              <DesignSystemPage />
            </AppLayout>
          }
        />

        {/* ================================================================= */}
        {/* ROUTES CONNECTÉES ENVELOPPÉES DANS APPLAYOUT                      */}
        {/* ================================================================= */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          {/* --- ADMIN --- */}
          <Route path="/admin/dashboard" element={<RoleRoute roles={['ADMIN']}><DashboardAdmin /></RoleRoute>} />
          <Route path="/admin/users" element={<RoleRoute roles={['ADMIN']}><UsersPage /></RoleRoute>} />
          <Route path="/admin/users/new" element={<RoleRoute roles={['ADMIN']}><AjouterUser /></RoleRoute>} />
          <Route path="/admin/users/edit/:id" element={<RoleRoute roles={['ADMIN']}><ModifierUser /></RoleRoute>} />
          <Route path="/admin/users/:id" element={<RoleRoute roles={['ADMIN']}><ConsulterUser /></RoleRoute>} />
          <Route path="/admin/camions" element={<RoleRoute roles={['ADMIN']}><CamionsPage /></RoleRoute>} />
          <Route path="/admin/camions/new" element={<RoleRoute roles={['ADMIN']}><AjouterCamion /></RoleRoute>} />
          <Route path="/admin/camions/edit/:id" element={<RoleRoute roles={['ADMIN']}><ModifierCamion /></RoleRoute>} />
          <Route path="/admin/camions/:id" element={<RoleRoute roles={['ADMIN']}><ConsulterCamion /></RoleRoute>} />
          <Route path="/admin/trajets" element={<RoleRoute roles={['ADMIN']}><TrajetsPage /></RoleRoute>} />
          <Route path="/admin/trajets/new" element={<RoleRoute roles={['ADMIN']}><PublierTrajet /></RoleRoute>} />
          <Route path="/admin/trajets/edit/:id" element={<RoleRoute roles={['ADMIN']}><ModifierTrajet /></RoleRoute>} />
          <Route path="/admin/trajets/:id" element={<RoleRoute roles={['ADMIN']}><ConsulterTrajet /></RoleRoute>} />
          <Route path="/admin/cargaisons" element={<RoleRoute roles={['ADMIN']}><CargaisonsPage /></RoleRoute>} />
          <Route path="/admin/cargaisons/new" element={<RoleRoute roles={['ADMIN']}><CreerCargaison /></RoleRoute>} />
          <Route path="/admin/cargaisons/:id" element={<RoleRoute roles={['ADMIN']}><ConsulterCargaison /></RoleRoute>} />
          <Route path="/admin/cargaisons/edit/:id" element={<RoleRoute roles={['ADMIN']}><ModifierCargaison /></RoleRoute>} />
          <Route path="/admin/reservations" element={<RoleRoute roles={['ADMIN']}><ReservationsPage /></RoleRoute>} />
          <Route path="/admin/reservations/:id" element={<RoleRoute roles={['ADMIN']}><ConsulterReservation /></RoleRoute>} />
          <Route path="/admin/paiements" element={<RoleRoute roles={['ADMIN']}><PaiementsPage /></RoleRoute>} />
          <Route path="/admin/transactions" element={<Navigate to="/admin/paiements" replace />} />
          <Route path="/admin/profile" element={<RoleRoute roles={['ADMIN']}><ProfileAdmin /></RoleRoute>} />
          <Route path="/admin/parametres" element={<Navigate to="/admin/profile" replace />} />

          {/* Phase D : Vérifications, Litiges et Analytics */}
          <Route path="/admin/verifications" element={<RoleRoute roles={['ADMIN']}><AdminVerificationsPage /></RoleRoute>} />
          <Route path="/admin/litiges" element={<RoleRoute roles={['ADMIN']}><AdminLitigesPage /></RoleRoute>} />
          <Route path="/admin/analytics" element={<RoleRoute roles={['ADMIN']}><AdminAnalyticsPage /></RoleRoute>} />

          {/* --- TRANSPORTEUR (PHASE B) --- */}
          <Route path="/transporteur/dashboard" element={<RoleRoute roles={['TRANSPORTEUR']}><DashboardTransporteur /></RoleRoute>} />
          <Route path="/transporteur/trajets" element={<RoleRoute roles={['TRANSPORTEUR']}><MesTrajets /></RoleRoute>} />
          <Route path="/transporteur/trajets/new" element={<RoleRoute roles={['TRANSPORTEUR', 'ADMIN']}><PublierTrajetPage /></RoleRoute>} />
          <Route path="/transporteur/trajets/edit/:id" element={<RoleRoute roles={['TRANSPORTEUR', 'ADMIN']}><PublierTrajetPage /></RoleRoute>} />
          <Route path="/transporteur/trajets/:id" element={<RoleRoute roles={['TRANSPORTEUR', 'ADMIN']}><MesTrajets /></RoleRoute>} />
          <Route path="/transporteur/camions" element={<RoleRoute roles={['TRANSPORTEUR']}><MonCamionProfilePage /></RoleRoute>} />
          <Route path="/transporteur/camions/new" element={<RoleRoute roles={['TRANSPORTEUR']}><MonCamionProfilePage /></RoleRoute>} />
          <Route path="/transporteur/camions/edit/:id" element={<RoleRoute roles={['TRANSPORTEUR']}><MonCamionProfilePage /></RoleRoute>} />
          <Route path="/transporteur/camions/:id" element={<RoleRoute roles={['TRANSPORTEUR']}><MonCamionProfilePage /></RoleRoute>} />
          <Route path="/transporteur/reservations" element={<RoleRoute roles={['TRANSPORTEUR']}><OffresRecuesPage /></RoleRoute>} />
          <Route path="/transporteur/offres" element={<RoleRoute roles={['TRANSPORTEUR']}><OffresRecuesPage /></RoleRoute>} />
          <Route path="/transporteur/suivi/:id" element={<RoleRoute roles={['TRANSPORTEUR']}><SuiviGpsPage /></RoleRoute>} />
          <Route path="/transporteur/revenus" element={<RoleRoute roles={['TRANSPORTEUR']}><RevenusPage /></RoleRoute>} />
          <Route path="/transporteur/profile" element={<RoleRoute roles={['TRANSPORTEUR']}><MonCamionProfilePage /></RoleRoute>} />
          <Route path="/transporteur/avis" element={<RoleRoute roles={['TRANSPORTEUR']}><MonCamionProfilePage /></RoleRoute>} />
          <Route path="/transporteur/parametres" element={<Navigate to="/transporteur/profile" replace />} />

          {/* --- EXPÉDITEUR (PHASE C) --- */}
          <Route path="/expediteur/dashboard" element={<RoleRoute roles={['EXPEDITEUR']}><DashboardExpediteur /></RoleRoute>} />
          <Route path="/expediteur/trajets" element={<RoleRoute roles={['EXPEDITEUR']}><TrajetsDisponibles /></RoleRoute>} />
          <Route path="/expediteur/trajets/:id" element={<RoleRoute roles={['EXPEDITEUR']}><DetailTrajet /></RoleRoute>} />
          <Route path="/expediteur/recherche" element={<Navigate to="/expediteur/trajets" replace />} />
          <Route path="/expediteur/detailtrajet/:id" element={<RoleRoute roles={['EXPEDITEUR']}><DetailTrajet /></RoleRoute>} />
          <Route path="/expediteur/cargaisons" element={<RoleRoute roles={['EXPEDITEUR']}><MesCargaisons /></RoleRoute>} />
          <Route path="/expediteur/cargaisons/new" element={<RoleRoute roles={['EXPEDITEUR']}><MesCargaisons /></RoleRoute>} />
          <Route path="/expediteur/cargaisons/edit/:id" element={<RoleRoute roles={['EXPEDITEUR']}><MesCargaisons /></RoleRoute>} />
          <Route path="/expediteur/cargaisons/:id" element={<RoleRoute roles={['EXPEDITEUR']}><MesCargaisons /></RoleRoute>} />
          <Route path="/expediteur/cargaisons/:id/suivi" element={<RoleRoute roles={['EXPEDITEUR']}><SuiviCargaison /></RoleRoute>} />
          <Route path="/expediteur/suivi/:id" element={<RoleRoute roles={['EXPEDITEUR']}><SuiviCargaison /></RoleRoute>} />
          <Route path="/expediteur/reservations" element={<RoleRoute roles={['EXPEDITEUR']}><MesReservations /></RoleRoute>} />
          <Route path="/expediteur/reservations/:id" element={<RoleRoute roles={['EXPEDITEUR']}><DetailReservation /></RoleRoute>} />
          <Route path="/expediteur/profile" element={<RoleRoute roles={['EXPEDITEUR']}><ProfileExpediteur /></RoleRoute>} />
          <Route path="/expediteur/parametres" element={<Navigate to="/expediteur/profile" replace />} />
          <Route path="/expediteur/paiements" element={<RoleRoute roles={['EXPEDITEUR']}><Paiement /></RoleRoute>} />
          <Route path="/expediteur/paiement" element={<RoleRoute roles={['EXPEDITEUR']}><Paiement /></RoleRoute>} />
          <Route path="/expediteur/finances" element={<Navigate to="/expediteur/paiements" replace />} />

          {/* Placeholders fonctionnels pour futures pages Phase C */}
          <Route path="/expediteur/favoris" element={<RoleRoute roles={['EXPEDITEUR']}><div style={{ padding: 20 }}><h3>Transporteurs favoris (Phase C)</h3><p>Disponible en Phase C.</p></div></RoleRoute>} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
