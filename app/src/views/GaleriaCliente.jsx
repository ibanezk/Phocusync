/* ========================================================================= */
/* Proyecto: PhocuSync SaaS Portal                                           */
/* Componente: GaleriaCliente.jsx                                            */
/* Descripción: Vista pública interactiva para el cliente final.             */
/*              Orquesta la preselección de favoritos, gestión de notas      */
/*              de retoque y descargas por lote protegidas.                  */
/* ========================================================================= */

import React from "react";
import useGaleriaCliente from "../hooks/useGaleriaCliente";
import AvisoNuevasFotos from "../components/GaleriaCliente/AvisoNuevasFotos";
import HeaderGaleria from "../components/GaleriaCliente/HeaderGaleria";
import VisorFotos from "../components/GaleriaCliente/VisorFotos";
import PanelLateral from "../components/GaleriaCliente/PanelLateral";
import ModalExito from "../components/GaleriaCliente/ModalExito";
import ModalConfirmacion from "../components/GaleriaCliente/ModalConfirmacion";
import LoaderCargando from "../components/GaleriaCliente/LoaderCargando";
import { AnimatePresence, motion } from "framer-motion";
import { useDescargarSeleccion } from "../hooks/useDescargaSeleccion";

export default function GaleriaCliente() {
  // ABSTRACCIÓN DE LÓGICA COGNITIVA: Se extrae todo el estado y los listeners
  // a un hook personalizado, aislando la lógica de negocio de la UI.
  const {
    proyecto,
    fotos,
    perfilFotografo,
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
    alerta,
  } = useGaleriaCliente();

  // GANCHO DE SERVICIO ASÍNCRONO: Orquesta la preparación de los archivos blob en memoria
  const { descargando, progreso, ejecutarDescargaLote } = useDescargarSeleccion();

  // CLÁUSULA DE SALVAGUARDA 1: Estado de carga global (Bloqueante inicial)
  if (loading) {
    return <LoaderCargando mensaje="Cargando tu galería privada..." />;
  }

  // CLÁUSULA DE SALVAGUARDA 2: Control de consistencia en caso de URLs inválidas o sin contenido
  if (!proyecto || fotos.length === 0) {
    return (
      <div className="min-h-screen bg-[#061115] flex items-center justify-center text-gray-500 text-xs font-light">
        No hay imágenes disponibles para esta galería.
      </div>
    );
  }

  return (
    // CONTENEDOR ENTORNO APLICACIÓN: Control rígido del viewport ('h-screen overflow-hidden')
    // para emular el comportamiento de una herramienta SPA de escritorio.
    <div className="w-full h-screen bg-[#061115] text-[#e2e8f0] font-sans flex flex-col overflow-hidden relative">
      {/* Notificación persistente con lógica de auto-cierre interna */}
      {avisoNuevasFotos && <AvisoNuevasFotos />}

      {/* CABECERA CONTEXTUAL */}
      <HeaderGaleria
        proyecto={proyecto}
        favoritasCount={favoritas.length}
        fotosCount={fotos.length}
        seleccionGuardada={seleccionGuardada}
        enviando={enviando}
        abrirPreguntaEnvio={abrirPreguntaEnvio}
      />

      {/* BANNER DINÁMICO DE COMPRESIÓN MULTIMEDIA (.ZIP) */}
      {/* Condicionado por la configuración de privilegios del proyecto administrada desde Supabase */}
      <AnimatePresence>
        {proyecto?.permitir_descarga && favoritas.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="flex items-center justify-between p-4 bg-[#ff4d00]/10 border border-[#ff4d00]/20 rounded-sm mx-6 mt-4 shrink-0 z-10">
            <div>
              <p className="text-xs font-medium text-white">
                {descargando ? `⏳ ${progreso}` : "¡Tu selección está lista!"}
              </p>
              <p className="text-[11px] text-gray-400">
                {descargando
                  ? "Por favor, mantén esta pestaña abierta hasta completar la descarga."
                  : `Tienes ${favoritas.length} fotos listas para bajar juntas en un archivo comprimido .ZIP`}
              </p>
            </div>

            <button
              disabled={descargando}
              onClick={() => ejecutarDescargaLote(proyecto, favoritas, fotos)}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider text-white rounded-sm transition-colors ${
                descargando ? "bg-gray-700 cursor-not-allowed" : "bg-[#ff4d00] hover:bg-[#e04400]"
              }`}>
              {descargando ? "Procesando..." : `Descargar .ZIP (${favoritas.length})`}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ÁREA DE TRABAJO SPLIT: Divide el espacio en dos columnas adaptables según dispositivo (Móvil vs Desktop) */}
      <div className="w-full flex-1 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden">
        {/* COLUMNA 1: ESPACIO DE VISUALIZACIÓN MULTIMEDIA (CARRUSEL PRINCIPAL) */}
        {/* Implementa inyección dinámica de marcas de agua según directivas comerciales */}
        <VisorFotos
          fotoActual={fotoActual}
          currentIndex={currentIndex}
          fotosCount={fotos.length}
          navegarIzquierda={navegarIzquierda}
          navegarDerecha={navegarDerecha}
          manejarTouchStart={manejarTouchStart}
          manejarTouchMove={manejarTouchMove}
          manejarTouchEnd={manejarTouchEnd}
          perfilFotografo={perfilFotografo}
          textoMarcaAgua={perfilFotografo?.marca_agua || perfilFotografo?.nombre_estudio || "PhocuSync"}
          forzar_marca_agua={proyecto?.forzar_marca_agua}
          permitirDescarga={proyecto?.permitir_descarga}
          esFavorita={esFavorita}
        />

        {/* COLUMNA 2: CONSOLA DE INTERACCIÓN LATERAL */}
        {/* Concentra los triggers para mutar favoritos y despachar strings de comentarios */}
        {!proyecto?.permitir_descarga && (
          <PanelLateral
            fotoActual={fotoActual}
            seleccionGuardada={seleccionGuardada}
            esFavorita={esFavorita}
            handleToggleFavorita={handleToggleFavorita}
            comentarioLocal={comentarioLocal}
            setComentarioLocal={setComentarioLocal}
            guardarComentarioEnBD={guardarComentarioEnBD}
          />
        )}
      </div>

      {/* FOOTER CORPORATIVO/CRÉDITOS */}
      <footer className="w-full py-4 border-t border-white/5 bg-[#040b0d] flex flex-col sm:flex-row items-center justify-between px-6 md:px-10 gap-2 shrink-0 z-10">
        <p className="text-[10px] uppercase tracking-widest text-gray-500 font-light">
          {perfilFotografo?.marca_agua || `© ${perfilFotografo?.nombre_estudio || "PhocuSync"} 2026`}
        </p>

        {perfilFotografo?.instagram && (
          <a
            href={`https://instagram.com/${perfilFotografo.instagram.replace("@", "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-gray-400 hover:text-[#ff4d00] transition-colors duration-300 group">
            <span>{perfilFotografo.instagram}</span>
          </a>
        )}
      </footer>

      {/* CAPA DE MODALES Y COMPONENTES TRANSITORIOS */}
      <ModalExito mostrar={mostrarExitoCliente} onClose={() => setMostrarExitoCliente(false)} />

      <ModalConfirmacion
        mostrar={modalConfirmarEnvio}
        favoritasCount={favoritas.length}
        onClose={() => setModalConfirmarEnvio(false)}
        onConfirm={handleEnviarSeleccion}
      />

      {/* OVERLAY DE PERSISTENCIA: Bloquea interacciones mientras los datos viajan a Supabase */}
      {enviandoDatos && (
        <LoaderCargando
          mensaje="Enviando selección..."
          submensaje="Guardando tus cambios de forma segura"
          isOverlay={true}
        />
      )}

      {/* TOAST SYSTEM: Alertas flotantes controladas por estado global */}
      <AnimatePresence>
        {alerta.mostrar && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-[#061115] border border-white/10 px-5 py-3.5 shadow-2xl rounded-sm max-w-md w-[90%]">
            <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#ff4d00]" />
            <span className="text-[#ff4d00] text-base">⚠️</span>
            <p className="text-xs font-medium text-gray-200 tracking-wide leading-relaxed">{alerta.mensaje}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
