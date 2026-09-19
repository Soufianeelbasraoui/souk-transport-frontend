import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiEye, FiCreditCard } from "react-icons/fi";

import Sidebar from "../../components/layout/Sidebar";
import PaginationComponent from "../../components/common/Pagination";
import Loader from "../../components/common/Loader";
import api from "../../services/api";

import "../../styles/global.css";
import "./styles/MesReservations.css";

function MesReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    chargerReservations();
  }, [page]);

  const chargerReservations = async () => {
    setLoading(true);
    try {
      const res = await api.get(
        `/api/reservations/expediteur/mes-reservations?page=${page - 1}&size=${pageSize}`
      );

      setReservations(res.data?.content || []);
      setTotalPages(res.data?.totalPages || 1);
      setTotalElements(res.data?.totalElements || 0);
    } catch (error) {
      console.error("Erreur réservations :", error);
      setReservations([]);
      setTotalPages(1);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const getStatusClass = (statut) => {
    switch (statut) {
      case "ACCEPTEE":
        return "badge-success";
      case "REFUSEE":
      case "ANNULEE":
        return "badge-danger";
      default:
        return "badge-warning";
    }
  };

  const getStatusLabel = (statut) => {
    switch (statut) {
      case "ACCEPTEE":
        return "Acceptée";
      case "REFUSEE":
        return "Refusée";
      case "ANNULEE":
        return "Annulée";
      case "EN_ATTENTE":
        return "En attente";
      default:
        return statut || "En attente";
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="app">
      <Sidebar />
      <main className="main-content">
        <div className="expediteur-dashboard-container">
          <div className="page-header">
            <div>
              <h1>Mes réservations</h1>
              <p>Consultez et suivez vos réservations de trajets.</p>
            </div>
            <span className="reservations-count">
              Total: <strong>{totalElements}</strong> réservation(s)
            </span>
          </div>

          <div className="table-container">
            {reservations.length > 0 ? (
              <table className="reservations-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Date</th>
                    <th>Trajet</th>
                    <th>Cargaison</th>
                    <th>Poids</th>
                    <th>Prix</th>
                    <th>Statut</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reservations.map((res) => (
                    <tr key={res.id}>
                      <td className="fw-bold">
                        R-{String(res.id).padStart(4, "0")}
                      </td>
                      <td>
                        {res.dateReservation
                          ? new Date(res.dateReservation).toLocaleDateString("fr-FR")
                          : "-"}
                      </td>
                      <td>
                        <strong>{res.villeDepart || `Trajet #${res.trajetId}`}</strong>
                        {res.villeArrivee && ` → ${res.villeArrivee}`}
                      </td>
                      <td>{res.description || `Cargaison #${res.cargaisonId}`}</td>
                      <td>{res.poidsReserve != null ? `${res.poidsReserve} kg` : "-"}</td>
                      <td className="fw-bold">{res.prixConvenu != null ? `${res.prixConvenu} DH` : "-"}</td>
                      <td>
                        <span className={`status-badge ${getStatusClass(res.statutReservation)}`}>
                          {getStatusLabel(res.statutReservation)}
                        </span>
                      </td>
                      <td>
                        <div className="actions-cell">
                          <Link
                            to={`/expediteur/reservations/${res.id}`}
                            className="btn-action btn-view"
                            title="Voir la réservation"
                          >
                            <FiEye />
                          </Link>

                          {res.statutReservation === "ACCEPTEE" && (
                            <Link
                              to={`/expediteur/paiements?reservationId=${res.id}`}
                              className="btn-action btn-pay"
                              title="Payer à la livraison"
                            >
                              <FiCreditCard />
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="reservations-empty">
                Aucune réservation trouvée.
              </div>
            )}
          </div>

          {totalElements > 0 && (
            <PaginationComponent
              page={page}
              totalPages={totalPages}
              totalElements={totalElements}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              itemLabel="réservations"
            />
          )}
        </div>
      </main>
    </div>
  );
}

export default MesReservations;