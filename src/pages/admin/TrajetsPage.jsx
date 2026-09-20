import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MdOutlineEdit, MdDelete } from "react-icons/md";
import { BiShowAlt } from "react-icons/bi";

import api from "../../services/api";

import "../../styles/global.css";
import "./styles/admin.css";
import Loader from "../../components/common/Loader";
import Sidebar from "../../components/layout/Sidebar";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import PaginationComponent from "../../components/common/Pagination";

function TrajetsPage() {
  const [trajets, setTrajets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);

  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);

  const [search, setSearch] = useState("");

  const pageSize = 10;

  const fetchTrajets = async () => {
    try {
      setLoading(true);

      let res;

      if (search.trim() === "") {
        res = await api.get(`/api/trajets?page=${page}&size=${pageSize}` );
      } else {
        res = await api.get( `/api/trajets/search?recherche=${search}&page=${page}&size=${pageSize}`
        );
      }

      setTrajets(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
      setTotalElements(res.data.totalElements || 0);
    } catch (error) {
      console.error("Erreur trajets :", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrajets();
  }, [page, search]);

  const handelDelet = async () => {
    try {
      await api.delete(`/api/trajets/${deleteId}`);

      setDeleteId(null);

      fetchTrajets();
    } catch (error) {
      console.error("Erreur suppression trajet :", error);
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(0);
  };

  
  const handlePageChange = (newPage) => {
    setPage(newPage - 1);
  };

  return (
    <div className="app admin-page">
      <Sidebar />

      <main className="main-content">
        <div className="page-header">
          <div>
            <h1>Trajets</h1>
            <p>Gérez les trajets.</p>
          </div>

          <Link
            to="/admin/trajets/new"
            className="btn-primary"
          >
            Ajouter un trajet
          </Link>
        </div>

        <div className="admin-card">

          <div className="admin-card-header">
            <div className="admin-search">
              <input
                type="search"
                placeholder="Rechercher une ville..."
                value={search}
                onChange={handleSearch}
              />
            </div>
          </div>

          <div className="admin-table-wrapper">
            <table className="admin-table">

              <thead>
                <tr>
                  <th>ID TRAJET</th>
                  <th>DÉPART → ARRIVÉE</th>
                  <th>DATE</th>
                  <th>CAPACITÉ</th>
                  <th>PRIX</th>
                  <th>STATUT</th>
                  <th>RÉS.</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="admin-empty">
                      <Loader />
                    </td>
                  </tr>
                ) : trajets.length > 0 ? (
                  trajets.map((item) => (
                    <tr key={item.id}>

                      <td className="admin-identity">
                        <strong>
                          T-{String(item.id).padStart(4, "0")}
                        </strong>
                      </td>

                      <td>
                        {item.villeDepart} → {item.villeArrivee}
                      </td>

                      <td>
                        <span className="date-cell">
                          {item.dateDepart
                            ? new Date(
                                item.dateDepart
                              ).toLocaleDateString("fr-FR", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              })
                            : "N/A"}
                        </span>
                      </td>

                      <td>
                        <strong>
                          {item.poidsDisponible || 0} Tonnes
                        </strong>
                      </td>

                      <td>
                        <strong>{item.prix}</strong>
                      </td>

                      <td>
                        <span
                          className={`status-badge ${
                            item.statutTrajet === "PUBLIE"
                              ? "status-open"
                              : item.statutTrajet === "EN_COURS"
                              ? "status-progress"
                              : "status-other"
                          }`}
                        >
                          {item.statutTrajet}
                        </span>
                      </td>

                      <td>
                        {item.nombreReservations || 0}
                      </td>

                      <td>
                        <div className="admin-actions">

                          <Link
                            to={`/admin/trajets/${item.id}`}
                            className="admin-action admin-action-view"
                          >
                            <BiShowAlt />
                          </Link>

                          <Link
                            to={`/admin/trajets/edit/${item.id}`}
                            className="admin-action admin-action-edit"
                          >
                            <MdOutlineEdit />
                          </Link>

                          <button
                            type="button"
                            className="admin-action admin-action-delete"
                            onClick={() => setDeleteId(item.id)}
                          >
                            <MdDelete />
                          </button>

                        </div>
                      </td>

                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="8"
                      className="admin-empty"
                    >
                      Aucun trajet trouvé.
                    </td>
                  </tr>
                )}
              </tbody>

            </table>
            { totalElements > 0 && (
              <PaginationComponent
                page={page + 1}
                totalPages={totalPages}
                totalElements={totalElements}
                pageSize={pageSize}
                onPageChange={handlePageChange}
                itemLabel="Trajets"
              />
            )}
          </div>
        </div>

        <ConfirmDialog
          show={deleteId !== null}
          title="Supprimer le trajet"
          message="Êtes-vous sûr de vouloir supprimer ce trajet ?"
          onConfirm={handelDelet}
          onCancel={() => setDeleteId(null)}
        />

      </main>
    </div>
  );
}

export default TrajetsPage;