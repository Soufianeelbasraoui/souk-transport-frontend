

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
import ModifierCamion from '../components/camion/Modifier';
import AjouterCamion from '../components/camion/AjouterCamion';
import MesTrajets from '../pages/transporteur/MesTrajets';
import MesCamions from '../pages/transporteur/MesCamions';
import PublierTrajet from '../components/trajet/PublierTrajet';
import ModifierTrajet from '../components/trajet/Modifier';
import ConsulterTrajet from '../components/trajet/Consulter';
import Profile from '../pages/transporteur/Profile';
import UsersPage from '../pages/admin/users/UsersPage';
import ModifierUser from '../pages/admin/users/Modifier';
import ConsulterUser from '../pages/admin/users/Consulter';
import AjouterUser from '../pages/admin/users/ajouter';
import TrajetsPage from '../pages/admin/TrajetsPage';



function AppRoutes() {

  return (
    <BrowserRouter>
     <Routes>
      <Route path='/'element={<HomePage/>}/>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register/>}/>
      <Route path='/*' element={<NotFoundPgae/>}/>

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

      <Route  path='/expediteur/dashboard'  element={   <ProtectedRoute> <RoleRoute roles={["EXPEDITEUR"]}> <DashboardExpediteur/> </RoleRoute></ProtectedRoute>  }/> </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes;
