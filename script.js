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
// 2. FUNCIÓN DE ANIMACIÓN DEL HERO
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

// ============================================================
// 8. ANIMACIÓN SECCIÓN PRECIOS
// ============================================================

// 1. Animación de entrada con ScrollTrigger
const pricingTimeline = gsap.timeline({
  scrollTrigger: {
    trigger: "#pricing",
    start: "top 75%", // Se activa cuando la parte superior de la sección llega al 75% del viewport
    toggleActions: "play none none reverse",
  },
});

pricingTimeline
  // Aparece el título y su línea decorativa primero
  .from("#pricing h2, #pricing .w-14", {
    y: 30,
    opacity: 0,
    duration: 0.6,
    stagger: 0.1,
    ease: "power2.out",
  })
  // Entran las tarjetas en cascada (stagger) de izquierda a derecha
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
  ) // Se solapa un poco con la animación del título para mayor fluidez
  // Por último, aparecen los 3 puntitos de paginación de golpe
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

// ==================== INTERACCIÓN HOVER EN LAS TARJETAS ====================

// Seleccionamos todas las tarjetas de precios
const pricingCards = document.querySelectorAll(".pricing-card");

pricingCards.forEach((card) => {
  // Buscamos el botón interno
  const button = card.querySelector("button");
  if (!button) return; // Seguridad por si acaso

  // Creamos una animación individual para el hover de cada tarjeta
  const hoverAnimation = gsap.timeline({ paused: true });

  // Verificamos si esta tarjeta es la Pro (buscando si su fondo es el oscuro destacado #132830)
  // O si prefieres puedes ponerle una clase única en el HTML como 'card-pro'
  const isFeatured = card.getBoundingClientRect().width > 0 && card.innerHTML.includes("Pro Studio");

  if (isFeatured) {
    // Si es la central (Pro Studio), solo la elevamos un extra y aumentamos su brillo
    hoverAnimation.to(card, {
      y: -12,
      borderColor: "rgba(255, 107, 0, 1)",
      boxShadow: "0 15px 40px rgba(255, 107, 0, 0.12)",
      duration: 0.3,
      ease: "power2.out",
    });
  } else {
    // Si son las laterales, suben desde su posición plana y su borde se ilumina levemente
    hoverAnimation.to(card, {
      y: -10,
      borderColor: "rgba(255, 107, 0, 0.4)",
      boxShadow: "0 15px 30px rgba(0, 0, 0, 0.3)",
      duration: 0.3,
      ease: "power2.out",
    });
  }

  // Animación para el botón interno
  hoverAnimation.to(
    button,
    {
      scale: 1.02,
      duration: 0.2,
      ease: "power1.out",
    },
    0,
  );

  // EVENTOS DEL MOUSE
  card.addEventListener("mouseenter", () => {
    hoverAnimation.play();

    // EFECTO DE JERARQUÍA SEGURO: Buscamos la tarjeta Pro Studio usando texto, sin selectores raros
    if (!isFeatured) {
      pricingCards.forEach((c) => {
        if (c.innerHTML.includes("Pro Studio")) {
          gsap.to(c, {
            opacity: 0.65,
            scale: 0.98,
            duration: 0.3,
          });
        }
      });
    }
  });

  card.addEventListener("mouseleave", () => {
    hoverAnimation.reverse();

    // Restauramos la tarjeta central de forma segura
    if (!isFeatured) {
      pricingCards.forEach((c) => {
        if (c.innerHTML.includes("Pro Studio")) {
          gsap.to(c, {
            opacity: 1,
            scale: 1,
            duration: 0.3,
          });
        }
      });
    }
  });
});

// ============================================================
// 9. ANIMACIÓN SECCIÓN TESTIMONIOS
// ============================================================

gsap.from(".testimonial-card", {
  scrollTrigger: {
    trigger: "#testimonials",
    start: "top 80%", // Se dispara un poco antes para que la transición sea suave
    toggleActions: "play none none reverse",
  },
  y: 35,
  opacity: 0,
  duration: 0.8,
  stagger: 0.15, // Aparecen una tras otra de izquierda a derecha
  ease: "power2.out",
});

// ============================================================
// 10. ANIMACIÓN SECCIÓN CTA
// ============================================================

// ==================== ANIMACIÓN DE ENTRADA (SCROLLTRIGGER) ====================

// 1. Entrada de la caja principal
gsap.from(".cta-container", {
  scrollTrigger: {
    trigger: "#final-cta",
    start: "top bottom", // Se dispara apenas entra a la vista
    toggleActions: "play none none reverse",
  },
  y: 40,
  opacity: 0,
  duration: 0.8,
  ease: "power3.out",
});

// 2. Entrada de las formas geométricas
// Entrada de las formas geométricas obligando el estado final
gsap.fromTo(
  ".cta-shape",
  {
    opacity: 0,
    scale: 0.8,
  }, // Estado Inicial
  {
    opacity: 1,
    scale: 1,
    duration: 1,
    stagger: 0.15,
    delay: 0.3,
    ease: "power2.out",
    scrollTrigger: {
      trigger: "#final-cta",
      start: "top 90%", // Se dispara apenas asoma la sección
      toggleActions: "play none none reverse",
    },
  }, // Estado Final
);

// ==================== INTERACCIÓN GEOMÉTRICA CON EL MOUSE ====================
const ctaContainer = document.querySelector(".cta-container");
const ctaShapes = document.querySelectorAll(".cta-shape");

if (ctaContainer && ctaShapes.length > 0) {
  ctaContainer.addEventListener("mousemove", (e) => {
    const { left, top, width, height } = ctaContainer.getBoundingClientRect();

    // Posición del mouse relativa al centro (-0.5 a 0.5)
    const x = (e.clientX - left) / width - 0.5;
    const y = (e.clientY - top) / height - 0.5;

    // Movimiento sutil de las líneas (efecto profundidad)
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

  // Resetear al salir el cursor
  ctaContainer.addEventListener("mouseleave", () => {
    ctaShapes.forEach((shape) => {
      gsap.to(shape, {
        x: 0,
        y: 0,
        duration: 0.8,
        ease: "power3.out",
      });
    });
  });
}

// ============================================================
// 11. ANIMACIÓN FOOTER
// ============================================================

gsap.from("footer flex", {
  scrollTrigger: {
    trigger: "footer",
    start: "top bottom",
    toggleActions: "play none none reverse",
  },
  opacity: 0,
  y: 15,
  duration: 0.6,
  stagger: 0.1,
  ease: "power2.out",
});

console.log("✅ animations.js cargado y loader integrado");
