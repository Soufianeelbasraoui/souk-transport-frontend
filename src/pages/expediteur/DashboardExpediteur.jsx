import { jwtDecode } from "jwt-decode";
import Sidebar from "../../components/layout/Sidebar";


function DashboardExpediteur(){
    const token=localStorage.getItem("token");
    const user=jwtDecode(token);
    return(
        <div>
            <Sidebar />

        </div>
    )
}
export default DashboardExpediteur;