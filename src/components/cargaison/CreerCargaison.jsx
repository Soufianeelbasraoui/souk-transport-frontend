
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as yup from "yup";
import Sidebar from "../layout/Sidebar";
import api from "../../services/api";
import "../../styles/global.css";
import "../../styles/formPage.css";
import { jwtDecode } from "jwt-decode";

const schema = yup.object({
  description: yup .string() .required("La description est obligatoire"),

  poids: yup .number() .typeError("Le poids doit être un nombre") .positive("Le poids doit être positif") .required("Le poids est obligatoire"),
  expediteurId: yup.number().when("$isAdmin", {
    is: true,
    then: (schema) =>
      schema.typeError("Veuillez sélectionner un expéditeur").required("Veuillez sélectionner un expéditeur"),
      otherwise: (schema) => schema.notRequired(),
  }),
});

function CreerCargaison() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const user = jwtDecode(token);

  const isAdmin = user.role === "ADMIN";
  const isExpediteur = user.role === "EXPEDITEUR";

  const [expediteurs, setExpediteurs] = useState([]);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    context: { isAdmin,  },
  });

  
  useEffect(() => {
  if (isAdmin) {
    api.get("/api/users/filter/role", {
      params: { role: "EXPEDITEUR" }
    }).then(response => {
      setExpediteurs(response.data.content || response.data);
    })
    .catch(error => {
      setSubmitError( error.response?.data?.message || "Erreur lors du chargement des expéditeurs.");
    });
  }
}, [isAdmin]);

 const onSubmit = async (data) => {
  setSubmitError("");
  setSubmitSuccess("");

  try {

    await api.post("/api/cargaisons",data);

    setSubmitSuccess("Cargaison ajoutée avec succès !");

    setTimeout(() => {
      navigate( isAdmin? "/admin/cargaisons": "/expediteur/cargaisons");
    }, 1500);

  } catch (error) {
    setSubmitError( error.response?.data?.message || "Une erreur est survenue. Veuillez réessayer." );
  }
};

  return (
    <div className="app">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1>Créer une cargaison</h1>
            <p>
              Remplissez les informations pour enregistrer votre cargaison.
            </p>
          </div>

          <Link to={ user.role === "ADMIN" ? "/admin/cargaisons" : "/expediteur/cargaisons" } className="btn-cancel" >
            ← Mes cargaisons
          </Link>
        </div>

        <div className="form-card">
          <div className="form-card-header">
            <div>
              <h5>Nouvelle cargaison</h5>
              <p>
                Tous les champs sont obligatoires.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="form-card-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>Description</label>
                  <input type="text"  className={`form-control-custom ${  errors.description ? "is-error" : "" }`} placeholder="Ex : Cartons de vêtements" {...register("description")} />
                  {errors.description && ( <span className="field-error"> {errors.description.message} </span> )}
                </div>
                <div className="form-group">
                  <label>Poids (kg)</label>

                  <input type="number"  step="0.01"  className={`form-control-custom ${ errors.poids ? "is-error" : "" }`} placeholder="Ex : 500" {...register("poids")}/>

                  {errors.poids && (<span className="field-error"> {errors.poids.message}</span>)}
                </div>

                {isAdmin && (<div className="form-group">
                    <label>Expéditeur</label>
                    <select className={`form-control-custom ${ errors.expediteurId ? "is-error" : "" }`} {...register("expediteurId")}>
                      <option value="">
                        Sélectionner un expéditeur
                      </option>

                      {expediteurs.map((expediteur) => (
                        <option key={expediteur.id} value={expediteur.id}>
                          {expediteur.nom} {expediteur.prenom}
                        </option>
                      ))}
                    </select>
                    {errors.expediteurId && (<span className="field-error">{errors.expediteurId.message}</span> )}
                  </div>
                )}

              </div>

              {submitError && ( <p  className="field-error" style={{ marginTop: 16 }}>{submitError}</p>)}
              {submitSuccess && (  <p style={{ marginTop: 16, color: "#2a7d30",  fontSize: 13, }} >{submitSuccess}</p>)}

            </div>
            <div className="form-card-footer">

              <Link to={ user.role === "ADMIN" ? "/admin/cargaisons" : "/expediteur/cargaisons" }className="btn-cancel">
                Annuler
              </Link>

              <button type="submit" className="btn-submit" disabled={isSubmitting}>
                {isSubmitting ? "Enregistrement…"  : "Ajouter la cargaison"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default CreerCargaison;

