import { Outlet } from "react-router-dom";
import { useDashboard } from "../../hooks/useDashboard";
import Sidebar from "./Sidebar";

export default function DashboardLayout() {
  // El Layout absorbe el hook una sola vez para toda la app
  const { userEmail, handleLogout, menuAbierto, setMenuAbierto } = useDashboard();

  return (
    <div className="flex min-h-screen bg-[#061115] text-white overflow-x-hidden font-sans">
      {/* El Sidebar queda fijo y alimentado globalmente */}
      <Sidebar
        menuAbierto={menuAbierto}
        setMenuAbierto={setMenuAbierto}
        userEmail={userEmail}
        handleLogout={handleLogout}
      />

      {/* 🚀 Aquí adentro React Router va a "inyectar" Dashboard, PanelGalerias o Ajustes */}
      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
