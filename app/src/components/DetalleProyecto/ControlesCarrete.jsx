export default function ControlesCarrete({
  fotos,
  fotosFiltradas,
  filtroElegidas,
  setFiltroElegidas,
  selectedFotos,
  setSelectedFotos,
  handleCopiarNombres,
  copiado,
  abrirConfirmacionMasiva,
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-white/5 pb-5 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
        <h2 className="text-xs font-bold tracking-widest uppercase text-white">Carrete del Proyecto</h2>
        <p className="text-[10px] text-gray-500 font-mono">
          {fotosFiltradas.length} MOSTRADAS DE {fotos.length} (
          {(fotos.reduce((acc, f) => acc + (f.size || 0), 0) / (1024 * 1024)).toFixed(2)} MB)
        </p>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
        <div className="bg-white/[0.02] border border-white/5 p-1 rounded-lg h-10 flex items-center w-full md:w-auto shrink-0 overflow-x-auto scrollbar-none">
          <div className="flex gap-1 w-full md:w-auto">
            <button
              onClick={() => setFiltroElegidas("todas")}
              className={`px-4 h-8 rounded text-[11px] tracking-wider uppercase font-bold transition-all whitespace-nowrap flex items-center justify-center ${filtroElegidas === "todas" ? "bg-white/10 text-white" : "text-gray-400 hover:text-white"}`}
              style={{ minWidth: "90px" }}>
              Todas ({fotos.length})
            </button>
            <button
              onClick={() => setFiltroElegidas("seleccionadas")}
              className={`px-4 h-8 rounded text-[11px] tracking-wider uppercase font-bold flex items-center justify-center gap-1.5 transition-all whitespace-nowrap ${filtroElegidas === "seleccionadas" ? "bg-[#ff4d00]/10 text-[#ff4d00]" : "text-gray-400 hover:text-gray-300"}`}
              style={{ minWidth: "115px" }}>
              <span>⭐</span> Elegidas ({fotos.filter((f) => f.seleccionada).length})
            </button>
            <button
              onClick={() => setFiltroElegidas("con_nota")}
              className={`px-4 h-8 rounded text-[11px] tracking-wider uppercase font-bold flex items-center justify-center gap-1.5 transition-all whitespace-nowrap ${filtroElegidas === "con_nota" ? "bg-amber-500/10 text-amber-400" : "text-gray-400 hover:text-gray-300"}`}
              style={{ minWidth: "105px" }}>
              <span>💬</span> Notas ({fotos.filter((f) => f.comentario).length})
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto justify-start md:justify-end">
          {fotos.some((f) => f.seleccionada) && (
            <button
              onClick={handleCopiarNombres}
              className={`w-full sm:w-auto px-4 h-10 rounded-md border text-[11px] font-bold tracking-wider uppercase transition-all flex items-center justify-center gap-2 whitespace-nowrap ${copiado ? "bg-[#ff4d00] text-black border-[#ff4d00]" : "border-[#ff4d00]/30 bg-[#ff4d00]/5 text-[#ff4d00] hover:bg-[#ff4d00]/10"}`}>
              <span>📋</span> {copiado ? "¡Copiado!" : "Copiar para Lightroom"}
            </button>
          )}

          <div className="flex gap-2 w-full sm:w-auto flex-1 sm:flex-none">
            {selectedFotos.length > 0 ? (
              <>
                <button
                  onClick={() => setSelectedFotos([])}
                  className="flex-1 sm:flex-none h-10 rounded-md bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 text-[11px] font-bold tracking-wider uppercase px-4 whitespace-nowrap">
                  Cancelar ({selectedFotos.length})
                </button>
                <button
                  onClick={abrirConfirmacionMasiva}
                  className="flex-1 sm:flex-none h-10 rounded-md bg-red-950/20 border border-red-500/30 text-red-400 hover:bg-red-900/30 text-[11px] font-bold tracking-wider uppercase px-4 flex items-center justify-center gap-1.5">
                  <span>🗑️</span> Borrar
                </button>
              </>
            ) : (
              <button
                onClick={() => setSelectedFotos(fotosFiltradas.map((f) => f.id))}
                className="w-full sm:w-auto h-10 rounded-md bg-white/[0.02] border border-white/5 text-gray-400 hover:text-white text-[11px] font-bold tracking-wider uppercase px-5 transition-all whitespace-nowrap text-center">
                Marcar Todo
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
