/* ========================================================================= */
/* Proyecto: PhocuSync SaaS Portal                                           */
/* Componente: SeccionCuenta.jsx                                             */
/* Descripción: Panel de control de cuotas y consumo de almacenamiento.       */
/*              Calcula métricas de espacio en la nube, renderiza barras de  */
/*              progreso reactivas y gestiona accesos al flujo de checkout.  */
/* ========================================================================= */

import React from "react";
import { motion } from "framer-motion";
import useAlmacenamiento from "../../hooks/useAlmacenamiento";

export default function SeccionCuenta({ userEmail, setModalPlanesAbierto }) {
  // Hook personalizado con datos directo de Supabase
  const { almacenamientoUsado, almacenamientoMaximo, planActual, cargando } = useAlmacenamiento();

  // Diccionario centralizado de beneficios por nivel de suscripción
  const infoContenidoPlanes = {
    Standard: {
      tagline: "Soporte básico para galerías activas simultáneas.",
      mostrarBotonMejorar: true,
    },
    "Pro Studio": {
      tagline: "Proyectos ilimitados, descargas en alta resolución y soporte prioritario.",
      mostrarBotonMejorar: true,
    },
    Agency: {
      tagline: "Soporte dedicado 24/7, marca blanca con dominio propio y control de equipo activo.",
      mostrarBotonMejorar: false,
    },
  };

  const infoPlan = infoContenidoPlanes[planActual] || infoContenidoPlanes["Standard"];

  // Calcula el porcentaje exacto de consumo (protegido contra división por cero)
  const porcentaje =
    almacenamientoMaximo > 0 ? Math.min(Math.round((almacenamientoUsado / almacenamientoMaximo) * 100), 100) : 0;

  // Formatea el espacio consumido a MB si es menor a 1 GB para mayor claridad visual
  const formatearUso = (gb) => {
    if (!gb || gb <= 0) return "0 MB";
    const mb = gb * 1024;
    if (mb < 1024) {
      return `${mb.toFixed(1)} MB`;
    }
    return `${gb.toFixed(2)} GB`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      className="space-y-6 max-w-xl">
      {/* TÍTULO Y DESCRIPCIÓN */}
      <div>
        <h3 className="text-lg font-medium text-white">Cuenta & Almacenamiento</h3>
        <p className="text-xs text-gray-400 mt-0.5">Monitorea el consumo de espacio de tus archivos en PhocuSync.</p>
      </div>

      <div className="space-y-4 pt-2">
        {/* CORREO VINCULADO */}
        <div className="p-4 bg-[#061115] border border-white/10 rounded-sm space-y-1">
          <p className="text-xs uppercase tracking-widest font-semibold text-gray-500">Correo Vinculado</p>
          <p className="text-sm font-mono text-white">{userEmail || "usuario@phocusync.com"}</p>
        </div>

        {/* MÉTRICAS DE ESPACIO EN LA NUBE */}
        <div className="p-4 bg-[#061115] border border-white/5 rounded-sm space-y-3">
          {cargando ? (
            <p className="text-xs text-gray-400 font-mono animate-pulse">Sincronizando espacio...</p>
          ) : (
            <>
              <div className="flex justify-between items-center text-xs">
                <span className="uppercase tracking-widest font-semibold text-gray-400 text-[11px]">
                  Espacio en la Nube
                </span>
                <span className="font-mono text-white">
                  {formatearUso(almacenamientoUsado)} / {almacenamientoMaximo.toFixed(1)} GB
                </span>
              </div>

              {/* Barra de progreso */}
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                  style={{ width: `${porcentaje}%` }}
                  className="h-full bg-[#ff4d00] rounded-full transition-all duration-500 ease-out"
                />
              </div>

              {/* Estado del almacenamiento */}
              <p className="text-xs text-gray-500">
                {porcentaje === 0
                  ? `Estás utilizando menos del 1% de tu plan ${planActual}.`
                  : `Estás utilizando el ${porcentaje}% del plan ${planActual}.`}
              </p>
            </>
          )}
        </div>

        {/* TARJETA DE ESTADO DEL PLAN */}
        <div className="p-4 border border-white/5 rounded-sm flex items-center justify-between gap-4">
          {cargando ? (
            <p className="text-xs text-gray-400 font-mono animate-pulse">Cargando beneficios del plan...</p>
          ) : (
            <>
              <div>
                <p className="text-sm font-medium text-white">
                  Plan actual: <span className="text-[#ff4d00] font-semibold">{planActual}</span>
                </p>
                <p className="text-xs text-gray-500 mt-1 max-w-sm">{infoPlan.tagline}</p>
              </div>

              {infoPlan.mostrarBotonMejorar && (
                <button
                  onClick={() => setModalPlanesAbierto(true)}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] tracking-widest uppercase font-semibold px-4 py-2 transition-colors shrink-0">
                  Mejorar Plan
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
