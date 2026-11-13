/** Loads the counts behind the index (nav row, Rejstřík, 404) through core loaders. */
import {
  getCoffins,
  getDocuments,
  getFaq,
  getFlowers,
  getGuidance,
  getNoticeIndex,
  getOptionalPage,
  getPeople,
  getPricing,
  getServices,
} from "@core/content/load.ts";
import type { NavItem, SiteContext } from "@core/content/view-models.ts";
import { fullIndex, neutralIndex, type IndexEntry } from "./directory.ts";

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

export async function loadIndex(site: SiteContext, path: string, neutral: boolean): Promise<IndexEntry[]> {
  if (neutral) {
    return neutralIndex(site, path);
  }
  const faq = await getFaq();
  const people = await getPeople();
  const documents = await getDocuments();
  const pricing = await getPricing();
  let firstPrice = null;
  if (pricing !== null) {
    firstPrice = pricing.groups[0]?.items[0] ?? null;
  }
  return fullIndex(
    site,
    path,
    {
      guestInfo: await optionalNavItem("pro-ucastniky", site.config.features.guestInfo),
      prePlanning: await optionalNavItem("pohreb-predem", site.config.features.prePlanning),
      hasPeople: people.length > 0,
      hasFaq: faq.length > 0,
      hasDocuments: documents.length > 0,
      hasLegalPage: site.legalLink !== null,
    },
    {
      steps: (await getGuidance()).length,
      upcoming: (await getNoticeIndex()).upcoming.length,
      services: (await getServices()).length,
      coffins: (await getCoffins()).length,
      flowers: (await getFlowers()).length,
      people: people.length,
      questions: faq.reduce((sum, group) => sum + group.entries.length, 0),
      documents: documents.length,
      firstPrice,
    },
  );
}
