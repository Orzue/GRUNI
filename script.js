(() => {
  const CONTACT_EMAIL = "gruni.auth@gmail.com";
  const SITE_NAME = "GRUNI";
  const DESKTOP_QUERY = "(min-width: 821px)";

  document.documentElement.classList.add("js");

  const safeInit = (name, init) => {
    try {
      init();
    } catch (error) {
      console.error(`${SITE_NAME}: no se pudo inicializar ${name}.`, error);
    }
  };

  const getFocusable = (root) => {
    if (!root) {
      return [];
    }

    return Array.from(
      root.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter((element) => element.offsetParent !== null || element === document.activeElement);
  };

  safeInit("header", () => {
    const header = document.getElementById("site-header");

    if (!header) {
      return;
    }

    const updateHeader = () => {
      header.classList.toggle("is-scrolled", window.scrollY > 12);
    };

    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
  });

  safeInit("menú móvil", () => {
    const menuButton = document.querySelector(".menu-toggle");
    const closeButton = document.querySelector(".menu-close");
    const navigation = document.getElementById("site-navigation");
    const backdrop = document.querySelector("[data-menu-backdrop]");
    const mediaQuery = window.matchMedia(DESKTOP_QUERY);

    if (!menuButton || !closeButton || !navigation || !backdrop) {
      return;
    }

    let lastFocusedElement = null;

    const openMenu = () => {
      lastFocusedElement = document.activeElement;
      menuButton.setAttribute("aria-expanded", "true");
      navigation.classList.add("is-open");
      document.body.classList.add("menu-open");
      backdrop.hidden = false;
      closeButton.focus();
    };

    const closeMenu = ({ restoreFocus = true } = {}) => {
      menuButton.setAttribute("aria-expanded", "false");
      navigation.classList.remove("is-open");
      document.body.classList.remove("menu-open");
      backdrop.hidden = true;

      if (restoreFocus && lastFocusedElement instanceof HTMLElement) {
        lastFocusedElement.focus();
      }
    };

    const isOpen = () => navigation.classList.contains("is-open");

    menuButton.addEventListener("click", () => {
      if (isOpen()) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    closeButton.addEventListener("click", () => closeMenu());
    backdrop.addEventListener("click", () => closeMenu());

    navigation.addEventListener("click", (event) => {
      const link = event.target.closest("a");

      if (link) {
        closeMenu({ restoreFocus: false });
      }
    });

    document.addEventListener("keydown", (event) => {
      if (!isOpen()) {
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusableItems = getFocusable(navigation);
      const firstItem = focusableItems[0];
      const lastItem = focusableItems[focusableItems.length - 1];

      if (!firstItem || !lastItem) {
        return;
      }

      if (event.shiftKey && document.activeElement === firstItem) {
        event.preventDefault();
        lastItem.focus();
      }

      if (!event.shiftKey && document.activeElement === lastItem) {
        event.preventDefault();
        firstItem.focus();
      }
    });

    mediaQuery.addEventListener("change", (event) => {
      if (event.matches && isOpen()) {
        closeMenu({ restoreFocus: false });
      }
    });
  });

  safeInit("preguntas frecuentes", () => {
    const accordion = document.querySelector("[data-accordion]");

    if (!accordion) {
      return;
    }

    const questions = Array.from(accordion.querySelectorAll(".faq-question"));

    const setPanelState = (button, open) => {
      const panel = document.getElementById(button.getAttribute("aria-controls"));
      const item = button.closest(".faq-item");

      if (!panel || !item) {
        return;
      }

      button.setAttribute("aria-expanded", String(open));
      item.classList.toggle("is-open", open);
      panel.style.maxHeight = open ? `${panel.scrollHeight}px` : "0px";
    };

    questions.forEach((button) => {
      setPanelState(button, false);

      button.addEventListener("click", () => {
        const isExpanded = button.getAttribute("aria-expanded") === "true";
        setPanelState(button, !isExpanded);
      });

      button.addEventListener("keydown", (event) => {
        const currentIndex = questions.indexOf(button);

        if (event.key === "ArrowDown") {
          event.preventDefault();
          questions[(currentIndex + 1) % questions.length].focus();
        }

        if (event.key === "ArrowUp") {
          event.preventDefault();
          questions[(currentIndex - 1 + questions.length) % questions.length].focus();
        }

        if (event.key === "Home") {
          event.preventDefault();
          questions[0].focus();
        }

        if (event.key === "End") {
          event.preventDefault();
          questions[questions.length - 1].focus();
        }
      });
    });

    window.addEventListener(
      "resize",
      () => {
        questions.forEach((button) => {
          if (button.getAttribute("aria-expanded") === "true") {
            setPanelState(button, true);
          }
        });
      },
      { passive: true }
    );
  });

  safeInit("formulario de contacto", () => {
    const form = document.getElementById("contact-form");
    const status = document.getElementById("form-status");
    const fallbackLink = document.getElementById("mail-fallback");

    if (!form || !status || !fallbackLink) {
      return;
    }

    const fields = {
      name: form.elements.namedItem("name"),
      company: form.elements.namedItem("company"),
      email: form.elements.namedItem("email"),
      area: form.elements.namedItem("area"),
      message: form.elements.namedItem("message")
    };

    const getErrorElement = (field) => {
      const errorId = field.getAttribute("aria-describedby");
      return errorId ? document.getElementById(errorId) : null;
    };

    const setError = (field, message) => {
      const error = getErrorElement(field);
      field.setAttribute("aria-invalid", message ? "true" : "false");

      if (error) {
        error.textContent = message;
      }
    };

    const getValue = (field) => field.value.trim();

    const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

    const validateForm = () => {
      const data = {};
      let firstInvalidField = null;

      Object.entries(fields).forEach(([key, field]) => {
        if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement)) {
          return;
        }

        const value = getValue(field);
        data[key] = value;

        if (!value) {
          setError(field, "Completá este campo para enviar la consulta.");
          firstInvalidField ||= field;
          return;
        }

        if (key === "email" && !isValidEmail(value)) {
          setError(field, "Ingresá un email válido.");
          firstInvalidField ||= field;
          return;
        }

        setError(field, "");
      });

      return {
        data,
        isValid: !firstInvalidField,
        firstInvalidField
      };
    };

    const buildSubject = (data) => `Consulta desde GRUNI — ${data.company}`;

    const buildBody = (data) => [
      `Nombre: ${data.name}`,
      `Empresa: ${data.company}`,
      `Email: ${data.email}`,
      `Área: ${data.area}`,
      "",
      "Proceso o problema:",
      data.message
    ].join("\n");

    const buildMailto = (data) => {
      const subject = encodeURIComponent(buildSubject(data));
      const body = encodeURIComponent(buildBody(data));
      return `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
    };

    const openMailClient = (mailtoUrl) => {
      fallbackLink.href = mailtoUrl;
      fallbackLink.hidden = false;
      window.location.href = mailtoUrl;
    };

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const validation = validateForm();

      if (!validation.isValid) {
        status.textContent = "Revisá los campos marcados antes de enviar.";
        validation.firstInvalidField.focus();
        return;
      }

      const mailtoUrl = buildMailto(validation.data);

      // Futuro: reemplazar este bloque por Formspree, Resend, EmailJS, una API propia o una función serverless.
      openMailClient(mailtoUrl);
      status.textContent = "Intentamos abrir tu cliente de correo. Si no se abrió, usá el enlace de abajo o escribinos directamente a gruni.auth@gmail.com.";
    });

    Object.values(fields).forEach((field) => {
      if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement)) {
        return;
      }

      field.addEventListener("input", () => {
        if (field.getAttribute("aria-invalid") === "true") {
          validateForm();
        }
      });
    });
  });

  safeInit("animaciones progresivas", () => {
    const elements = Array.from(document.querySelectorAll("[data-reveal]"));

    if (!elements.length) {
      return;
    }

    if (!("IntersectionObserver" in window)) {
      elements.forEach((element) => element.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: "0px 0px -8% 0px",
        threshold: 0.12
      }
    );

    elements.forEach((element) => observer.observe(element));
  });

  safeInit("año dinámico", () => {
    const yearElement = document.getElementById("current-year");

    if (yearElement) {
      yearElement.textContent = String(new Date().getFullYear());
    }
  });

  safeInit("ocultar flotante en contacto", () => {
    const floatBtn = document.querySelector(".wa-float");
    const contact = document.getElementById("contacto");
    const footer = document.querySelector(".site-footer");

    if (!floatBtn || !("IntersectionObserver" in window)) {
      return;
    }

    const targets = [contact, footer].filter(Boolean);
    if (!targets.length) {
      return;
    }

    const visible = new Set();
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            visible.add(entry.target);
          } else {
            visible.delete(entry.target);
          }
        }
        floatBtn.classList.toggle("wa-float--hidden", visible.size > 0);
      },
      { threshold: 0.15 }
    );

    targets.forEach((t) => io.observe(t));
  });

  safeInit("red de nodos del hero", () => {
    const canvas = document.querySelector("[data-hero-network]");

    if (!canvas || typeof canvas.getContext !== "function") {
      return;
    }

    // Respetar la preferencia de "reducir movimiento".
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduceMotion.matches) {
      return;
    }

    const hero = canvas.closest(".hero");
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    hero?.classList.add("has-network");

    const BRAND = "70, 225, 181"; // --color-brand-light en RGB
    let width = 0;
    let height = 0;
    let dpr = 1;
    let nodes = [];
    let mouse = { x: -9999, y: -9999, active: false };
    let animationId = null;
    let running = false;

    // Cantidad de nodos según el ancho: menos en mobile para cuidar batería.
    const nodeCount = () => {
      const area = width * height;
      const base = Math.round(area / 22000);
      return Math.max(18, Math.min(64, base));
    };

    const createNodes = () => {
      const count = nodeCount();
      nodes = [];
      for (let i = 0; i < count; i += 1) {
        // "depth" 0..1: nodos más lejanos (chicos, tenues) o más cercanos (grandes, brillantes)
        const depth = Math.random();
        nodes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.22,
          vy: (Math.random() - 0.5) * 0.22,
          r: 0.9 + depth * 1.9,
          depth,
          // fase para el latido de brillo de cada nodo
          pulse: Math.random() * Math.PI * 2,
          pulseSpeed: 0.006 + Math.random() * 0.01
        });
      }
    };

    // Pulsos de datos: pequeñas señales que viajan de un nodo a otro por las líneas.
    let signals = [];

    const spawnSignal = () => {
      if (nodes.length < 2) return;
      const a = Math.floor(Math.random() * nodes.length);
      // buscar un vecino dentro de rango para que el trayecto sea corto y visible
      let candidates = [];
      for (let j = 0; j < nodes.length; j += 1) {
        if (j === a) continue;
        const dx = nodes[a].x - nodes[j].x;
        const dy = nodes[a].y - nodes[j].y;
        if (Math.hypot(dx, dy) < LINK_DIST) candidates.push(j);
      }
      if (!candidates.length) return;
      const b = candidates[Math.floor(Math.random() * candidates.length)];
      signals.push({
        from: a,
        to: b,
        t: 0,
        speed: 0.012 + Math.random() * 0.016
      });
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      createNodes();
      signals = [];
    };

    const LINK_DIST = 155; // distancia máxima para unir dos nodos
    const MOUSE_DIST = 200; // radio de influencia del cursor
    // cuántos pulsos simultáneos como máximo (menos en mobile)
    const maxSignals = () => (width < 720 ? 3 : 6);

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Mover nodos y rebotar en los bordes.
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        n.pulse += n.pulseSpeed;

        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;

        // Atracción suave hacia el cursor (interactividad).
        if (mouse.active) {
          const dx = mouse.x - n.x;
          const dy = mouse.y - n.y;
          const dist = Math.hypot(dx, dy);
          if (dist < MOUSE_DIST && dist > 0.001) {
            const pull = (1 - dist / MOUSE_DIST) * 0.16;
            n.x += (dx / dist) * pull;
            n.y += (dy / dist) * pull;
          }
        }
      }

      // Dibujar conexiones.
      for (let i = 0; i < nodes.length; i += 1) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j += 1) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < LINK_DIST) {
            const alpha = (1 - dist / LINK_DIST) * 0.28;
            ctx.strokeStyle = `rgba(${BRAND}, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }

        // Línea extra hacia el cursor: los nodos cercanos "se enganchan".
        if (mouse.active) {
          const mdx = a.x - mouse.x;
          const mdy = a.y - mouse.y;
          const mdist = Math.hypot(mdx, mdy);
          if (mdist < MOUSE_DIST) {
            const alpha = (1 - mdist / MOUSE_DIST) * 0.45;
            ctx.strokeStyle = `rgba(${BRAND}, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        }
      }

      // Generar y avanzar pulsos de datos.
      if (signals.length < maxSignals() && Math.random() < 0.04) {
        spawnSignal();
      }
      for (let s = signals.length - 1; s >= 0; s -= 1) {
        const sig = signals[s];
        const from = nodes[sig.from];
        const to = nodes[sig.to];
        if (!from || !to) {
          signals.splice(s, 1);
          continue;
        }
        sig.t += sig.speed;
        if (sig.t >= 1) {
          signals.splice(s, 1);
          continue;
        }
        const px = from.x + (to.x - from.x) * sig.t;
        const py = from.y + (to.y - from.y) * sig.t;
        // brillo del pulso (más fuerte en el medio del trayecto)
        const glow = Math.sin(sig.t * Math.PI);
        const grd = ctx.createRadialGradient(px, py, 0, px, py, 6);
        grd.addColorStop(0, `rgba(${BRAND}, ${0.9 * glow})`);
        grd.addColorStop(1, `rgba(${BRAND}, 0)`);
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(px, py, 6, 0, Math.PI * 2);
        ctx.fill();
        // núcleo brillante
        ctx.fillStyle = `rgba(220, 255, 244, ${glow})`;
        ctx.beginPath();
        ctx.arc(px, py, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }

      // Dibujar nodos con halo y latido.
      for (const n of nodes) {
        const beat = 0.5 + 0.5 * Math.sin(n.pulse);
        const baseAlpha = 0.35 + n.depth * 0.5;
        // halo
        const haloR = n.r * (3.5 + beat * 1.5);
        const halo = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, haloR);
        halo.addColorStop(0, `rgba(${BRAND}, ${(0.16 + n.depth * 0.14) * (0.6 + beat * 0.4)})`);
        halo.addColorStop(1, `rgba(${BRAND}, 0)`);
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(n.x, n.y, haloR, 0, Math.PI * 2);
        ctx.fill();
        // punto
        ctx.fillStyle = `rgba(${BRAND}, ${baseAlpha})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      }

      animationId = window.requestAnimationFrame(draw);
    };

    const start = () => {
      if (running) return;
      running = true;
      animationId = window.requestAnimationFrame(draw);
    };

    const stop = () => {
      running = false;
      if (animationId) {
        window.cancelAnimationFrame(animationId);
        animationId = null;
      }
    };

    // Interactividad con mouse (desktop).
    hero?.addEventListener("mousemove", (event) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = event.clientX - rect.left;
      mouse.y = event.clientY - rect.top;
      mouse.active = true;
    });
    hero?.addEventListener("mouseleave", () => {
      mouse.active = false;
    });

    // Pausar la animación cuando el hero no está en pantalla (ahorra batería).
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              start();
            } else {
              stop();
            }
          }
        },
        { threshold: 0.01 }
      );
      io.observe(canvas);
    } else {
      start();
    }

    // Pausar si la pestaña pasa a segundo plano.
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        stop();
      } else {
        start();
      }
    });

    let resizeTimer = null;
    window.addEventListener("resize", () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(resize, 180);
    });

    // Si el usuario activa reduce-motion en vivo, apagamos.
    reduceMotion.addEventListener?.("change", (event) => {
      if (event.matches) {
        stop();
        ctx.clearRect(0, 0, width, height);
        hero?.classList.remove("has-network");
      }
    });

    resize();
  });
})();
