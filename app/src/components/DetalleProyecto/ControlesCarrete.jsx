// 📁 src/components/AjustesProyecto/ControlesCarrete.jsx
import React from "react";
import ToggleDescargas from "./ToggleDescargas";

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
  permitirDescargas,
  handleToggleDescargas,
  guardandoDescarga,
  limiteSelecciones,
  forzarMarcaAgua,
  guardandoAjustes,
  actualizarAjuste,
}) {
  const tieneElegidas = fotos.some((f) => f.seleccionada);

  return (
    <div className="w-full bg-[#040b0d]/50 border border-white/5 p-4 md:p-5 rounded-sm flex flex-col gap-5 select-none">
      {/* ─── FILA 1: ENCABEZADO Y METRICAS ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#ff4d00]" />
          <h2 className="text-xs font-bold tracking-widest uppercase text-white">Carrete del Proyecto</h2>
        </div>
        <p className="text-[10px] text-gray-500 font-mono tracking-wider">
          {fotosFiltradas.length} / {fotos.length} MOSTRADAS (
          {(fotos.reduce((acc, f) => acc + (f.size || 0), 0) / (1024 * 1024)).toFixed(2)} MB)
        </p>
      </div>

      {/* ─── FILA 2: FILTROS DE VISTA (TABS) ─── */}
      <div className="w-full flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        {/* Selector de Filtros */}
        <div className="bg-[#061115] border border-white/5 p-1 rounded-sm flex gap-1 w-full sm:w-auto overflow-x-auto scrollbar-none">
          <button
            onClick={() => setFiltroElegidas("todas")}
            className={`flex-1 sm:flex-none px-4 py-1.5 rounded-sm text-[11px] font-bold tracking-wider uppercase transition-all whitespace-nowrap ${
              filtroElegidas === "todas" ? "bg-white/10 text-white" : "text-gray-400 hover:text-white"
            }`}>
            Todas ({fotos.length})
          </button>
          <button
            onClick={() => setFiltroElegidas("seleccionadas")}
            className={`flex-1 sm:flex-none px-4 py-1.5 rounded-sm text-[11px] font-bold tracking-wider uppercase flex items-center justify-center gap-1.5 transition-all whitespace-nowrap ${
              filtroElegidas === "seleccionadas"
                ? "bg-[#ff4d00]/10 text-[#ff4d00]"
                : "text-gray-400 hover:text-gray-200"
            }`}>
            ⭐ Elegidas ({fotos.filter((f) => f.seleccionada).length})
          </button>
          <button
            onClick={() => setFiltroElegidas("con_nota")}
            className={`flex-1 sm:flex-none px-4 py-1.5 rounded-sm text-[11px] font-bold tracking-wider uppercase flex items-center justify-center gap-1.5 transition-all whitespace-nowrap ${
              filtroElegidas === "con_nota" ? "bg-amber-500/10 text-amber-400" : "text-gray-400 hover:text-gray-200"
            }`}>
            💬 Notas ({fotos.filter((f) => f.comentario).length})
          </button>
        </div>

        {/* Acción de Selección Masiva Local (Marcar todo / Cancelar) */}
        <div className="w-full sm:w-auto shrink-0">
          {selectedFotos.length > 0 ? (
            <div className="flex gap-2 w-full justify-end">
              <button
                onClick={() => setSelectedFotos([])}
                className="px-3 h-8 text-[11px] font-bold uppercase tracking-wider text-gray-400 bg-white/5 hover:bg-white/10 rounded-sm border border-white/5 transition-colors">
                Cancelar ({selectedFotos.length})
              </button>
              <button
                onClick={abrirConfirmacionMasiva}
                className="px-3 h-8 text-[11px] font-bold uppercase tracking-wider text-red-400 bg-red-950/20 hover:bg-red-900/30 rounded-sm border border-red-500/20 flex items-center gap-1.5 transition-colors">
                🗑️ Borrar
              </button>
            </div>
          ) : (
            <button
              onClick={() => setSelectedFotos(fotosFiltradas.map((f) => f.id))}
              className="w-full sm:w-auto px-4 h-8 text-[11px] font-bold uppercase tracking-wider text-gray-400 hover:text-white bg-[#061115] border border-white/5 hover:border-white/10 rounded-sm transition-all">
              Marcar todo el lote
            </button>
          )}
        </div>
      </div>

      {/* ─── FILA 3: GRID DE REGLAS Y ACCIONES DE FLUJO ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-2 border-t border-white/5 w-full">
        {/* BLOQUE IZQUIERDO: REGLAS DE LA GALERÍA (8 Columnas en Desktop) */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col sm:flex-row flex-wrap items-center gap-2.5 w-full">
          {/* Regla 1: Descargas */}
          <div className="w-full sm:w-auto shrink-0">
            <ToggleDescargas
              permitirDescargas={permitirDescargas}
              onToggle={handleToggleDescargas}
              disabled={guardandoDescarga}
            />
          </div>

          {/* Regla 2: Marca de Agua */}
          <button
            onClick={() => actualizarAjuste("forzar_marca_agua", !forzarMarcaAgua)}
            disabled={guardandoAjustes}
            className={`w-full sm:w-auto px-4 h-10 rounded-sm border text-[11px] font-bold tracking-wider uppercase transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${
              forzarMarcaAgua
                ? "border-[#ff4d00]/30 bg-[#ff4d00]/5 text-[#ff4d00] shadow-[0_0_15px_rgba(255,77,0,0.03)]"
                : "border-white/5 bg-[#061115] text-gray-400 hover:text-white"
            }`}>
            Marca de agua:{" "}
            <span className={forzarMarcaAgua ? "text-white" : "text-gray-500"}>
              {forzarMarcaAgua ? "Activa" : "Desactivada"}
            </span>
          </button>

          {/* Regla 3: Límite Numérico */}
          <div className="flex items-center justify-center gap-2.5 bg-[#061115] border border-white/5 h-10 px-4 rounded-sm text-[11px] font-bold tracking-wider uppercase text-gray-400 w-full sm:w-auto focus-within:border-white/10 transition-colors">
            <span>Límite:</span>
            <input
              type="number"
              min="1"
              disabled={guardandoAjustes}
              defaultValue={limiteSelecciones}
              key={limiteSelecciones}
              onBlur={(e) => {
                const valorEntero = parseInt(e.target.value, 10);
                if (!isNaN(valorEntero) && valorEntero !== limiteSelecciones) {
                  actualizarAjuste("limite_selecciones", valorEntero);
                }
              }}
              className="bg-transparent text-white font-mono w-8 text-center focus:outline-none border-b border-white/10 focus:border-[#ff4d00] transition-colors p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none disabled:opacity-50"
            />
            <span className="text-gray-500 lowercase font-light">fotos</span>
          </div>
        </div>

        {/* BLOQUE DERECHO: DISPARADOR PRINCIPAL (5 Columnas en Desktop) */}
        <div className="lg:col-span-5 xl:col-span-4 flex items-center justify-end w-full">
          {tieneElegidas ? (
            <button
              onClick={handleCopiarNombres}
              className={`w-full lg:w-auto px-6 h-10 rounded-sm text-[11px] font-bold tracking-wider uppercase transition-all flex items-center justify-center gap-2 active:scale-[0.99] shadow-md ${
                copiado
                  ? "bg-emerald-600 text-white shadow-emerald-950/20"
                  : "bg-[#ff4d00] hover:bg-[#e04400] text-white shadow-[#ff4d00]/10"
              }`}>
              <span>{copiado ? "✓" : "📋"}</span>
              {copiado ? "¡Copiado con éxito!" : "Copiar para Lightroom"}
            </button>
          ) : (
            <div className="text-[10px] text-gray-500 font-medium italic tracking-wide text-center lg:text-right w-full py-2">
              El cliente aún no ha seleccionado fotos.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
