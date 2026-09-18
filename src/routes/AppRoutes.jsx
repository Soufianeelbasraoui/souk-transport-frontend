

import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Login from '../pages/auth/Login';
import HomePage from '../pages/HomePage';
import Register from '../pages/auth/Register';
import DashboardAdmin from '../pages/admin/DashboardAdmin';
import CamionsPage from '../pages/admin/CamionsPage';
import DashboardTransporteur from '../pages/transporteur/DashboardTransporteur';
import DashboardExpediteur from '../pages/expediteur/DashboardExpediteur';
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';
import NotFoundPgae from '../pages/NotFoundPage';
import ReservationsRecues from '../pages/transporteur/ReservationsRecues';


import ConsulterCamion from '../components/camion/Consulter';
import ModifierCamion from '../components/camion/ModifierCamion';
import AjouterCamion from '../components/camion/AjouterCamion';
import MesTrajets from '../pages/transporteur/MesTrajets';
import MesCamions from '../pages/transporteur/MesCamions';
import PublierTrajet from '../components/trajet/PublierTrajet';
import ModifierTrajet from '../components/trajet/ModifierTrajet';
import ConsulterTrajet from '../components/trajet/Consulter';
import Profile from '../pages/transporteur/Profile';
import UsersPage from '../pages/admin/users/UsersPage';
import ModifierUser from '../pages/admin/users/Modifier';
import ConsulterUser from '../pages/admin/users/Consulter';
import AjouterUser from '../pages/admin/users/ajouter';
import TrajetsPage from '../pages/admin/TrajetsPage';
import CargaisonsPage from '../pages/admin/CargaisonsPage';
import ReservationsPage from '../pages/admin/Reservations';
import CreerCargaison from '../components/cargaison/CreerCargaison';
import ConsulterCargaison from '../components/cargaison/Consulter';
import TrajetsDisponibles from '../pages/expediteur/TrajetsDisponibles';
import DetailTrajet from '../pages/expediteur/DetailTrajet';
import MesCargaisons from '../pages/expediteur/MesCargaisons';
import MesReservations from '../pages/expediteur/MesReservations';
import Paiement from '../pages/expediteur/Paiement';
import DetailReservation from '../pages/expediteur/DetailReservation';

import PublicRoute from './PublicRoute';
import Unauthorized from '../pages/unauthorized';



function AppRoutes() {

  return (
    <BrowserRouter>
     <Routes>
      <Route element={<PublicRoute/>}>
         <Route path="/login" element={<Login />} />
         <Route path="/register" element={<Register/>}/>
      </Route>
       <Route path='/'element={<HomePage/>}/>
      <Route path='/*' element={<NotFoundPgae/>}/>
      <Route path="/unauthorized" element={<Unauthorized/>} />

      <Route  path='/admin/dashboard'   element={  <ProtectedRoute> <RoleRoute roles={["ADMIN"]}><DashboardAdmin/> </RoleRoute>  </ProtectedRoute> } />
      <Route path='/admin/camions' element={<ProtectedRoute><RoleRoute roles={["ADMIN"]}><CamionsPage/></RoleRoute></ProtectedRoute>}/>
      <Route path='/admin/users' element={<ProtectedRoute><RoleRoute roles={["ADMIN"]}><UsersPage/></RoleRoute></ProtectedRoute>} />
      <Route path='/admin/users/new' element={<ProtectedRoute><RoleRoute roles={["ADMIN"]}><AjouterUser/></RoleRoute></ProtectedRoute>} />
      <Route path='/admin/users/edit/:id' element={<ProtectedRoute><RoleRoute roles={["ADMIN"]}><ModifierUser/></RoleRoute></ProtectedRoute>} />
      <Route path='/admin/users/:id' element={<ProtectedRoute><RoleRoute roles={["ADMIN"]}><ConsulterUser/></RoleRoute></ProtectedRoute>} />
      <Route path='/admin/camions/new' element={<ProtectedRoute><RoleRoute  roles={["ADMIN"]}><AjouterCamion/></RoleRoute></ProtectedRoute>}/>
      <Route path='/admin/camions/edit/:id' element={<ProtectedRoute><RoleRoute roles={["ADMIN"]}><ModifierCamion/></RoleRoute></ProtectedRoute>}/>
      <Route path='/admin/camions/:id' element={<ProtectedRoute><RoleRoute roles={["ADMIN"]}><ConsulterCamion/></RoleRoute></ProtectedRoute>}/>
      <Route path='/admin/trajets' element={<ProtectedRoute><RoleRoute roles={["ADMIN"]}><TrajetsPage/></RoleRoute></ProtectedRoute>}/>
      <Route path='/admin/trajets/new' element={<ProtectedRoute><RoleRoute  roles={["ADMIN"]}><PublierTrajet/></RoleRoute></ProtectedRoute>}/>
      <Route path='/admin/trajets/edit/:id' element={<ProtectedRoute><RoleRoute roles={["ADMIN"]}><ModifierTrajet/></RoleRoute></ProtectedRoute>}/>
      <Route path='/admin/trajets/:id' element={<ProtectedRoute><RoleRoute roles={["ADMIN"]}><ConsulterTrajet/></RoleRoute></ProtectedRoute>}/>
      <Route path='/admin/cargaisons' element={<ProtectedRoute><RoleRoute roles={["ADMIN"]}><CargaisonsPage/></RoleRoute></ProtectedRoute>}/>
      <Route path='/admin/cargaisons/new' element={<ProtectedRoute><RoleRoute roles={["ADMIN"]}><CreerCargaison/></RoleRoute></ProtectedRoute>}/>
      <Route path='/admin/cargaisons/:id' element={<ProtectedRoute><RoleRoute roles={["ADMIN"]}><ConsulterCargaison/></RoleRoute></ProtectedRoute>}/>
      <Route path='/admin/reservations' element={<ProtectedRoute><RoleRoute  roles={["ADMIN"]}><ReservationsPage/></RoleRoute></ProtectedRoute>}/>



      <Route  path='/transporteur/dashboard'  element={  <ProtectedRoute> <RoleRoute roles={["TRANSPORTEUR"]}>   <DashboardTransporteur/>  </RoleRoute> </ProtectedRoute>}/>
      <Route path='/transporteur/trajets' element={<ProtectedRoute><RoleRoute roles={["TRANSPORTEUR"]}><MesTrajets/></RoleRoute></ProtectedRoute>}/>  
      <Route path='/transporteur/trajets/new' element={<ProtectedRoute><RoleRoute  roles={["TRANSPORTEUR"]}><PublierTrajet/></RoleRoute></ProtectedRoute>}/>
      <Route path='/transporteur/trajets/edit/:id' element={<ProtectedRoute><RoleRoute roles={["TRANSPORTEUR"]}><ModifierTrajet/></RoleRoute></ProtectedRoute>}/>
      <Route path='/transporteur/trajets/:id' element={<ProtectedRoute><RoleRoute roles={["TRANSPORTEUR"]}><ConsulterTrajet/></RoleRoute></ProtectedRoute>}/>
      <Route path='/transporteur/camions' element={<ProtectedRoute ><RoleRoute roles={["TRANSPORTEUR"]}><MesCamions/></RoleRoute></ProtectedRoute>} />
      <Route path='/transporteur/camions/new' element={<ProtectedRoute><RoleRoute  roles={["TRANSPORTEUR"]}><AjouterCamion/></RoleRoute></ProtectedRoute>}/>
      <Route path='/transporteur/camions/edit/:id' element={<ProtectedRoute><RoleRoute roles={["TRANSPORTEUR"]}><ModifierCamion/></RoleRoute></ProtectedRoute>}/>
      <Route path='/transporteur/camions/:id' element={<ProtectedRoute><RoleRoute roles={["TRANSPORTEUR"]}><ConsulterCamion/></RoleRoute></ProtectedRoute>}/>
      <Route path='/transporteur/reservations' element={<ProtectedRoute><RoleRoute roles={["TRANSPORTEUR"]}><ReservationsRecues/></RoleRoute></ProtectedRoute>} />
      <Route path='/transporteur/profile' element={<ProtectedRoute><RoleRoute roles={["TRANSPORTEUR"]}><Profile/></RoleRoute></ProtectedRoute>}/>

      <Route  path='/expediteur/dashboard'  element={   <ProtectedRoute> <RoleRoute roles={["EXPEDITEUR"]}> <DashboardExpediteur/> </RoleRoute></ProtectedRoute>  }/>
      <Route path='/expediteur/trajets' element={<ProtectedRoute><RoleRoute roles={["EXPEDITEUR"]}><TrajetsDisponibles/></RoleRoute></ProtectedRoute>}/>
      <Route path='/expediteur/cargaisons/:id' element={<ProtectedRoute><RoleRoute roles={["EXPEDITEUR"]}><ConsulterCargaison/></RoleRoute></ProtectedRoute>}/>
      <Route  path='/expediteur/detailtrajet/:id' element={<ProtectedRoute><RoleRoute  roles={["EXPEDITEUR"]}><DetailTrajet/></RoleRoute></ProtectedRoute>}/>
      <Route  path='/expediteur/cargaisons' element={<ProtectedRoute><RoleRoute roles={["EXPEDITEUR"]}><MesCargaisons/></RoleRoute></ProtectedRoute>}/>
      <Route path='/expediteur/cargaisons/new' element={<ProtectedRoute><RoleRoute roles={["EXPEDITEUR"]}><CreerCargaison/></RoleRoute></ProtectedRoute>}/>
      <Route path='/expediteur/reservations' element={<ProtectedRoute><RoleRoute roles={["EXPEDITEUR"]}><MesReservations/></RoleRoute></ProtectedRoute>}/>
      <Route path='/expediteur/reservations/:id' element={<ProtectedRoute><RoleRoute roles={["EXPEDITEUR"]}><DetailReservation/></RoleRoute></ProtectedRoute>}/>

      <Route path='/expediteur/paiements' element={<ProtectedRoute><RoleRoute roles={["EXPEDITEUR"]}><Paiement/></RoleRoute></ProtectedRoute>}/>


    </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes;
