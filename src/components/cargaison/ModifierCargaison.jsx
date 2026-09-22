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
import { FiArrowLeft } from "react-icons/fi";

const schema = yup.object({
  description: yup.string().required("La description est obligatoire"),
  poids: yup.number().typeError("Le poids doit être un nombre").positive("Le poids doit être positif").required("Le poids est obligatoire"),
  expediteurId: yup.mixed().nullable().transform((value, originalValue) =>  originalValue === "" ? null : value),

});

function ModifierCargaison() {
  const { id } = useParams();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const user = token ? jwtDecode(token) : null;

  const [loading, setLoading] = useState(true);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [isLocked, setIsLocked] = useState(false);
  const [statutCargaison, setStatutCargaison] = useState("");

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


        const statut = cargaison.statutCargaison || "";
        setStatutCargaison(statut);

        if (statut === "LIVREE" || statut === "EN_TRANSIT" || statut === "ANNULEE") {

          setIsLocked(true);
        }

        setValue("description", cargaison.description || "");
        setValue("poids", cargaison.poids ?? "");
        setValue("expediteurId", cargaison.expediteurId ?? "");
      } catch (error) {
        console.error("Erreur chargement des données :", error);

        setSubmitError("Impossible de charger les données de la cargaison.");
      } finally {
        setLoading(false);
      }
    };

    chargerDonnees();
  }, [id, setValue]);

  const onSubmit = async (data) => {
    if (isLocked) {

      setSubmitError("Cette cargaison est livrée ou en cours de route et ne peut plus être modifiée.");
      return;
    }

    setSubmitError("");
    setSubmitSuccess("");

    try {
      const cargaisonModifiee = {
        description: data.description,
        poids: Number(data.poids),
        expediteurId: data.expediteurId ? Number(data.expediteurId) : null,
      };

      await api.put(`/api/cargaisons/${id}`, cargaisonModifiee);
      setSubmitSuccess("Cargaison modifiée avec succès ! Redirection en cours...");

      setTimeout(() => {
        navigate(retourPath);
      }, 1500);
    } catch (error) {
      console.error("Erreur modification cargaison :", error);
      setSubmitError( error.response?.data?.message ||  "Une erreur est survenue lors de la modification.");}
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
            <FiArrowLeft /> Mes cargaisons
          </Link>
        </div>

        <div className="form-card">
          <div className="form-card-header">
            <div className="d-flex justify-content-between align-items-center w-100">
              <div>
                <h5>Modifier la cargaison #C-{String(id).padStart(4, "0")}</h5>
                <p>
                  {isLocked 
                    ? "Consultation uniquement : cette cargaison ne peut pas être modifiée." 
                    : "Modifiez les informations puis enregistrez."}
                </p>
              </div>

              {statutCargaison && (
                <span className={`status-badge ${
                  statutCargaison === "LIVREE" 
                    ? "badge-success" 
                    : statutCargaison === "EN_TRANSIT" 
                    ? "badge-warning" 
                    : "badge-default"
                }`}>
                  {statutCargaison}
                </span>
              )}
            </div>
          </div>

          {isLocked && (
            <div className="alert alert-warning m-3" role="alert">
              🔒 <strong>Modification impossible :</strong> Cette cargaison a le statut <strong>{statutCargaison}</strong> (en transit ou déjà livrée).
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="form-card-body">
              <div className="form-grid">
                
                <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                  <label>Description</label>
                  <textarea
                    rows="3"
                    disabled={isLocked}
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

                <div className="form-group">
                  <label>Poids (kg)</label>
                  <input
                    type="number"
                    min="0.1"
                    step="0.01"
                    disabled={isLocked}
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

                {user?.role === "ADMIN" && (
                  <div className="form-group">
                    <label>ID Expéditeur (Optionnel)</label>
                    <input
                      type="number"
                      disabled={isLocked}
                      className={`form-control-custom ${
                        errors.expediteurId ? "is-error" : ""
                      }`}
                      placeholder="Ex : 3" {...register("expediteurId")} />
                    {errors.expediteurId && ( <span className="field-error"></span> )}
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

            <div className="form-card-footer d-flex justify-content-between align-items-center">
              <Link to={retourPath} className="btn-cancel">
                {isLocked ? "Retour" : "Annuler"}
              </Link>


              {!isLocked ? (
                <button
                  type="submit"
                  className="btn-submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Enregistrement..." : "Enregistrer les modifications"}
                </button>
              ) : (
                <span className="text-muted fst-italic" style={{ fontSize: "13px" }}>
                  Cette cargaison est {statutCargaison === "LIVREE" ? "livrée" : "en cours d'acheminement"} et ne peut plus être modifiée.
                </span>
              )}

            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default ModifierCargaison;