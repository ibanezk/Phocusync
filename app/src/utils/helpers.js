/* ========================================================================= */
/* Utilidad: obtenerEstiloEstado                                             */
/* Descripción: Función pura que mapea los estados comerciales de un         */
/*              proyecto con sus respectivas clases de diseño en Tailwind.   */
/* ========================================================================= */

export const obtenerEstiloEstado = (estado) => {
  // --- CLÁUSULA DE SALVAGUARDA (Guard Clause) ---
  // Si el estado es undefined, null o una cadena vacía, retorna el estilo neutral por defecto
  if (!estado) return "border-gray-500/20 text-gray-400 bg-gray-500/5";

  // Normaliza el texto a minúsculas para prevenir errores de coincidencia por mayúsculas
  switch (estado.toLowerCase()) {
    // Estado: Galería aprobada y finalizada por el cliente
    case "aprobado":
      return "border-[#00ff88]/20 text-[#00ff88] bg-[#00ff88]/5";

    // Estado: El cliente está interactuando, seleccionando o dejando notas
    case "en revisión":
      return "border-amber-400/20 text-amber-400 bg-amber-500/10";

    // Estado: Creado recientemente por el fotógrafo, aún sin publicar
    case "borrador":
      return "border-blue-400/20 text-blue-400 bg-blue-400/5";

    // --- CONTROL DE ERRORES (Fallback) ---
    // Si la base de datos devuelve un estado desconocido, se asume el estilo gris neutral
    default:
      return "border-gray-500/20 text-gray-400 bg-gray-500/5";
  }
};
