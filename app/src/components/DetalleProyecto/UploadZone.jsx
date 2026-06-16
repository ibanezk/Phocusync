export default function UploadZone({ uploading, isDragActive, handleDrag, handleDrop, procesarYSubirArchivos }) {
  return (
    <div className="lg:col-span-1 bg-[#09171d] border border-white/5 p-6 space-y-6 h-fit">
      <div>
        <h3 className="text-sm font-medium text-white uppercase tracking-wider">Cargar Fotografías</h3>
        <p className="text-xs text-gray-400 font-light mt-1">Sube los archivos para la revisión del cliente.</p>
      </div>

      <label
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`border border-dashed flex flex-col items-center justify-center p-8 text-center cursor-pointer space-y-3 bg-[#061115]/50 transition-all min-h-[180px] ${uploading ? "border-gray-600 opacity-50 cursor-not-allowed" : isDragActive ? "border-[#ff4d00] bg-[#ff4d00]/5 scale-[1.02]" : "border-white/10 hover:border-[#ff4d00]/50"}`}>
        <span className="text-2xl block">{uploading ? "⏳" : "📤"}</span>
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
        <input
          type="file"
          multiple
          accept="image/*"
          disabled={uploading}
          onChange={(e) => procesarYSubirArchivos(Array.from(e.target.files))}
          className="hidden"
        />
      </label>
    </div>
  );
}
