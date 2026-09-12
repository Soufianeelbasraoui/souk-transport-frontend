import Sidebar from "../../components/layout/Sidebar";
import '../../styles/global.css';

function PublierTrajet(){
    return(
        <div className="app">
            <Sidebar/>
            <main className="main-content">
                <div className="page-header">
                  <div>
                    <h1>Publier un trajet</h1>
                    <p>Remplissez les informations pour publier votre trajet.</p>
                  </div>
                </div>
            
            </main>
        </div>
    )
}
export default PublierTrajet;