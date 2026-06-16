export const obtenerEstiloEstado = (estado) => {
  if (!estado) return "border-gray-500/20 text-gray-400 bg-gray-500/5";
  switch (estado.toLowerCase()) {
    case "aprobado":
      return "border-[#00ff88]/20 text-[#00ff88] bg-[#00ff88]/5";
    case "en revisión":
    case "en revision":
      return "border-amber-400/20 text-amber-400 bg-amber-500/10";
    case "borrador":
      return "border-blue-400/20 text-blue-400 bg-blue-400/5";
    default:
      return "border-gray-500/20 text-gray-400 bg-gray-500/5";
  }
};
