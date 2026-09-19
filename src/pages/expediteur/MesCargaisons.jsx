import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiMoreVertical } from "react-icons/fi";

import Sidebar from "../../components/layout/Sidebar";
import PaginationComponent from "../../components/common/Pagination";
import Loader from "../../components/common/Loader";
import api from "../../services/api";

import "./styles/MesCargaisons.css";

function MesCargaisons() {
  const [cargaisons, setCargaisons] = useState([]);
  const [filter, setFilter] = useState("TOUTES");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);

  const pageSize = 9;

  useEffect(() => {
    fetchCargaisons();
  }, [page, filter]);

  const fetchCargaisons = async () => {
    try {
      setLoading(true);

      const res = await api.get("/api/cargaisons/mes-cargaisons", {
        params: {  page, size: pageSize, ...(filter !== "TOUTES" && { statut: filter }),},
      });

      setCargaisons(res.data?.content || []);
      setTotalPages(res.data?.totalPages || 0);
      setTotalElements(res.data?.totalElements || 0);
    } catch (error) {
      console.error("Erreur chargement cargaisons:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (value) => {
    setFilter(value);
    setPage(0);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage - 1);
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
              className={`tab-btn ${
                filter === "TOUTES" ? "active" : ""
              }`}
            >
              Toutes
            </button>

            <button
              type="button"
              onClick={() => handleFilter("SOUMISE")}
              className={`tab-btn ${
                filter === "SOUMISE" ? "active" : ""
              }`}
            >
              En attente
            </button>

            <button
              type="button"
              onClick={() => handleFilter("EN_TRANSIT")}
              className={`tab-btn ${
                filter === "EN_TRANSIT" ? "active" : ""
              }`}
            >
              En transit
            </button>

            <button
              type="button"
              onClick={() => handleFilter("LIVREE")}
              className={`tab-btn ${
                filter === "LIVREE" ? "active" : ""
              }`}
            >
              Livrées
            </button>

            <button
              type="button"
              onClick={() => handleFilter("ANNULEE")}
              className={`tab-btn ${
                filter === "ANNULEE" ? "active" : ""
              }`}
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
              const badge = getBadgeStyle(
                cargaison.statutCargaison
              );

              return (
                <div
                  key={cargaison.id}
                  className="col-xl-4 col-lg-6 col-md-6 d-flex"
                >
                  <div className="card cargaison-card w-100">
                    <div className="card-body d-flex flex-column">

                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <span
                          className={`status-badge ${badge.class}`}
                        >
                          {badge.label}
                        </span>

                        <button
                          type="button"
                          className="btn-more"
                        >
                          <FiMoreVertical />
                        </button>
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

                        <Link
                          to={`/expediteur/cargaisons/${cargaison.id}`}
                          className="btn-cargaison"
                        >
                          Voir détails
                        </Link>

                      </div>

                    </div>
                  </div>
                </div>
              );
            })}

          {!loading && cargaisons.length === 0 && (
            <div className="col-12">
              <div className="empty-state">
                <p>Aucune cargaison trouvée.</p>
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

      </main>
    </div>
  );
}

export default MesCargaisons;