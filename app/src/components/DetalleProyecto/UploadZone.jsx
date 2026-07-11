/* ========================================================================= */
/* Proyecto: PhocuSync SaaS Portal                                           */
/* Componente: UploadZone.jsx                                                */
/* Descripción: Panel interactivo de carga multimedia con soporte para       */
/*              Drag and Drop, estados de carga y pre-procesamiento.         */
/* ========================================================================= */

export default function UploadZone({ uploading, isDragActive, handleDrag, handleDrop, procesarYSubirArchivos }) {
  return (
    // ESTRATEGIA DE LAYOUT: Ocupa una columna en pantallas grandes y se ajusta a su
    // propio contenido ('h-fit') para no estirarse innecesariamente en cuadrículas asimétricas.
    <div className="lg:col-span-1 bg-[#09171d] border border-white/5 p-6 space-y-6 h-fit">
      <div>
        <h3 className="text-sm font-medium text-white uppercase tracking-wider">Cargar Fotografías</h3>
        <p className="text-xs text-gray-400 font-light mt-1">Sube los archivos para la revisión del cliente.</p>
      </div>

      {/* CONTENEDOR INTERACTIVO: El uso de <label> transfiere automáticamente el evento de click al input oculto */}
      <label
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        // EVALUACIÓN DINÁMICA DE CLASES:
        // 1. Estado Uploading: Opacidad reducida y cursor bloqueado.
        // 2. Estado DragActive: Borde de marca, fondo tintado y micro-escala reactiva.
        // 3. Estado Reposo: Borde sutil con hover suave hacia el color corporativo.
        className={`border border-dashed flex flex-col items-center justify-center p-8 text-center cursor-pointer space-y-3 bg-[#061115]/50 transition-all min-h-[180px] ${
          uploading
            ? "border-gray-600 opacity-50 cursor-not-allowed"
            : isDragActive
              ? "border-[#ff4d00] bg-[#ff4d00]/5 scale-[1.02]"
              : "border-white/10 hover:border-[#ff4d00]/50"
        }`}>
        {/* Cambia dinámicamente el indicador visual (Emoji) según el ciclo de vida de la subida */}
        <span className="text-2xl block">{uploading ? "⏳" : "📤"}</span>

        {/* Renderizado condicional del texto para guiar al usuario en tiempo real */}
        <p className="text-xs text-gray-300 font-light">
          {uploading ? (
            "Optimizando y subiendo..."
          ) : isDragActive ? (
            "¡Suéltalas aquí!"
          ) : (
            <>
              Arrastra tus fotos aquí o <span className="text-[#ff4d00] underline">explora archivos</span>
            </>
          )}
        </p>

        {/* Input de sistema oculto pero completamente funcional de fondo */}
        <input
          type="file"
          multiple
          accept="image/*" // Restringe nativamente la ventana de exploración solo a imágenes
          disabled={uploading} // Evita colisiones de peticiones concurrentes si el proceso ya inició
          // Convierte el FileList en un Array real antes de enviarlo a la capa de procesamiento/Supabase
          onChange={(e) => procesarYSubirArchivos(Array.from(e.target.files))}
          className="hidden"
        />
      </label>

      {/* 💡 AVISO INFORMATIVO (DISCLAIMER): Guía al fotógrafo sobre el flujo de reemplazo automático */}
      <div className="bg-[#061115]/60 border border-white/5 p-4 rounded-sm space-y-1.5">
        <div className="flex items-center gap-1.5 text-[#ff4d00]">
          <span className="text-xs">💡</span>
          <h4 className="text-[11px] font-semibold uppercase tracking-wider">Tip de Reemplazo</h4>
        </div>
        <p className="text-[11px] text-gray-400 font-light leading-relaxed">
          Para reemplazar fotos existentes en vez de crear duplicados, asegúrate de que los archivos editados conserven
          el <span className="text-gray-200 font-medium">mismo nombre original</span> o terminen en sufijos como{" "}
          <span className="text-[#ff4d00] font-mono">_editada</span>,{" "}
          <span className="text-[#ff4d00] font-mono">_final</span> o{" "}
          <span className="text-[#ff4d00] font-mono">_edit</span>.
        </p>
      </div>
    </div>
  );
}
