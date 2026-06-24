import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export function useDashboard() {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [proyectos, setProyectos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ proyectos: 0, fotos: 0, almacenamiento: "0 GB" });
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Nuevos estados para controlar el plan y límites
  const [planActual, setPlanActual] = useState("Standard");
  const [almacenamientoMaximo, setAlmacenamientoMaximo] = useState(1.0);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Obtenemos el usuario directamente aquí para evitar desfases de estados asíncronos
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Consultar el plan del fotógrafo en tu tabla real
      const { data: fotografo } = await supabase.from("fotografos").select("plan").eq("id", user.id).maybeSingle();

      const configPlanes = {
        standard: { nombre: "Standard", max: 1.0 },
        pro_studio: { nombre: "Pro Studio", max: 50.0 },
        agency: { nombre: "Agency", max: 50.0 },
      };

      const planKey = fotografo?.plan?.toLowerCase() || "standard";
      const config = configPlanes[planKey] || configPlanes.standard;

      setPlanActual(config.nombre);
      setAlmacenamientoMaximo(config.max);

      // Consultar proyectos (Tu consulta original intacta)
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
        .order("creado_en", { ascending: false });

      if (proyectosError) throw proyectosError;

      const proyectosNormalizados = proyectosData || [];

      const proyectosConContadores = proyectosNormalizados.map((proyecto) => ({
        ...proyecto,
        totalFotos: proyecto.fotos ? proyecto.fotos.length : 0,
      }));

      const acumuladoFotosGlobal = proyectosConContadores.reduce((suma, p) => suma + p.totalFotos, 0);

      const totalBytesReales = proyectosNormalizados.reduce((sumaProyecto, proyecto) => {
        if (!proyecto.fotos) return sumaProyecto;
        const bytesDelProyecto = proyecto.fotos.reduce((sumaFoto, foto) => sumaFoto + (foto.size || 0), 0);
        return sumaProyecto + bytesDelProyecto;
      }, 0);

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

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate("/");
        return;
      }

      setUserEmail(user.email);
      setUserId(user.id);
      fetchDashboardData();
    };
    checkUser();
  }, [navigate, fetchDashboardData]);

  // Evaluamos el límite basándonos en los datos ya procesados en local
  const haAlcanzadoElLimite = planActual === "Standard" && proyectos.length >= 3;

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!projectName.trim()) return;

    // Candado de seguridad por si intentan saltarse la UI
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
      navigate(`/dashboard/proyecto/${nuevoProyecto.id}`);
    }
    setIsCreating(false);
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      alert(`Error al cerrar sesión: ${error.message}`);
    } else {
      navigate("/");
    }
  };

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
