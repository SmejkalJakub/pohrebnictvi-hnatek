/**
 * Markdown plugins for Astro 7's default processor (Sätteri), installed by core/integration.ts.
 *
 * Pages CMS's rich-text editor cannot be restricted (it offers H1–H3, docs/spikes/pages-cms.md §5),
 * so instead of failing the build core normalises what the editor produces:
 *  - every `#` heading in a body becomes `##` (the page H1 comes from the title field);
 *  - heading ids are ASCII slugs ("co-sluzba-zahrnuje"), as content-contract §5 requires for anchors.
 *
 * Types are declared locally so core does not depend on Sätteri's packages directly.
 */
import { asciiSlug } from "../content/primitives.ts";

interface MdastHeading {
  type: "heading";
  depth: number;
}

interface MdastContext {
  setProperty(node: unknown, key: string, value: unknown): void;
}

interface HastElement {
  type: "element";
  tagName: string;
  properties?: Record<string, unknown>;
}

interface HastContext {
  setProperty(node: unknown, key: string, value: unknown): void;
  textContent(node: unknown): string;
}

/** `#` in a body is demoted to `##`. Runs on mdast, before HTML exists. */
export const demoteBodyH1Plugin = {
  name: "site-core-demote-h1",
  heading(node: Readonly<MdastHeading>, ctx: MdastContext): void {
    if (node.depth === 1) {
      ctx.setProperty(node, "depth", 2);
    }
  },
};

/**
 * ASCII heading ids, unique per document. Runs before Astro's own heading-id plugin, which keeps
 * an existing id, so Astro's `headings` metadata uses the same ASCII slugs.
 */
export function asciiHeadingIdsPlugin() {
  const used = new Set<string>();
  return {
    name: "site-core-ascii-heading-ids",
    element: {
      filter: ["h1", "h2", "h3", "h4", "h5", "h6"],
      visit(node: Readonly<HastElement>, ctx: HastContext): void {
        if (typeof node.properties?.id === "string") {
          return;
        }
        const base = asciiSlug(ctx.textContent(node));
        let candidate = base;
        let suffix = 1;
        while (used.has(candidate)) {
          candidate = `${base}-${suffix}`;
          suffix += 1;
        }
        used.add(candidate);
        ctx.setProperty(node, "id", candidate);
      },
    },
  };
}

interface ProcessorLike {
  name: string;
  options: unknown;
}

/** Add the plugins to a Sätteri processor in place. Returns false for any other processor. */
export function installContractMarkdownPlugins(processor: ProcessorLike): boolean {
  if (processor.name !== "satteri") {
    return false;
  }
  const options = processor.options as { mdastPlugins?: unknown[]; hastPlugins?: unknown[] };
  if (!Array.isArray(options.mdastPlugins) || !Array.isArray(options.hastPlugins)) {
    return false;
  }
  options.mdastPlugins.push(demoteBodyH1Plugin);
  // A factory gives every document its own set of used ids.
  options.hastPlugins.push(() => asciiHeadingIdsPlugin());
  return true;
}
