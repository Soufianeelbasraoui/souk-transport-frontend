import { Link } from "react-router-dom";
import Sidebar from "../../../components/layout/Sidebar";
import "../../../styles/global.css";
import "../style/styleTransporteur.css";
import api from "../../../services/api";
import { useEffect, useState } from "react";
import { MdOutlineEdit,MdDelete } from "react-icons/md";
import { BiShowAlt } from "react-icons/bi";




function MesCamions() {
    const [mesCamions, setMesCamions] = useState([]);

  useEffect(() => {
    api.get("/api/camions/mesCamions") .then((res) => {
        setMesCamions(res.data);
        console.log(res.data);
      })
      .catch((error) => {
        console.error("Erreur camions :", error);
      });
  }, []);

  return (
    <div className="app">

      <Sidebar />

      <main className="main-content">

        <div className="page-header">
          <div>
            <h1>Mes Camions</h1>
            <p>Gérez vos camions.</p>
          </div>
          <Link to="/transporteur/camions/new" className=" btn-primary">
            Ajouter un camion
          </Link>
        </div>
        <div className="dashboard-card recent-trajets">
          <div className="card-header-custom">
               <div>
                 <input type="text" placeholder="Rechercher un camion..." />
                </div>
          </div>
          <div className="table-responsive">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>CAMION</th>
                  <th>IMMATRICULATION</th>
                  <th>MODÈLE</th>
                  <th>CAPACITÉ</th> 
                  <th>type</th>
                  <th>STATUT</th>
                 
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {mesCamions.length>0 ?(
                    mesCamions.map((item)=>(
                      <tr key={item.id}>
                        <td>{item.marque}</td>
                        <td>{item.immatriculation}</td>
                        <td>{item.modele}</td>
                        <td>{item.capacite}</td>
                        <td>{item.type}</td>
                        <td>
                          <span className={`badge ${item.disponible ? 'bg-success' : 'bg-danger'}`}>
                             {item.disponible ? 'Disponible' : 'Non disponible'}
                          </span>
                        </td>
                        
                        <td>
                          <div className="action-btns">
                            <Link to={`/transporteur/camions/${item.id}`} className="action-btn view" title="Voir">
                              <BiShowAlt />
                            </Link>
                            <Link to={`/transporteur/camions/edit/${item.id}`} className="action-btn edit" title="Modifier">
                              <MdOutlineEdit />
                            </Link>
                            <button className="action-btn delete" title="Supprimer">
                              <MdDelete />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                ):(
                  <tr>
                    <td colSpan="6">
                          <div className="table-empty">
                            Aucun trajet trouvé.
                          </div>
                       </td>
                  </tr>
                )}
              </tbody>

            </table>

          </div>

        </div>

      </main>

    </div>
  );
}

export default MesCamions;