/// <reference lib="dom" />
// Functions evaluated inside the page (page.evaluate). Each one must be self-contained: Playwright
// serialises the function source, so they may not call other module-level helpers.

export interface EmergencyCandidate {
  index: number;
  href: string;
  name: string;
  visible: boolean;
  inFirstViewport: boolean;
  inFixedBar: boolean;
  width: number;
  height: number;
}

/** Describes every [data-emergency-link] at the current scroll position (call at scrollY = 0). */
export function describeEmergencyLinks(): EmergencyCandidate[] {
  const links = Array.from(document.querySelectorAll<HTMLAnchorElement>("[data-emergency-link]"));
  return links.map((link, index) => {
    const rect = link.getBoundingClientRect();
    const style = getComputedStyle(link);
    const visible =
      link.checkVisibility({ opacityProperty: true, visibilityProperty: true }) &&
      rect.width > 0 &&
      rect.height > 0 &&
      style.visibility !== "hidden";
    const inFirstViewport =
      rect.top >= 0 && rect.left >= 0 && rect.bottom <= window.innerHeight && rect.right <= window.innerWidth;
    let inFixedBar = false;
    let node: Element | null = link;
    while (node !== null) {
      const position = getComputedStyle(node).position;
      if (position === "fixed" || position === "sticky") {
        inFixedBar = true;
        break;
      }
      node = node.parentElement;
    }
    return {
      index,
      href: link.getAttribute("href") ?? "",
      name: link.getAttribute("aria-label") ?? link.textContent ?? "",
      visible,
      inFirstViewport,
      inFixedBar,
      width: rect.width,
      height: rect.height,
    };
  });
}

export interface HoursFinding {
  text: string;
  container: string;
  problem: string;
}

export interface HoursReport {
  hoursFound: number;
  findings: HoursFinding[];
}

/**
 * Invariant 2 (template-contract §6, content-contract §6.4/§6.5): office hours and the emergency CTA
 * never share a container, list or heading.
 *
 * - Hours text = any text node with a time range such as "7:00–15:30".
 * - Its container = the nearest `[data-office-hours]`, `dl`, `table`, `ul`, `ol` or sectioning element
 *   (`section`, `aside`, `article`, `footer`, `header`, `main`). The container must not contain an
 *   emergency link, must not sit inside an emergency link or `[data-emergency-block]`, and must not
 *   mention "nonstop" or "24 hodin".
 * - Its heading = the nearest heading before it in document order. No emergency link may have the same
 *   nearest heading (a shared heading).
 */
export function checkHoursSeparation(): HoursReport {
  const timeRange = /\b\d{1,2}:\d{2}\s*[–-]\s*\d{1,2}:\d{2}\b/;
  const containerSelector =
    "[data-office-hours], dl, table, ul, ol, section, aside, article, footer, header, main";
  const emergencyLinks = Array.from(document.querySelectorAll("[data-emergency-link]"));
  const headings = Array.from(document.querySelectorAll("h1, h2, h3, h4, h5, h6"));

  const describe = (el: Element): string => {
    const id = el.id === "" ? "" : `#${el.id}`;
    const hooks = Array.from(el.attributes)
      .filter((a) => a.name.startsWith("data-") && !a.name.startsWith("data-astro"))
      .map((a) => `[${a.name}]`)
      .join("");
    return `${el.tagName.toLowerCase()}${id}${hooks}`;
  };

  const headingBefore = (node: Node): Element | null => {
    let found: Element | null = null;
    for (const heading of headings) {
      const relation = heading.compareDocumentPosition(node);
      if ((relation & Node.DOCUMENT_POSITION_FOLLOWING) !== 0 || heading.contains(node)) {
        found = heading;
      } else {
        break;
      }
    }
    return found;
  };

  const emergencyHeadings = new Set<Element>();
  for (const link of emergencyLinks) {
    const heading = headingBefore(link);
    if (heading !== null) {
      emergencyHeadings.add(heading);
    }
  }

  const findings: HoursFinding[] = [];
  let hoursFound = 0;
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let current = walker.nextNode();
  while (current !== null) {
    const textNode = current;
    current = walker.nextNode();
    const value = textNode.textContent ?? "";
    if (!timeRange.test(value)) {
      continue;
    }
    const parent = textNode.parentElement;
    if (parent === null || parent.closest("script, style, [data-emergency-link]") !== null) {
      continue;
    }
    hoursFound += 1;
    const text = value.trim().slice(0, 60);
    const container = parent.closest(containerSelector);
    if (container === null) {
      findings.push({ text, container: "(none)", problem: "hours text outside any container" });
      continue;
    }
    const label = describe(container);
    if (container.querySelector("[data-emergency-link]") !== null) {
      findings.push({ text, container: label, problem: "container also holds an emergency link" });
    }
    if (container.closest("[data-emergency-link], [data-emergency-block]") !== null) {
      findings.push({ text, container: label, problem: "container sits inside an emergency block" });
    }
    if (/nonstop|24\s*hodin/i.test(container.textContent ?? "")) {
      findings.push({ text, container: label, problem: "container text mentions nonstop / 24 hodin" });
    }
    const heading = headingBefore(textNode);
    if (heading !== null && emergencyHeadings.has(heading)) {
      findings.push({
        text,
        container: label,
        problem: `shares the heading "${(heading.textContent ?? "").trim()}" with an emergency link`,
      });
    }
  }
  return { hoursFound, findings };
}

export interface HeadingReport {
  h1Count: number;
  outline: string[];
  skips: string[];
}

/** Heading outline of rendered headings (call after opening every <details>). */
export function headingOutline(): HeadingReport {
  const headings = Array.from(document.querySelectorAll<HTMLElement>("h1, h2, h3, h4, h5, h6")).filter(
    (h) => h.checkVisibility() && h.closest("[aria-hidden='true']") === null,
  );
  const outline: string[] = [];
  const skips: string[] = [];
  let previous = 0;
  for (const heading of headings) {
    const level = Number(heading.tagName.slice(1));
    const text = (heading.textContent ?? "").trim().replace(/\s+/g, " ").slice(0, 70);
    outline.push(`h${level} ${text}`);
    if (previous > 0 && level > previous + 1) {
      skips.push(`h${previous} → h${level} at "${text}"`);
    }
    if (previous === 0 && level !== 1) {
      skips.push(`first heading is h${level} ("${text}")`);
    }
    previous = level;
  }
  return { h1Count: headings.filter((h) => h.tagName === "H1").length, outline, skips };
}

export interface FocusState {
  isBody: boolean;
  key: string;
  description: string;
  hasIndicator: boolean;
  indicator: string;
  inViewport: boolean;
  obscuredBy: string | null;
}

/** Describes document.activeElement: its focus indicator and whether anything covers it. */
export function describeFocus(): FocusState {
  const el = document.activeElement;
  if (el === null || el === document.body || el === document.documentElement) {
    return {
      isBody: true,
      key: "body",
      description: "body",
      hasIndicator: false,
      indicator: "",
      inViewport: false,
      obscuredBy: null,
    };
  }
  const short = (node: Element): string => {
    const id = node.id === "" ? "" : `#${node.id}`;
    const text = (node.getAttribute("aria-label") ?? node.textContent ?? "")
      .trim()
      .replace(/\s+/g, " ")
      .slice(0, 40);
    const href = node.getAttribute("href");
    const target = href === null ? "" : ` → ${href}`;
    return `${node.tagName.toLowerCase()}${id} "${text}"${target}`;
  };
  // A stable key: the element's position among all elements.
  const all = Array.from(document.querySelectorAll("*"));
  const key = String(all.indexOf(el));
  const style = getComputedStyle(el);
  const outlineWidth = Number.parseFloat(style.outlineWidth);
  const outlineVisible =
    style.outlineStyle !== "none" &&
    outlineWidth >= 1 &&
    style.outlineColor !== "transparent" &&
    !style.outlineColor.endsWith(", 0)");
  const shadowVisible = style.boxShadow !== "none" && style.boxShadow !== "";
  const indicator = `outline: ${style.outlineStyle} ${style.outlineWidth} ${style.outlineColor}; box-shadow: ${style.boxShadow}`;

  const rects = Array.from(el.getClientRects()).filter((r) => r.width > 0 && r.height > 0);
  const rect = rects[0] ?? el.getBoundingClientRect();
  const inViewport =
    rect.bottom > 0 && rect.right > 0 && rect.top < window.innerHeight && rect.left < window.innerWidth;
  let obscuredBy: string | null = null;
  if (inViewport) {
    const x = Math.min(Math.max(rect.left + rect.width / 2, 0), window.innerWidth - 1);
    const y = Math.min(Math.max(rect.top + rect.height / 2, 0), window.innerHeight - 1);
    const hit = document.elementFromPoint(x, y);
    if (hit !== null && hit !== el && !el.contains(hit)) {
      const cover =
        hit.closest("[data-mobile-action-bar], header, aside, [data-utility-strip], nav, footer") ?? hit;
      obscuredBy = short(cover);
    }
  }
  return {
    isBody: false,
    key,
    description: short(el),
    hasIndicator: outlineVisible || shadowVisible,
    indicator,
    inViewport,
    obscuredBy,
  };
}

/** True when the page scrolls horizontally. */
export function horizontalOverflow(): { scrollWidth: number; clientWidth: number; offenders: string[] } {
  const root = document.scrollingElement ?? document.documentElement;
  const clientWidth = root.clientWidth;
  const offenders: string[] = [];
  for (const el of Array.from(document.body.querySelectorAll("*"))) {
    const rect = el.getBoundingClientRect();
    if (rect.right > clientWidth + 1 && rect.width > 0) {
      offenders.push(
        `${el.tagName.toLowerCase()}${el.id === "" ? "" : `#${el.id}`} right=${Math.round(rect.right)}`,
      );
    }
    if (offenders.length >= 8) {
      break;
    }
  }
  return { scrollWidth: root.scrollWidth, clientWidth, offenders };
}

/** Opens every <details> element so that its content is part of the rendered outline. */
export function openAllDetails(): number {
  const all = Array.from(document.querySelectorAll("details"));
  for (const details of all) {
    details.open = true;
  }
  return all.length;
}
