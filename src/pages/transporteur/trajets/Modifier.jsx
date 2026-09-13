import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import * as yup from "yup";
import Sidebar from "../../../components/layout/Sidebar";
import api from "../../../services/api";
import "../../../styles/global.css";
import "../style/publierTrajet.css";

const schema = yup.object({
  villeDepart: yup.string().required("La ville de départ est obligatoire"),
  villeArrivee: yup.string().required("La ville d'arrivée est obligatoire").notOneOf([yup.ref("villeDepart")], "La ville d'arrivée doit être différente de la ville de départ"),
  dateDepart: yup.string().required("La date de départ est obligatoire"),
  prix: yup .number() .typeError("Le prix doit être un nombre") .positive("Le prix doit être positif") .required("Le prix est obligatoire"),
  poidsDisponible: yup .number() .typeError("Le poids doit être un nombre") .positive("Le poids doit être positif") .required("Le poids disponible est obligatoire"),
  camionId: yup.string().required("Veuillez sélectionner un camion"),
});

function ModifierTrajet() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [camions, setCamions] = useState([]);
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [trajetRes, camionsRes] = await Promise.all([
          api.get(`/api/trajets/${id}`),
          api.get("/api/camions/mesCamions"),
        ]);

        setCamions(camionsRes.data || []);

        const trajet = trajetRes.data;
        reset({
          villeDepart: trajet.villeDepart || "",
          villeArrivee: trajet.villeArrivee || "",
          dateDepart: trajet.dateDepart ? trajet.dateDepart.slice(0, 16) : "",
          prix: trajet.prix,
          poidsDisponible: trajet.poidsDisponible,
          camionId: trajet.camion?.id ? String(trajet.camion.id) : (trajet.camionId ? String(trajet.camionId) : ""),
        });
      } catch (error) {
        setSubmitError("Impossible de charger les données du trajet.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, reset]);

  const onSubmit = async (data) => {
    setSubmitError("");
    setSubmitSuccess("");
    try {
      await api.put(`/api/trajets/${id}`, data);
      setSubmitSuccess("Trajet mis à jour avec succès ! Redirection en cours…");
      setTimeout(() => navigate("/transporteur/trajets"), 2000);
    } catch (error) {
      setSubmitError(error.response?.data?.message || "Une erreur est survenue lors de la modification.");
    }
  };

  return (
    <div className="app">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1>Modifier le trajet</h1>
            <p>Mettez à jour les informations de votre trajet.</p>
          </div>
          <Link to="/transporteur/trajets" className="btn-cancel">
            ← Mes trajets
          </Link>
        </div>

        <div className="form-card">
          <div className="form-card-header">
            <div>
              <h5>Modifier le trajet #{id}</h5>
              <p>Modifiez les informations souhaitées puis enregistrez.</p>
            </div>
          </div>

          {loading ? (
            <div className="form-card-body" style={{ color: "#8a94a6", fontSize: 13 }}>
              Chargement des données du trajet…
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="form-card-body">
                <div className="form-grid">
                  {/* Ville Départ */}
                  <div className="form-group">
                    <label>Ville de départ</label>
                    <input
                      type="text"
                      className={`form-control-custom ${errors.villeDepart ? "is-error" : ""}`}
                      placeholder="Ex : Casablanca"
                      {...register("villeDepart")}
                    />
                    {errors.villeDepart && <span className="field-error">{errors.villeDepart.message}</span>}
                  </div>
                  <div className="form-group">
                    <label>Ville d'arrivée</label>
                    <input
                      type="text"
                      className={`form-control-custom ${errors.villeArrivee ? "is-error" : ""}`}
                      placeholder="Ex : Marrakech"
                      {...register("villeArrivee")}
                    />
                    {errors.villeArrivee && <span className="field-error">{errors.villeArrivee.message}</span>}
                  </div>
                  <div className="form-group">
                    <label>Date &amp; heure de départ</label>
                    <input
                      type="datetime-local"
                      className={`form-control-custom ${errors.dateDepart ? "is-error" : ""}`}
                      {...register("dateDepart")}
                    />
                    {errors.dateDepart && <span className="field-error">{errors.dateDepart.message}</span>}
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
                    {errors.prix && <span className="field-error">{errors.prix.message}</span>}
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
                    {errors.poidsDisponible && <span className="field-error">{errors.poidsDisponible.message}</span>}
                  </div>
                  <div className="form-group">
                    <label>Camion assigné</label>
                    <select
                      className={`form-control-custom ${errors.camionId ? "is-error" : ""}`}
                      {...register("camionId")}
                    >
                      <option value="">-- Sélectionner un camion --</option>
                      {camions.map((c) => (
                        <option key={c.id} value={String(c.id)}>
                          {c.marque} {c.modele} — {c.immatriculation} ({c.capacite} T)
                        </option>
                      ))}
                    </select>
                    {errors.camionId && <span className="field-error">{errors.camionId.message}</span>}
                  </div>
                </div>

                {submitError && <p className="field-error" style={{ marginTop: 16 }}>⚠ {submitError}</p>}
                {submitSuccess && <p style={{ marginTop: 16, color: "#2a7d30", fontSize: 13 }}>✅ {submitSuccess}</p>}
              </div>

              <div className="form-card-footer">
                <Link to="/transporteur/trajets" className="btn-cancel">
                  Annuler
                </Link>
                <button type="submit" className="btn-submit" disabled={isSubmitting}>
                  {isSubmitting ? "Enregistrement…" : "Enregistrer les modifications"}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}

export default ModifierTrajet;