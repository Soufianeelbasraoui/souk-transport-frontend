import { Link } from "react-router-dom";

function Unauthorized() {
  return (
    <div className="text-center mt-5">
      <h1>403</h1>
      <h3>Accès non autorisé</h3>
      <p>Vous n'avez pas accès à cette page.</p>

      <Link to="/" className="btn btn-primary">
        Retour à l'accueil
      </Link>
    </div>
  );
}

export default Unauthorized;