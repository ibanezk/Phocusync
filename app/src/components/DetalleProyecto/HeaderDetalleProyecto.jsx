import { obtenerEstiloEstado } from "../../utils/helpers";

export default function HeaderProyecto({ proyecto, navigate, setModalEliminarProyecto, setModalCompartir }) {
  return (
    <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/5 pb-6 gap-4">
      <div className="space-y-1">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-xs text-gray-400 hover:text-[#ff4d00] transition-colors">
            ← Volver al Panel
          </button>
          <button
            onClick={() => setModalEliminarProyecto(true)}
            className="text-[10px] uppercase tracking-widest text-red-400/70 hover:text-red-400 transition-colors bg-red-950/20 px-2 py-0.5 border border-red-500/10">
            🗑️ Eliminar Proyecto
          </button>
        </div>
        <h1 className="text-3xl font-semibold text-white tracking-tight">{proyecto?.nombre}</h1>
      </div>

      <div className="flex items-center gap-3 w-full sm:w-auto">
        <button
          onClick={() => setModalCompartir(true)}
          className="flex-1 sm:flex-none border border-[#ff4d00] text-white text-xs tracking-widest uppercase font-semibold px-4 py-2.5 hover:bg-[#ff4d00] transition-all">
          🔗 Compartir con Cliente
        </button>
        <span
          className={`inline-block text-xs tracking-widest uppercase px-3 py-2.5 border font-medium ${obtenerEstiloEstado(proyecto?.estado)}`}>
          {proyecto?.estado || "Borrador"}
        </span>
      </div>
    </header>
  );
}
