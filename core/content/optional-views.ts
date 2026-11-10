/**
 * View models for the optional content types (content-contract §6.13–§6.17): notices, people, FAQ,
 * documents and legal information. Pure functions shared by the Astro loaders and unit tests.
 *
 * Notice views are deliberately narrow (research L1, L12): they carry the practical facts of the
 * notice and nothing else. No consent record, no publication window, no prices, services or links
 * to them. Templates render a notice page from NoticeView alone.
 */
import { czechWeekday, formatCzechDate, formatCzechTime, formatYearOrDate } from "../format/date.ts";
import { formatPhone, type FormattedPhone } from "../format/phone.ts";
import { documentHref, normalizeDocumentFile, parteHref } from "../media/documents.ts";
import { qrSvg } from "../qr/qr-code.ts";
import {
  DOCUMENT_KINDS,
  FAQ_TOPICS,
  type DocumentEntry,
  type DocumentKind,
  type Faq,
  type FaqTopic,
  type ImageRef,
  type LegalInfo,
  type Notice,
  type NoticeCeremonyType,
  type Person,
} from "./schemas.ts";

// ---------------------------------------------------------------------------
// Notices
// ---------------------------------------------------------------------------

export const NOTICE_CEREMONY_LABELS: Record<NoticeCeremonyType, string> = {
  civil: "Občanský obřad",
  church: "Církevní obřad",
  "without-ceremony": "Pohřeb bez obřadu",
  private: "V úzkém rodinném kruhu",
};

export const NOTICES_ROUTE = "/oznameni/";

export function noticeHref(id: string): string {
  return `${NOTICES_ROUTE}${id}/`;
}

/** Printable QR code file written next to each notice page at build time. */
export function noticeQrHref(id: string): string {
  return `${NOTICES_ROUTE}${id}/qr.svg`;
}

export interface NoticeCeremonyView {
  type: NoticeCeremonyType;
  typeLabel: string;
  /** YYYY-MM-DD or null (no public ceremony date). */
  date: string | null;
  /** "14. 11. 2026" */
  dateText: string | null;
  /** "pátek" */
  weekday: string | null;
  /** "10:00" (as stored) and "10:00" / "9:30" (display). */
  time: string | null;
  timeText: string | null;
  placeName: string | null;
  address: string | null;
  mapUrl: string | null;
}

export interface NoticeQr {
  /** Absolute URL the code points to (siteUrl + /oznameni/<slug>/). */
  target: string;
  /** Inline SVG markup (black on white, no classes or styles). */
  svg: string;
  /** Printable standalone file: /oznameni/<slug>/qr.svg. */
  href: string;
}

export interface NoticeView {
  id: string;
  href: string;
  fullName: string;
  /** "1941" or "1941-04-03"; null when not given. */
  born: string | null;
  died: string;
  /** "1941" or "3. 4. 1941". */
  bornText: string | null;
  diedText: string;
  photo: ImageRef | null;
  parteImage: ImageRef | null;
  /** /oznameni/<slug>/<file>.pdf, or null. */
  partePdfHref: string | null;
  ceremony: NoticeCeremonyView | null;
  /** True when the ceremony date is on or after the build date. */
  upcoming: boolean;
  livestreamUrl: string | null;
  familyNote: string | null;
  /** Office e-mail for condolences, only when the family agreed (condolencesViaOffice). */
  condolencesEmail: string | null;
  noindex: boolean;
  listed: boolean;
  placeholder: boolean;
  qr: NoticeQr;
}

export interface NoticeViewContext {
  siteUrl: string;
  buildDate: string;
  /** The office e-mail offered for condolences (first contact e-mail), or null. */
  officeEmail: string | null;
}

function buildCeremonyView(notice: Notice): NoticeCeremonyView | null {
  const ceremony = notice.ceremony;
  if (ceremony === null) {
    return null;
  }
  let dateText: string | null = null;
  let weekday: string | null = null;
  if (ceremony.date !== null) {
    dateText = formatCzechDate(ceremony.date);
    weekday = czechWeekday(ceremony.date);
  }
  let timeText: string | null = null;
  if (ceremony.time !== null) {
    timeText = formatCzechTime(ceremony.time);
  }
  return {
    type: ceremony.type,
    typeLabel: NOTICE_CEREMONY_LABELS[ceremony.type],
    date: ceremony.date,
    dateText,
    weekday,
    time: ceremony.time,
    timeText,
    placeName: ceremony.placeName,
    address: ceremony.address,
    mapUrl: ceremony.mapUrl,
  };
}

export function buildNoticeView(entry: { id: string; data: Notice }, context: NoticeViewContext): NoticeView {
  const notice = entry.data;
  const href = noticeHref(entry.id);
  const target = `${context.siteUrl.replace(/\/$/, "")}${href}`;
  const ceremony = buildCeremonyView(notice);
  let upcoming = false;
  if (ceremony !== null && ceremony.date !== null) {
    upcoming = ceremony.date >= context.buildDate;
  }
  let bornText: string | null = null;
  if (notice.born !== null) {
    bornText = formatYearOrDate(notice.born);
  }
  let partePdfHref: string | null = null;
  if (notice.partePdf !== null) {
    partePdfHref = parteHref(entry.id, normalizeDocumentFile(notice.partePdf));
  }
  let condolencesEmail: string | null = null;
  if (notice.condolencesViaOffice) {
    condolencesEmail = context.officeEmail;
  }
  return {
    id: entry.id,
    href,
    fullName: notice.fullName,
    born: notice.born,
    died: notice.died,
    bornText,
    diedText: formatYearOrDate(notice.died),
    photo: notice.photo,
    parteImage: notice.parteImage,
    partePdfHref,
    ceremony,
    upcoming,
    livestreamUrl: notice.livestreamUrl,
    familyNote: notice.familyNote,
    condolencesEmail,
    noindex: notice.noindex,
    listed: notice.listed,
    placeholder: notice.placeholder,
    qr: {
      target,
      svg: qrSvg(target, { title: `QR kód s odkazem na oznámení: ${notice.fullName}` }),
      href: noticeQrHref(entry.id),
    },
  };
}

function ceremonyMoment(view: NoticeView): string {
  return `${view.ceremony?.date ?? ""}T${view.ceremony?.time ?? "00:00"}`;
}

export interface NoticeIndex {
  /** Ceremonies on or after the build date, soonest first. */
  upcoming: NoticeView[];
  /** Everything else (past ceremony, no ceremony date), most recent death first. */
  recent: NoticeView[];
}

/** The /oznameni/ list: listed notices only (unlisted ones are reachable by link or QR code). */
export function buildNoticeIndex(views: readonly NoticeView[]): NoticeIndex {
  const listed = views.filter((view) => view.listed);
  const upcoming = listed
    .filter((view) => view.upcoming)
    .sort(
      (a, b) =>
        ceremonyMoment(a).localeCompare(ceremonyMoment(b)) || a.fullName.localeCompare(b.fullName, "cs"),
    );
  const recent = listed
    .filter((view) => !view.upcoming)
    .sort((a, b) => b.died.localeCompare(a.died) || a.fullName.localeCompare(b.fullName, "cs"));
  return { upcoming, recent };
}

// ---------------------------------------------------------------------------
// People
// ---------------------------------------------------------------------------

export interface PersonView {
  id: string;
  name: string;
  role: string;
  photo: ImageRef | null;
  phone: FormattedPhone | null;
  /** "EV" for "Ing. Eva Vzorová": for layouts that must look complete without photos. */
  initials: string;
  placeholder: boolean;
}

export function personInitials(name: string): string {
  const words = name
    .split(/\s+/)
    .filter((word) => word !== "" && !word.endsWith("."))
    .filter((word) => /\p{L}/u.test(word));
  if (words.length === 0) {
    return "";
  }
  const first = (words[0] as string).charAt(0);
  if (words.length === 1) {
    return first.toLocaleUpperCase("cs");
  }
  const last = (words[words.length - 1] as string).charAt(0);
  return `${first}${last}`.toLocaleUpperCase("cs");
}

export function buildPersonView(entry: { id: string; data: Person }): PersonView {
  let phone: FormattedPhone | null = null;
  if (entry.data.phone !== null) {
    phone = formatPhone(entry.data.phone);
  }
  return {
    id: entry.id,
    name: entry.data.name,
    role: entry.data.role,
    photo: entry.data.photo,
    phone,
    initials: personInitials(entry.data.name),
    placeholder: entry.data.placeholder,
  };
}

export function sortPeople<T extends { data: Person }>(entries: readonly T[]): T[] {
  return entries
    .filter((entry) => entry.data.published)
    .sort((a, b) => a.data.order - b.data.order || a.data.name.localeCompare(b.data.name, "cs"));
}

// ---------------------------------------------------------------------------
// FAQ
// ---------------------------------------------------------------------------

export const FAQ_TOPIC_LABELS: Record<FaqTopic, string> = {
  "first-steps": "Úmrtí a první kroky",
  arrangements: "Sjednání pohřbu",
  ceremony: "Obřad a rozloučení",
  "cremation-urn": "Kremace a urna",
  documents: "Doklady a úřady",
  costs: "Náklady a platba",
  other: "Další otázky",
};

export interface FaqGroup<T> {
  topic: FaqTopic;
  label: string;
  entries: T[];
}

/** Published questions grouped by topic, in the fixed topic order; empty topics are omitted. */
export function groupFaq<T extends { data: Faq }>(entries: readonly T[]): FaqGroup<T>[] {
  const published = entries
    .filter((entry) => entry.data.published)
    .sort((a, b) => a.data.order - b.data.order || a.data.question.localeCompare(b.data.question, "cs"));
  const groups: FaqGroup<T>[] = [];
  for (const topic of FAQ_TOPICS) {
    const inTopic = published.filter((entry) => entry.data.topic === topic);
    if (inTopic.length > 0) {
      groups.push({ topic, label: FAQ_TOPIC_LABELS[topic], entries: inTopic });
    }
  }
  return groups;
}

// ---------------------------------------------------------------------------
// Documents
// ---------------------------------------------------------------------------

export const DOCUMENT_KIND_LABELS: Record<DocumentKind, string> = {
  "rad-pohrebni-sluzby": "Řád pohřební služby",
  "obchodni-podminky": "Obchodní podmínky",
  "reklamacni-rad": "Reklamační řád",
  other: "Dokument",
};

export interface DocumentView {
  id: string;
  title: string;
  kind: DocumentKind;
  kindLabel: string;
  /** /dokumenty/<file>.pdf */
  href: string;
  fileName: string;
  validFrom: string | null;
  /** "1. 1. 2026" */
  validFromText: string | null;
  placeholder: boolean;
}

export function buildDocumentView(entry: { id: string; data: DocumentEntry }): DocumentView {
  let validFromText: string | null = null;
  if (entry.data.validFrom !== null) {
    validFromText = formatCzechDate(entry.data.validFrom);
  }
  return {
    id: entry.id,
    title: entry.data.title,
    kind: entry.data.kind,
    kindLabel: DOCUMENT_KIND_LABELS[entry.data.kind],
    href: documentHref(entry.data.file),
    fileName: normalizeDocumentFile(entry.data.file),
    validFrom: entry.data.validFrom,
    validFromText,
    placeholder: entry.data.placeholder,
  };
}

/** Published documents: by kind (řád, podmínky, reklamační řád, other), then order, then title. */
export function sortDocuments<T extends { data: DocumentEntry }>(entries: readonly T[]): T[] {
  return entries
    .filter((entry) => entry.data.published)
    .sort(
      (a, b) =>
        DOCUMENT_KINDS.indexOf(a.data.kind) - DOCUMENT_KINDS.indexOf(b.data.kind) ||
        a.data.order - b.data.order ||
        a.data.title.localeCompare(b.data.title, "cs"),
    );
}

// ---------------------------------------------------------------------------
// Legal information (research L10)
// ---------------------------------------------------------------------------

export const LEGAL_PAGE_HREF = "/pravni-informace/";

export interface LegalLink {
  label: string;
  href: string;
}

/**
 * The footer link to právní informace: present when site/legal.json exists and the page
 * pravni-informace exists (G-076 warns when only the singleton is there). Templates that render
 * /pravni-informace/ must show this link on every page (template-contract §6).
 */
export function buildLegalLink(
  legal: LegalInfo | null,
  pages: readonly { id: string; data: { navLabel: string } }[],
): LegalLink | null {
  if (legal === null) {
    return null;
  }
  const page = pages.find((entry) => entry.id === "pravni-informace");
  if (page === undefined) {
    return null;
  }
  return { label: page.data.navLabel, href: LEGAL_PAGE_HREF };
}
