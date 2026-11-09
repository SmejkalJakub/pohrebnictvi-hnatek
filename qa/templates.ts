// Shared QA data: the two pilot templates, their preview ports and route discovery from dist/.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

export const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

export interface TemplateUnderTest {
  id: "rodinna-tradice" | "dustojna-jednoduchost";
  /** Short letter used in the design docs. */
  letter: "A" | "B";
  port: number;
  dir: string;
  dist: string;
  /** The tag every test for this template carries; each Playwright project greps for its own tag. */
  tag: string;
}

function template(
  id: TemplateUnderTest["id"],
  letter: TemplateUnderTest["letter"],
  port: number,
): TemplateUnderTest {
  const dir = join(repoRoot, "templates", id);
  return { id, letter, port, dir, dist: join(dir, "dist"), tag: `@${id}` };
}

export const templates: TemplateUnderTest[] = [
  template("rodinna-tradice", "A", 4411),
  template("dustojna-jednoduchost", "B", 4412),
];

export function baseUrlFor(t: TemplateUnderTest): string {
  return `http://127.0.0.1:${t.port}`;
}

export interface Route {
  /** URL path as served, e.g. "/", "/sluzby/kremace/", "/404.html". */
  path: string;
  /** File-name friendly name, e.g. "home", "sluzby-kremace", "404". */
  slug: string;
}

function walk(dir: string, out: string[]): void {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "_astro") {
        continue;
      }
      walk(full, out);
    } else if (entry.name === "index.html" || entry.name === "404.html") {
      out.push(full);
    }
  }
}

function routeFromFile(dist: string, file: string): Route {
  const rel = relative(dist, file).split(sep).join("/");
  if (rel === "404.html") {
    return { path: "/404.html", slug: "404" };
  }
  const dir = rel.replace(/\/?index\.html$/, "");
  if (dir === "") {
    return { path: "/", slug: "home" };
  }
  return { path: `/${dir}/`, slug: dir.replaceAll("/", "-") };
}

/**
 * Routes are discovered from the build output, never hard-coded. Playwright starts the webServers
 * (which build both templates) before it loads the test files, so dist/ exists at this point.
 */
export function discoverRoutes(t: TemplateUnderTest): Route[] {
  if (!existsSync(t.dist)) {
    return [];
  }
  const files: string[] = [];
  walk(t.dist, files);
  const routes = files.map((file) => routeFromFile(t.dist, file));
  routes.sort((a, b) => a.path.localeCompare(b.path));
  return routes;
}

export const viewports = [
  { name: "375", width: 375, height: 667 },
  { name: "1280", width: 1280, height: 800 },
] as const;

/** WCAG 1.4.10: 1280 px at 400 % zoom. */
export const reflowViewport = { width: 320, height: 568 };

/** 1280 × 800 at 200 % zoom (WCAG 1.4.4 resize text, checked as layout reflow). */
export const zoom200Viewport = { width: 640, height: 400 };

interface EmergencyFixture {
  enabled: boolean;
  label: string;
  phone: string;
}

/** The fixture both templates build against (read-only). */
export const emergency: EmergencyFixture = JSON.parse(
  readFileSync(join(repoRoot, "fixtures/neutral/src/content/site/emergency.json"), "utf8"),
) as EmergencyFixture;

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}
