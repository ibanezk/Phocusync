/* ========================================================================= */
/* Proyecto: PhocuSync SaaS Portal                                           */
/* Componente: App.jsx (Enrutador Maestro)                                   */
/* Descripción: Definición de la arquitectura de navegación del sistema.    */
/*              Divide los entornos públicos, los espacios de trabajo       */
/*              con barra de control fija y los lienzos de pantalla completa*/
/* ========================================================================= */

import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Layouts y Contenedores estructurales
import DashboardLayout from "./components/Dashboard/DashboardLayout";

// Vistas de la Aplicación
import Login from "./views/login";
import Dashboard from "./views/Dashboard";
import DetalleProyecto from "./views/DetalleProyecto";
import GaleriaCliente from "./views/GaleriaCliente";
import PanelGalerias from "./views/PanelGalerias";
import Ajustes from "./views/Ajustes";
import Demo from "./components/Demo";
import CheckoutPage from "./components/Checkout";
import PhocuSyncLanding from "./views/landing";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* ================= PUBLIC ROUTES ================= */}
        {/* 2. Asignas la Landing a la ruta raíz "/" */}
        <Route path="/" element={<PhocuSyncLanding />} />

        <Route path="/login" element={<Login />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/demo" element={<Demo />} />

        {/* ================= PRIVATE WORKSPACE (With Sidebar) ================= */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="galerias" element={<PanelGalerias />} />
          <Route path="ajustes" element={<Ajustes />} />
        </Route>

        {/* ================= FULLSCREEN CANVAS (No Sidebar) ================= */}
        <Route path="/dashboard/proyecto/:id" element={<DetalleProyecto />} />

        {/* Portal de Cara al Cliente Final */}
        <Route path="/galeria/:id" element={<GaleriaCliente />} />
      </Routes>
    </Router>
  );
}
