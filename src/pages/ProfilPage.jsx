import Sidebar from "../components/layout/Sidebar";
import "../styles/global.css";

function ProfilPage() {
  return (
    <div className="app">
      <Sidebar />
      <main className="main-content">

        <div className="page-header">
          <div>
            <h1>Mon Profil</h1>
            <p>Gérez vos informations personnelles.</p>
          </div>
        </div>

      </main>

    </div>
  );
}

export default ProfilPage;