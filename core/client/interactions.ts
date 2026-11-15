/**
 * Progressive enhancements shared by every template (design review 2026-11-13, §5.2). Each one is
 * driven by data-* attributes the template places in its markup; the template owns all styling.
 * Without JavaScript every page stays complete: nothing here hides or replaces content.
 *
 *  - tel: links on desktop (fine pointer, no touch): a click copies the number and announces it.
 *  - data-office-status: "Kancelář je teď otevřená, do 15:30." from office-hours.json.
 *  - data-spy-nav: marks the link whose section is being read (aria-current="location");
 *    data-spy-counter: "Krok {n} z {total}".
 *  - data-xref="03": hovering or focusing one element highlights every element with that value.
 *  - data-vt-anchor: in-page links that filter with :target animate through a view transition.
 *  - in-page link clicks scroll smoothly (keyboard focus never waits for an animation).
 *  - data-guide-next: the guide's "Potom" links move to the next step without clearing the
 *    situation filter, and mark it data-guide-arrived.
 */
import type { OfficeHours } from "../content/schemas.ts";
import { officeStatusAt, pragueMoment } from "../format/office-status.ts";

const reducedMotion = (): boolean => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function isVisible(element: Element): boolean {
  return element instanceof HTMLElement && element.offsetParent !== null;
}

/* ------------------------------------------------------------------ */
/* Copy phone numbers on desktop                                        */
/* ------------------------------------------------------------------ */

function announcer(): HTMLElement {
  let region = document.querySelector<HTMLElement>("[data-site-toast]");
  if (region === null) {
    region = document.createElement("p");
    region.setAttribute("data-site-toast", "");
    region.setAttribute("role", "status");
    region.setAttribute("aria-live", "polite");
    document.body.append(region);
  }
  return region;
}

let toastTimer: number | undefined;

function announce(message: string): void {
  const region = announcer();
  region.textContent = message;
  region.dataset.visible = "true";
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    region.dataset.visible = "false";
  }, 4000);
}

function setupPhoneCopy(): void {
  const desktop =
    window.matchMedia("(hover: hover) and (pointer: fine)").matches && navigator.maxTouchPoints === 0;
  if (!desktop || navigator.clipboard === undefined) {
    return;
  }
  document.addEventListener("click", (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) {
      return;
    }
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }
    const link = target.closest<HTMLAnchorElement>('a[href^="tel:"]');
    if (link === null) {
      return;
    }
    const number = decodeURIComponent(link.getAttribute("href")?.slice(4) ?? "");
    const display = number.replace(/^(\+420)(\d{3})(\d{3})(\d{3})$/, "$1 $2 $3 $4");
    event.preventDefault();
    navigator.clipboard.writeText(display).then(
      () => {
        link.dataset.copied = "true";
        window.setTimeout(() => {
          delete link.dataset.copied;
        }, 2000);
        announce(`Číslo ${display} je zkopírované. Zavolejte z telefonu.`);
      },
      () => {
        window.location.href = link.href;
      },
    );
  });
}

/* ------------------------------------------------------------------ */
/* Office status                                                       */
/* ------------------------------------------------------------------ */

function setupOfficeStatus(): void {
  const elements = document.querySelectorAll<HTMLElement>("[data-office-status]");
  if (elements.length === 0) {
    return;
  }
  const render = (): void => {
    for (const element of elements) {
      const raw = element.dataset.hours;
      if (raw === undefined) {
        continue;
      }
      let hours: OfficeHours;
      try {
        hours = JSON.parse(raw) as OfficeHours;
      } catch {
        continue;
      }
      const status = officeStatusAt(hours, pragueMoment(new Date()));
      element.dataset.state = status.state;
      const target = element.querySelector<HTMLElement>("[data-office-status-text]") ?? element;
      if (element.dataset.variant === "short") {
        target.textContent = status.short;
      } else {
        target.textContent = status.text;
      }
      element.hidden = status.state === "unknown";
    }
  };
  render();
  window.setInterval(render, 60_000);
}

/* ------------------------------------------------------------------ */
/* Scroll spy and step counter                                          */
/* ------------------------------------------------------------------ */

function setupScrollSpy(): void {
  for (const nav of document.querySelectorAll<HTMLElement>("[data-spy-nav]")) {
    const links = Array.from(nav.querySelectorAll<HTMLAnchorElement>('a[href^="#"]'));
    const pairs = links
      .map((link) => ({ link, section: document.getElementById(decodeURIComponent(link.hash.slice(1))) }))
      .filter((pair): pair is { link: HTMLAnchorElement; section: HTMLElement } => pair.section !== null);
    if (pairs.length === 0) {
      continue;
    }
    const counterId = nav.dataset.spyCounter;
    let counter: HTMLElement | null = null;
    if (counterId !== undefined && counterId !== "") {
      counter = document.getElementById(counterId);
    }
    const activate = (): void => {
      const visible = pairs.filter((pair) => isVisible(pair.section));
      const line = window.innerHeight * 0.35;
      let current = visible[0];
      for (const pair of visible) {
        if (pair.section.getBoundingClientRect().top <= line) {
          current = pair;
        }
      }
      for (const pair of pairs) {
        if (pair === current) {
          pair.link.setAttribute("aria-current", "location");
        } else {
          pair.link.removeAttribute("aria-current");
        }
      }
      if (counter !== null && current !== undefined) {
        const template = counter.dataset.template ?? "{n} z {total}";
        counter.textContent = template
          .replace("{n}", String(visible.indexOf(current) + 1))
          .replace("{total}", String(visible.length));
        counter.hidden = false;
      }
    };
    let queued = false;
    window.addEventListener(
      "scroll",
      () => {
        if (queued) {
          return;
        }
        queued = true;
        window.requestAnimationFrame(() => {
          queued = false;
          activate();
        });
      },
      { passive: true },
    );
    window.addEventListener("hashchange", activate);
    window.addEventListener("resize", activate);
    activate();
  }
}

/* ------------------------------------------------------------------ */
/* Cross-references                                                     */
/* ------------------------------------------------------------------ */

function setupCrossReferences(): void {
  const all = Array.from(document.querySelectorAll<HTMLElement>("[data-xref]"));
  if (all.length === 0) {
    return;
  }
  const highlight = (value: string | null): void => {
    for (const element of all) {
      element.toggleAttribute("data-xref-active", value !== null && element.dataset.xref === value);
    }
  };
  for (const element of all) {
    const value = element.dataset.xref ?? null;
    element.addEventListener("mouseenter", () => {
      highlight(value);
    });
    element.addEventListener("mouseleave", () => {
      highlight(null);
    });
    element.addEventListener("focusin", () => {
      highlight(value);
    });
    element.addEventListener("focusout", () => {
      highlight(null);
    });
  }
}

/* ------------------------------------------------------------------ */
/* Animated :target filters                                             */
/* ------------------------------------------------------------------ */

type ViewTransitionDocument = Document & { startViewTransition?: (update: () => void) => unknown };

function setupAnchorTransitions(): void {
  const doc = document as ViewTransitionDocument;
  if (typeof doc.startViewTransition !== "function") {
    return;
  }
  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element) || event.defaultPrevented || reducedMotion()) {
      return;
    }
    const link = target.closest<HTMLAnchorElement>("a[data-vt-anchor]");
    if (
      link === null ||
      link.origin !== window.location.origin ||
      link.pathname !== window.location.pathname
    ) {
      return;
    }
    event.preventDefault();
    const hash = link.hash;
    doc.startViewTransition?.call(document, () => {
      // Assigning location.hash (unlike pushState) updates :target, which the filters rely on.
      window.location.hash = hash;
    });
  });
}

/* ------------------------------------------------------------------ */
/* Smooth scrolling for in-page link clicks only                       */
/* ------------------------------------------------------------------ */

/**
 * `scroll-behavior: smooth` on <html> would also animate the scroll that follows keyboard focus,
 * so a focused element would arrive late. Instead the attribute is set for the duration of one
 * in-page link click; the default navigation then scrolls smoothly (and still updates :target).
 */
function setupSmoothAnchors(): void {
  const root = document.documentElement;
  let timer: number | undefined;
  const clear = (): void => {
    delete root.dataset.smoothScroll;
  };
  window.addEventListener("scrollend", clear);
  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element) || reducedMotion()) {
      return;
    }
    const link = target.closest<HTMLAnchorElement>('a[href*="#"]');
    if (link === null || link.hash === "" || link.pathname !== window.location.pathname) {
      return;
    }
    if (link.hasAttribute("data-vt-anchor") || link.getAttribute("href") === "#obsah") {
      return;
    }
    root.dataset.smoothScroll = "true";
    window.clearTimeout(timer);
    timer = window.setTimeout(clear, 1500);
  });
}

/* ------------------------------------------------------------------ */
/* Guide: "Potom" links keep the chosen situation                       */
/* ------------------------------------------------------------------ */

/**
 * The guide's situation filter lives in the URL fragment (:target), so a plain "#next-step" link
 * would clear it. With JavaScript, a[data-guide-next] scrolls to and focuses the next step instead
 * and marks it data-guide-arrived (templates style it together with :target). A step drawn as a
 * row that opens (the step is a <details>, or its first child is one) is opened on arrival.
 * Without JavaScript the link still works; the filter then shows all steps.
 */
function setupGuideNext(): void {
  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element) || event.defaultPrevented) {
      return;
    }
    const link = target.closest<HTMLAnchorElement>("a[data-guide-next]");
    if (link === null || link.hash === "" || link.pathname !== window.location.pathname) {
      return;
    }
    const step = document.getElementById(decodeURIComponent(link.hash.slice(1)));
    if (step === null) {
      return;
    }
    event.preventDefault();
    for (const previous of document.querySelectorAll("[data-guide-arrived]")) {
      previous.removeAttribute("data-guide-arrived");
    }
    step.setAttribute("data-guide-arrived", "");
    let row: Element | null = step;
    if (!(row instanceof HTMLDetailsElement)) {
      row = step.firstElementChild;
    }
    if (row instanceof HTMLDetailsElement) {
      row.open = true;
    }
    if (!step.hasAttribute("tabindex")) {
      step.setAttribute("tabindex", "-1");
    }
    let behavior: ScrollBehavior = "smooth";
    if (reducedMotion()) {
      behavior = "auto";
    }
    step.scrollIntoView({ behavior, block: "start" });
    step.focus({ preventScroll: true });
  });
}

export function initSiteInteractions(): void {
  document.documentElement.dataset.js = "true";
  setupPhoneCopy();
  setupOfficeStatus();
  setupScrollSpy();
  setupCrossReferences();
  setupAnchorTransitions();
  setupSmoothAnchors();
  setupGuideNext();
}
