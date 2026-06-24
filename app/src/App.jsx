import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DashboardLayout from "./components/Dashboard/DashboardLayout";
import Login from "./views/Login";
import Dashboard from "./views/Dashboard";
import DetalleProyecto from "./views/DetalleProyecto";
import GaleriaCliente from "./views/GaleriaCliente";
import PanelGalerias from "./views/PanelGalerias";
import Ajustes from "./views/Ajustes";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta pública */}
        <Route path="/" element={<Login />} />

        {/* 🔒 Rutas privadas con Sidebar fijo */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="galerias" element={<PanelGalerias />} />
          <Route path="ajustes" element={<Ajustes />} />
        </Route>

        {/* 🔓 Pantalla completa (SIN Sidebar) */}
        {/* 🎯 Mantenemos la ruta completa para que useDashboard no rompa */}
        <Route path="/dashboard/proyecto/:id" element={<DetalleProyecto />} />
        <Route path="/galeria/:id" element={<GaleriaCliente />} />
      </Routes>
    </Router>
  );
}
