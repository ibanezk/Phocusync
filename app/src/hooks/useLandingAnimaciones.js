import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

// Registro obligatorio del plugin ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

export function usePhocuSyncAnimations(containerRef) {
  useGSAP(
    () => {
      const scope = containerRef.current;
      if (!scope) return;

      // -----------------------------------------------------------------------
      // 1. OPTIMIZACIONES DE RENDIMIENTO NATIVAS
      // -----------------------------------------------------------------------
      const animatedElements = scope.querySelectorAll(
        ".animate-on-load, .frame, #imageContainer, .nav-item, #contactBtn, #heroButton, #heroParagraph",
      );
      animatedElements.forEach((el) => {
        el.style.willChange = "transform, opacity";
      });

      // -----------------------------------------------------------------------
      // 2. FUNCIÓN ORQUESTADORA: ANIMACIÓN DEL HERO
      // -----------------------------------------------------------------------
      const startHeroAnimation = () => {
        const menuContainer = scope.querySelector("#menuContainer");
        if (menuContainer) menuContainer.style.opacity = "1";
        scope.querySelectorAll(".animate-on-load").forEach((el) => {
          el.style.opacity = "1";
        });

        const tl = gsap.timeline();
        tl.from("#imageContainer", { x: 80, opacity: 0, duration: 0.7, ease: "power3.out" }, "-=0.3")
          .from("#logoIcon", { scale: 0, duration: 0.4, ease: "back.out(1.2)" }, "-=0.2")
          .from(".nav-item", { y: -20, opacity: 0, stagger: 0.1, duration: 0.4, ease: "power2.out" }, "-=0.2")
          .from("#contactBtn", { scale: 0.8, duration: 0.4, ease: "elastic.out(1, 0.5)" }, "-=0.2")
          .from("#heroParagraph", { y: 30, opacity: 0, duration: 0.5, ease: "power2.out" }, "-=0.3")
          .from("#heroButton", { scale: 0, opacity: 0, duration: 0.5, ease: "back.out(1.5)" }, "-=0.2")
          .from(".frame", { opacity: 0, stagger: 0.1, duration: 0.4, ease: "power2.out" }, "-=0.4");
      };

      // -----------------------------------------------------------------------
      // 3. INTEGRACIÓN DEL PAGE LOADER
      // -----------------------------------------------------------------------
      const heroImage = scope.querySelector("#imageContainer img");
      const loader = scope.querySelector("#page-loader");

      const hideLoaderAndStart = () => {
        if (!loader) {
          startHeroAnimation();
          return;
        }
        loader.style.opacity = "0";
        setTimeout(() => {
          loader.style.display = "none";
          startHeroAnimation();
        }, 500);
      };

      if (heroImage && heroImage.complete) {
        setTimeout(hideLoaderAndStart, 100);
      } else if (heroImage) {
        heroImage.onload = hideLoaderAndStart;
        heroImage.onerror = hideLoaderAndStart;
      } else {
        hideLoaderAndStart();
      }

      // -----------------------------------------------------------------------
      // 4. CONTROLADOR DEL MENÚ MÓVIL DESPLEGABLE
      // -----------------------------------------------------------------------
      const menuBtn = scope.querySelector("#menuBtn");
      const closeMenuBtn = scope.querySelector("#closeMenuBtn");
      const mobileMenu = scope.querySelector("#mobileMenu");
      let menuTimeline = null;

      const openMobileMenu = () => {
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
      };

      const closeMobileMenu = () => {
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
      };

      if (menuBtn) menuBtn.addEventListener("click", openMobileMenu);
      if (closeMenuBtn) closeMenuBtn.addEventListener("click", closeMobileMenu);
      scope.querySelectorAll(".mobile-nav-link").forEach((link) => {
        link.addEventListener("click", closeMobileMenu);
      });

      // -----------------------------------------------------------------------
      // 5. ANIMACIÓN BUCLE INFINITO (Marquee de Integraciones)
      // -----------------------------------------------------------------------
      document.fonts.ready.then(() => {
        const marqueeContent = scope.querySelector("#marqueeContent");
        const firstTrack = scope.querySelectorAll(".marquee-track")[0];

        if (marqueeContent && firstTrack) {
          const trackWidth = firstTrack.getBoundingClientRect().width;

          gsap.to(marqueeContent, {
            x: -trackWidth,
            duration: 15,
            ease: "none",
            repeat: -1,
            modifiers: {
              x: gsap.utils.unitize((x) => parseFloat(x) % trackWidth),
            },
          });
        }
      });

      // -----------------------------------------------------------------------
      // 6. GRID ASIMÉTRICO DE BENEFICIOS
      // -----------------------------------------------------------------------
      const cardsContainer = scope.querySelector("#beneficios .grid");
      const cards = scope.querySelectorAll("#beneficios .flex.flex-col.gap-2");

      if (cardsContainer && cards.length) {
        gsap.set(cards, { opacity: 0, y: 30 });
        const bentoImages = Array.from(cardsContainer.querySelectorAll("img"));

        Promise.all(
          bentoImages.map((img) =>
            img.decode().catch(() => {
              console.warn("Decodificación asíncrona de imagen mitigada de forma segura.");
            }),
          ),
        ).then(() => {
          gsap.to(cards, {
            scrollTrigger: {
              trigger: cardsContainer,
              start: "top 80%",
              once: true,
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

      // -----------------------------------------------------------------------
      // 7. COMPONENTE INTERACTIVO: CÓMO FUNCIONA (Tabs)
      // -----------------------------------------------------------------------
      const tabs = scope.querySelectorAll(".tab-btn");
      const images = scope.querySelectorAll(".tab-img");
      let currentIndex = 0;

      tabs.forEach((tab, index) => {
        tab.addEventListener("click", () => {
          if (index === currentIndex) return;

          const previousTab = tabs[currentIndex];
          const currentTab = tab;

          // FASE 1: MUTACIÓN DE SALIDA
          previousTab.classList.add("opacity-40", "border-transparent");
          previousTab.classList.remove("bg-[#0d1a1f]", "border-gray-800", "shadow-xl");
          previousTab.querySelector(".tab-number")?.classList.replace("text-brand-orange", "text-gray-500");
          previousTab.querySelector(".tab-title")?.classList.replace("text-white", "text-gray-400");

          gsap.to(previousTab.querySelector(".tab-desc"), {
            height: 0,
            opacity: 0,
            marginTop: 0,
            duration: 0.3,
            ease: "power2.out",
          });
          gsap.to(previousTab.querySelector(".tab-border"), { opacity: 0, duration: 0.3 });

          gsap.to(images[currentIndex], {
            opacity: 0,
            scale: 0.95,
            duration: 0.4,
            ease: "power2.inOut",
            pointerEvents: "none",
          });

          // FASE 2: MUTACIÓN DE ENTRADA
          currentIndex = index;

          currentTab.classList.remove("opacity-40", "border-transparent");
          currentTab.classList.add("bg-[#0d1a1f]", "border-gray-800", "shadow-xl");
          currentTab.querySelector(".tab-number")?.classList.replace("text-gray-500", "text-brand-orange");
          currentTab.querySelector(".tab-title")?.classList.replace("text-gray-400", "text-white");

          gsap.to(currentTab.querySelector(".tab-desc"), {
            height: "auto",
            opacity: 1,
            marginTop: 8,
            duration: 0.3,
            ease: "power2.out",
          });
          gsap.to(currentTab.querySelector(".tab-border"), { opacity: 1, duration: 0.3 });

          gsap.to(images[currentIndex], {
            opacity: 1,
            scale: 1,
            duration: 0.4,
            ease: "power2.inOut",
            pointerEvents: "auto",
          });
        });
      });

      // -----------------------------------------------------------------------
      // 8. SECCIÓN DE PRECIOS
      // -----------------------------------------------------------------------
      const pricingTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: "#pricing",
          start: "top 75%",
          toggleActions: "play none none reverse",
        },
      });

      pricingTimeline
        .from("#pricing h2, #pricing .w-14", {
          y: 30,
          opacity: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: "power2.out",
        })
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

      const pricingCards = scope.querySelectorAll(".pricing-card");

      pricingCards.forEach((card) => {
        const button = card.querySelector("button, a");
        const hoverAnimation = gsap.timeline({ paused: true });

        const isFeatured = card.getBoundingClientRect().width > 0 && card.innerHTML.includes("Pro Studio");

        if (isFeatured) {
          hoverAnimation.to(card, {
            y: -12,
            borderColor: "rgba(255, 107, 0, 1)",
            boxShadow: "0 15px 40px rgba(255, 107, 0, 0.12)",
            duration: 0.3,
            ease: "power2.out",
          });
        } else {
          hoverAnimation.to(card, {
            y: -10,
            borderColor: "rgba(255, 107, 0, 0.4)",
            boxShadow: "0 15px 30px rgba(0, 0, 0, 0.3)",
            duration: 0.3,
            ease: "power2.out",
          });
        }

        if (button) {
          hoverAnimation.to(button, { scale: 1.02, duration: 0.2, ease: "power1.out" }, 0);
        }

        card.addEventListener("mouseenter", () => {
          hoverAnimation.play();
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
          if (!isFeatured) {
            pricingCards.forEach((c) => {
              if (c.innerHTML.includes("Pro Studio")) {
                gsap.to(c, { opacity: 1, scale: 1, duration: 0.3 });
              }
            });
          }
        });
      });

      // -----------------------------------------------------------------------
      // 9. SECCIÓN DE TESTIMONIOS
      // -----------------------------------------------------------------------
      gsap.from(".testimonial-card", {
        scrollTrigger: {
          trigger: "#testimonials",
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
        y: 35,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "power2.out",
      });

      // -----------------------------------------------------------------------
      // 10. BLOQUE FINAL CTA (Parallax)
      // -----------------------------------------------------------------------
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

      const ctaContainer = scope.querySelector(".cta-container");
      const ctaShapes = scope.querySelectorAll(".cta-shape");

      if (ctaContainer && ctaShapes.length > 0) {
        const handleMouseMove = (e) => {
          const { left, top, width, height } = ctaContainer.getBoundingClientRect();
          const x = (e.clientX - left) / width - 0.5;
          const y = (e.clientY - top) / height - 0.5;

          ctaShapes.forEach((shape, index) => {
            const factor = (index + 1) * 15;
            gsap.to(shape, {
              x: x * factor,
              y: y * factor,
              duration: 0.6,
              ease: "power2.out",
            });
          });
        };

        const handleMouseLeave = () => {
          ctaShapes.forEach((shape) => {
            gsap.to(shape, { x: 0, y: 0, duration: 0.8, ease: "power3.out" });
          });
        };

        ctaContainer.addEventListener("mousemove", handleMouseMove);
        ctaContainer.addEventListener("mouseleave", handleMouseLeave);
      }
    },
    { scope: containerRef },
  );
}
