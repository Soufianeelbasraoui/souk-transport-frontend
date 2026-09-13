import { Link } from "react-router-dom";
import Sidebar from "../../../components/layout/Sidebar";
import '../../../styles/global.css';
import "../style/styleTransporteur.css";
import { useEffect,useState } from "react";
import api from "../../../services/api";
import { MdOutlineEdit,MdDelete } from "react-icons/md";
import { BiShowAlt } from "react-icons/bi";

function MesTrajets(){
  const [mesTrajets, setMesTrajets] = useState([]);

useEffect(() => {
    try {
      api.get("/api/trajets/mesTrajets").then((res) => {
        console.log(res.data);
        setMesTrajets(res.data);
      });
    } catch (error) {
      console.log(error);
    }
  }, []);

  return(
    <div className="app">
     <Sidebar/>
     <main className="main-content">
        <div className="page-header">
          <div>
             <h1>Mes Trajets</h1>
             <p>Gérez vos trajets publiés et consultez leurs performances.</p>
          </div>
         <Link to="/transporteur/trajets/new" className="btn-primary">
           Publier un trajet
         </Link>
        </div>
        <div className="row">
          <div className="col-lg-12">
            <div className="dashboard-card recent-trajets">
              <div className="card-header-custom">
                <div>
                  <h5>Trajets récents</h5>
                  <p>Vos derniers trajets publiés</p>
                </div>
                <Link to="/transporteur/trajets" className="view-all-link">
                  Voir tous les trajets
                </Link>
              </div>

              <div className="table-responsive">
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>ID Trajet</th>
                      <th>Départ &rarr; Arrivée</th>
                      <th>Date</th>
                      <th>Capacite</th>
                      <th>Prix</th>
                      <th>Statut</th>
                      <th>Rés.</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {mesTrajets.length > 0 ? (
                      mesTrajets.slice(0, 5).map((item) => (
                        <tr key={item.id}>
                          <td>
                            <span className="trajet-id">
                              {" "}
                              T-{String(item.id).padStart(4, "0")}
                            </span>
                          </td>
                          <td>
                            <div className="route-cell">
                              <span>{item.villeDepart}</span>
                              <span className="route-arrow">&rarr;</span>
                              <span>{item.villeArrivee}</span>
                            </div>
                          </td>
                          <td>
                            <span className="date-cell">
                              {item.dateDepart
                                ? new Date(item.dateDepart).toLocaleDateString(
                                    "fr-FR",
                                    {
                                      day: "2-digit",
                                      month: "2-digit",
                                      year: "numeric",
                                    },
                                  )
                                : "N/A"}
                            </span>
                          </td>
                          <td>
                            <div className="truck-cell">
                              <strong>{item.poidsDisponible || "CAPACITÉ"} Tonnes</strong>
                            </div>
                          </td>
                          <td className="truck-greane">
                            <strong>{item.prix}</strong>
                          </td>
                          <td>
                            <span  className={`status-badge ${item.statutTrajet === "PUBLIE" ? "status-open" : item.statutTrajet === "EN_COURS" ? "status-progress" : "status-other"}`}>
                              {item.statutTrajet}
                            </span>
                          </td>

                          <td>
                            <span className="reservation-count">
                              {item.nombreReservations || 0}
                            </span>
                          </td>
                          <td>
                            <div className="action-btns">
                              <Link to={`/transporteur/trajets/${item.id}`} className="action-btn view">
                                <BiShowAlt />
                              </Link>
                              <Link to={`/transporteur/trajets/edit/${item.id}`} className="action-btn edit">
                                <MdOutlineEdit />
                              </Link>
                              <button className="action-btn delete">
                                <MdDelete />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
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
          </div>

        </div>
     </main>
    </div>
  )
}
export default MesTrajets;