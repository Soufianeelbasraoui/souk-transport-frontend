import { Link } from "react-router-dom";
import { FiAlertTriangle, FiHome } from "react-icons/fi";

function NotFoundPage() {
  return (
    <div 
      className="min-vh-100 d-flex align-items-center justify-content-center p-4" style={{ backgroundColor: "#f9faf8" }}>
      <div className="text-center" style={{ maxWidth: "500px" }}>
        
        <div className="mb-3 text-secondary opacity-75">
          <FiAlertTriangle size={60} />
        </div>

        <h1 
          className="fw-bold text-dark mb-2" 
          style={{ fontSize: "4rem", letterSpacing: "-1px", lineHeight: "1" }}
        >
          404
        </h1>

        <h2 className="h3 fw-bold text-dark opacity-70 mb-2">
          Page non trouvée
        </h2>
        
        <p className="text-secondary small mb-4 px-3" style={{ fontSize: "0.90rem", lineHeight: "1.5" }}>
          Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
        </p>

        <Link 
          to="/" 
          className="btn btn-dark btn-sm d-inline-flex align-items-center gap-2 px-4 py-2 text-uppercase fw-semibold"
          style={{ fontSize: "0.75rem", letterSpacing: "1px", borderRadius: "2px" }} >
          <FiHome size={15} />
          <span>Retour à l'accueil</span>
        </Link>

      </div>
    </div>
  );
}

export default NotFoundPage;