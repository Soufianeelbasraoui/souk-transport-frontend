import { useEffect, useState } from "react";
import Sidebar from "../../components/layout/Sidebar";
import api from "../../services/api";
import "./styles/TrajetsDisponibles.css";
import { FiBox, FiCalendar, FiMapPin, FiSearch, FiTruck } from "react-icons/fi";
import PaginationComponent from "../../components/common/Pagination";
import { Link } from "react-router-dom";

function TrajetsDisponibles() {
  const [trajets, setTrajets] = useState([]);
  const [villeDepart, setVilleDepart] = useState("");
  const [villeArrivee, setVilleArrivee] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0); 
  const pageSize = 9;

  const chargerTrajets = (targetPage = page) => {
    const hasSearch = villeDepart.trim() !== "" || villeArrivee.trim() !== "";
    const url = hasSearch ? `/api/trajets/rechercher/trajet?villeDepart=${villeDepart.trim()}&villeArrivee=${villeArrivee.trim()}&page=${targetPage - 1}&size=${pageSize}` : `/api/trajets?page=${targetPage - 1}&size=${pageSize}`;

    api.get(url).then((res) => {
        setTrajets(res.data.content || []);
        setTotalPages(res.data.totalPages || 1);
        setTotalElements(res.data.totalElements || 0);
      })
      .catch((error) => {
        console.error("Erreur trajets :", error);
        setTrajets([]);
      });
  };

  useEffect(() => {
    chargerTrajets(page);
  }, [page]);

  
  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    chargerTrajets(1);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  return (
    <div className="app">
      <Sidebar />

      <main className="main-content">
        <div className="expediteur-dashboard-container">
          <div className="page-header">
            <div>
              <h1>Trajets disponibles</h1>
              <p>Découvrez les trajets proposés par nos transporteurs et réservez celui qui vous convient.</p>
            </div>
          </div>

          <div className="container">
            <div className="trajets-search-card">
              <form className="trajets-search-form" onSubmit={handleSearch}>
                <div className="trajets-search-group">
                  <label>Ville de départ</label>
                  <div className="trajets-input-wrapper">
                    <FiMapPin className="trajets-input-icon" />
                    <input
                      className="trajets-input-field"
                      placeholder="Départ"
                      value={villeDepart}
                      onChange={(e) => setVilleDepart(e.target.value)}
                    />
                  </div>
                </div>

                <div className="trajets-search-group">
                  <label>Ville d'arrivée</label>
                  <div className="trajets-input-wrapper">
                    <FiMapPin className="trajets-input-icon" />
                    <input
                      className="trajets-input-field"
                      placeholder="Arrivée"
                      value={villeArrivee}
                      onChange={(e) => setVilleArrivee(e.target.value)}
                    />
                  </div>
                </div>

                <button type="submit" className="trajets-btn-search">
                  <FiSearch /> Rechercher
                </button>
              </form>
            </div>
          </div>

          <div className="container">
            <div className="trajets-results-bar">
              <span className="trajets-count">
                <strong>{totalElements}</strong> trajets trouvés
              </span>

              <div className="trajets-sort-group">
                <label>Trier par :</label>
                <select className="trajets-sort-select">
                  <option value="recent">Plus récents</option>
                  <option value="poids">Poids disponible</option>
                  <option value="prix">Prix</option>
                </select>
              </div>
            </div>
          </div>

          <div className="container">
            <div className="row g-4 mb-4">
              {trajets.length > 0 ? (
                trajets.map((t) => (
                  <div key={t.id} className="col-lg-4 col-md-6 d-flex">
                    <div className="trajet-card">
                      <div className="trajet-card-header">
                        <span className="trajet-cities">
                          {t.villeDepart} → {t.villeArrivee}
                        </span>
                        <span className="badge-dispo">{t.statutTrajet}</span>
                      </div>

                      <div className="trajet-card-body">
                        <div className="trajet-info-item">
                          <FiCalendar />
                          <span>
                            {t.dateDepart
                              ? new Date(t.dateDepart).toLocaleDateString("fr-FR", {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "N/A"}
                          </span>
                        </div>

                        <div className="trajet-info-item">
                          <FiTruck />
                          <span>{t.typeCamion || "Camion spécifié"}</span>
                        </div>

                        <div className="trajet-info-item">
                          <FiBox />
                          <span>{t.poidsDisponible} Tonnes</span>
                        </div>
                      </div>
                       <Link to={`/expediteur/detailtrajet/${t.id}`} className="btn-card-action text-center">Voir le trajet</Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-12">
                  <div className="trajets-empty">
                    Aucun trajet disponible pour le moment.
                  </div>
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
                itemLabel="trajets"
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default TrajetsDisponibles;