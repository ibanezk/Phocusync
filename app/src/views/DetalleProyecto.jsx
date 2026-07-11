import { useParams, useNavigate } from "react-router-dom";
import useDetalleProyecto from "../hooks/useDetalleProyecto";
import { usePermitirDescarga } from "../hooks/usePermitirDescarga";
import { useAjustesProyecto } from "../hooks/useSeleccionMarcaAgua";
import HeaderProyecto from "../components/DetalleProyecto/HeaderDetalleProyecto";
import UploadZone from "../components/DetalleProyecto/UploadZone";
import ControlesCarrete from "../components/DetalleProyecto/ControlesCarrete";
import FotoGrid from "../components/DetalleProyecto/FotoGrid";
import ModalesProyecto from "../components/DetalleProyecto/ModalesProyecto";
import LoaderCargando from "../components/GaleriaCliente/LoaderCargando";

export default function DetalleProyecto() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Extraemos toda la lógica desde nuestro Custom Hook principal
  const { state, actions, refs } = useDetalleProyecto(id, navigate);

  // Hook existente para descargas por lote
  const { permitirDescarga, guardandoDescarga, handleToggleDescarga } = usePermitirDescarga(
    id,
    state.proyecto?.permitir_descarga,
  );

  // Conexión del nuevo mini-hook para controlar límites y marca de agua de este proyecto
  const { limiteSelecciones, forzarMarcaAgua, guardandoAjustes, actualizarAjuste } = useAjustesProyecto(
    id,
    state.proyecto,
  );

  if (state.loading) {
    return (
      <LoaderCargando
        mensaje="Cargando tu galería..."
        submensaje="Preparando tus fotografías y optimizando la visualización."
        isOverlay={false}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#061115] text-[#e2e8f0] font-sans p-6 md:p-10 space-y-10">
      <HeaderProyecto
        proyecto={state.proyecto}
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
          {/* PROPS ENRIQUECIDOS: Ahora pasamos los nuevos ajustes a ControlesCarrete */}
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
            permitirDescargas={permitirDescarga}
            handleToggleDescargas={handleToggleDescarga}
            guardandoDescarga={guardandoDescarga}
            limiteSelecciones={limiteSelecciones}
            forzarMarcaAgua={forzarMarcaAgua}
            guardandoAjustes={guardandoAjustes}
            actualizarAjuste={actualizarAjuste}
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
