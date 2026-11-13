/**
 * The two paths of template D (docs/designs/dve-cesty/README.md § Paths). Every page belongs to
 * "now" (Teď hned: navy opening with the number), "ahead" (S předstihem: stone opening), the
 * neutral notice group (research L1: no path at all) or "both" (home, 404).
 * The switch is exhaustive, so a new core page id fails the typecheck until it is assigned.
 */
import type { PageId } from "@core/content/schemas.ts";

export type PathId = "now" | "ahead" | "neutral" | "both";

export function pathOf(id: PageId): PathId {
  switch (id) {
    case "home": {
      return "both";
    }
    case "jak-postupovat":
    case "kontakt": {
      return "now";
    }
    case "oznameni": {
      return "neutral";
    }
    case "sluzby":
    case "rakve":
    case "kvetiny":
    case "o-nas":
    case "cenik":
    case "ochrana-osobnich-udaju":
    case "clanky":
    case "pro-ucastniky":
    case "pohreb-predem":
    case "pravni-informace": {
      return "ahead";
    }
    default: {
      const unassigned: never = id;
      throw new Error(`Page "${String(unassigned)}" belongs to no path.`);
    }
  }
}

/** Where each switch option leads: the first page of its path (both always exist). */
export const PATH_HREF = {
  now: "/jak-postupovat/",
  ahead: "/sluzby/",
} as const;
