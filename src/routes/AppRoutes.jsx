

import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Login from '../pages/auth/Login';
import HomePage from '../pages/HomePage';
import Register from '../pages/auth/Register';
import DashboardAdmin from '../pages/admin/DashboardAdmin';
import DashboardTransporteur from '../pages/transporteur/DashboardTransporteur';
import DashboardExpediteur from '../pages/expediteur/DashboardExpediteur';
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';
import NotFoundPgae from '../pages/NotFoundPage';
import MesTrajets from '../pages/transporteur/trajets/MesTrajets';
import MesCamions from '../pages/transporteur/camion/MesCamions';
import ReservationsRecues from '../pages/transporteur/ReservationsRecues';
import PublierTrajet from '../pages/transporteur/trajets/PublierTrajet';
import AjouterCamion from '../pages/transporteur/camion/AjouterCamion';
import ModifierCamion from '../pages/transporteur/camion/Modifier';
import ConsulterCamion from '../pages/transporteur/camion/Consulter';
import ModifierTrajet from '../pages/transporteur/trajets/Modifier';
import ConsulterTrajet from '../pages/transporteur/trajets/Consulter';
import Profile from '../pages/transporteur/trajets/Profile';
import UsersPage from '../pages/admin/users/UsersPage';
import ModifierUser from '../pages/admin/users/Modifier';
import ConsulterUser from '../pages/admin/users/Consulter';
import CamionsPage from '../pages/admin/camions/CamionsPage';
import AjouterUser from '../pages/admin/users/ajouter';



function AppRoutes() {

  return (
    <BrowserRouter>
     <Routes>
      <Route path='/'element={<HomePage/>}/>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register/>}/>
      <Route path='/*' element={<NotFoundPgae/>}/>

      <Route 
          path='/admin/dashboard' 
          element={
            <ProtectedRoute>
              <RoleRoute roles={["ADMIN"]}>
                <DashboardAdmin/>
              </RoleRoute>
            </ProtectedRoute>
          }
        />
      <Route path='/admin/camions' element={<ProtectedRoute><RoleRoute roles={["ADMIN"]}><CamionsPage/></RoleRoute></ProtectedRoute>}/>
      <Route path='/admin/users' element={<ProtectedRoute><RoleRoute roles={["ADMIN"]}><UsersPage/></RoleRoute></ProtectedRoute>} />
      <Route path='/admin/users/new' element={<ProtectedRoute><RoleRoute roles={["ADMIN"]}><AjouterUser/></RoleRoute></ProtectedRoute>} />
      <Route path='/admin/users/edit/:id' element={<ProtectedRoute><RoleRoute roles={["ADMIN"]}><ModifierUser/></RoleRoute></ProtectedRoute>} />
      <Route path='/admin/users/:id' element={<ProtectedRoute><RoleRoute roles={["ADMIN"]}><ConsulterUser/></RoleRoute></ProtectedRoute>} />



      <Route 
         path='/transporteur/dashboard'
         element={
          <ProtectedRoute>
            <RoleRoute roles={["TRANSPORTEUR"]}>
                <DashboardTransporteur/>
            </RoleRoute>
          </ProtectedRoute>
        }/>
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

      <Route 
        path='/expediteur/dashboard' 
        element={
          <ProtectedRoute>
            <RoleRoute roles={["EXPEDITEUR"]}>
               <DashboardExpediteur/>
            </RoleRoute>
          </ProtectedRoute>
        }/>
     </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes;
