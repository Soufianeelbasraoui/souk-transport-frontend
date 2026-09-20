import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as yup from "yup";
import Sidebar from "../layout/Sidebar";
import api from "../../services/api";
import "../../styles/global.css";
import "../../styles/formPage.css";
import { jwtDecode } from "jwt-decode";

const schema = yup.object({
  villeDepart: yup.string().required("La ville de départ est obligatoire"),
  villeArrivee: yup.string().required("La ville d'arrivée est obligatoire").notOneOf([yup.ref("villeDepart")], "La ville d'arrivée doit être différente de la ville de départ"),
  dateDepart: yup.string().required("La date de départ est obligatoire") .test("futur", "La date de départ doit être dans le futur", (val) => { return val ? new Date(val) > new Date() : false; }),
  prix: yup .number().typeError("Le prix doit être un nombre").positive("Le prix doit être positif").required("Le prix est obligatoire"),
  poidsDisponible: yup .number().typeError("Le poids doit être un nombre").positive("Le poids doit être positif").required("Le poids disponible est obligatoire"),
  camionId: yup.string().required("Veuillez sélectionner un camion"),
});

function PublierTrajet() {
  const navigate = useNavigate();

   const token=localStorage.getItem("token");
  const user=jwtDecode(token)

  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [camions, setCamions] = useState([]);
  const [loadingCamions, setLoadingCamions] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    api.get("/api/camions/mesCamions").then((res) => setCamions(res.data.content))
      .catch(() => setCamions([]))
      .finally(() => setLoadingCamions(false));
  }, []);

  const retourPath = user?.role === "ADMIN" ? "/admin/trajets" : "/transporteur/trajets";

  const onSubmit = async (data) => {
    setSubmitError("");
    setSubmitSuccess("");
    try {
      await api.post("/api/trajets", data);
      setSubmitSuccess("Trajet publié avec succès ! Redirection en cours…");
      setTimeout(() => navigate(retourPath), 1500);
    } catch (error) {
      setSubmitError(
        error.response?.data?.message || "Une erreur est survenue. Veuillez réessayer."
      );
    }
  };

  return (
    <div className="app">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1>Publier un trajet</h1>
            <p>Remplissez les informations pour publier votre trajet.</p>
          </div>
          <Link to={retourPath} className="btn-cancel">
            Mes trajets
          </Link>
        </div>

        <div className="form-card">
          <div className="form-card-header">
            <div>
              <h5>Nouveau trajet</h5>
              <p>Tous les champs sont obligatoires.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="form-card-body">
              <div className="form-grid">

                <div className="form-group">
                  <label>Ville de départ</label>
                  <input
                    type="text"
                    className={`form-control-custom ${errors.villeDepart ? "is-error" : ""}`}
                    placeholder="Ex : Casablanca"
                    {...register("villeDepart")}
                  />
                  {errors.villeDepart && (<span className="field-error">{errors.villeDepart.message}</span>)}
                </div>
                <div className="form-group">
                  <label>Ville d'arrivée</label>
                  <input
                    type="text"
                    className={`form-control-custom ${errors.villeArrivee ? "is-error" : ""}`}
                    placeholder="Ex : Marrakech"
                    {...register("villeArrivee")}
                  />
                  {errors.villeArrivee && (<span className="field-error">{errors.villeArrivee.message}</span>)}
                </div>

                <div className="form-group">
                  <label>Date &amp; heure de départ</label>
                  <input
                    type="datetime-local"
                    className={`form-control-custom ${errors.dateDepart ? "is-error" : ""}`}
                    min={new Date(Date.now() + 60000).toISOString().slice(0, 16)}
                    {...register("dateDepart")}
                  />
                  {errors.dateDepart && (
                    <span className="field-error">{errors.dateDepart.message}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Prix (MAD)</label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    className={`form-control-custom ${errors.prix ? "is-error" : ""}`}
                    placeholder="Ex : 1500"
                    {...register("prix")}
                  />
                  {errors.prix && (
                    <span className="field-error">{errors.prix.message}</span>
                  )}
                </div>
                <div className="form-group">
                  <label>Poids disponible (Tonnes)</label>
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    className={`form-control-custom ${errors.poidsDisponible ? "is-error" : ""}`}
                    placeholder="Ex : 10"
                    {...register("poidsDisponible")}
                  />
                  {errors.poidsDisponible && (<span className="field-error">{errors.poidsDisponible.message}</span>)}
                </div>

               
                <div className="form-group">
                  <label>Camion</label>
                  {loadingCamions ? (
                    <div className="form-control-custom" style={{ color: "#8a94a6" }}>
                      Chargement des camions…
                    </div>
                  ) : (
                    <select
                      className={`form-control-custom ${errors.camionId ? "is-error" : ""}`}
                      {...register("camionId")}
                    >
                      <option value="">-- Sélectionner un camion --</option>
                      {camions.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.marque} {c.modele} — {c.immatriculation} ({c.capacite} T)
                        </option>
                      ))}
                    </select>
                  )}
                  {errors.camionId && (
                    <span className="field-error">{errors.camionId.message}</span>
                  )}
                  {!loadingCamions && camions.length === 0 && (
                    <span className="field-error">
                      Aucun camion trouvé.{" "}
                      <Link to="/transporteur/camions/new" style={{ color: "#f47b20" }}>
                        Ajouter un camion
                      </Link>
                    </span>
                  )}
                </div>

              </div>

              {submitError && <p className="field-error" style={{ marginTop: 16 }}>{submitError}</p>}
              {submitSuccess && <p style={{ marginTop: 16, color: "#2a7d30", fontSize: 13 }}>{submitSuccess}</p>}
            </div>

            <div className="form-card-footer">
              <Link to={retourPath} className="btn-cancel">
                Annuler
              </Link>
              <button type="submit" className="btn-submit" disabled={isSubmitting || loadingCamions}>
                {isSubmitting ? "Publication…" : "Publier le trajet"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default PublierTrajet;