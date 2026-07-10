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
    if (!root) return [];
    return Array.from(
      root.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter((el) => el.offsetParent !== null || el === document.activeElement);
  };

  /* ── Header scroll ── */
  safeInit("header", () => {
    const header = document.getElementById("site-header");
    if (!header) return;
    const update = () => header.classList.toggle("is-scrolled", window.scrollY > 12);
    update();
    window.addEventListener("scroll", update, { passive: true });
  });

  /* ── Menú móvil ── */
  safeInit("menú móvil", () => {
    const menuButton = document.querySelector(".menu-toggle");
    const closeButton = document.querySelector(".menu-close");
    const navigation = document.getElementById("site-navigation");
    const backdrop = document.querySelector("[data-menu-backdrop]");
    const mq = window.matchMedia(DESKTOP_QUERY);

    if (!menuButton || !closeButton || !navigation || !backdrop) return;

    let lastFocused = null;

    const openMenu = () => {
      lastFocused = document.activeElement;
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
      if (restoreFocus && lastFocused instanceof HTMLElement) lastFocused.focus();
    };

    const isOpen = () => navigation.classList.contains("is-open");

    menuButton.addEventListener("click", () => (isOpen() ? closeMenu() : openMenu()));
    closeButton.addEventListener("click", () => closeMenu());
    backdrop.addEventListener("click", () => closeMenu());

    navigation.addEventListener("click", (e) => {
      if (e.target.closest("a")) closeMenu({ restoreFocus: false });
    });

    document.addEventListener("keydown", (e) => {
      if (!isOpen()) return;
      if (e.key === "Escape") { e.preventDefault(); closeMenu(); return; }
      if (e.key !== "Tab") return;
      const items = getFocusable(navigation);
      const first = items[0];
      const last = items[items.length - 1];
      if (!first || !last) return;
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });

    mq.addEventListener("change", (e) => { if (e.matches && isOpen()) closeMenu({ restoreFocus: false }); });
  });

  /* ── Nav activo por sección visible ── */
  safeInit("nav activo", () => {
    if (!("IntersectionObserver" in window)) return;

    const navLinks = Array.from(
      document.querySelectorAll('.site-nav a[href^="#"]:not(.nav-cta)')
    );
    if (!navLinks.length) return;

    const sectionMap = new Map();
    navLinks.forEach((link) => {
      const id = link.getAttribute("href").replace("#", "");
      const section = document.getElementById(id);
      if (section) sectionMap.set(section, link);
    });

    const visible = new Set();

    const updateActive = () => {
      navLinks.forEach((l) => l.classList.remove("is-active"));
      // Priorizar la sección más alta visible
      let topSection = null;
      let topY = Infinity;
      for (const sec of visible) {
        const rect = sec.getBoundingClientRect();
        if (rect.top < topY) { topY = rect.top; topSection = sec; }
      }
      if (topSection && sectionMap.has(topSection)) {
        sectionMap.get(topSection).classList.add("is-active");
      }
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) visible.add(entry.target);
          else visible.delete(entry.target);
        });
        updateActive();
      },
      { rootMargin: "-20% 0px -55% 0px" }
    );

    sectionMap.forEach((_, section) => io.observe(section));
  });

  /* ── Animaciones progresivas con stagger ── */
  safeInit("animaciones progresivas", () => {
    const elements = Array.from(document.querySelectorAll("[data-reveal]"));
    if (!elements.length) return;

    if (!("IntersectionObserver" in window)) {
      elements.forEach((el) => el.classList.add("is-visible"));
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
      { rootMargin: "0px 0px -8% 0px", threshold: 0.1 }
    );

    elements.forEach((el) => observer.observe(el));
  });

  /* ── Contadores numéricos animados al hacer scroll ── */
  safeInit("contadores", () => {
    const counters = Array.from(document.querySelectorAll("[data-count]"));
    if (!counters.length || !("IntersectionObserver" in window)) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const animateCount = (el, target, suffix) => {
      if (reduceMotion) { el.textContent = target + suffix; return; }
      const duration = 1200;
      const start = performance.now();
      const step = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        // Ease out quint
        const eased = 1 - Math.pow(1 - progress, 4);
        el.textContent = Math.round(eased * target) + suffix;
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const target = parseInt(el.dataset.count, 10);
          const suffix = el.dataset.suffix || "";
          animateCount(el, target, suffix);
          io.unobserve(el);
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach((el) => io.observe(el));
  });

  /* ── Cursor de luz que sigue al mouse en las cards ── */
  safeInit("cursor luz en cards", () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(hover: none)").matches) return; // No en touch

    const cards = Array.from(
      document.querySelectorAll(".problem-card, .service-card, .principle-card")
    );

    cards.forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty("--mouse-x", `${x}%`);
        card.style.setProperty("--mouse-y", `${y}%`);
        card.classList.add("has-glow");
      });

      card.addEventListener("mouseleave", () => {
        card.classList.remove("has-glow");
      });
    });
  });

  /* ── Tilt 3D suave en cards grandes ── */
  safeInit("tilt 3D", () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(hover: none)").matches) return;

    const tiltCards = Array.from(
      document.querySelectorAll(".problem-card, .principle-card")
    );

    tiltCards.forEach((card) => {
      card.style.transformStyle = "preserve-3d";
      card.style.perspective = "800px";

      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (e.clientX - cx) / (rect.width / 2);
        const dy = (e.clientY - cy) / (rect.height / 2);
        const rotX = -dy * 5;
        const rotY = dx * 5;
        card.style.transform = `translateY(-5px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
      });

      card.addEventListener("mouseleave", () => {
        card.style.transform = "";
      });
    });
  });

  /* ── Parallax suave en el hero ── */
  safeInit("parallax hero", () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const asset = document.querySelector(".hero__asset");
    if (!asset) return;

    let ticking = false;
    window.addEventListener("scroll", () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        asset.style.transform = `translateY(${y * 0.15}px)`;
        ticking = false;
      });
    }, { passive: true });
  });

  /* ── Ocultar flotante WA en zona de contacto ── */
  safeInit("ocultar flotante en contacto", () => {
    const floatBtn = document.querySelector(".wa-float");
    const contact = document.getElementById("contacto");
    const footer = document.querySelector(".site-footer");

    if (!floatBtn || !("IntersectionObserver" in window)) return;

    const targets = [contact, footer].filter(Boolean);
    if (!targets.length) return;

    const visible = new Set();
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target);
          else visible.delete(entry.target);
        }
        floatBtn.classList.toggle("wa-float--hidden", visible.size > 0);
      },
      { threshold: 0.15 }
    );

    targets.forEach((t) => io.observe(t));
  });

  /* ── Red de nodos animada en el hero (canvas) ── */
  safeInit("red de nodos del hero", () => {
    const canvas = document.querySelector("[data-hero-network]");
    if (!canvas || typeof canvas.getContext !== "function") return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduceMotion.matches) return;

    const hero = canvas.closest(".hero");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    hero?.classList.add("has-network");

    const BRAND = "70, 225, 181";
    let width = 0, height = 0, dpr = 1;
    let nodes = [];
    let mouse = { x: -9999, y: -9999, active: false };
    let animationId = null;
    let running = false;

    const nodeCount = () => {
      const area = width * height;
      const base = Math.round(area / 22000);
      return Math.max(18, Math.min(64, base));
    };

    const createNodes = () => {
      const count = nodeCount();
      nodes = [];
      for (let i = 0; i < count; i++) {
        const depth = Math.random();
        nodes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.22,
          vy: (Math.random() - 0.5) * 0.22,
          r: 0.9 + depth * 1.9,
          depth,
          pulse: Math.random() * Math.PI * 2,
          pulseSpeed: 0.006 + Math.random() * 0.01
        });
      }
    };

    let signals = [];
    const LINK_DIST = 155;
    const MOUSE_DIST = 200;
    const maxSignals = () => (width < 720 ? 3 : 6);

    const spawnSignal = () => {
      if (nodes.length < 2) return;
      const a = Math.floor(Math.random() * nodes.length);
      let candidates = [];
      for (let j = 0; j < nodes.length; j++) {
        if (j === a) continue;
        const dx = nodes[a].x - nodes[j].x;
        const dy = nodes[a].y - nodes[j].y;
        if (Math.hypot(dx, dy) < LINK_DIST) candidates.push(j);
      }
      if (!candidates.length) return;
      const b = candidates[Math.floor(Math.random() * candidates.length)];
      signals.push({ from: a, to: b, t: 0, speed: 0.012 + Math.random() * 0.016 });
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

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        n.pulse += n.pulseSpeed;
        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;

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

      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
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

      if (signals.length < maxSignals() && Math.random() < 0.04) spawnSignal();

      for (let s = signals.length - 1; s >= 0; s--) {
        const sig = signals[s];
        const from = nodes[sig.from];
        const to = nodes[sig.to];
        if (!from || !to) { signals.splice(s, 1); continue; }
        sig.t += sig.speed;
        if (sig.t >= 1) { signals.splice(s, 1); continue; }
        const px = from.x + (to.x - from.x) * sig.t;
        const py = from.y + (to.y - from.y) * sig.t;
        const glow = Math.sin(sig.t * Math.PI);
        const grd = ctx.createRadialGradient(px, py, 0, px, py, 6);
        grd.addColorStop(0, `rgba(${BRAND}, ${0.9 * glow})`);
        grd.addColorStop(1, `rgba(${BRAND}, 0)`);
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(px, py, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(220, 255, 244, ${glow})`;
        ctx.beginPath();
        ctx.arc(px, py, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }

      for (const n of nodes) {
        const beat = 0.5 + 0.5 * Math.sin(n.pulse);
        const baseAlpha = 0.35 + n.depth * 0.5;
        const haloR = n.r * (3.5 + beat * 1.5);
        const halo = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, haloR);
        halo.addColorStop(0, `rgba(${BRAND}, ${(0.16 + n.depth * 0.14) * (0.6 + beat * 0.4)})`);
        halo.addColorStop(1, `rgba(${BRAND}, 0)`);
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(n.x, n.y, haloR, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(${BRAND}, ${baseAlpha})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      }

      animationId = window.requestAnimationFrame(draw);
    };

    const start = () => { if (running) return; running = true; animationId = window.requestAnimationFrame(draw); };
    const stop = () => { running = false; if (animationId) { window.cancelAnimationFrame(animationId); animationId = null; } };

    hero?.addEventListener("mousemove", (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    });
    hero?.addEventListener("mouseleave", () => { mouse.active = false; });

    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (entries) => { for (const e of entries) e.isIntersecting ? start() : stop(); },
        { threshold: 0.01 }
      );
      io.observe(canvas);
    } else {
      start();
    }

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stop(); else start();
    });

    let resizeTimer = null;
    window.addEventListener("resize", () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(resize, 180);
    });

    reduceMotion.addEventListener?.("change", (e) => {
      if (e.matches) { stop(); ctx.clearRect(0, 0, width, height); hero?.classList.remove("has-network"); }
    });

    resize();
  });

  /* ── FAQ accordion ── */
  safeInit("preguntas frecuentes", () => {
    const accordion = document.querySelector("[data-accordion]");
    if (!accordion) return;

    const questions = Array.from(accordion.querySelectorAll(".faq-question"));

    const setPanelState = (button, open) => {
      const panel = document.getElementById(button.getAttribute("aria-controls"));
      const item = button.closest(".faq-item");
      if (!panel || !item) return;
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

      button.addEventListener("keydown", (e) => {
        const idx = questions.indexOf(button);
        if (e.key === "ArrowDown") { e.preventDefault(); questions[(idx + 1) % questions.length].focus(); }
        if (e.key === "ArrowUp") { e.preventDefault(); questions[(idx - 1 + questions.length) % questions.length].focus(); }
        if (e.key === "Home") { e.preventDefault(); questions[0].focus(); }
        if (e.key === "End") { e.preventDefault(); questions[questions.length - 1].focus(); }
      });
    });

    window.addEventListener("resize", () => {
      questions.forEach((b) => { if (b.getAttribute("aria-expanded") === "true") setPanelState(b, true); });
    }, { passive: true });
  });

  /* ── Formulario de contacto ── */
  safeInit("formulario de contacto", () => {
    const form = document.getElementById("contact-form");
    const status = document.getElementById("form-status");
    const fallbackLink = document.getElementById("mail-fallback");
    if (!form || !status || !fallbackLink) return;

    const fields = {
      name: form.elements.namedItem("name"),
      company: form.elements.namedItem("company"),
      email: form.elements.namedItem("email"),
      area: form.elements.namedItem("area"),
      message: form.elements.namedItem("message")
    };

    const getErrorEl = (field) => {
      const id = field.getAttribute("aria-describedby");
      return id ? document.getElementById(id) : null;
    };

    const setError = (field, msg) => {
      const err = getErrorEl(field);
      field.setAttribute("aria-invalid", msg ? "true" : "false");
      if (err) err.textContent = msg;
    };

    const getValue = (field) => field.value.trim();
    const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

    const validateForm = () => {
      const data = {};
      let firstInvalid = null;
      Object.entries(fields).forEach(([key, field]) => {
        if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement)) return;
        const value = getValue(field);
        data[key] = value;
        if (!value) { setError(field, "Completá este campo para enviar la consulta."); firstInvalid ||= field; return; }
        if (key === "email" && !isValidEmail(value)) { setError(field, "Ingresá un email válido."); firstInvalid ||= field; return; }
        setError(field, "");
      });
      return { data, isValid: !firstInvalid, firstInvalidField: firstInvalid };
    };

    const buildSubject = (d) => `Consulta desde GRUNI — ${d.company}`;
    const buildBody = (d) => [`Nombre: ${d.name}`, `Empresa: ${d.company}`, `Email: ${d.email}`, `Área: ${d.area}`, "", "Proceso o problema:", d.message].join("\n");
    const buildMailto = (d) => `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(buildSubject(d))}&body=${encodeURIComponent(buildBody(d))}`;

    const openMailClient = (url) => { fallbackLink.href = url; fallbackLink.hidden = false; window.location.href = url; };

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const v = validateForm();
      if (!v.isValid) { status.textContent = "Revisá los campos marcados antes de enviar."; v.firstInvalidField.focus(); return; }
      openMailClient(buildMailto(v.data));
      status.textContent = "Intentamos abrir tu cliente de correo. Si no se abrió, usá el enlace de abajo o escribinos directamente a gruni.auth@gmail.com.";
    });

    Object.values(fields).forEach((field) => {
      if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement)) return;
      field.addEventListener("input", () => { if (field.getAttribute("aria-invalid") === "true") validateForm(); });
    });
  });

  /* ── Año dinámico ── */
  safeInit("año dinámico", () => {
    const el = document.getElementById("current-year");
    if (el) el.textContent = String(new Date().getFullYear());
  });

})();
