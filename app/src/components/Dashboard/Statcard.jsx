/* ========================================================================= */
/* Proyecto: PhocuSync SaaS Portal                                           */
/* Componente: StatCard.jsx                                                  */
/* Propósito: Tarjeta de métrica reutilizable (átomo) para mostrar KPIs.      */
/* ========================================================================= */

export default function StatCard({ label, value, isHighlight = false }) {
  return (
    <div className="bg-[#09171d] border border-white/5 p-6 space-y-2">
      {/* Etiqueta descriptiva superior de la métrica */}
      <span className="text-xs tracking-widest text-gray-400 uppercase font-light">{label}</span>

      {/* Valor cuantificable con tipografía monoespaciada y color condicional según desees resaltar */}
      <p className={`text-2xl font-semibold font-mono ${isHighlight ? "text-[#ff4d00]" : "text-white"}`}>{value}</p>
    </div>
  );
}
