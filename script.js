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
// 5. ANIMACIÓN DE TARJETAS CON SCROLLTRIGGER (Sincronización estricta)
// ============================================================
gsap.registerPlugin(ScrollTrigger);

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
      // Sin stagger, para que las 3 entren en el mismo milisegundo exacto
    });
  });
}

console.log("✅ animations.js cargado y loader integrado");
