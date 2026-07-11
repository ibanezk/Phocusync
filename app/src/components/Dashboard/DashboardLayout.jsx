/* ========================================================================= */
/* Proyecto: PhocuSync SaaS Portal                                           */
/* Componente: DashboardLayout.jsx                                           */
/* Propósito: Contenedor maestro estructural que unifica la navegación global*/
/*            con la inyección dinámica de subvistas (vías React Router).     */
/* ========================================================================= */

import { Outlet } from "react-router-dom";
import { useDashboard } from "../../hooks/useDashboard";
import Sidebar from "./Sidebar";

export default function DashboardLayout() {
  // El Layout absorbe el hook una sola vez para toda la app
  // Centraliza los estados críticos de interfaz y usuario, sirviendo de puente único de datos
  const { userEmail, handleLogout, menuAbierto, setMenuAbierto } = useDashboard();

  return (
    <div className="flex min-h-screen bg-[#061115] text-white overflow-x-hidden font-sans">
      {/* El Sidebar queda fijo y alimentado globalmente */}
      {/* Se encarga de la navegación y hereda el control directo del menú colapsable */}
      <Sidebar
        menuAbierto={menuAbierto}
        setMenuAbierto={setMenuAbierto}
        userEmail={userEmail}
        handleLogout={handleLogout}
      />

      {/*  Aquí adentro React Router va a "inyectar" Dashboard, PanelGalerias o Ajustes */}
      {/* El uso de 'flex-1' expande el área de trabajo y 'min-w-0' previene roturas por desbordamiento */}
      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
