import AppRoutes from "./routes/AppRoutes"
import './App.css'
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {

  return (
    <div>
        <AppRoutes/>
        <ToastContainer position="top-right" autoClose={2000} />

    </div>
  )
  
}

export default App
