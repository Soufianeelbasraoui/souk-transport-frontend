
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import * as yup from "yup";

import Sidebar from "../layout/Sidebar";
import Loader from "../common/Loader";
import api from "../../services/api";
import { jwtDecode } from "jwt-decode";

import "../../styles/global.css";
import "../../styles/formPage.css";

const schema = yup.object({
  villeDepart: yup.string().required("La ville de départ est obligatoire"),
  villeArrivee: yup.string().required("La ville d'arrivée est obligatoire").notOneOf([yup.ref("villeDepart")], "La ville d'arrivée doit être différente de la ville de départ"),
  dateDepart: yup.string().required("La date de départ est obligatoire"),
  prix: yup.number().typeError("Le prix doit être un nombre").positive("Le prix doit être positif").required("Le prix est obligatoire"),
  poidsDisponible: yup.number().typeError("Le poids doit être un nombre").positive("Le poids doit être positif").required("Le poids disponible est obligatoire"),
  camionId: yup.string().required("Veuillez sélectionner un camion"),
});

function ModifierTrajet() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = jwtDecode(localStorage.getItem("token"));

  const [camions, setCamions] = useState([]);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [loading, setLoading] = useState(true);

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    api.get(`/api/trajets/${id}`).then((res) => {
        const trajet = res.data;
        setValue("villeDepart", trajet.villeDepart);
        setValue("villeArrivee", trajet.villeArrivee);
        setValue("dateDepart", trajet.dateDepart?.slice(0, 16) || "");
        setValue("prix", trajet.prix);
        setValue("poidsDisponible", trajet.poidsDisponible);
        setValue("camionId", String(trajet.camion?.id || trajet.camionId || ""));
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setSubmitError("Impossible de charger les données du trajet.");
        setLoading(false);
      });

    api.get("/api/camions/mesCamions").then((res) => setCamions(res.data))
      .catch((error) => console.error(error));
  }, [id, setValue]);

  const onSubmit = async (data) => {
    setSubmitError("");
    setSubmitSuccess("");

    try {
      await api.put(`/api/trajets/${id}`, {...data,
        prix: Number(data.prix),
        poidsDisponible: Number(data.poidsDisponible),
        camionId: Number(data.camionId),
      });

      setSubmitSuccess("Trajet modifié avec succès ! Redirection en cours…");

      setTimeout(() => {
        navigate(user.role === "ADMIN" ? "/admin/trajets" : "/transporteur/trajets");
      }, 2000);
    } catch (error) {
      console.error(error);
      setSubmitError(error.response?.data?.message || "Une erreur est survenue. Veuillez réessayer.");
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="app">
      <Sidebar />

      <main className="main-content">
        <div className="page-header">
          <div>
            <h1>Modifier le trajet</h1>
            <p>Mettez à jour les informations de votre trajet.</p>
          </div>

          <Link
            to={user.role === "ADMIN" ? "/admin/trajets" : "/transporteur/trajets"}
            className="btn-cancel"
          >
            ← Mes trajets
          </Link>
        </div>

        <div className="form-card">
          <div className="form-card-header">
            <div>
              <h5>Modifier le trajet #{id}</h5>
              <p>Modifiez les champs souhaités puis enregistrez.</p>
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
                  <label>Date & heure de départ</label>
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
                    {camions.map((camion) => (
                      <option key={camion.id} value={camion.id}>
                        {camion.marque} {camion.modele} — {camion.immatriculation} ({camion.capacite} T)
                      </option>
                    ))}
                  </select>
                  {errors.camionId && <span className="field-error">{errors.camionId.message}</span>}
                </div>

              </div>

              {submitError && <p className="field-error" style={{ marginTop: 16 }}>{submitError}</p>}
              {submitSuccess && <p style={{ marginTop: 16, color: "#2a7d30", fontSize: 13 }}>{submitSuccess}</p>}
            </div>

            <div className="form-card-footer">
              <Link
                to={user.role === "ADMIN" ? "/admin/trajets" : "/transporteur/trajets"}
                className="btn-cancel"
              >
                Annuler
              </Link>

              <button type="submit" className="btn-submit" disabled={isSubmitting}>
                {isSubmitting ? "Enregistrement…" : "Enregistrer les modifications"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default ModifierTrajet;

