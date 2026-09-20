import { useEffect, useState } from "react";
import Sidebar from "../../components/layout/Sidebar";
import "../../styles/global.css";
import "./style/transporteur.css";
import { FaTruck, FaBox, FaMoneyBillWave, FaUsers } from "react-icons/fa";
import api from "../../services/api";
import { Link } from "react-router-dom";
function DashboardTransporteur() {
  const [mesTrajets, setMesTrajets] = useState([]);
  const [mesCamions, setMesCamions] = useState([]);
  const[countMesTrajet,setCountMesTrajet]=useState(0);
  const[countMesReservation,setCountMesReservation]=useState(0);
  const[page,setPage]=useState(0);

  useEffect(() => {
    try {
      api.get(`/api/trajets/mesTrajets?page=${page}&size=10`).then((res) => {
        console.log(res.data.content);
        setMesTrajets(res.data.content);
      });
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    api .get("/api/camions/mesCamions") .then((res) => {
        setMesCamions(res.data.content);
        console.log(res.data);
      })
      .catch((error) => {
        console.error("Erreur camions :", error);
      });
  }, []);
  
  useEffect(()=>{
    api.get("/api/trajets/countTrajet").then((res)=>{
       console.log(res.data);
       setCountMesTrajet(res.data);
    })

    api.get("api/reservations/transporteur/count").then((res)=>{
      setCountMesReservation(res.data);
    })
  
  },[])

  return (
    <div className="app">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1>Bienvenue, Amine</h1>
            <p>Bienvenue dans votre espace transporteur.</p>
          </div>
        </div>
        <div className="">
          <div className="row g-3">
            <div className="col-lg-3 col-md-6">
              <div className="stat-card ">
                <div class="icon orange">
                  <FaTruck />
                </div>
                <div>
                  <small class="text-uppercase text-muted fw-semibold">
                  Totale Trajets 
                  </small>
                  <h3 class="mb-0 fw-bold">{countMesTrajet}</h3>
                </div>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <div className="stat-card ">
                <div class="icon blue">
                  <FaBox />
                </div>
                <div>
                  <small class="text-uppercase text-muted fw-semibold">
                    Camion
                  </small>
                  <h3 class="mb-0 fw-bold">{mesCamions.length}</h3>
                </div>
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <div className="stat-card ">
                <div class="icon green">
                  <FaMoneyBillWave />
                </div>
                <div>
                  <small class="text-uppercase text-muted fw-semibold">
                    Revenus 
                  </small>
                  <h3 class="mb-0 fw-bold">12</h3>
                </div>
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <div className="stat-card ">
                <div class="icon gray">
                  <FaUsers />
                </div>
                <div>
                  <small class="text-uppercase text-muted fw-semibold">
                    Réservations reçues
                  </small>
                  <h3 class="mb-0 fw-bold">{countMesReservation}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="row dashboard-bottom g-3 mt-2">
          <div className="col-lg-8">
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
                      <th>Camion</th>
                      <th>Statut</th>
                      <th>Rés.</th>
                    </tr>
                  </thead>

                  <tbody>
                    {mesTrajets.length > 0 ? (
                      mesTrajets.slice(0, 5).map((item) => (
                        <tr key={item.id}>
                          <td>
                            <span className="trajet-id">
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
                              {item.dateDepart ? new Date(item.dateDepart).toLocaleDateString(
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
                              <strong>{item.typeCamion || "Camion"}</strong>
                            </div>
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

          <div className="col-lg-4">
            <div className="dashboard-card quick-actions">
              <div className="card-header-custom">
                <div>
                  <h5>Actions rapides</h5>
                  <p>Accès rapide à vos fonctionnalités</p>
                </div>
              </div>

              <Link to="/transporteur/trajets/new" className="quick-action">
                <div className="quick-icon orange">
                  <FaTruck />{" "}
                </div>
                <div className="quick-content">
                  <strong>Publier un nouveau trajet</strong>
                  <span>Ajoutez un trajet disponible</span>
                </div>
                <span className="quick-arrow">&rarr;</span>
              </Link>

              <Link to="/transporteur/camions/new" className="quick-action">
                <div className="quick-icon blue">
                  <FaTruck />
                </div>
                <div className="quick-content">
                  <strong>Ajouter un camion</strong>
                  <span>Enregistrez un nouveau camion</span>
                </div>
                <span className="quick-arrow">→</span>
              </Link>
            </div>

            <div className="dashboard-card my-trucks mt-1">
              <div className="card-header-custom">
                <div>
                  <h5>Mes camions</h5>
                  <p>Vos véhicules disponibles</p>
                </div>
                <Link to="/transporteur/camions" className="view-all-link">
                  Voir tous{" "}
                </Link>
              </div>
              {mesCamions.length > 0 ? (
                mesCamions.slice(0, 2).map((camion) => (
                  <div className="truck-item" key={camion.id}>
                    <div className="truck-info">
                      <strong>
                        {camion.marque} {camion.modele}
                      </strong>
                      <span>{camion.immatriculation} </span>
                      <small> Capacité : {camion.capacite} Tonnes</small>
                    </div>
                    <span className="truck-status"> Actif </span>
                  </div>
                ))
              ) : (
                <div className="empty-trucks">Aucun camion enregistré</div>
              )}
              <Link to="/transporteur/camions/new" className="add-truck-btn">
                <span>+</span>
                Ajouter un camion
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default DashboardTransporteur;
