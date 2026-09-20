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
  villeDepart: yup
    .string()
    .required("La ville de départ est obligatoire"),

  villeArrivee: yup
    .string()
    .required("La ville d'arrivée est obligatoire")
    .notOneOf(
      [yup.ref("villeDepart")],
      "La ville d'arrivée doit être différente de la ville de départ"
    ),

  dateDepart: yup
    .string()
    .required("La date de départ est obligatoire"),

  prix: yup
    .number()
    .typeError("Le prix doit être un nombre")
    .positive("Le prix doit être positif")
    .required("Le prix est obligatoire"),

  poidsDisponible: yup
    .number()
    .typeError("Le poids doit être un nombre")
    .positive("Le poids doit être positif")
    .required("Le poids disponible est obligatoire"),

  camionId: yup
    .number()
    .typeError("Le camion est obligatoire")
    .required("Le camion est obligatoire"),
});

function ModifierTrajet() {
  const { id } = useParams();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const user = token ? jwtDecode(token) : null;

  const [loading, setLoading] = useState(true);
  const [camions, setCamions] = useState([]);
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

  const retourPath =user?.role === "ADMIN" ? "/admin/trajets" : "/transporteur/trajets";

  useEffect(() => {
  const chargerDonnees = async () => {
    try {
      const trajetRes = await api.get(`/api/trajets/${id}`);
      const trajet = trajetRes.data;
      console.log("Trajet chargé :", trajet);

      let listeCamions = [];

      if (user?.role === "ADMIN") {
        const camionsRes = await api.get(  "/api/camions/lister?page=0&size=100"
        );
        listeCamions = camionsRes.data.content || [];

      } else {
        const camionsRes = await api.get( "/api/camions/mesCamions" );

        listeCamions = camionsRes.data.content || [];
      }

      console.log("Camions disponibles :", listeCamions);

      setCamions(listeCamions);

      setValue( "villeDepart",trajet.villeDepart || "" );

      setValue("villeArrivee",trajet.villeArrivee || "");
      setValue( "dateDepart", trajet.dateDepart ? trajet.dateDepart.slice(0, 16) : ""  );
      setValue( "prix",trajet.prix ?? "" );
      setValue( "poidsDisponible", trajet.poidsDisponible ?? "" );
      setValue(  "camionId",  trajet.camionId ?? "");

    } catch (error) {
      console.error(
        "Erreur chargement des données :",
        error
      );

      console.error(
        "Réponse backend :",
        error.response?.data
      );

      setSubmitError(
        error.response?.data?.message ||
          "Impossible de charger les données du trajet."
      );

    } finally {
      setLoading(false);
    }
  };

  chargerDonnees();

}, [id, setValue, user?.role]);


  const onSubmit = async (data) => {
    setSubmitError("");
    setSubmitSuccess("");

    try {
      const trajetModifie = {
        villeDepart: data.villeDepart,
        villeArrivee: data.villeArrivee,
        dateDepart: data.dateDepart,
        prix: Number(data.prix),
        poidsDisponible: Number(data.poidsDisponible),
        camionId: Number(data.camionId),
      };

      console.log(
        "Données envoyées :",
        trajetModifie
      );

      const res = await api.put( `/api/trajets/${id}`,
        trajetModifie
      );

      console.log(  "Trajet modifié :", res.data);

      setSubmitSuccess( "Trajet modifié avec succès ! Redirection en cours...");

      setTimeout(() => {
        navigate(retourPath);
      }, 1500);

    } catch (error) {
      console.error("Erreur modification trajet :", error );
      console.error(   "Réponse backend :", error.response?.data);
      setSubmitError(error.response?.data?.message ||"Une erreur est survenue lors de la modification." );
    }
  };


  if (loading) {
    return (
      <div className="app">
        <Sidebar />

        <main className="main-content">
           <Loader/>
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
            <h1>Modifier le trajet</h1>

            <p>
              Mettez à jour les informations du trajet.
            </p>
          </div>

          <Link to={retourPath} className="btn-cancel"  >
             Mes trajets
          </Link>

        </div>

        <div className="form-card">

          <div className="form-card-header">

            <div>
              <h5>
                Modifier le trajet #{id}
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

                  <label>
                    Ville de départ
                  </label>

                  <input
                    type="text"
                    className={`form-control-custom ${
                      errors.villeDepart
                        ? "is-error"
                        : ""
                    }`}
                    placeholder="Ex : Casablanca"
                    {...register("villeDepart")}
                  />

                  {errors.villeDepart && (
                    <span className="field-error">
                      {errors.villeDepart.message}
                    </span>
                  )}

                </div>

            
                <div className="form-group">

                  <label>
                    Ville d'arrivée
                  </label>

                  <input
                    type="text"
                    className={`form-control-custom ${
                      errors.villeArrivee
                        ? "is-error"
                        : ""
                    }`}
                    placeholder="Ex : Marrakech"
                    {...register("villeArrivee")}
                  />

                  {errors.villeArrivee && (
                    <span className="field-error">
                      {errors.villeArrivee.message}
                    </span>
                  )}

                </div>
                <div className="form-group">

                  <label>
                    Date & heure de départ
                  </label>

                  <input
                    type="datetime-local"
                    className={`form-control-custom ${
                      errors.dateDepart
                        ? "is-error"
                        : ""
                    }`}
                    {...register("dateDepart")}
                  />

                  {errors.dateDepart && (
                    <span className="field-error">
                      {errors.dateDepart.message}
                    </span>
                  )}

                </div>
                <div className="form-group">

                  <label>
                    Prix (MAD)
                  </label>

                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    className={`form-control-custom ${
                      errors.prix
                        ? "is-error"
                        : ""
                    }`}
                    placeholder="Ex : 1500"
                    {...register("prix")}
                  />

                  {errors.prix && (
                    <span className="field-error">
                      {errors.prix.message}
                    </span>
                  )}

                </div>
                <div className="form-group">

                  <label>
                    Poids disponible (Tonnes)
                  </label>

                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    className={`form-control-custom ${
                      errors.poidsDisponible
                        ? "is-error"
                        : ""
                    }`}
                    placeholder="Ex : 10"
                    {...register("poidsDisponible")}
                  />

                  {errors.poidsDisponible && (
                    <span className="field-error">
                      {errors.poidsDisponible.message}
                    </span>
                  )}

                </div>

                {/* Camion */}
                <div className="form-group">

                  <label>
                    Camion assigné
                  </label>

                  <select
                    className={`form-control-custom ${
                      errors.camionId
                        ? "is-error"
                        : ""
                    }`}
                    {...register("camionId")}
                  >

                    <option value="">
                      -- Sélectionner un camion --
                    </option>

                    {camions.map((camion) => (
                      <option
                        key={camion.id}
                        value={camion.id}
                      >
                        {camion.marque}{" "}
                        {camion.modele} -{" "}
                        {camion.immatriculation}
                      </option>
                    ))}

                  </select>

                  {errors.camionId && (
                    <span className="field-error">
                      {errors.camionId.message}
                    </span>
                  )}

                  {camions.length === 0 && (
                    <span className="field-error">
                      Aucun camion disponible.
                    </span>
                  )}

                </div>

              </div>
              {submitError && (
                <p
                  className="field-error"
                  style={{ marginTop: 16 }}
                >
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

              <Link
                to={retourPath}
                className="btn-cancel"
              >
                Annuler
              </Link>

              <button
                type="submit"
                className="btn-submit"
                disabled={
                  isSubmitting ||
                  camions.length === 0
                }
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

export default ModifierTrajet;