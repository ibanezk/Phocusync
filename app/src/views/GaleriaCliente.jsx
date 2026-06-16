import React from "react";
import useGaleriaCliente from "../hooks/useGaleriaCliente";
import AvisoNuevasFotos from "../components/GaleriaCliente/AvisoNuevasFotos";
import HeaderGaleria from "../components/GaleriaCliente/HeaderGaleria";
import VisorFotos from "../components/GaleriaCliente/VisorFotos";
import PanelLateral from "../components/GaleriaCliente/PanelLateral";
import ModalExito from "../components/GaleriaCliente/ModalExito";
import ModalConfirmacion from "../components/GaleriaCliente/ModalConfirmacion";
import LoaderCargando from "../components/GaleriaCliente/LoaderCargando";

export default function GaleriaCliente() {
  const {
    proyecto,
    fotos,
    loading,
    currentIndex,
    comentarioLocal,
    enviando,
    seleccionGuardada,
    mostrarExitoCliente,
    modalConfirmarEnvio,
    enviandoDatos,
    avisoNuevasFotos,
    favoritas,
    fotoActual,
    esFavorita,
    setComentarioLocal,
    setMostrarExitoCliente,
    setModalConfirmarEnvio,
    navegarIzquierda,
    navegarDerecha,
    handleToggleFavorita,
    guardarComentarioEnBD,
    abrirPreguntaEnvio,
    handleEnviarSeleccion,
    manejarTouchStart,
    manejarTouchMove,
    manejarTouchEnd,
  } = useGaleriaCliente();

  if (loading) {
    return <LoaderCargando mensaje="Cargando tu galería privada..." />;
  }

  if (!proyecto || fotos.length === 0) {
    return (
      <div className="min-h-screen bg-[#061115] flex items-center justify-center text-gray-500 text-xs font-light">
        No hay imágenes disponibles para esta galería.
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-[#061115] text-[#e2e8f0] font-sans flex flex-col overflow-hidden relative">
      {/* Cartelito flotante de aviso con auto-cierre */}
      {avisoNuevasFotos && <AvisoNuevasFotos />}

      {/* HEADER */}
      <HeaderGaleria
        proyecto={proyecto}
        favoritasCount={favoritas.length}
        fotosCount={fotos.length}
        seleccionGuardada={seleccionGuardada}
        enviando={enviando}
        abrirPreguntaEnvio={abrirPreguntaEnvio}
      />

      {/* CONTENIDO */}
      <div className="w-full h-screen flex flex-col md:flex-row overflow-y-auto md:overflow-hidden">
        {/* CONTENEDOR GENERAL DE LA IZQUIERDA (CARRUSEL COMPLETO) */}
        <VisorFotos
          fotoActual={fotoActual}
          currentIndex={currentIndex}
          fotosCount={fotos.length}
          navegarIzquierda={navegarIzquierda}
          navegarDerecha={navegarDerecha}
          manejarTouchStart={manejarTouchStart}
          manejarTouchMove={manejarTouchMove}
          manejarTouchEnd={manejarTouchEnd}
        />

        {/* PANEL LATERAL */}
        <PanelLateral
          fotoActual={fotoActual}
          seleccionGuardada={seleccionGuardada}
          esFavorita={esFavorita}
          handleToggleFavorita={handleToggleFavorita}
          comentarioLocal={comentarioLocal}
          setComentarioLocal={setComentarioLocal}
          guardarComentarioEnBD={guardarComentarioEnBD}
        />
      </div>

      {/* MODAL: ÉXITO */}
      <ModalExito mostrar={mostrarExitoCliente} onClose={() => setMostrarExitoCliente(false)} />

      {/* MODAL: ADVERTENCIA */}
      <ModalConfirmacion
        mostrar={modalConfirmarEnvio}
        favoritasCount={favoritas.length}
        onClose={() => setModalConfirmarEnvio(false)}
        onConfirm={handleEnviarSeleccion}
      />

      {/* LOADER DE ENVÍO */}
      {enviandoDatos && (
        <LoaderCargando
          mensaje="Enviando selección..."
          submensaje="Guardando tus cambios de forma segura"
          isOverlay={true}
        />
      )}
    </div>
  );
}
