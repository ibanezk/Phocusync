import { useParams, useNavigate } from "react-router-dom";
import useDetalleProyecto from "../hooks/useDetalleProyecto";
import HeaderProyecto from "../components/DetalleProyecto/HeaderDetalleProyecto";
import UploadZone from "../components/DetalleProyecto/UploadZone";
import ControlesCarrete from "../components/DetalleProyecto/ControlesCarrete";
import FotoGrid from "../components/DetalleProyecto/FotoGrid";
import ModalesProyecto from "../components/DetalleProyecto/ModalesProyecto";

export default function DetalleProyecto() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Extraemos toda la lógica desde nuestro Custom Hook
  const { state, actions, refs } = useDetalleProyecto(id, navigate);

  if (state.loading) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0c1f27] backdrop-blur-md p-4">
        <p className="text-[18px] uppercase font-bold tracking-widest text-gray-200 font-mono">
          Cargando tu galería...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#061115] text-[#e2e8f0] font-sans p-6 md:p-10 space-y-10">
      <HeaderProyecto
        proyecto={state.proyecto}
        navigate={navigate}
        setModalEliminarProyecto={actions.setModalEliminarProyecto}
        setModalCompartir={actions.setModalCompartir}
      />

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <UploadZone
          uploading={state.uploading}
          isDragActive={state.isDragActive}
          handleDrag={actions.handleDrag}
          handleDrop={actions.handleDrop}
          procesarYSubirArchivos={actions.procesarYSubirArchivos}
        />

        <div className="lg:col-span-2 bg-[#09171d] border border-white/5 p-6 space-y-4">
          <ControlesCarrete
            fotos={state.fotos}
            fotosFiltradas={state.fotosFiltradas}
            filtroElegidas={state.filtroElegidas}
            setFiltroElegidas={actions.setFiltroElegidas}
            selectedFotos={state.selectedFotos}
            setSelectedFotos={actions.setSelectedFotos}
            handleCopiarNombres={actions.handleCopiarNombres}
            copiado={state.copiado}
            abrirConfirmacionMasiva={actions.abrirConfirmacionMasiva}
          />

          <FotoGrid
            fotosMostradas={state.fotosMostradas}
            fotosFiltradas={state.fotosFiltradas}
            fotosVisibles={state.fotosVisibles}
            filtroElegidas={state.filtroElegidas}
            selectedFotos={state.selectedFotos}
            handleSelectFoto={actions.handleSelectFoto}
            setModalComentario={actions.setModalComentario}
            ultimaFotoRef={refs.ultimaFotoRef}
          />
        </div>
      </section>

      <ModalesProyecto
        modalEliminar={state.modalEliminar}
        setModalEliminar={actions.setModalEliminar}
        ejecutarEliminarFoto={actions.ejecutarEliminarFoto}
        modalEliminarMasivo={state.modalEliminarMasivo}
        setModalEliminarMasivo={actions.setModalEliminarMasivo}
        ejecutarEliminarMasivo={actions.ejecutarEliminarMasivo}
        modalEliminarProyecto={state.modalEliminarProyecto}
        setModalEliminarProyecto={actions.setModalEliminarProyecto}
        ejecutarEliminarProyecto={actions.ejecutarEliminarProyecto}
        proyecto={state.proyecto}
        selectedFotos={state.selectedFotos}
        modalComentario={state.modalComentario}
        setModalComentario={actions.setModalComentario}
        modalCompartir={state.modalCompartir}
        setModalCompartir={actions.setModalCompartir}
        urlPublica={state.urlPublica}
        enlaceCopiado={state.enlaceCopiado}
        handleCopiarEnlaceCompartir={actions.handleCopiarEnlaceCompartir}
      />
    </div>
  );
}
