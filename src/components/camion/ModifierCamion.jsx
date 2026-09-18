
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
  marque: yup
    .string()
    .required("La marque est obligatoire"),

  modele: yup
    .string()
    .required("Le modèle est obligatoire"),

  type: yup
    .string()
    .required("Le type est obligatoire"),

  immatriculation: yup
    .string()
    .required("L'immatriculation est obligatoire"),

  capacite: yup
    .number()
    .typeError("La capacité doit être un nombre")
    .positive("La capacité doit être positive")
    .required("La capacité est obligatoire"),

  disponible: yup
    .boolean()
    .required("La disponibilité est obligatoire"),
});

function ModifierCamion() {
  const { id } = useParams();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const user = token ? jwtDecode(token) : null;

  const [loading, setLoading] = useState(true);
  const [typesCamion, setTypesCamion] = useState([]);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      marque: "",
      modele: "",
      type: "",
      immatriculation: "",
      capacite: "",
      disponible: true,
    },
  });

  /*
   * Page de retour selon le rôle
   */
  const retourPath =
    user?.role === "ADMIN"
      ? "/admin/camions"
      : "/transporteur/camions";

  /*
   * Charger le camion + les types
   */
  useEffect(() => {
    const chargerDonnees = async () => {
      try {
        /*
         * Récupérer le camion
         */
        const camionResponse = await api.get(
          `/api/camions/${id}`
        );

        const camion = camionResponse.data;

        console.log("Camion chargé :", camion);

        setValue("marque", camion.marque || "");
        setValue("modele", camion.modele || "");
        setValue("type", camion.type || "");
        setValue(
          "immatriculation",
          camion.immatriculation || ""
        );
        setValue(
          "capacite",
          camion.capacite ?? ""
        );
        setValue(
          "disponible",
          camion.disponible ?? true
        );
        const typesResponse = await api.get(
          "/api/camions/types"
        );

        console.log(
          "Types camion :",
          typesResponse.data
        );

        setTypesCamion(typesResponse.data || []);

      } catch (error) {
        console.error(
          "Erreur chargement camion/types :",
          error
        );

        setSubmitError(
          error.response?.data?.message ||
            "Impossible de charger les données du camion."
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
      const camionModifie = {
        marque: data.marque,
        modele: data.modele,
        type: data.type,
        immatriculation: data.immatriculation,
        capacite: Number(data.capacite),
        disponible: data.disponible,
      };

      console.log(
        "Données envoyées :",
        camionModifie
      );

      const response = await api.put(
        `/api/camions/${id}`,
        camionModifie
      );

      console.log(
        "Camion modifié :",
        response.data
      );

      setSubmitSuccess(
        "Camion modifié avec succès ! Redirection en cours..."
      );

      setTimeout(() => {
        navigate(retourPath);
      }, 1500);

    } catch (error) {
      console.error(
        "Erreur modification camion :",
        error
      );

      console.error(
        "Response backend :",
        error.response?.data
      );

      setSubmitError(
        error.response?.data?.message ||
          "Une erreur est survenue. Veuillez réessayer."
      );
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="app">

      <Sidebar />

      <main className="main-content">
        <div className="page-header">

          <div>
            <h1>Modifier le camion</h1>

            <p>
              Mettez à jour les informations du camion.
            </p>
          </div>

          <Link
            to={retourPath}
            className="btn-cancel"
          >
            ← Camions
          </Link>

        </div>
        <div className="form-card">

          <div className="form-card-header">

            <div>

              <h5>
                Modifier le camion #{id}
              </h5>

              <p>
                Modifiez les informations puis
                enregistrez.
              </p>

            </div>

          </div>

          <form onSubmit={handleSubmit(onSubmit)}>

            <div className="form-card-body">

              <div className="form-grid">
                <div className="form-group">

                  <label>Marque</label>

                  <input
                    type="text"
                    className={`form-control-custom ${
                      errors.marque
                        ? "is-error"
                        : ""
                    }`}
                    placeholder="Ex : Renault"
                    {...register("marque")}
                  />

                  {errors.marque && (
                    <span className="field-error">
                      {errors.marque.message}
                    </span>
                  )}

                </div>
                <div className="form-group">

                  <label>Modèle</label>

                  <input
                    type="text"
                    className={`form-control-custom ${
                      errors.modele
                        ? "is-error"
                        : ""
                    }`}
                    placeholder="Ex : Premium"
                    {...register("modele")}
                  />

                  {errors.modele && (
                    <span className="field-error">
                      {errors.modele.message}
                    </span>
                  )}

                </div>
                <div className="form-group">

                  <label>Immatriculation</label>

                  <input
                    type="text"
                    className={`form-control-custom ${
                      errors.immatriculation
                        ? "is-error"
                        : ""
                    }`}
                    placeholder="Ex : 12345-A-6"
                    {...register("immatriculation")}
                  />

                  {errors.immatriculation && (
                    <span className="field-error">
                      {errors.immatriculation.message}
                    </span>
                  )}

                </div>

                {/* TYPE */}
                <div className="form-group">

                  <label>Type</label>

                  <select
                    className={`form-control-custom ${
                      errors.type
                        ? "is-error"
                        : ""
                    }`}
                    {...register("type")}
                  >

                    <option value="">
                      -- Sélectionner un type --
                    </option>

                    {typesCamion.map((type) => (
                      <option
                        key={type}
                        value={type}
                      >
                        {type
                          .replaceAll("_", " ")
                          .toLowerCase()
                          .replace(/\b\w/g, (letter) =>
                            letter.toUpperCase()
                          )}
                      </option>
                    ))}

                  </select>

                  {errors.type && (
                    <span className="field-error">
                      {errors.type.message}
                    </span>
                  )}

                </div>

                {/* CAPACITE */}
                <div className="form-group">

                  <label>
                    Capacité (Tonnes)
                  </label>

                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    className={`form-control-custom ${
                      errors.capacite
                        ? "is-error"
                        : ""
                    }`}
                    placeholder="Ex : 10"
                    {...register("capacite")}
                  />

                  {errors.capacite && (
                    <span className="field-error">
                      {errors.capacite.message}
                    </span>
                  )}

                </div>

                {/* DISPONIBILITE */}
                <div className="form-group">

                  <label>
                    Disponibilité
                  </label>

                  <select
                    className={`form-control-custom ${
                      errors.disponible
                        ? "is-error"
                        : ""
                    }`}
                    {...register("disponible", {
                      setValueAs: (value) =>
                        value === "true",
                    })}
                  >

                    <option value="true">
                      Disponible
                    </option>

                    <option value="false">
                      Non disponible
                    </option>

                  </select>

                  {errors.disponible && (
                    <span className="field-error">
                      {errors.disponible.message}
                    </span>
                  )}

                </div>

              </div>

              {/* ERROR */}
              {submitError && (
                <p
                  className="field-error"
                  style={{ marginTop: 16 }}
                >
                  {submitError}
                </p>
              )}

              {/* SUCCESS */}
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

            {/* FOOTER */}
            <div className="form-card-footer">

              <Link
                to={retourPath}
                className="btn-cancel"
              >
                Annuler
              </Link>

              <button
                type="submit"
                className="btn-submit"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? "Enregistrement..."
                  : "Enregistrer les modifications"}
              </button>

            </div>

          </form>

        </div>

      </main>

    </div>
  );
}

export default ModifierCamion;
