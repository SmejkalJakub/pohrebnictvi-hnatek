/** Locations inside the template-system repository, and loaders for its template manifests. */
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import type { TemplateManifest } from "../../core/content/config.ts";

export const REPO_ROOT = fileURLToPath(new URL("../..", import.meta.url));
export const CORE_DIR = path.join(REPO_ROOT, "core");
export const TEMPLATES_DIR = path.join(REPO_ROOT, "templates");

export function templateDir(templateId: string): string {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(templateId)) {
    throw new Error(`Invalid template id "${templateId}".`);
  }
  const dir = path.join(TEMPLATES_DIR, templateId);
  if (!existsSync(path.join(dir, "template.manifest.ts"))) {
    throw new Error(`Template "${templateId}" not found (expected ${dir}/template.manifest.ts).`);
  }
  return dir;
}

/** Imports templates/<id>/template.manifest.ts (Node strips its types; it has only `import type`). */
export async function loadManifest(templateId: string): Promise<TemplateManifest> {
  const file = path.join(templateDir(templateId), "template.manifest.ts");
  const module = (await import(pathToFileURL(file).href)) as { default: TemplateManifest };
  return module.default;
}

/** True when `child` is `parent` itself or lies inside it. */
export function isInside(parent: string, child: string): boolean {
  const relative = path.relative(parent, child);
  if (relative === "") {
    return true;
  }
  return !relative.startsWith("..") && !path.isAbsolute(relative);
}
