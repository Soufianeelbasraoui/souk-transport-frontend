import { useEffect, useState } from "react";
import Sidebar from "../../components/layout/Sidebar";
import "../../styles/global.css";
import "./styles/admin.css";

import { FaTruck, FaBox, FaMoneyBillWave, FaUsers, FaEllipsisV,} from "react-icons/fa";
import { Link } from "react-router-dom";
import api from "../../services/api";

function DashboardAdmin() {

  const [dashboard, setDashboard] = useState({
    totalUtilisateurs: 0,
    trajetsPublies: 0,
    totalCargaisons: 0,
    totalReservations: 0,
    revenusTotaux: 0,
    derniersTrajets: [],
    reservationsRecentes: [],
  });

  useEffect(() => {
    api.get("/api/dashboard/admin").then((res) => {
        console.log("Dashboard Admin :", res.data);
        setDashboard(res.data);
      })
      .catch((error) => {
        console.error("Erreur dashboard admin :", error);
      });

  }, []);

  return (
    <div className="app">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1>Tableau de bord</h1>
            <p>Bienvenue dans votre espace Admin.</p>
          </div>
        </div>
        <div className="row g-3">
          <div className="col">
            <div className="stat-card h-100">
              <div className="icon orange">
                <FaUsers />
              </div>
              <div>
                <small className="text-uppercase text-muted fw-semibold">
                  Utilisateurs total
                </small>
                <h3 className="mb-0 fw-bold">
                  {dashboard.totalUtilisateurs}
                </h3>
              </div>

            </div>
          </div>
          <div className="col">
            <div className="stat-card h-100">
              <div className="icon blue">
                <FaTruck />
              </div>

              <div>
                <small className="text-uppercase text-muted fw-semibold">
                  Trajets publiés
                </small>

                <h3 className="mb-0 fw-bold">
                  {dashboard.trajetsPublies}
                </h3>
              </div>

            </div>
          </div>

          <div className="col">
            <div className="stat-card h-100">
              <div className="icon green">
                <FaBox />
              </div>

              <div>
                <small className="text-uppercase text-muted fw-semibold"> Cargaisons </small>
                <h3 className="mb-0 fw-bold"> {dashboard.totalCargaisons}</h3>
              </div>

            </div>
          </div>
          <div className="col">
            <div className="stat-card h-100">
              <div className="icon gray">
                <FaUsers />
              </div>

              <div>
                <small className="text-uppercase text-muted fw-semibold">
                  Réservations
                </small>

                <h3 className="mb-0 fw-bold">
                  {dashboard.totalReservations}
                </h3>
              </div>

            </div>
          </div>

          <div className="col">
            <div className="stat-card h-100">
              <div className="icon gray">
                <FaMoneyBillWave />
              </div>

              <div>
                <small className="text-uppercase text-muted fw-semibold">
                  Revenus totaux
                </small>

                <h3 className="mb-0 fw-bold">
                  {dashboard.revenusTotaux} DH
                </h3>
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
                  <p>Les derniers trajets publiés</p>
                </div>

                <Link to="/admin/trajets"  className="view-all-link" >
                  Voir tous les trajets
                </Link>
              </div>

              <div className="table-responsive">
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>ID Trajet</th>
                      <th>Départ → Arrivée</th>
                      <th>Date</th>
                      <th>Camion</th>
                      <th>Statut</th>
                    </tr>
                  </thead>

                  <tbody>

                    {dashboard.derniersTrajets.length > 0 ? (
                      dashboard.derniersTrajets.map((item) => (
                        <tr key={item.id}>
                          <td>
                            <span className="trajet-id">
                              T-{String(item.id).padStart(4, "0")}
                            </span>
                          </td>


                          <td>

                            <div className="route-cell">
                              <span>  {item.villeDepart} </span>
                              <span className="route-arrow">  → </span>
                              <span> {item.villeArrivee} </span>
                            </div>
                          </td>


                          <td>

                            <span className="date-cell">
                              {item.dateDepart
                                ? new Date(
                                    item.dateDepart
                                  ).toLocaleDateString(
                                    "fr-FR",
                                    {
                                      day: "2-digit",
                                      month: "2-digit",
                                      year: "numeric",
                                    }
                                  )
                                : "N/A"}

                            </span>

                          </td>
                          <td>
                            <div className="truck-cell">
                              <strong>   {item.typeCamion || "Camion"}</strong>
                            </div>
                          </td>
                          <td>
                            <span className={`status-badge ${
                              item.statutTrajet === "PUBLIE"
                                ? "status-open"
                                : item.statutTrajet === "EN_COURS"
                                ? "status-progress"
                                : item.statutTrajet === "TERMINE"
                                ? "status-finished"
                                : "status-other"
                            }`} >
                              {item.statutTrajet}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5">
                          <div className="table-empty"> Aucun trajet trouvé.</div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="col-lg-4">
            <div className="admin-reservations-card">
              <div className="admin-reservations-header">
                <h5> Réservations récentes</h5>
                <button type="button"className="admin-menu-button" aria-label="Plus d'options"> <FaEllipsisV /></button>

              </div>
             <div className="admin-reservations-list">
                {dashboard.reservationsRecentes.length > 0 ? (
                  dashboard.reservationsRecentes.map((item) => (
                    <div  className="admin-reservation-item"  key={item.id} >
                      <div className="admin-reservation-icon"><FaTruck /></div>
            
                      <div className="admin-reservation-content">
                        <strong>
                          {item.villeDepart || "Départ"}
                          {" → "}
                          {item.villeArrivee || "Arrivée"}
                        </strong>
            
                        <span>TR-{item.id}-{item.poidsReserve} T</span>
                      </div>
                       <span className="admin-reservation-status is-pending">
                            {item.statutReservation || "En attente"}
                        </span>
                        </div>
                    ))) : (
                      <p className="admin-reservations-empty">
                        Aucune réservation récente.
                      </p>
                    )}
                  </div>
              <Link  to="/admin/reservations"  className="admin-reservations-footer"> Afficher toutes les réservations </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default DashboardAdmin;