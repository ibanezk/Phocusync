import { useNavigate } from "react-router-dom";

export default function ModalAlmacenamiento({ modalAlmacenamiento, setModalAlmacenamiento, setModalPlanes }) {
  const navigate = useNavigate();
  if (!modalAlmacenamiento?.isOpen) return null;

  const handleAbrirPlanes = () => {
    setModalAlmacenamiento({ ...modalAlmacenamiento, isOpen: false }); // Cierra este modal
    setModalPlanes({ isOpen: true }); // Abre el modal de planes
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-[#09171d] border border-white/10 text-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
        {/* Ícono de advertencia */}
        <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 mx-auto">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        {/* Textos principales */}
        <div className="text-center space-y-1">
          <h3 className="text-xl font-bold text-white tracking-tight">Límite de Almacenamiento Alcanzado</h3>
          <p className="text-sm text-slate-400">
            No tienes suficiente espacio en tu cuenta para subir este lote de fotos.
          </p>
        </div>

        {/* Tarjeta con desglose de espacio */}
        <div className="bg-[#061115] border border-white/5 rounded-xl p-4 space-y-2 text-sm">
          <div className="flex justify-between items-center text-slate-300">
            <span>Espacio disponible:</span>
            <span className="font-semibold text-emerald-400">{modalAlmacenamiento.disponibleMB} MB</span>
          </div>
          <div className="flex justify-between items-center text-slate-300">
            <span>Fotos a subir:</span>
            <span className="font-semibold text-amber-400">{modalAlmacenamiento.requeridoMB} MB</span>
          </div>
        </div>

        {/* Botones */}
        <div className="flex flex-col gap-2 pt-2">
          <button
            onClick={handleAbrirPlanes}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition-all shadow-lg shadow-indigo-600/30 text-sm">
            Mejorar mi plan
          </button>
          <button
            onClick={() => setModalAlmacenamiento({ ...modalAlmacenamiento, isOpen: false })}
            className="w-full py-2.5 px-4 bg-transparent hover:bg-white/5 text-slate-400 hover:text-white font-medium rounded-xl transition-colors text-sm">
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
