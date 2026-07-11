// =========================================================================
// Proyecto: PhocuSync SaaS Landing Page
// Nombre del Archivo: script.js / animations.js
// Propósito: Motor de interactividad, animaciones de entrada y optimizaciones de rendimiento.
// Arquitectura: GSAP v3 (GreenSock) Core + ScrollTrigger Plugin.
// Versión: 1.0.0 (Fase de Lanzamiento)
// =========================================================================

// Registro obligatorio del plugin ScrollTrigger para habilitar animaciones basadas en el scroll
gsap.registerPlugin(ScrollTrigger);

// =========================================================================
// 1. OPTIMIZACIONES DE RENDIMIENTO NATIVAS (Browser Paint Thread Optimization)
// =========================================================================

// Inyección dinámica de atributos de rendimiento para mitigar el bloqueo del hilo principal (Main Thread)
document.querySelectorAll("img").forEach((img) => {
  // Asegura la carga diferida nativa si no se declaró explícitamente en el HTML
  if (!img.hasAttribute("loading")) img.setAttribute("loading", "lazy");
  // Decodificación asíncrona para evitar tirones de renderizado al hacer scroll rápido
  if (!img.hasAttribute("decoding")) img.setAttribute("decoding", "async");
});

// Promoción de capas en la GPU (Hardware Acceleration) para elementos con transiciones complejas.
// Esto reduce los costos de 'Paint' y 'Layout' redistribuyendo el esfuerzo al procesador gráfico.
const animatedElements = document.querySelectorAll(
  ".animate-on-load, .frame, #imageContainer, .nav-item, #contactBtn, #heroButton, #heroParagraph",
);
animatedElements.forEach((el) => (el.style.willChange = "transform, opacity"));

// =========================================================================
// 2. FUNCIÓN ORQUESTADORA: ANIMACIÓN DEL HERO
// =========================================================================
function startHeroAnimation() {
  // Previene el efecto FOUC (Flash of Unstyled Content) forzando la opacidad base
  const menuContainer = document.getElementById("menuContainer");
  if (menuContainer) menuContainer.style.opacity = "1";
  document.querySelectorAll(".animate-on-load").forEach((el) => (el.style.opacity = "1"));

  // Instancia de la línea de tiempo principal para secuenciar de forma síncrona
  const tl = gsap.timeline();

  // Orquestación secuencial mediante offsets relativos ("-=0.X") para solapamientos fluidos
  tl.from("#imageContainer", { x: 80, opacity: 0, duration: 0.7, ease: "power3.out" }, "-=0.3")
    .from("#logoIcon", { scale: 0, duration: 0.4, ease: "back.out(1.2)" }, "-=0.2")
    .from(".nav-item", { y: -20, opacity: 0, stagger: 0.1, duration: 0.4, ease: "power2.out" }, "-=0.2")
    .from("#contactBtn", { scale: 0.8, duration: 0.4, ease: "elastic.out(1, 0.5)" }, "-=0.2")
    .from("#heroParagraph", { y: 30, opacity: 0, duration: 0.5, ease: "power2.out" }, "-=0.3")
    .from("#heroButton", { scale: 0, opacity: 0, duration: 0.5, ease: "back.out(1.5)" }, "-=0.2")
    .from(".frame", { opacity: 0, stagger: 0.1, duration: 0.4, ease: "power2.out" }, "-=0.4");
}

// =========================================================================
// 3. INTEGRACIÓN DEL PAGE LOADER (Lifecycle Assets Synchronization)
// =========================================================================
const heroImage = document.querySelector("#imageContainer img");
const loader = document.getElementById("page-loader");

/**
 * Gestiona la transición de salida del Loader y dispara la línea de tiempo del Hero
 */
function hideLoaderAndStart() {
  if (!loader) {
    startHeroAnimation();
    return;
  }
  // Suavizado visual mediante transición CSS de opacidad
  loader.style.opacity = "0";

  // Retraso controlado para remover el loader del flujo del DOM tras culminar la transición
  setTimeout(() => {
    loader.style.display = "none";
    startHeroAnimation();
  }, 500);
}

// Validación de caché de imágenes: Si la imagen ya fue procesada, arranca inmediatamente
if (heroImage && heroImage.complete) {
  setTimeout(hideLoaderAndStart, 100);
} else if (heroImage) {
  // Enlace a listeners nativos para flujos asíncronos lentos o fallas de red
  heroImage.onload = hideLoaderAndStart;
  heroImage.onerror = hideLoaderAndStart;
} else {
  // Cláusula de salvaguarda por si el layout cambia estructuralmente
  hideLoaderAndStart();
}

// =========================================================================
// 4. CONTROLADOR DEL MENÚ MÓVIL DESPLEGABLE (Modal State Management)
// =========================================================================
const menuBtn = document.getElementById("menuBtn");
const closeMenuBtn = document.getElementById("closeMenuBtn");
const mobileMenu = document.getElementById("mobileMenu");
let menuTimeline = null; // Almacena la referencia de la línea de tiempo activa para evitar colisiones de hilos

/**
 * Abre el portal móvil aplicando animaciones escalonadas (stagger) de entrada
 */
function openMobileMenu() {
  if (menuTimeline) menuTimeline.kill(); // Mata cualquier proceso residual activo
  document.body.classList.add("menu-open");

  // Inicialización de propiedades espaciales seguras en el DOM
  gsap.set(mobileMenu, { visibility: "visible", display: "flex" });

  menuTimeline = gsap
    .timeline()
    .fromTo(mobileMenu, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power2.out" })
    .fromTo(".mobile-menu-content", { x: "100%" }, { x: "0%", duration: 0.4, ease: "back.out(0.8)" }, "-=0.2")
    .fromTo(
      ".mobile-nav-link",
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, stagger: 0.08, duration: 0.4, ease: "power2.out" },
      "-=0.2",
    );

  // Bloqueo estricto del scroll nativo de fondo por accesibilidad y UX (Layout Locking)
  document.body.style.overflow = "hidden";
}

/**
 * Cierra el menú revirtiendo los valores hacia coordenadas seguras fuera del Viewport
 */
function closeMobileMenu() {
  if (menuTimeline) menuTimeline.kill();

  menuTimeline = gsap.timeline({
    onComplete: () => {
      // Callback de limpieza absoluta al finalizar el timeline
      gsap.set(mobileMenu, { visibility: "hidden", display: "none" });
      document.body.style.overflow = "";
      document.body.classList.remove("menu-open");
    },
  });

  menuTimeline
    .to(".mobile-nav-link", { opacity: 0, y: 30, stagger: 0.05, duration: 0.2, ease: "power2.in" })
    .to(".mobile-menu-content", { x: "100%", duration: 0.3, ease: "power2.in" }, "-=0.1")
    .to(mobileMenu, { opacity: 0, duration: 0.3, ease: "power2.in" }, "-=0.2");
}

// Vinculación de Event Listeners seguros
if (menuBtn) menuBtn.addEventListener("click", openMobileMenu);
if (closeMenuBtn) closeMenuBtn.addEventListener("click", closeMobileMenu);
document.querySelectorAll(".mobile-nav-link").forEach((link) => link.addEventListener("click", closeMobileMenu));

// =========================================================================
// 5. ANIMACIÓN BUCLE INFINITO (Ticker / Marquee de Integraciones)
// =========================================================================
document.addEventListener("DOMContentLoaded", () => {
  // Sincronización con el render de fuentes para evitar mediciones erróneas de anchura en pixeles (Layout Thrashing)
  document.fonts.ready.then(() => {
    const marqueeContent = document.getElementById("marqueeContent");
    const firstTrack = document.querySelectorAll(".marquee-track")[0];

    // Obtención métrica exacta del bounding-box de un bloque para el cálculo del bucle
    const trackWidth = firstTrack.getBoundingClientRect().width;

    // Lógica matemática mediante modificadores dinámicos.
    // Mueve el contenedor horizontalmente y aplica una operación módulo (%) en tiempo real,
    // permitiendo un loop infinito perfecto, libre de saltos visuales o desfases.
    gsap.to(marqueeContent, {
      x: -trackWidth,
      duration: 15, // Factor de velocidad: a mayor tiempo, mayor elegancia editorial
      ease: "none",
      repeat: -1,
      modifiers: {
        x: gsap.utils.unitize((x) => parseFloat(x) % trackWidth),
      },
    });
  });
});

// =========================================================================
// 6. GRID ASIMÉTRICO DE BENEFICIOS (GPU-Pre-decoding & ScrollTrigger)
// =========================================================================
const cardsContainer = document.querySelector(".grid");
const cards = document.querySelectorAll(".flex.flex-col.gap-2");

if (cardsContainer && cards.length) {
  // Estado inicial oculto controlado por JS para evitar saltos estéticos bruscos (Flicker)
  gsap.set(cards, { opacity: 0, y: 30 });

  const bentoImages = Array.from(cardsContainer.querySelectorAll("img"));

  // API Avanzada Promisificada: Fuerza la descompresión y decodificación de las imágenes en la GPU
  // ANTES de calcular las zonas calientes del scroll, garantizando que el trigger sea 100% preciso.
  Promise.all(
    bentoImages.map((img) => {
      return img.decode().catch(() => {
        console.warn("Decodificación asíncrona de imagen mitigada de forma segura.");
      });
    }),
  ).then(() => {
    // Inicialización del disparador una vez resuelto el hilo de imágenes
    gsap.to(cards, {
      scrollTrigger: {
        trigger: cardsContainer,
        start: "top 80%",
        once: true, // Optimización: Destruye el listener tras ejecutarse una vez (Un-mount manual)
        toggleActions: "play none none none",
        invalidateOnRefresh: false,
      },
      opacity: 1,
      y: 0,
      duration: 1,
      ease: "power2.out",
    });
  });
}

// =========================================================================
// 7. COMPONENTE INTERACTIVO: CÓMO FUNCIONA (Tabs Lifecycle & Crossfades)
// =========================================================================
document.addEventListener("DOMContentLoaded", () => {
  const tabs = document.querySelectorAll(".tab-btn");
  const images = document.querySelectorAll(".tab-img");
  let currentIndex = 0; // Puntero de estado global del componente

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => {
      // Cláusula de escape si el usuario presiona la pestaña activa en pantalla
      if (index === currentIndex) return;

      const previousTab = tabs[currentIndex];
      const currentTab = tab;

      // --- FASE 1: MUTACIÓN DE SALIDA (Limpieza de Estados de Marca) ---
      previousTab.classList.add("opacity-40", "border-transparent");
      previousTab.classList.remove("bg-[#0d1a1f]", "border-gray-800", "shadow-xl");
      previousTab.querySelector(".tab-number").classList.replace("text-brand-orange", "text-gray-500");
      previousTab.querySelector(".tab-title").classList.replace("text-white", "text-gray-400");

      // Colapso dinámico de altura mediante interpolación lineal de GSAP
      gsap.to(previousTab.querySelector(".tab-desc"), {
        height: 0,
        opacity: 0,
        marginTop: 0,
        duration: 0.3,
        ease: "power2.out",
      });
      gsap.to(previousTab.querySelector(".tab-border"), { opacity: 0, duration: 0.3 });

      // Desvanecimiento cruzado y desactivación del puntero del frame saliente
      gsap.to(images[currentIndex], {
        opacity: 0,
        scale: 0.95,
        duration: 0.4,
        ease: "power2.inOut",
        pointerEvents: "none",
      });

      // --- FASE 2: MUTACIÓN DE ENTRADA (Activación del nuevo nodo) ---
      currentIndex = index; // Sincronización del puntero de control

      currentTab.classList.remove("opacity-40", "border-transparent");
      currentTab.classList.add("bg-[#0d1a1f]", "border-gray-800", "shadow-xl");
      currentTab.querySelector(".tab-number").classList.replace("text-gray-500", "text-brand-orange");
      currentTab.querySelector(".tab-title").classList.replace("text-gray-400", "text-white");

      // Expansión fluida basada en cálculo dinámico de altura ("auto")
      gsap.to(currentTab.querySelector(".tab-desc"), {
        height: "auto",
        opacity: 1,
        marginTop: 8,
        duration: 0.3,
        ease: "power2.out",
      });
      gsap.to(currentTab.querySelector(".tab-border"), { opacity: 1, duration: 0.3 });

      // Zoom in y activación del canal interactivo de la imagen seleccionada
      gsap.to(images[currentIndex], {
        opacity: 1,
        scale: 1,
        duration: 0.4,
        ease: "power2.inOut",
        pointerEvents: "auto",
      });
    });
  });
});

// =========================================================================
// 8. SECCIÓN DE PRECIOS (Scroll Orchestration & Focus/Blur Effects)
// =========================================================================

// Línea de tiempo enlazada al ScrollTrigger de la sección completa
const pricingTimeline = gsap.timeline({
  scrollTrigger: {
    trigger: "#pricing",
    start: "top 75%",
    toggleActions: "play none none reverse", // Revierte elegantemente si el usuario hace scroll hacia arriba
  },
});

pricingTimeline
  // Entrada tipográfica inicial
  .from("#pricing h2, #pricing .w-14", {
    y: 30,
    opacity: 0,
    duration: 0.6,
    stagger: 0.1,
    ease: "power2.out",
  })
  // Entrada en cascada desfasada de las tarjetas comerciales
  .from(
    ".pricing-card",
    {
      y: 40,
      opacity: 0,
      duration: 0.8,
      stagger: 0.15,
      ease: "power3.out",
    },
    "-=0.3",
  )
  // Entrada sutil de los elementos estéticos indicadores
  .from(
    "#pricing .flex.justify-center.items-center.gap-3",
    {
      y: 15,
      opacity: 0,
      duration: 0.4,
      ease: "power2.out",
    },
    "-=0.2",
  );

// --- INTERACCIONES DE MICROMOVIMIENTO (Hover States Mechanics) ---
const pricingCards = document.querySelectorAll(".pricing-card");

pricingCards.forEach((card) => {
  const button = card.querySelector("button");
  if (!button) return;

  const hoverAnimation = gsap.timeline({ paused: true });

  // Discriminador semántico seguro: Detecta si es la tarjeta premium (Pro Studio) mediante strings en el DOM
  const isFeatured = card.getBoundingClientRect().width > 0 && card.innerHTML.includes("Pro Studio");

  if (isFeatured) {
    // Escala y brillo prioritarios para la opción destacada
    hoverAnimation.to(card, {
      y: -12,
      borderColor: "rgba(255, 107, 0, 1)",
      boxShadow: "0 15px 40px rgba(255, 107, 0, 0.12)",
      duration: 0.3,
      ease: "power2.out",
    });
  } else {
    // Elevación estándar para tarjetas base
    hoverAnimation.to(card, {
      y: -10,
      borderColor: "rgba(255, 107, 0, 0.4)",
      boxShadow: "0 15px 30px rgba(0, 0, 0, 0.3)",
      duration: 0.3,
      ease: "power2.out",
    });
  }

  // Escala sutil del botón interno (Micro-feedback)
  hoverAnimation.to(button, { scale: 1.02, duration: 0.2, ease: "power1.out" }, 0);

  // Eventos de Mouse con control de opacidades cruzadas para jerarquía visual profunda
  card.addEventListener("mouseenter", () => {
    hoverAnimation.play();

    // Si el usuario enfoca una tarjeta lateral, atenúa sutilmente la tarjeta central destacada (Focus Effect)
    if (!isFeatured) {
      pricingCards.forEach((c) => {
        if (c.innerHTML.includes("Pro Studio")) {
          gsap.to(c, { opacity: 0.65, scale: 0.98, duration: 0.3 });
        }
      });
    }
  });

  card.addEventListener("mouseleave", () => {
    hoverAnimation.reverse();

    // Restauración inmediata del balance estético original (Blur rollback)
    if (!isFeatured) {
      pricingCards.forEach((c) => {
        if (c.innerHTML.includes("Pro Studio")) {
          gsap.to(c, { opacity: 1, scale: 1, duration: 0.3 });
        }
      });
    }
  });
});

// =========================================================================
// 9. SECCIÓN DE TESTIMONIOS (Staggered Entrance Trigger)
// =========================================================================
gsap.from(".testimonial-card", {
  scrollTrigger: {
    trigger: "#testimonials",
    start: "top 80%",
    toggleActions: "play none none reverse",
  },
  y: 35,
  opacity: 0,
  duration: 0.8,
  stagger: 0.15, // Desfase rítmico de izquierda a derecha (Efecto oleada)
  ease: "power2.out",
});

// =========================================================================
// 10. BLOQUE FINAL DE LLAMADO A LA ACCIÓN (Parallax Geométrico Interactivo)
// =========================================================================

// Animación de entrada por scroll del contenedor estructural
gsap.from(".cta-container", {
  scrollTrigger: {
    trigger: "#final-cta",
    start: "top bottom",
    toggleActions: "play none none reverse",
  },
  y: 40,
  opacity: 0,
  duration: 0.8,
  ease: "power3.out",
});

// Inicialización controlada de las capas vectoriales internas de fondo (SVG Shapes)
gsap.fromTo(
  ".cta-shape",
  { opacity: 0, scale: 0.8 },
  {
    opacity: 1,
    scale: 1,
    duration: 1,
    stagger: 0.15,
    delay: 0.3,
    ease: "power2.out",
    scrollTrigger: {
      trigger: "#final-cta",
      start: "top 90%",
      toggleActions: "play none none reverse",
    },
  },
);

// --- CÁLCULO DE VECTORES DE PROFUNDIDAD (Mousemove Parallax Effect) ---
const ctaContainer = document.querySelector(".cta-container");
const ctaShapes = document.querySelectorAll(".cta-shape");

if (ctaContainer && ctaShapes.length > 0) {
  ctaContainer.addEventListener("mousemove", (e) => {
    // Mapeo perimetral del contenedor relativo al viewport global
    const { left, top, width, height } = ctaContainer.getBoundingClientRect();

    // Normalización de coordenadas del cursor en un rango cartesiano (-0.5 a 0.5)
    const x = (e.clientX - left) / width - 0.5;
    const y = (e.clientY - top) / height - 0.5;

    // Desplazamiento reactivo asimétrico: Multiplica los vectores por factores indexados
    // creando una ilusión óptica de tridimensionalidad física (Depth of Field Simulacrum).
    ctaShapes.forEach((shape, index) => {
      const factor = (index + 1) * 15;
      gsap.to(shape, {
        x: x * factor,
        y: y * factor,
        duration: 0.6,
        ease: "power2.out",
      });
    });
  });

  // Reajuste inercial suave al retirar el cursor (Spring-back effect)
  ctaContainer.addEventListener("mouseleave", () => {
    ctaShapes.forEach((shape) => {
      gsap.to(shape, { x: 0, y: 0, duration: 0.8, ease: "power3.out" });
    });
  });
}

// Logs informativos de control para entornos de desarrollo y diagnóstico
console.log("✅ animations.js cargado y loader integrado");
