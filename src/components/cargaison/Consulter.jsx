
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

import Sidebar from "../layout/Sidebar";
import api from "../../services/api";

import "../../styles/global.css";
import "../../styles/formPage.css";
import Loader from "../common/Loader";
import { FiArrowLeft } from "react-icons/fi";

function ConsulterCargaison() {
  const { id } = useParams();
  const token = localStorage.getItem("token");
  const user = jwtDecode(token);

  const [cargaison, setCargaison] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get(`/api/cargaisons/${id}`).then((res) => {
        setCargaison(res.data);
      })
      .catch((err) => {
        console.error("Erreur :", err);
        setError("Impossible de charger les informations de cette cargaison.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="app">
      <Sidebar />

      <main className="main-content">
        <div className="page-header">
          <div>
            <h1>Détails de la Cargaison</h1>
            <p>Consultez les informations détaillées de votre cargaison.</p>
          </div>

          <Link
            to={ user.role === "ADMIN"? "/admin/cargaisons"  : "/expediteur/cargaisons" } className="btn-cancel">
           <FiArrowLeft /> Mes cargaisons
          </Link>
        </div>

        {error && <div className="alert-banner error">{error}</div>}

        {!loading && !error && cargaison && (
          <div className="form-card">
            <div className="form-card-header">
              <div className="d-flex justify-content-between align-items-center">
                <h5>Cargaison #{String(cargaison.id).padStart(4, "0")}</h5>
                <p>
                  <span
                    className={`status-badge ${ cargaison.statutCargaison === "LIVREE" ? "status-open" : cargaison.statutCargaison === "EN_TRANSIT" ? "status-progress" : "status-other" }`} > {cargaison.statutCargaison}
                  </span>
                </p>
              </div>
            </div>

            <div className="form-card-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>Référence</label>
                  <p className="form-control-custom">
                    C-{String(cargaison.id).padStart(4, "0")}
                  </p>
                </div>

                <div className="form-group">
                  <label>Poids</label>
                  <p className="form-control-custom">
                    {cargaison.poids ?? 0} kg
                  </p>
                </div>

                <div className="form-group form-group-full">
                  <label>Description du chargement</label>
                  <p className="form-control-custom">
                    {cargaison.description || "N/A"}
                  </p>
                </div>

                <div className="form-group">
                  <label>Expéditeur</label>
                  <p className="form-control-custom">
                    {cargaison.expediteurNom || `${cargaison.expediteur?.nom || ""} ${cargaison.expediteur?.prenom || ""  }`.trim() || "Non spécifié"}
                  </p>
                </div>
              </div>
            </div>

            <div className="form-card-footer">
              {cargaison.statutCargaison !== "LIVREE" && cargaison.statutCargaison !== "EN_TRANSIT" ? (
                <Link  to={  user.role === "ADMIN" ? `/admin/cargaisons/edit/${cargaison.id}` : `/expediteur/cargaisons/edit/${cargaison.id}`  }  className="btn-submit" >
                  Modifier
                </Link>
              ) : (
                <span className="text-muted fst-italic" style={{ fontSize: "13px" }}>
                   Cette cargaison est {cargaison.statutCargaison === "LIVREE" ? "livrée" : "en cours d'acheminement (en transit)"} et ne peut plus être modifiée.
                </span>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default ConsulterCargaison;
