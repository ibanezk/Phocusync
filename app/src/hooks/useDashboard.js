/* ========================================================================= */
/* Proyecto: PhocuSync SaaS Portal */
/* Nombre del Archivo: useDashboard.js / useDashboard.ts */
/* Propósito: Orquestador de estado global y lógica de negocio para el Dashboard. */
/*            Maneja la verificación de sesión, consumo de API relacional, */
/*            cálculo de almacenamiento en bytes y control de cuotas por plan. */
/* Arquitectura: React Hooks (Memoization) + Supabase Client + Client-Side Aggregations. */
/* Versión: 1.0.0 */
/* ========================================================================= */

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export function useDashboard() {
  const navigate = useNavigate();

  // =========================================================================
  // 1. ESTADOS DE IDENTIDAD Y UI (Identity & UI State)
  // =========================================================================
  const [userEmail, setUserEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [proyectos, setProyectos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [stats, setStats] = useState({ proyectos: 0, fotos: 0, almacenamiento: "0 GB" });

  // =========================================================================
  // 2. REGLAS DE NEGOCIO Y SUSCRIPCIONES (SaaS Tier Limits)
  // =========================================================================
  const [planActual, setPlanActual] = useState("Standard");
  const [almacenamientoMaximo, setAlmacenamientoMaximo] = useState(1.0); // Representado en GB

  // =========================================================================
  // 3. PIPELINE DE RECOLECCIÓN Y PROCESAMIENTO (Data Fetching & Aggregation)
  // =========================================================================

  /**
   * Obtiene de forma centralizada toda la información correlacionada del fotógrafo.
   * Patrón Memoized: useCallback evita recreaciones de la función en cada render,
   * previniendo bucles infinitos dentro del ciclo de vida del useEffect.
   */
  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Optimizacion UX: Obtenemos el usuario directo de la sesión para evitar desfases de estados asíncronos
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // ---------------------------------------------------------------------
      // PASO A: Resolución dinámica del Tier/Plan del usuario
      // ---------------------------------------------------------------------
      const { data: fotografo } = await supabase.from("fotografos").select("plan").eq("id", user.id).maybeSingle();

      // Diccionario de configuración centralizado para escalabilidad de planes
      const configPlanes = {
        standard: { nombre: "Standard", max: 1.0 },
        pro_studio: { nombre: "Pro Studio", max: 50.0 },
        agency: { nombre: "Agency", max: 50.0 },
      };

      const planKey = fotografo?.plan?.toLowerCase() || "standard";
      const config = configPlanes[planKey] || configPlanes.standard;

      setPlanActual(config.nombre);
      setAlmacenamientoMaximo(config.max);

      // ---------------------------------------------------------------------
      // PASO B: Consulta Relacional unificada (Eager Loading / Joins)
      // ---------------------------------------------------------------------
      // En lugar de hacer una consulta para proyectos y N consultas para las fotos
      // de cada proyecto (Problema del N+1), se realiza un Join nativo mediante PostgREST.
      const { data: proyectosData, error: proyectosError } = await supabase
        .from("proyectos")
        .select(
          `
          *,
          fotos (
            id,
            size
          )
        `,
        )
        .eq("fotografo_id", user.id) // Filtrado por el fotógrafo dueño de la cuenta
        .order("creado_en", { ascending: false });

      if (proyectosError) throw proyectosError;

      const proyectosNormalizados = proyectosData || [];

      // ---------------------------------------------------------------------
      // PASO C: Procesamiento de Métricas en el Cliente (Client-Side Reduce)
      // ---------------------------------------------------------------------

      // Map 1: Inyecta contadores individuales por proyecto sin mutar el objeto original
      const proyectosConContadores = proyectosNormalizados.map((proyecto) => ({
        ...proyecto,
        totalFotos: proyecto.fotos ? proyecto.fotos.length : 0,
      }));

      // Acumulador 1: Sumatoria lineal de todas las fotos de todas las galerías
      const acumuladoFotosGlobal = proyectosConContadores.reduce((suma, p) => suma + p.totalFotos, 0);

      // Acumulador 2: Sumatoria en cascada (Double Reduce) para computar el peso real en bytes
      const totalBytesReales = proyectosNormalizados.reduce((sumaProyecto, proyecto) => {
        if (!proyecto.fotos) return sumaProyecto;
        const bytesDelProyecto = proyecto.fotos.reduce((sumaFoto, foto) => sumaFoto + (foto.size || 0), 0);
        return sumaProyecto + bytesDelProyecto;
      }, 0);

      // Algoritmo de conversión matemática para strings legibles de almacenamiento (Bytes -> MB/GB)
      let almacenamientoLegible = "0 MB";
      if (totalBytesReales > 0) {
        const totalKB = totalBytesReales / 1024;
        const totalMB = totalKB / 1024;

        if (totalMB >= 1024) {
          const totalGB = totalMB / 1024;
          almacenamientoLegible = `${totalGB.toFixed(2)} GB`;
        } else {
          almacenamientoLegible = `${totalMB.toFixed(1)} MB`;
        }
      }

      // Despacho de estados procesados listos para consumo de componentes presentacionales
      setProyectos(proyectosConContadores);
      setStats({
        proyectos: proyectosConContadores.length,
        fotos: acumuladoFotosGlobal,
        almacenamiento: `${almacenamientoLegible} / ${config.max.toFixed(1)} GB`,
      });
    } catch (err) {
      console.error("Error general en el Dashboard:", err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // =========================================================================
  // 4. VERIFICACIÓN DE ACCESO SEGURO (Route Guard)
  // =========================================================================
  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Middleware de protección en el cliente: Expulsa a usuarios sin token JWT activo
      if (!user) {
        navigate("/login");
        return;
      }

      setUserEmail(user.email);
      setUserId(user.id);
      fetchDashboardData();
    };
    checkUser();
  }, [navigate, fetchDashboardData]);

  // VALIDACIÓN EN TIEMPO REAL: Evaluación síncrona derivada del estado local de proyectos
  const haAlcanzadoElLimite = planActual === "Standard" && proyectos.length >= 3;

  // =========================================================================
  // 5. ACCIONES DE MUTACIÓN Y CICLO DE VIDA (Mutations & Session Actions)
  // =========================================================================

  /**
   * Crea una nueva galería fotográfica aplicando validación de cuotas.
   * @param {Event} e - Evento del formulario submit.
   */
  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!projectName.trim()) return;

    // CANDADO DE SEGURIDAD (Exploit Prevention):
    // Bloquea peticiones maliciosas que intenten saltarse el bloqueo visual del botón HTML.
    if (haAlcanzadoElLimite) {
      setIsModalOpen(false);
      return;
    }

    setIsCreating(true);

    const { data, error } = await supabase
      .from("proyectos")
      .insert([{ nombre: projectName, fotografo_id: userId }])
      .select();

    if (error) {
      alert(`Error: ${error.message}`);
    } else if (data && data.length > 0) {
      const nuevoProyecto = data[0];
      setProjectName("");
      setIsModalOpen(false);
      // UX Premium: Redirección inmediata a la zona de carga del nuevo proyecto creado
      navigate(`/dashboard/proyecto/${nuevoProyecto.id}`);
    }
    setIsCreating(false);
  };

  /**
   * Destruye de forma segura la sesión del usuario actual revocando los tokens de Supabase.
   */
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      alert(`Error al cerrar sesión: ${error.message}`);
    } else {
      window.location.href = "/login"; // Limpieza completa del flujo de rutas
    }
  };

  // API pública del hook
  return {
    userEmail,
    proyectos,
    isLoading,
    stats,
    menuAbierto,
    setMenuAbierto,
    isModalOpen,
    setIsModalOpen,
    projectName,
    setProjectName,
    isCreating,
    handleCreateProject,
    handleLogout,
    navigateToProject: (id) => navigate(`/dashboard/proyecto/${id}`),
    planActual,
    haAlcanzadoElLimite,
  };
}
