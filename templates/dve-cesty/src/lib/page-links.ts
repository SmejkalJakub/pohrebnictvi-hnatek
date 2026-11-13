/**
 * The path navigation with every optional page and anchor that is on, for the layout (header,
 * menu, footer) and for the opening panels' "V této cestě" row. Reads through core loaders only.
 */
import { getDocuments, getFaq, getOptionalPage, getPeople, hasPage } from "@core/content/load.ts";
import type { NavItem, SiteContext } from "@core/content/view-models.ts";
import { pathNav, type PathLink, type PathNav } from "./site.ts";

async function optionalNavItem(id: "pro-ucastniky" | "pohreb-predem", enabled: boolean): Promise<NavItem | null> {
  if (!enabled) {
    return null;
  }
  const page = await getOptionalPage(id);
  if (page === null) {
    return null;
  }
  return { id, label: page.data.navLabel, href: `/${id}/` };
}

export async function hasDocumentLinks(): Promise<boolean> {
  const documents = await getDocuments();
  return documents.length > 0 && (await hasPage("pravni-informace"));
}

export async function getPathNav(site: SiteContext, url: string): Promise<PathNav> {
  const people = await getPeople();
  const faq = await getFaq();
  return pathNav(site, url, {
    guestInfo: await optionalNavItem("pro-ucastniky", site.config.features.guestInfo),
    prePlanning: await optionalNavItem("pohreb-predem", site.config.features.prePlanning),
    hasPeople: people.length > 0,
    hasFaq: faq.length > 0,
    hasDocuments: await hasDocumentLinks(),
  });
}

/** The links of one path, for the opening panel's "V této cestě" row. */
export async function getPathLinks(site: SiteContext, url: string, path: "now" | "ahead"): Promise<PathLink[]> {
  const nav = await getPathNav(site, url);
  if (path === "now") {
    return nav.now;
  }
  return nav.ahead;
}
