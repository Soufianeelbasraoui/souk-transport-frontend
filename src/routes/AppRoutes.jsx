

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
import MesTrajets from '../pages/transporteur/MesTrajets';
import MesCamions from '../pages/transporteur/MesCamions';
import ReservationsRecues from '../pages/transporteur/ReservationsRecues';
import Cargaisons from '../pages/transporteur/CargaisonsEnCours';
import PublierTrajet from '../pages/transporteur/PublierTrajet';
import ProfilPage from '../pages/ProfilPage';
import AjouterCamion from '../pages/transporteur/AjouterCamion';


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
      <Route path='/transporteur/camions' element={<ProtectedRoute ><RoleRoute roles={["TRANSPORTEUR"]}><MesCamions/></RoleRoute></ProtectedRoute>} />
      <Route path='/transporteur/camions/new' element={<ProtectedRoute><RoleRoute  roles={["TRANSPORTEUR"]}><AjouterCamion/></RoleRoute></ProtectedRoute>}/>
      <Route path='/transporteur/reservations' element={<ProtectedRoute><RoleRoute roles={["TRANSPORTEUR"]}><ReservationsRecues/></RoleRoute></ProtectedRoute>} />
      <Route path='/transporteur/profile' element={<ProtectedRoute><RoleRoute roles={["TRANSPORTEUR"]}><ProfilPage/></RoleRoute></ProtectedRoute>}/>
      <Route path='/transporteur/cargaisons' element={<ProtectedRoute><RoleRoute roles={["TRANSPORTEUR"]}><Cargaisons/></RoleRoute></ProtectedRoute>}/>

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
