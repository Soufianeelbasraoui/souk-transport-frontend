import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MdDelete, MdCheck, MdClose, MdUndo } from "react-icons/md";
import { BiShowAlt } from "react-icons/bi";
import { BsThreeDotsVertical } from "react-icons/bs";

import Sidebar from "../../components/layout/Sidebar";
import Loader from "../../components/common/Loader";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import api from "../../services/api";

import "../../styles/global.css";
import "./styles/admin.css";
import PaginationComponent from "../../components/common/Pagination";

function ReservationsPage() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10;

  // Fermer le menu déroulant lors d'un clic à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".admin-action-dropdown-wrapper")) {
        setActiveDropdownId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setLoading(true);

    api.get(`/api/reservations/page?page=${page - 1}&size=${pageSize}`).then((res) => {
        setReservations(res.data?.content || []);
        setTotalPages(res.data?.totalPages || 1);
        setTotalElements(res.data?.totalElements || 0);
      })
      .catch((err) => {
        console.error("Erreur lors de la récupération :", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [page]);

  const updateStatus = async (id, action) => {
    try {
      const res = await api.patch(`/api/reservations/${id}/${action}`);
      setReservations((prev) =>
        prev.map((item) => (item.id === id ? res.data : item))
      );
    } catch (error) {
      console.error(`Erreur ${action} :`, error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/reservations/${id}`);
      setReservations((prev) => prev.filter((item) => item.id !== id));
      setDeleteId(null);
    } catch (error) {
      console.error("Erreur suppression :", error);
    }
  };

  const handlePageChange = (newPage) => {
    setActiveDropdownId(null);
    setPage(newPage);
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="app admin-page">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1>Réservations</h1>
            <p>Gérez les réservations.</p>
          </div>

          <Link to="/admin/reservations/new" className="btn-primary">
            Créer une réservation
          </Link>
        </div>

        <div className="admin-card">
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Date</th>
                  <th>Trajet</th>
                  <th>Cargaison</th>
                  <th>Poids</th>
                  <th>Prix</th>
                  <th>Statut</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>

              <tbody>
                {reservations.length > 0 ? (
                  reservations.map((item, index) => {
                    const isEnAttente = item.statutReservation === "EN_ATTENTE";
                    const isRefusee = item.statutReservation === "REFUSEE";
                    const hasMoreActions = isEnAttente || isRefusee;

                    return (
                      <tr key={item.id}>
                        <td className="admin-identity">
                          <strong> R-{String(item.id).padStart(4, "0")}</strong>
                        </td>

                        <td>
                          {item.dateReservation
                            ? new Date(item.dateReservation).toLocaleDateString("fr-FR")
                            : "-"}
                        </td>
                        <td>{item.trajetId ? `Trajet #${item.trajetId}` : "-"}</td>
                        <td>{item.cargaisonId ? `Cargaison #${item.cargaisonId}` : "-"}</td>
                        <td>{item.poidsReserve != null ? `${item.poidsReserve} kg` : "-"}</td>
                        <td>{item.prixConvenu != null ? `${item.prixConvenu} DH` : "-"}</td>

                        <td>
                          <span
                            className={`admin-status ${
                              item.statutReservation === "ACCEPTEE"
                                ? "is-success"
                                : item.statutReservation === "REFUSEE" ||
                                  item.statutReservation === "ANNULEE"
                                ? "is-danger"
                                : "is-pending"
                            }`}
                          >
                            {item.statutReservation || "EN_ATTENTE"}
                          </span>
                        </td>

                        <td>
                          <div className="admin-actions">
                            {/* 1. Bouton Consulter (Œil) */}
                            <Link
                              to={`/admin/reservations/${item.id}`}
                              className="admin-action-btn"
                              title="Voir"
                            >
                              <BiShowAlt />
                            </Link>

                            {hasMoreActions && (
                              <div className="admin-action-dropdown-wrapper">
                                <button
                                  type="button"
                                  className={`admin-action-btn ${
                                    activeDropdownId === item.id ? "active" : ""
                                  }`}
                                  title="Actions"
                                  onClick={() =>
                                    setActiveDropdownId(
                                      activeDropdownId === item.id ? null : item.id
                                    )
                                  }
                                >
                                  <BsThreeDotsVertical />
                                </button>

                                {activeDropdownId === item.id && (
                                  <div
                                    className={`admin-action-dropdown ${
                                      index >= reservations.length - 2 &&
                                      reservations.length > 2
                                        ? "open-up"
                                        : ""
                                    }`}
                                  >
                                    {isEnAttente && (
                                      <>
                                        <button
                                          type="button"
                                          className="admin-dropdown-link success"
                                          onClick={() => {
                                            setActiveDropdownId(null);
                                            updateStatus(item.id, "accepter");
                                          }}
                                        >
                                          <MdCheck className="dropdown-icon" />
                                          <span>Accepter</span>
                                        </button>

                                        <button
                                          type="button"
                                          className="admin-dropdown-link delete"
                                          onClick={() => {
                                            setActiveDropdownId(null);
                                            updateStatus(item.id, "refuser");
                                          }}
                                        >
                                          <MdClose className="dropdown-icon" />
                                          <span>Refuser</span>
                                        </button>

                                        <button
                                          type="button"
                                          className="admin-dropdown-link warning"
                                          onClick={() => {
                                            setActiveDropdownId(null);
                                            updateStatus(item.id, "annuler");
                                          }}
                                        >
                                          <MdUndo className="dropdown-icon" />
                                          <span>Annuler</span>
                                        </button>
                                      </>
                                    )}

                                    {(isEnAttente || isRefusee) && (
                                      <button
                                        type="button"
                                        className="admin-dropdown-link delete"
                                        onClick={() => {
                                          setActiveDropdownId(null);
                                          setDeleteId(item.id);
                                        }}
                                      >
                                        <MdDelete className="dropdown-icon" />
                                        <span>Supprimer</span>
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="8" className="admin-empty">
                      Aucune réservation trouvée.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
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
        </div>

        <ConfirmDialog
          show={deleteId !== null}
          title="Supprimer la réservation"
          message="Êtes-vous sûr de vouloir supprimer cette réservation ?"
          onConfirm={() => handleDelete(deleteId)}
          onCancel={() => setDeleteId(null)}
        />
      </main>
    </div>
  );
}

export default ReservationsPage;