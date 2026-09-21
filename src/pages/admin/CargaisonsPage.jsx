import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MdOutlineEdit, MdDelete, MdUndo } from "react-icons/md";
import { BiShowAlt } from "react-icons/bi";
import { BsThreeDotsVertical } from "react-icons/bs";

import Sidebar from "../../components/layout/Sidebar";
import Loader from "../../components/common/Loader";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import PaginationComponent from "../../components/common/Pagination";
import api from "../../services/api";

import "../../styles/global.css";
import "./styles/admin.css";

function CargaisonsPage() {
  const [cargaisons, setCargaisons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [activeDropdownId, setActiveDropdownId] = useState(null);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
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

  const fetchCargaisons = async () => {
    try {
      setLoading(true);
      let res;
      const query = search.trim();

      if (query !== "") {
        res = await api.get(`/api/cargaisons/search?description=${query}&page=${page}&size=${pageSize}`);
      } else if (status !== "") {
        res = await api.get(
          `/api/cargaisons/filter/status?statut=${status}&page=${page}&size=${pageSize}`
        );
      } else {
        res = await api.get(`/api/cargaisons/lister?page=${page}&size=${pageSize}`);
      }

      setCargaisons(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
      setTotalElements(res.data.totalElements || 0);
    } catch (error) {
      console.error("Erreur Cargaisons :", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCargaisons();
  }, [page, search, status]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setStatus("");
    setPage(0);
  };

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
    setSearch("");
    setPage(0);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/cargaisons/${id}`);
      setDeleteId(null);
      fetchCargaisons();
    } catch (error) {
      console.error("Erreur suppression :", error);
    }
  };

  return (
    <div className="app admin-page">
      <Sidebar />

      <main className="main-content">
        <div className="page-header">
          <div>
            <h1>Cargaisons</h1>
            <p>Gérez les cargaisons.</p>
          </div>

          <Link to="/admin/cargaisons/new" className="btn-primary">
            Ajouter une cargaison
          </Link>
        </div>

        <div className="admin-card">
          <div className="admin-card-header">
            <div className="admin-search">
              <input
                type="search"
                placeholder="Rechercher par description..."
                value={search}
                onChange={handleSearch}
              />
            </div>

            <select value={status} onChange={handleStatusChange}>
              <option value="">Tous les statuts</option>
              <option value="SOUMISE">Soumise</option>
              <option value="EN_TRANSIT">En transit</option>
              <option value="LIVREE">Livrée</option>
              <option value="ANNULEE">Annulée</option>
            </select>
          </div>

          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>DESCRIPTION</th>
                  <th>POIDS</th>
                  <th>EXPÉDITEUR</th>
                  <th>STATUT</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="admin-empty">
                      <Loader />
                    </td>
                  </tr>
                ) : cargaisons.length > 0 ? (
                  cargaisons.map((item, index) => {
                    const isSoumise = item.statutCargaison === "SOUMISE";
                    const isEnTransit = item.statutCargaison === "EN_TRANSIT";
                    const isLivree = item.statutCargaison === "LIVREE";
                    const hasMoreActions = isSoumise || (!isEnTransit && !isLivree);

                    return (
                      <tr key={item.id}>
                        <td className="admin-identity">
                          <strong>
                            C-{String(item.id).padStart(4, "0")}
                          </strong>
                        </td>

                        <td>{item.description}</td>
                        <td>{item.poids}</td>
                        <td>{item.expediteurNom}</td>

                        <td>
                          <span
                            className={`admin-status ${
                              isLivree
                                ? "is-success"
                                : item.statutCargaison === "ANNULEE"
                                ? "is-danger"
                                : isEnTransit
                                ? "is-warning"
                                : "is-pending"
                            }`}
                          >
                            {item.statutCargaison || "SOUMISE"}
                          </span>
                        </td>

                        <td>
                          <div className="admin-actions">
                            {/* 1. Bouton Consulter (Œil) */}
                            <Link
                              to={`/admin/cargaisons/${item.id}`}
                              className="admin-action-btn"
                              title="Voir"
                            >
                              <BiShowAlt />
                            </Link>

                            {/* 2. Bouton 3 points avec menu déroulant */}
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
                                      index >= cargaisons.length - 2 && cargaisons.length > 2
                                        ? "open-up"
                                        : ""
                                    }`}
                                  >
                                    {isSoumise && (
                                      <>
                                        <Link
                                          to={`/admin/cargaisons/edit/${item.id}`}
                                          className="admin-dropdown-link"
                                          onClick={() => setActiveDropdownId(null)}
                                        >
                                          <MdOutlineEdit className="dropdown-icon" />
                                          <span>Modifier</span>
                                        </Link>

                                        {typeof updateStatus === "function" && (
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
                                        )}
                                      </>
                                    )}

                                    {!isEnTransit && !isLivree && (
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
                    <td colSpan="6" className="admin-empty">
                      Aucune cargaison trouvée.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {totalElements > 0 && (
              <PaginationComponent
                page={page + 1}
                totalPages={totalPages}
                totalElements={totalElements}
                pageSize={pageSize}
                onPageChange={(newPage) => {
                  setActiveDropdownId(null);
                  setPage(newPage - 1);
                }}
                itemLabel="Cargaisons"
              />
            )}
          </div>
        </div>

        <ConfirmDialog
          show={deleteId !== null}
          title="Supprimer la cargaison"
          message="Êtes-vous sûr de vouloir supprimer cette cargaison ?"
          onConfirm={() => handleDelete(deleteId)}
          onCancel={() => setDeleteId(null)}
        />
      </main>
    </div>
  );
}

export default CargaisonsPage;