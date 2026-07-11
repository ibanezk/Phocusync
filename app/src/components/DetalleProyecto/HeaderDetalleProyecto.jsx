/* ========================================================================= */
/* Componente: HeaderProyecto.jsx                                            */
/* Descripción: Cabecera administrativa de la galería del proyecto.          */
/*              Maneja de forma autónoma la navegación, estados de la UI     */
/*              y disparadores para acciones críticas de compartición/borrado*/
/* ========================================================================= */

import { useNavigate } from "react-router-dom";
import { obtenerEstiloEstado } from "../../utils/helpers";

export default function HeaderProyecto({ proyecto, setModalEliminarProyecto, setModalCompartir }) {
  // AUTONOMÍA DE ENRUTAMIENTO: El componente maneja su propio ciclo de navegación
  // sin depender de funciones heredadas del componente padre.
  const navigate = useNavigate();

  return (
    // DISEÑO RESPONSIVO: Pasa de una distribución vertical (flex-col) en móviles
    // a una alineación horizontal (sm:flex-row) equilibrada en pantallas superiores.
    <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/5 pb-6 gap-4">
      {/* SECCIÓN IZQUIERDA: Flujos de retorno y metadatos principales */}
      <div className="space-y-1">
        <div className="flex items-center gap-4">
          {/* Botón de retorno al panel general */}
          <button
            onClick={() => navigate("/dashboard")}
            className="text-xs text-gray-400 hover:text-[#ff4d00] transition-colors">
            ← Volver al Panel
          </button>

          {/* Disparador de seguridad para la eliminación lógica o física del proyecto */}
          <button
            onClick={() => setModalEliminarProyecto({ isOpen: true })}
            className="text-[10px] uppercase tracking-widest text-red-400/70 hover:text-red-400 transition-colors bg-red-950/20 px-2 py-0.5 border border-red-500/10">
            🗑️ Eliminar Proyecto
          </button>
        </div>

        {/* Renderizado seguro mediante Optional Chaining (?.) para evitar excepciones si los datos de la API están pendientes */}
        <h1 className="text-3xl font-semibold text-white tracking-tight">{proyecto?.nombre}</h1>
      </div>

      {/* SECCIÓN DERECHA: Botones de acción comercial y estatus actual */}
      {/* En pantallas pequeñas ('w-full') expande los controles para facilitar la interacción táctil */}
      <div className="flex items-center gap-3 w-full sm:w-auto">
        {/* Acción para abrir la configuración de enlaces independientes del cliente */}
        <button
          onClick={() => setModalCompartir({ isOpen: true })}
          className="flex-1 sm:flex-none border border-[#ff4d00] text-white text-xs tracking-widest uppercase font-semibold px-4 py-2.5 hover:bg-[#ff4d00] transition-all">
          🔗 Compartir con Cliente
        </button>

        {/* Badge dinámico: Delega la asignación de paleta de colores (borde/fondo/texto) 
            a una función utilitaria pura según el string de la base de datos */}
        <span
          className={`inline-block text-xs tracking-widest uppercase px-3 py-2.5 border font-medium ${obtenerEstiloEstado(proyecto?.estado)}`}>
          {proyecto?.estado || "Borrador"}
        </span>
      </div>
    </header>
  );
}
