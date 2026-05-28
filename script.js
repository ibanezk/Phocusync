gsap.registerPlugin(ScrollTrigger);

// ============================================================
// 1. OPTIMIZACIONES GENERALES (imágenes lazy, will-change)
// ============================================================
document.querySelectorAll("img").forEach((img) => {
  if (!img.hasAttribute("loading")) img.setAttribute("loading", "lazy");
  if (!img.hasAttribute("decoding")) img.setAttribute("decoding", "async");
});

// Añadir will-change a elementos animados (mejora fluidez)
const animatedElements = document.querySelectorAll(
  ".animate-on-load, .frame, #heroTitle, #imageContainer, .nav-item, #contactBtn, #heroButton, #heroParagraph",
);
animatedElements.forEach((el) => (el.style.willChange = "transform, opacity"));

// ============================================================
// 2. FUNCIÓN DE ANIMACIÓN DEL HERO (COMPLETA, CON CAÍDA DEL MENÚ)
// ============================================================
function startHeroAnimation() {
  // Asegurar visibilidad por si algún elemento quedó oculto
  const menuContainer = document.getElementById("menuContainer");
  if (menuContainer) menuContainer.style.opacity = "1";
  document.querySelectorAll(".animate-on-load").forEach((el) => (el.style.opacity = "1"));

  const tl = gsap.timeline();

  // Todas tus animaciones originales (título, imagen, logo, nav-item cayendo, etc.)
  tl.from("#heroTitle", { x: -50, opacity: 0, duration: 0.6, ease: "power2.out" })
    .from("#imageContainer", { x: 80, opacity: 0, duration: 0.7, ease: "power3.out" }, "-=0.3")
    .from("#logoIcon", { scale: 0, duration: 0.4, ease: "back.out(1.2)" }, "-=0.2")
    .from(".nav-item", { y: -20, opacity: 0, stagger: 0.1, duration: 0.4, ease: "power2.out" }, "-=0.2")
    .from("#contactBtn", { scale: 0.8, duration: 0.4, ease: "elastic.out(1, 0.5)" }, "-=0.2")
    .from("#heroParagraph", { y: 30, opacity: 0, duration: 0.5, ease: "power2.out" }, "-=0.3")
    .from("#heroButton", { scale: 0, opacity: 0, duration: 0.5, ease: "back.out(1.5)" }, "-=0.2")
    .from(".frame", { opacity: 0, stagger: 0.1, duration: 0.4, ease: "power2.out" }, "-=0.4");
}

// ============================================================
// 3. LOADER: ESPERAR A QUE LA IMAGEN DEL HERO ESTÉ LISTA
// ============================================================
const heroImage = document.querySelector("#imageContainer img");
const loader = document.getElementById("page-loader");

function hideLoaderAndStart() {
  if (!loader) {
    startHeroAnimation();
    return;
  }
  // Desvanecer loader
  loader.style.opacity = "0";
  // Esperar a que termine la transición y luego ocultarlo del DOM y animar
  setTimeout(() => {
    loader.style.display = "none";
    startHeroAnimation();
  }, 500);
}

// Si la imagen ya está cargada, esperamos un poco por si acaso, luego ocultamos loader
if (heroImage && heroImage.complete) {
  setTimeout(hideLoaderAndStart, 100);
} else if (heroImage) {
  heroImage.onload = hideLoaderAndStart;
  heroImage.onerror = hideLoaderAndStart; // si falla, también ocultamos
} else {
  // Si no hay imagen, ocultamos loader directamente
  hideLoaderAndStart();
}

// ============================================================
// 4. MENÚ MÓVIL CON GSAP (sin cambios)
// ============================================================
const menuBtn = document.getElementById("menuBtn");
const closeMenuBtn = document.getElementById("closeMenuBtn");
const mobileMenu = document.getElementById("mobileMenu");
let menuTimeline = null;

function openMobileMenu() {
  if (menuTimeline) menuTimeline.kill();
  document.body.classList.add("menu-open");
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
  document.body.style.overflow = "hidden";
}

function closeMobileMenu() {
  if (menuTimeline) menuTimeline.kill();
  menuTimeline = gsap.timeline({
    onComplete: () => {
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

if (menuBtn) menuBtn.addEventListener("click", openMobileMenu);
if (closeMenuBtn) closeMenuBtn.addEventListener("click", closeMobileMenu);
document.querySelectorAll(".mobile-nav-link").forEach((link) => link.addEventListener("click", closeMobileMenu));

// ============================================================
// 5. ANIMACIÓN BUCLE INFINITO
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  // Aseguramos que Google Fonts se haya renderizado por completo antes de medir
  document.fonts.ready.then(() => {
    const marqueeContent = document.getElementById("marqueeContent");
    const firstTrack = document.querySelectorAll(".marquee-track")[0];

    // Medimos el ancho exacto de una sola pista (el bloque de palabras completo)
    const trackWidth = firstTrack.getBoundingClientRect().width;

    // Animación fluida con GSAP Modifiers para un bucle infinito real
    gsap.to(marqueeContent, {
      x: -trackWidth,
      duration: 15, // Más segundos = más lento y elegante
      ease: "none",
      repeat: -1,
      modifiers: {
        // Esta función hace que cuando el contenedor se desplace el ancho de una pista,
        // vuelva a 0 instantáneamente sin saltos ópticos
        x: gsap.utils.unitize((x) => parseFloat(x) % trackWidth),
      },
    });
  });
});

// ============================================================
// 6. ANIMACIÓN DE TARJETAS CON SCROLLTRIGGER (Sincronización estricta)
// ============================================================

const cardsContainer = document.querySelector(".grid");
const cards = document.querySelectorAll(".flex.flex-col.gap-2");

if (cardsContainer && cards.length) {
  // 1. Ocultamos las tarjetas inmediatamente con GSAP para evitar parpadeos
  gsap.set(cards, { opacity: 0, y: 30 });

  // 2. Seleccionamos solo las imágenes dentro de las tarjetas asimétricas
  const bentoImages = Array.from(cardsContainer.querySelectorAll("img"));

  // 3. Forzamos a la GPU a decodificarlas en bloque ANTES de crear el ScrollTrigger
  Promise.all(
    bentoImages.map((img) => {
      // img.decode() es una API moderna que procesa la imagen de forma asíncrona
      // y resuelve la promesa solo cuando está 100% lista para ser pintada al instante.
      return img.decode().catch(() => {
        // Capturamos cualquier error silencioso para que la animación no se rompa
        console.warn("Una imagen del grid tardó en decodificarse");
      });
    }),
  ).then(() => {
    // 4. UNA VEZ TODAS ESTÁN LISTAS, inicializamos la animación
    gsap.to(cards, {
      scrollTrigger: {
        trigger: cardsContainer,
        start: "top 80%",
        once: true,
        toggleActions: "play none none none",
        invalidateOnRefresh: false,
        markers: false,
      },
      opacity: 1,
      y: 0,
      duration: 1,
      ease: "power2.out",
    });
  });
}

// ============================================================
// 7. ANIMACIÓN SECCIÓN CÓMO FUNCIONA
// ============================================================

// Esperamos a que cargue el DOM
document.addEventListener("DOMContentLoaded", () => {
  // Seleccionamos todas las filas de los pasos
  const steps = document.querySelectorAll("#how-it-works .grid");

  steps.forEach((step, index) => {
    const text = step.querySelector(".step-text");
    const mockup = step.querySelector(".step-mockup");

    // Determinamos la dirección según el índice (Paso 1 y 3 entran diferente al Paso 2)
    // Si index es impar (Paso 2), el texto viene de la derecha (x: 100) y mockup de la izquierda (x: -100)
    const isEven = index % 2 === 0;
    const textFromX = isEven ? -60 : 60;
    const mockupFromX = isEven ? 60 : -60;
    const rotationFrom = isEven ? 4 : -4; // Rotación sutil inicial para el mockup

    // Creación de la línea de tiempo de GSAP vinculada al scroll de esta fila
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: step,
        start: "top 80%", // La animación arranca cuando el tope de la fila llega al 80% del alto de la pantalla
        end: "top 50%", // Termina de ejecutarse al llegar al 50%
        toggleActions: "play none none reverse", // Se reproduce al bajar, se revierte de forma fluida si suben
      },
    });

    // Animación del bloque de Texto
    tl.from(
      text,
      {
        opacity: 0,
        x: textFromX,
        duration: 1,
        ease: "power2.out",
      },
      0,
    ); // El ', 0' hace que corran al mismo tiempo

    // Animación del bloque Mockup (Con un ligero efecto 3D rotativo de entrada)
    tl.from(
      mockup,
      {
        opacity: 0,
        x: mockupFromX,
        rotation: rotationFrom,
        scale: 0.95,
        duration: 1.2,
        ease: "power3.out",
      },
      0,
    );
  });
});

console.log("✅ animations.js cargado y loader integrado");
