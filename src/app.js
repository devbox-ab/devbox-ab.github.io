// Devbox site behaviour. Source of truth; `npm run build` bundles it with Motion into app.min.js.
import { animate } from "motion";

// Mobile menu --------------------------------------------------------------

const nav = document.querySelector(".nav");
const menuBtn = document.getElementById("menu-btn");

const setMenu = (open) => {
  nav.toggleAttribute("data-open", open);
  menuBtn.setAttribute("aria-expanded", String(open));
  menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
};

menuBtn.addEventListener("click", () => setMenu(!nav.hasAttribute("data-open")));
for (const link of document.querySelectorAll("[data-close-menu]")) {
  link.addEventListener("click", () => setMenu(false));
}
matchMedia("(min-width: 720px)").addEventListener("change", (e) => e.matches && setMenu(false));

// Motion -------------------------------------------------------------------

const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const logo = document.querySelector("[data-trace]");
const paths = logo.querySelectorAll("path");
const ACCENT = "var(--color-accent)";

const fillLogo = () => paths.forEach((p) => Object.assign(p.style, { fill: ACCENT, fillOpacity: 1 }));

if (reduceMotion) {
  fillLogo();
} else {
  const SPEED = 0.75;

  // Hero logo trace: each path draws its outline, then fades its fill in. Plays once, when the logo is in view.
  const trace = () => {
    const lens = [...paths].map((p) => p.getTotalLength()); // read all before writing any
    paths.forEach((p, i) => {
      const len = lens[i];
      Object.assign(p.style, { fill: ACCENT, stroke: ACCENT, strokeWidth: "12", strokeDasharray: len, strokeDashoffset: len, fillOpacity: 0 });
      animate(len, 0, {
        duration: 1 / SPEED,
        delay: (0.2 + i * 0.06) / SPEED,
        ease: [0.65, 0, 0.35, 1],
        onUpdate: (v) => { p.style.strokeDashoffset = v; },
      });
      animate(0, 1, {
        duration: 0.5 / SPEED,
        delay: (1.2 + i * 0.04) / SPEED,
        onUpdate: (v) => { p.style.fillOpacity = v; p.style.strokeOpacity = 1 - v; },
      });
    });
  };

  // Scroll reveals: elements below the fold are hidden on first observation and fade in as they enter.
  // Anything already on screen, or above it after an anchor jump, is left alone.
  const show = (el, animated) => {
    if (animated) {
      animate(el, { opacity: [0, 1], transform: ["translateY(28px)", "translateY(0px)"] }, { duration: 0.8, ease: [0.22, 1, 0.36, 1] });
    } else {
      el.style.opacity = 1;
    }
  };

  const io = new IntersectionObserver((entries) => {
    const vh = innerHeight; // layout is clean at the start of an IO callback, so this read is free
    for (const { target: el, isIntersecting, boundingClientRect: rect } of entries) {
      if (el === logo) {
        if (isIntersecting) { trace(); io.unobserve(el); }
      } else if (isIntersecting || rect.top < vh) {
        show(el, el.style.opacity === "0");
        io.unobserve(el);
      } else {
        el.style.opacity = 0;
      }
    }
  }, { rootMargin: "0px 0px -8% 0px" });
  io.observe(logo);
  document.querySelectorAll("[data-reveal]").forEach((el) => io.observe(el));
}
