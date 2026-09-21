import { Link } from "react-router-dom";
import Sidebar from "../../components/layout/Sidebar";
import '../../styles/global.css';
import "./style/transporteur.css";
import "../admin/styles/admin.css";
import { useEffect, useState } from "react";
import api from "../../services/api";
import { MdOutlineEdit, MdDelete } from "react-icons/md";
import { BiShowAlt } from "react-icons/bi";
import { BsThreeDotsVertical } from "react-icons/bs";
import Loader from "../../components/common/Loader";
import ConfirmDialog from "../../components/common/ConfirmDialog";

import PaginationComponent from "../../components/common/Pagination";

function MesTrajets() {
  const [mesTrajets, setMesTrajets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [activeDropdownId, setActiveDropdownId] = useState(null);
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

  const fetchTrajets = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/trajets/mesTrajets?page=${page}&size=${pageSize}`);
      setMesTrajets(res.data?.content || []);
      setTotalElements(res.data?.totalElements || 0);
      setTotalPages(res.data?.totalPages || 0);
    } catch (error) {
      console.error("Erreur récupération trajets :", error);
      setMesTrajets([]);
      setTotalElements(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrajets();
  }, [page]);

  const handlePageChange = (newPage) => {
    setActiveDropdownId(null);
    setPage(newPage - 1);
  };

  const handelDelet = async () => {
    try {
      await api.delete(`/api/trajets/${deleteId}`);
      setDeleteId(null);
      fetchTrajets();
    } catch (error) {
      console.error("Erreur suppression trajet :", error);
    }
  };
  
  if(loading){
    return<Loader/>
  }

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
                      mesTrajets.map((item, index) => (
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
                            <span className={`status-badge ${
                              item.statutTrajet === "PUBLIE"
                                ? "status-open"
                                : item.statutTrajet === "EN_COURS"
                                ? "status-progress"
                                : item.statutTrajet === "TERMINE"
                                ? "status-finished"
                                : "status-other"
                            }`}>
                              {item.statutTrajet}
                            </span>
                          </td>

                          <td>
                            <span className="reservation-count">
                              {item.nombreReservations || 0}
                            </span>
                          </td>
                          <td>
                            <div className="admin-actions">    
                              <Link
                                to={`/transporteur/trajets/${item.id}`}
                                className="admin-action-btn"
                                title="Voir"
                              >
                                <BiShowAlt />
                              </Link>
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
                                      index >= mesTrajets.length - 2 && mesTrajets.length > 2
                                        ? "open-up"
                                        : ""
                                    }`}
                                  >
                                    {item.statutTrajet !== "TERMINE" && (
                                      <Link
                                        to={`/transporteur/trajets/edit/${item.id}`}
                                        className="admin-dropdown-link"
                                        onClick={() => setActiveDropdownId(null)}
                                      >
                                        <MdOutlineEdit className="dropdown-icon" />
                                        <span>Modifier</span>
                                      </Link>
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
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8">
                          <div className="table-empty">
                            Aucun trajet trouvé.
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {totalElements > 0 && (
                <PaginationComponent
                  page={page + 1}
                  totalPages={totalPages}
                  totalElements={totalElements}
                  pageSize={pageSize}
                  onPageChange={handlePageChange}
                  itemLabel="trajets"
                />
              )}
            </div>
          </div>

        </div>
         <ConfirmDialog
            show={deleteId !== null}
            title="Supprimer le trajet"
            message="Êtes-vous sûr de vouloir supprimer ce trajet ? Le camion associé redeviendra disponible."
            onConfirm={handelDelet}
            onCancel={() => setDeleteId(null)}
        />
     </main>
    </div>
  )
}
export default MesTrajets;