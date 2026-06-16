export default function StatCard({ label, value, isHighlight = false }) {
  return (
    <div className="bg-[#09171d] border border-white/5 p-6 space-y-2">
      <span className="text-xs tracking-widest text-gray-400 uppercase font-light">{label}</span>
      <p className={`text-4xl font-semibold font-mono ${isHighlight ? "text-[#ff4d00]" : "text-white"}`}>{value}</p>
    </div>
  );
}
