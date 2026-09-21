import { useEffect, useState } from "react";
import { MdDelete, MdCheck, MdDownload } from "react-icons/md";
import { BsThreeDotsVertical } from "react-icons/bs";

import Sidebar from "../../components/layout/Sidebar";
import Loader from "../../components/common/Loader";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import PaginationComponent from "../../components/common/Pagination";
import api from "../../services/api";

import "../../styles/global.css";
import "./styles/admin.css";

function PaiementsPage() {
  const [paiements, setPaiements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [activeDropdownId, setActiveDropdownId] = useState(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10;

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

  const fetchPaiements = () => {
    setLoading(true);
    api
      .get(`/api/paiements?page=${page - 1}&size=${pageSize}`)
      .then((res) => {
        setPaiements(res.data?.content || []);
        setTotalPages(res.data?.totalPages || 1);
        setTotalElements(res.data?.totalElements || 0);
      })
      .catch((err) => {
        console.error("Erreur récupération paiements :", err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPaiements();
  }, [page]);

  const handleConfirmer = async (id) => {
    try {
      const res = await api.patch(`/api/paiements/${id}/payer`);
      setPaiements((prev) =>
        prev.map((item) => (item.id === id ? res.data : item))
      );
    } catch (error) {
      console.error("Erreur confirmation paiement :", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/paiements/${id}`);
      setPaiements((prev) => prev.filter((item) => item.id !== id));
      setDeleteId(null);
    } catch (error) {
      console.error("Erreur suppression paiement :", error);
    }
  };

  const handleDownloadPdf = async (id) => {
    try {
      const response = await api.get(`/api/paiements/${id}/recu`, {
        responseType: "blob",
      });

      const blob = new Blob([response.data], { type: "application/pdf" });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", `recu-paiement-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Erreur téléchargement PDF :", error);
    }
  };

  const handlePageChange = (newPage) => {
    setActiveDropdownId(null);
    setPage(newPage);
  };

  if (loading && paiements.length === 0) {
    return <Loader />;
  }

  return (
    <div className="app admin-page">
      <Sidebar />

      <main className="main-content">
        <div className="page-header">
          <div>
            <h1>Paiements</h1>
            <p>Gérez et suivez les paiements des réservations.</p>
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>RÉSERVATION</th>
                  <th>CARGAISON</th>
                  <th>MONTANT</th>
                  <th>MÉTHODE</th>
                  <th>DATE</th>
                  <th>STATUT</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>

              <tbody>
                {paiements.length > 0 ? (
                  paiements.map((item, index) => {
                    const isPaye = item.statutPaiement === "PAYE";
                    const isEnAttente = item.statutPaiement === "EN_ATTENTE" || !item.statutPaiement;

                    return (
                      <tr key={item.id}>
                        <td className="admin-identity">
                          <strong>P-{String(item.id).padStart(4, "0")}</strong>
                        </td>

                        <td>
                          {item.reservationId
                            ? `Réservation #${item.reservationId}`
                            : "-"}
                        </td>

                        <td>
                          {item.cargaisonId
                            ? `Cargaison #${item.cargaisonId}`
                            : "-"}
                        </td>

                        <td>
                          <strong>{item.montantTotal != null ? `${item.montantTotal} DH` : "-"}</strong>
                        </td>

                        <td>
                          <span className="admin-badge admin-badge-info">
                            {item.methodePaiement || "CASH"}
                          </span>
                        </td>

                        <td>
                          {item.datePaiement || item.dateCreation
                            ? new Date(item.datePaiement || item.dateCreation).toLocaleDateString("fr-FR")
                            : "-"}
                        </td>

                        <td>
                          <span
                            className={`admin-status ${
                              isPaye
                                ? "is-success"
                                : item.statutPaiement === "ANNULE"
                                ? "is-danger"
                                : "is-pending"
                            }`}
                          >
                            {item.statutPaiement || "EN_ATTENTE"}
                          </span>
                        </td>

                        <td>
                          <div className="admin-actions">
                            <button
                              type="button"
                              className="admin-action-btn"
                              title="Télécharger le reçu PDF"
                              onClick={() => handleDownloadPdf(item.id)}
                            >
                              <MdDownload />
                            </button>

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
                                    index >= paiements.length - 2 && paiements.length > 2
                                      ? "open-up"
                                      : ""
                                  }`}
                                >
                                  {isEnAttente && (
                                    <button
                                      type="button"
                                      className="admin-dropdown-link success"
                                      onClick={() => {
                                        setActiveDropdownId(null);
                                        handleConfirmer(item.id);
                                      }}
                                    >
                                      <MdCheck className="dropdown-icon" />
                                      <span>Confirmer paiement</span>
                                    </button>
                                  )}

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
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="8" className="admin-empty">
                      Aucun paiement trouvé.
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
                itemLabel="paiements"
              />
            )}
          </div>
        </div>

        <ConfirmDialog
          show={deleteId !== null}
          title="Supprimer le paiement"
          message="Êtes-vous sûr de vouloir supprimer ce paiement ?"
          onConfirm={() => handleDelete(deleteId)}
          onCancel={() => setDeleteId(null)}
        />
      </main>
    </div>
  );
}

export default PaiementsPage;