import { Link } from "react-router-dom";
import { FaTruckMoving, FaRoute, FaBoxOpen, FaShieldAlt } from "react-icons/fa";
import "./LeftPanel.css";

function LeftPanel() {
  return (
    <div className="leftPanel-container">
      <div className="leftPanel-logo">
        <Link to="/" className="leftPanel-brand">
          <div className="logo-icon-box">
            <FaTruckMoving size={22} />
          </div>
          <span className="logo-text">
            Souk<span className="logo-highlight">Transport</span>
          </span>
        </Link>
      </div>
      <div className="leftPanel-intro">
        <p className="leftPanel-description">
          Plateforme intelligente de mise en relation de fret et de transport de marchandises au Maroc.
        </p>
      </div>
      <div className="leftPanel-features">
        <div className="feature-item">
          <div className="feature-icon-box">
            <FaRoute size={18} />
          </div>
          <div className="feature-text">
            <h4>Gestion des Trajets</h4>
            <p>Proposez et trouvez des trajets de transport en temps réel.</p>
          </div>
        </div>

        <div className="feature-item">
          <div className="feature-icon-box">
            <FaBoxOpen size={18} />
          </div>
          <div className="feature-text">
            <h4>Suivi des Expéditions</h4>
            <p>Gérez vos chargements et suivez vos livraisons facilement.</p>
          </div>
        </div>

        <div className="feature-item">
          <div className="feature-icon-box">
            <FaShieldAlt size={18} />
          </div>
          <div className="feature-text">
            <h4>Transport Sécurisé</h4>
            <p>Mise en relation directe avec des transporteurs vérifiés.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LeftPanel;