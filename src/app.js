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
const accent = getComputedStyle(document.documentElement).getPropertyValue("--color-accent").trim();
const logo = document.querySelector("[data-trace]");
const paths = logo.querySelectorAll("path");

const fillLogo = () => paths.forEach((p) => Object.assign(p.style, { fill: accent, fillOpacity: 1 }));

if (reduceMotion) {
  fillLogo();
} else {
  // Hero logo trace: each path draws its outline, then fades its fill in. Plays once, when the logo is in view.
  const SPEED = 0.75;
  let traced = false;

  const trace = () => {
    traced = true;
    paths.forEach((p, i) => {
      const len = p.getTotalLength();
      Object.assign(p.style, { fill: accent, stroke: accent, strokeWidth: "12", strokeDasharray: len, strokeDashoffset: len, fillOpacity: 0 });
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

  // Scroll reveals: elements below the fold fade in and move up as they enter.
  // Anything the user has already scrolled past (an anchor jump) appears at once.
  let pending = [...document.querySelectorAll("[data-reveal]")]
    .filter((el) => el.getBoundingClientRect().top >= innerHeight * 0.92);
  pending.forEach((el) => { el.style.opacity = 0; });

  const show = (el, animated) => {
    if (animated) {
      animate(el, { opacity: [0, 1], transform: ["translateY(28px)", "translateY(0px)"] }, { duration: 0.8, ease: [0.22, 1, 0.36, 1] });
    } else {
      el.style.opacity = 1;
    }
  };

  let raf = 0;
  const check = () => {
    raf = 0;
    const vh = innerHeight;
    if (!traced && logo.getBoundingClientRect().top < vh * 0.85) trace();
    pending = pending.filter((el) => {
      const top = el.getBoundingClientRect().top;
      if (top >= vh * 0.92) return true;
      show(el, top > -el.offsetHeight);
      return false;
    });
    if (!pending.length && traced) unbind();
  };
  const onScroll = () => { if (!raf) raf = requestAnimationFrame(check); };
  const unbind = () => {
    removeEventListener("scroll", onScroll, true);
    removeEventListener("resize", onScroll);
  };

  addEventListener("scroll", onScroll, { passive: true, capture: true });
  addEventListener("resize", onScroll);
  check();

  // Safeguard: nothing stays hidden for more than 8s.
  setTimeout(() => {
    pending.forEach((el) => show(el, false));
    pending = [];
    if (!traced) fillLogo();
    unbind();
  }, 8000);
}
