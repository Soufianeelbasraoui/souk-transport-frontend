import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import * as yup from "yup";

import Sidebar from "../layout/Sidebar";
import api from "../../services/api";
import { jwtDecode } from "jwt-decode";

import "../../styles/global.css";
import "../../styles/formPage.css";
import Loader from "../common/Loader";

const schema = yup.object({
  description: yup
    .string()
    .required("La description est obligatoire"),

  poids: yup
    .number()
    .typeError("Le poids doit être un nombre")
    .positive("Le poids doit être positif")
    .required("Le poids est obligatoire"),

  expediteurId: yup
    .mixed()
    .nullable()
    .transform((value, originalValue) =>
      originalValue === "" ? null : value
    ),
});

function ModifierCargaison() {
  const { id } = useParams();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const user = token ? jwtDecode(token) : null;

  const [loading, setLoading] = useState(true);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const retourPath = user?.role === "ADMIN" ? "/admin/cargaisons" : "/expediteur/cargaisons";

  useEffect(() => {
    const chargerDonnees = async () => {
      try {
        const res = await api.get(`/api/cargaisons/${id}`);
        const cargaison = res.data;
        console.log("Cargaison chargée :", cargaison);

        setValue("description", cargaison.description || "");
        setValue("poids", cargaison.poids ?? "");
        setValue("expediteurId", cargaison.expediteurId ?? "");
      } catch (error) {
        console.error("Erreur chargement des données :", error);
        console.error("Réponse backend :", error.response?.data);

        setSubmitError(
          error.response?.data?.message ||
            "Impossible de charger les données de la cargaison."
        );
      } finally {
        setLoading(false);
      }
    };

    chargerDonnees();
  }, [id, setValue]);

  const onSubmit = async (data) => {
    setSubmitError("");
    setSubmitSuccess("");

    try {
      const cargaisonModifiee = {
        description: data.description,
        poids: Number(data.poids),
        expediteurId: data.expediteurId ? Number(data.expediteurId) : null,
      };

      console.log("Données envoyées :", cargaisonModifiee);

      const res = await api.put(`/api/cargaisons/${id}`, cargaisonModifiee);

      console.log("Cargaison modifiée :", res.data);

      setSubmitSuccess("Cargaison modifiée avec succès ! Redirection en cours...");

      setTimeout(() => {
        navigate(retourPath);
      }, 1500);
    } catch (error) {
      console.error("Erreur modification cargaison :", error);
      console.error("Réponse backend :", error.response?.data);
      setSubmitError(
        error.response?.data?.message ||
          "Une erreur est survenue lors de la modification."
      );
    }
  };

  if (loading) {
    return (
      <div className="app">
        <Sidebar />
        <main className="main-content">
          <Loader />
        </main>
      </div>
    );
  }

  return (
    <div className="app">
      <Sidebar />

      <main className="main-content">
        <div className="page-header">
          <div>
            <h1>Modifier la cargaison</h1>
            <p>Mettez à jour les informations de la cargaison.</p>
          </div>

          <Link to={retourPath} className="btn-cancel">
            Mes cargaisons
          </Link>
        </div>

        <div className="form-card">
          <div className="form-card-header">
            <div>
              <h5>Modifier la cargaison #{id}</h5>
              <p>Modifiez les informations puis enregistrez.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="form-card-body">
              <div className="form-grid">
                {/* Description */}
                <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                  <label>Description</label>
                  <textarea
                    rows="3"
                    className={`form-control-custom ${
                      errors.description ? "is-error" : ""
                    }`}
                    placeholder="Ex : Lot de marchandises textiles"
                    {...register("description")}
                  />
                  {errors.description && (
                    <span className="field-error">
                      {errors.description.message}
                    </span>
                  )}
                </div>

                {/* Poids */}
                <div className="form-group">
                  <label>Poids (kg)</label>
                  <input
                    type="number"
                    min="0.1"
                    step="0.01"
                    className={`form-control-custom ${
                      errors.poids ? "is-error" : ""
                    }`}
                    placeholder="Ex : 500"
                    {...register("poids")}
                  />
                  {errors.poids && (
                    <span className="field-error">
                      {errors.poids.message}
                    </span>
                  )}
                </div>

                {/* ID Expéditeur (Visible uniquement pour ADMIN) */}
                {user?.role === "ADMIN" && (
                  <div className="form-group">
                    <label>ID Expéditeur (Optionnel)</label>
                    <input
                      type="number"
                      className={`form-control-custom ${
                        errors.expediteurId ? "is-error" : ""
                      }`}
                      placeholder="Ex : 3"
                      {...register("expediteurId")}
                    />
                    {errors.expediteurId && (
                      <span className="field-error">
                        {errors.expediteurId.message}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {submitError && (
                <p className="field-error" style={{ marginTop: 16 }}>
                  {submitError}
                </p>
              )}

              {submitSuccess && (
                <p
                  style={{
                    marginTop: 16,
                    color: "#2a7d30",
                    fontSize: 13,
                  }}
                >
                  {submitSuccess}
                </p>
              )}
            </div>

            <div className="form-card-footer">
              <Link to={retourPath} className="btn-cancel">
                Annuler
              </Link>

              <button  type="submit"className="btn-submit" disabled={isSubmitting} >
                {isSubmitting? "Enregistrement...": "Enregistrer les modifications"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default ModifierCargaison;