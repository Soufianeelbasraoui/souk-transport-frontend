
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import * as yup from "yup";

import Sidebar from "../layout/Sidebar";
import api from "../../services/api";

import "../../styles/global.css";
import "../../styles/formPage.css";
import Loader from "../common/Loader";
import { jwtDecode } from "jwt-decode";

const schema = yup.object({
  marque: yup.string().required("La marque est obligatoire"),
  modele: yup.string().required("Le modèle est obligatoire"),
  type: yup.string().required("Le type de camion est obligatoire"),
  immatriculation: yup.string().required("L'immatriculation est obligatoire"),
  capacite: yup.number().typeError("La capacité doit être un nombre").positive("La capacité doit être positive").required("La capacité est obligatoire"),
  disponible: yup.boolean(),
});

function ModifierCamion() {
  const { id } = useParams();
  const navigate = useNavigate();

  const token=localStorage.getItem("token");
  const user=jwtDecode(token);


  const [typesCamion, setTypesCamion] = useState([]);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [loading, setLoading] = useState(true);


  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    api.get(`/api/camions/${id}`).then((res) => {
        setValue("marque", res.data.marque);
        setValue("modele", res.data.modele);
        setValue("type", res.data.type);
        setValue("immatriculation", res.data.immatriculation);
        setValue("capacite", res.data.capacite);
        setValue("disponible", res.data.disponible ?? true);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error)
        setSubmitError( "Impossible de charger les données du camion." );
        setLoading(false);
      });

    api.get("/api/camions/types").then((res) => {
        setTypesCamion(res.data);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [id, setValue]);


  const onSubmit = async (data) => {
    setSubmitError("");
    setSubmitSuccess("");

    try {
      await api.put(`/api/camions/${id}`, data);
      setSubmitSuccess("Camion modifié avec succès ! Redirection en cours…");
      setTimeout(() => {
        if(user.role==="ADMIN"){
          navigate("/admin/camions");
        }else if(user.role==="TRANSPORTEUR"){
          navigate("/transporteur/camions")
        }
        
      }, 2000);
    } catch (error) {
      console.error(error);
      setSubmitError( error.response?.data?.message ||"Une erreur est survenue. Veuillez réessayer." );
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

          <Link to={user.role==="ADMIN" ?"/admin/camions":"/transporteur/camions"} className="btn-cancel">
            ← Mes camions
          </Link>
        </div>

        <div className="form-card">
          <div className="form-card-header">
            <div>
              <h5>Modifier le camion #{id}</h5>

              <p>
                Modifiez les champs souhaités puis enregistrez.
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
                      errors.marque ? "is-error" : ""
                    }`}
                    placeholder="Ex : Mercedes"
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

                  <input type="text" className={`form-control-custom ${errors.modele ? "is-error" : "" }`} placeholder="Ex : Actros"  {...register("modele")} />
                  {errors.modele && ( <span className="field-error"> {errors.modele.message} </span> )}
                </div>

                <div className="form-group">
                  <label>Type de camion</label>

                  <select  className={`form-control-custom ${ errors.type ? "is-error" : ""}`} {...register("type")}>
                    <option value=""> -- Sélectionner un type -- </option>
                    {typesCamion.map((type) => ( <option key={type} value={type}> {type.replace(/_/g, " ")} </option>))}
                  </select>

                  {errors.type && (<span className="field-error"> {errors.type.message} </span> )}
                </div>

                <div className="form-group">
                  <label>Immatriculation</label>

                  <input  type="text" className={`form-control-custom ${ errors.immatriculation  ? "is-error" : ""}`}  placeholder="Ex : 12345-A-1" {...register("immatriculation")} />

                  {errors.immatriculation && (
                    <span className="field-error">
                      {errors.immatriculation.message}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label>Capacité (Tonnes)</label>

                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    className={`form-control-custom ${
                      errors.capacite ? "is-error" : ""
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

                <div
                  className="form-group"
                  style={{ justifyContent: "center" }}
                >
                  <label>Disponibilité</label>

                  <label
                    style={{
                      flexDirection: "row",
                      gap: 10,
                      alignItems: "center",
                      cursor: "pointer",
                      fontWeight: 400,
                    }}
                  >
                    <input
                      type="checkbox"
                      style={{
                        width: 16,
                        height: 16,
                        accentColor: "#f47b20",
                      }}
                      {...register("disponible")}
                    />

                    Camion disponible
                  </label>
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
                to={user.role==="ADMIN" ?"/admin/camions":"/transporteur/camions"} className="btn-cancel"> Annuler
              </Link>

              <button
                type="submit" className="btn-submit"  disabled={isSubmitting}> {isSubmitting ? "Enregistrement…": "Enregistrer les modifications"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default ModifierCamion;
