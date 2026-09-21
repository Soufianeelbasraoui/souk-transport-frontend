import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MdOutlineEdit, MdDelete } from "react-icons/md";
import { BiShowAlt } from "react-icons/bi";
import { BsThreeDotsVertical } from "react-icons/bs";

import Sidebar from "../../components/layout/Sidebar";
import PaginationComponent from "../../components/common/Pagination";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import api from "../../services/api";

import "../../styles/global.css";
import "./style/transporteur.css";
import "../admin/styles/admin.css";

function MesCamions() {
  const [mesCamions, setMesCamions] = useState([]);
  const [deleteId, setDeleteId] = useState(null);
  const [activeDropdownId, setActiveDropdownId] = useState(null);

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [searchTaype, setSearchTaype] = useState("");
  const pageSize = 9;

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
    if (searchTaype.trim() === "") {
      fetchCamions();
    } else {
      handeleSearch();
    }
  }, [page, searchTaype]);


  const fetchCamions = () => {
    api.get(`/api/camions/mesCamions?page=${page}&size=${pageSize}`)
      .then((res) => {
        setMesCamions(res.data?.content || []);
        setTotalPages(res.data?.totalPages || 0);
        setTotalElements(res.data?.totalElements || 0);
      })
      .catch((error) => {
        console.error("Erreur camions :", error);
        setMesCamions([]);
        setTotalPages(0);
        setTotalElements(0);
      });
  };

  const handlePageChange = (newPage) => {
    setActiveDropdownId(null);
    setPage(newPage - 1);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/api/camions/${deleteId}`);
      setDeleteId(null);
      fetchCamions();
    } catch (error) {
      console.error("Erreur suppression camion :", error);
    }
  };

  const handeleSearch = () => {
    if (searchTaype.trim() === "") {
      return;
    }
    api.get(`/api/camions/transporteur/searchByMarque?marque=${searchTaype}&page=${page}&size=10`).then((res) => {
      setMesCamions(res.data.content);
      setTotalPages(res.data.totalPages);
      setTotalElements(res.data.totalElements);
    });
  };

  return (
    <div className="app">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1>Mes Camions</h1>
            <p>Gérez vos camions.</p>
          </div>
          <Link to="/transporteur/camions/new" className="btn-primary">
            Ajouter un camion
          </Link>
        </div>

        <div className="row">
          <div className="col-lg-12">
            <div className="dashboard-card recent-trajets">
              <div className="card-header-custom">
                <div className="trasporteur-search">
                  <input
                    type="text"
                    placeholder="Rechercher par marque..."
                    value={searchTaype}
                    onChange={(e) => {
                      setSearchTaype(e.target.value);
                      setPage(0);
                    }}
                  />
                </div>
              </div>

              <div className="table-responsive">
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>Camion</th>
                      <th>Immatriculation</th>
                      <th>Modèle</th>
                      <th>Capacité</th>
                      <th>Type</th>
                      <th>Statut</th>
                      <th>Action</th>
                    </tr>
                  </thead>
              <tbody>
                {mesCamions.length > 0 ? (
                  mesCamions.map((item, index) => (
                    <tr key={item.id}>
                      <td>{item.marque}</td>
                      <td>{item.immatriculation}</td>
                      <td>{item.modele}</td>
                      <td>{item.capacite}</td>
                      <td>{item.type}</td>
                      <td>
                        <span className={`badge ${item.disponible ? "bg-success" : "bg-danger" }`} >
                          {item.disponible ? "Disponible" : "Non disponible"}
                        </span>
                      </td>
                      <td>
                        <div className="admin-actions">
                          <Link
                            to={`/transporteur/camions/${item.id}`}
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
                                  index >= mesCamions.length - 2 && mesCamions.length > 2
                                    ? "open-up"
                                    : ""
                                }`}
                              >
                                <Link
                                  to={`/transporteur/camions/edit/${item.id}`}
                                  className="admin-dropdown-link"
                                  onClick={() => setActiveDropdownId(null)}
                                >
                                  <MdOutlineEdit className="dropdown-icon" />
                                  <span>Modifier</span>
                                </Link>

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
                    <td colSpan="7">
                      <div className="table-empty">Aucun camion trouvé.</div>
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
              itemLabel="camions"
            />
          )}
            </div>
          </div>
        </div>

        <ConfirmDialog
          show={deleteId !== null}
          title="Supprimer le camion"
          message="Êtes-vous sûr de vouloir supprimer ce camion ?"
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      </main>
    </div>
  );
}

export default MesCamions;