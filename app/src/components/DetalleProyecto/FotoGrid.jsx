import { motion, AnimatePresence } from "framer-motion";

export default function FotoGrid({
  fotosMostradas,
  fotosFiltradas,
  fotosVisibles,
  filtroElegidas,
  selectedFotos,
  handleSelectFoto,
  setModalComentario,
  ultimaFotoRef,
}) {
  if (fotosMostradas.length === 0) {
    return (
      <div className="text-center text-gray-500 text-xs py-20 font-light border border-white/5 bg-[#09171d]/20">
        {filtroElegidas === "seleccionadas"
          ? "El cliente aún no ha marcado ninguna foto como favorita."
          : filtroElegidas === "con_nota"
            ? "Ninguna foto tiene indicaciones de retoque todavía."
            : "No hay fotos en este carrete."}
      </div>
    );
  }

  return (
    <>
      <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {fotosMostradas.map((foto) => {
            const isSelected = selectedFotos.includes(foto.id);
            return (
              <motion.div
                key={foto.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                className={`group aspect-[2/3] bg-[#09171d] border relative overflow-hidden flex flex-col justify-between transition-all duration-200 ${isSelected ? "border-[#ff4d00]" : "border-white/5 hover:border-white/20"}`}>
                <img
                  src={foto.url}
                  alt={foto.nombre_archivo}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop";
                    e.target.style.opacity = "0.2";
                  }}
                />

                {foto.seleccionada && (
                  <div className="absolute top-3 left-3 bg-[#ff4d00] text-black text-[9px] font-black tracking-widest uppercase px-2 py-1 shadow-lg z-10">
                    ⭐ Elegida
                  </div>
                )}

                {foto.comentario && (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setModalComentario({ isOpen: true, text: foto.comentario, fotoUrl: foto.url });
                    }}
                    className="absolute bottom-0 inset-x-0 bg-black/95 border-t border-t-amber-500/30 p-3.5 z-20 cursor-pointer">
                    <div className="flex flex-col mb-1.5">
                      <span className="text-[10px] uppercase tracking-wider text-amber-400 font-bold">
                        Nota del cliente:
                      </span>
                      <span className="text-gray-500 text-[12px] font-mono">➔ Ver nota completa</span>
                    </div>
                    <p className="text-xs text-gray-300 font-light italic line-clamp-1">"{foto.comentario}"</p>
                  </div>
                )}

                <div
                  onClick={() => handleSelectFoto(foto.id)}
                  className={`absolute inset-0 bg-black/40 transition-opacity cursor-pointer flex items-start justify-end p-3 ${isSelected ? "opacity-100 bg-[#ff4d00]/10" : "opacity-0 group-hover:opacity-100"}`}>
                  <div
                    className={`w-5 h-5 border flex items-center justify-center text-[10px] ${isSelected ? "bg-[#ff4d00] border-[#ff4d00] text-white" : "bg-black/60 border-white/30 text-transparent"}`}>
                    {isSelected ? "✓" : ""}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {fotosVisibles < fotosFiltradas.length && (
        <div ref={ultimaFotoRef} className="w-full flex justify-center py-6">
          <p className="text-[10px] tracking-widest text-gray-500 font-mono uppercase animate-pulse">
            Cargando más capturas...
          </p>
        </div>
      )}
    </>
  );
}
