import Sidebar from "../../components/layout/Sidebar";
import '../../styles/global.css';

function Cargaisons(){
    return(
        <div className="app">
            <Sidebar/>
            <main className="main-content">
                <div className="page-header">
                    <div>
                        <h1>Mes cargaisons</h1>
                        <p>Consultez les cargaisons associées à vos trajets.</p>
                    </div>
                </div>

            </main>
        </div>
    )
}
export default Cargaisons;