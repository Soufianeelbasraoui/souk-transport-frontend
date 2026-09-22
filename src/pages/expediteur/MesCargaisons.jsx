import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  FiMoreVertical, 
  FiPackage, 
  FiPlus, 
  FiTrash2, 
  FiEdit2, 
  FiEye, 
  FiTruck 
} from "react-icons/fi";
import { toast } from "react-toastify";

import Sidebar from "../../components/layout/Sidebar";
import PaginationComponent from "../../components/common/Pagination";
import Loader from "../../components/common/Loader";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import api from "../../services/api";

import "./styles/MesCargaisons.css";

function MesCargaisons() {
  const [cargaisons, setCargaisons] = useState([]);
  const [filter, setFilter] = useState("TOUTES");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);

  // Gestion des actions, de la suppression et de la modification rapide
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  // État pour la modification rapide (PUT /api/cargaisons/{id})
  const [editCargaison, setEditCargaison] = useState(null);
  const [editForm, setEditForm] = useState({ description: "", poids: "" });
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const pageSize = 9;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".cargaison-action-wrapper")) {
        setActiveDropdownId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    fetchCargaisons();
  }, [page, filter]);

  const fetchCargaisons = async () => {
    try {
      setLoading(true);

      const res = await api.get("/api/cargaisons/mes-cargaisons", {
        params: { 
          page, 
          size: pageSize, 
          ...(filter !== "TOUTES" && { statut: filter }) 
        },
      });

      setCargaisons(res.data?.content || []);
      setTotalPages(res.data?.totalPages || 0);
      setTotalElements(res.data?.totalElements || 0);
    } catch (error) {
      console.error("Erreur chargement cargaisons:", error);
      toast.error("Erreur lors du chargement de vos cargaisons.");
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (value) => {
    setFilter(value);
    setPage(0);
    setActiveDropdownId(null);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage - 1);
    setActiveDropdownId(null);
  };

  // Suppression (DELETE /api/cargaisons/{id})
  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/cargaisons/${id}`);
      toast.success("Cargaison supprimée avec succès !");
      setDeleteId(null);
      fetchCargaisons();
    } catch (error) {
      console.error("Erreur suppression :", error);
      toast.error(
        error.response?.data?.message || "Impossible de supprimer cette cargaison."
      );
      setDeleteId(null);
    }
  };

  // Ouverture de la modale de modification rapide pour cargaison SOUMISE
  const openEditModal = (cargaison) => {
    setEditCargaison(cargaison);
    setEditForm({
      description: cargaison.description || "",
      poids: cargaison.poids || "",
    });
    setActiveDropdownId(null);
  };

  // Sauvegarde de la modification (PUT /api/cargaisons/{id})
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editForm.description.trim()) {
      toast.error("La description est obligatoire.");
      return;
    }
    if (!editForm.poids || Number(editForm.poids) <= 0) {
      toast.error("Le poids doit être un nombre positif.");
      return;
    }

    try {
      setIsSavingEdit(true);
      const payload = {
        description: editForm.description.trim(),
        poids: Number(editForm.poids),
      };

      await api.put(`/api/cargaisons/${editCargaison.id}`, payload);
      toast.success("Cargaison modifiée avec succès !");
      setEditCargaison(null);
      fetchCargaisons();
    } catch (error) {
      console.error("Erreur modification cargaison :", error);
      toast.error(
        error.response?.data?.message || "Erreur lors de la modification de la cargaison."
      );
    } finally {
      setIsSavingEdit(false);
    }
  };

  const getBadgeStyle = (statut) => {
    switch (statut) {
      case "LIVREE":
        return { label: "Livrée", class: "badge-livree" };
      case "EN_TRANSIT":
        return { label: "En transit", class: "badge-transit" };
      case "SOUMISE":
        return { label: "Soumise", class: "badge-attente" };
      case "ANNULEE":
        return { label: "Annulée", class: "badge-annulee" };
      default:
        return { label: statut || "Inconnu", class: "badge-default" };
    }
  };

  return (
    <div className="app admin-page">
      <Sidebar />

      <main className="main-content">
        <div className="page-header d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1>Mes Cargaisons</h1>
            <p className="text-muted">
              Gérez toutes vos marchandises expédiées.
            </p>
          </div>

          <Link
            to="/expediteur/cargaisons/new"
            className="btn-primary px-4 py-2 rounded-3"
          >
            Ajouter une cargaison
          </Link>
        </div>

        <div className="cargaisons-tabs-card mb-4">
          <div className="cargaisons-tabs">
            <button
              type="button"
              onClick={() => handleFilter("TOUTES")}
              className={`tab-btn ${filter === "TOUTES" ? "active" : ""}`}
            >
              Toutes
            </button>

            <button
              type="button"
              onClick={() => handleFilter("SOUMISE")}
              className={`tab-btn ${filter === "SOUMISE" ? "active" : ""}`}
            >
              En attente
            </button>

            <button
              type="button"
              onClick={() => handleFilter("EN_TRANSIT")}
              className={`tab-btn ${filter === "EN_TRANSIT" ? "active" : ""}`}
            >
              En transit
            </button>

            <button
              type="button"
              onClick={() => handleFilter("LIVREE")}
              className={`tab-btn ${filter === "LIVREE" ? "active" : ""}`}
            >
              Livrées
            </button>

            <button
              type="button"
              onClick={() => handleFilter("ANNULEE")}
              className={`tab-btn ${filter === "ANNULEE" ? "active" : ""}`}
            >
              Annulées
            </button>
          </div>
        </div>

        <div className="row g-4">
          {loading && (
            <div className="col-12">
              <div className="empty-state">
                <Loader />
              </div>
            </div>
          )}

          {!loading && cargaisons.length > 0 &&
            cargaisons.map((cargaison) => {
              const badge = getBadgeStyle(cargaison.statutCargaison);
              const isEnTransit = cargaison.statutCargaison === "EN_TRANSIT";
              const isLivree = cargaison.statutCargaison === "LIVREE";
              const isSoumise = cargaison.statutCargaison === "SOUMISE";
              const isAnnulee = cargaison.statutCargaison === "ANNULEE";
              const canEdit = isSoumise; // Uniquement pour SOUMISE
              const canDelete = isLivree || isAnnulee || isSoumise; // Supprimer autorisée si non en transit

              return (
                <div
                  key={cargaison.id}
                  className="col-xl-4 col-lg-6 col-md-6 d-flex"
                >
                  <div className="card cargaison-card w-100">
                    <div className="card-body d-flex flex-column">

                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <span className={`status-badge ${badge.class}`}>
                          {badge.label}
                        </span>

                        <div className="cargaison-action-wrapper">
                          <button
                            type="button"
                            className="btn-more"
                            title="Options"
                            onClick={() =>
                              setActiveDropdownId(
                                activeDropdownId === cargaison.id ? null : cargaison.id
                              )
                            }
                          >
                            <FiMoreVertical />
                          </button>

                          {activeDropdownId === cargaison.id && (
                            <div className="cargaison-dropdown">
                              <Link
                                to={`/expediteur/cargaisons/${cargaison.id}`}
                                className="cargaison-dropdown-item"
                                onClick={() => setActiveDropdownId(null)}
                              >
                                <FiEye />
                                <span>Voir détails</span>
                              </Link>

                              {canEdit && (
                                <Link
                                  type="button"
                                  className="cargaison-dropdown-item"
                                   to={`/expediteur/cargaisons/${cargaison.id}`}
                                >
                                  <FiEdit2 />
                                  <span>Modifier</span>
                                </Link>
                              )}

                              {canDelete && (
                                <button
                                  type="button"
                                  className="cargaison-dropdown-item delete"
                                  onClick={() => {
                                    setActiveDropdownId(null);
                                    setDeleteId(cargaison.id);
                                  }}
                                >
                                  <FiTrash2 />
                                  <span>Supprimer</span>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <h5 className="cargaison-title">
                        {cargaison.description || "Marchandise"}
                      </h5>

                      <div className="row text-center info-box">
                        <div className="col-6 border-end">
                          <small>Poids</small>
                          <strong>
                            {cargaison.poids
                              ? `${cargaison.poids} kg`
                              : "N/A"}
                          </strong>
                        </div>

                        <div className="col-6">
                          <small>Prix</small>
                          <strong>
                            {cargaison.prix
                              ? `${cargaison.prix} DH`
                              : "0 DH"}
                          </strong>
                        </div>
                      </div>

                      <div className="card-footer-custom mt-auto">
                        <div>
                          <strong className="price">
                            {cargaison.prix
                              ? `${cargaison.prix} DH`
                              : "0 DH"}
                          </strong>

                          <small className="payment">
                            Paiement à la livraison
                          </small>
                        </div>

                        {isEnTransit ? (
                          <Link
                            to={`/expediteur/cargaisons/${cargaison.id}`}
                            className="btn-suivi"
                            title="Suivre l'acheminement de la cargaison"
                          >
                            <FiTruck />
                            <span>Suivi cargaison</span>
                          </Link>
                        ) : (
                          <Link
                            to={`/expediteur/cargaisons/${cargaison.id}`}
                            className="btn-cargaison"
                          >
                            Voir détails
                          </Link>
                        )}
                      </div>

                    </div>
                  </div>
                </div>
              );
            })}

          {!loading && cargaisons.length === 0 && (
            <div className="col-12">
              <div className="cargaisons-empty-card">
                <div className="empty-icon-box">
                  <FiPackage />
                </div>
                <h3>Aucune cargaison trouvée</h3>
                <p>
                  {filter !== "TOUTES"
                    ? "Aucune cargaison ne correspond au filtre actuellement sélectionné."
                    : "Vous n'avez pas encore créé de cargaison à expédier."}
                </p>
                <div className="empty-actions">
                  {filter !== "TOUTES" ? (
                    <button
                      type="button"
                      className="btn-empty-outline"
                      onClick={() => handleFilter("TOUTES")}
                    >
                      Afficher toutes les cargaisons
                    </button>
                  ) : (
                    <Link
                      to="/expediteur/cargaisons/new"
                      className="btn-empty-primary"
                    >
                      <FiPlus />
                      <span>Ajouter une cargaison</span>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {!loading && totalElements > 0 && (
          <PaginationComponent
            page={page + 1}
            totalPages={totalPages}
            totalElements={totalElements}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            itemLabel="Cargaisons"
          />
        )}

        <ConfirmDialog
          show={deleteId !== null}
          title="Supprimer la cargaison"
          message="Êtes-vous sûr de vouloir supprimer définitivement cette cargaison ?"
          onConfirm={() => handleDelete(deleteId)}
          onCancel={() => setDeleteId(null)}
        />

        
      </main>
    </div>
  );
}

export default MesCargaisons;