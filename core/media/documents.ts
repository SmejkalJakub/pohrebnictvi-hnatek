/**
 * Downloadable files (PDF) in src/assets/documents/: the documents collection and printed parte of
 * notices. Unlike images they are not processed; the integration copies the referenced ones to
 * dist as they are (content-contract §6.16). Content may store a bare file name or a CMS-written
 * path such as "src/assets/documents/rad.pdf"; both normalise to "rad.pdf".
 */
import { normalizeMediaFile } from "./normalize.ts";

export const DOCUMENT_EXTENSIONS = ["pdf"] as const;

/** Public URL prefix of documents-collection files. */
export const DOCUMENTS_ROUTE = "/dokumenty/";

export function normalizeDocumentFile(file: string): string {
  return normalizeMediaFile(file);
}

export function isSupportedDocumentFile(name: string): boolean {
  const extension = name.split(".").pop()?.toLowerCase();
  if (extension === undefined) {
    return false;
  }
  return (DOCUMENT_EXTENSIONS as readonly string[]).includes(extension);
}

/** "/dokumenty/rad-pohrebni-sluzby.pdf" for a documents-collection entry. */
export function documentHref(file: string): string {
  return `${DOCUMENTS_ROUTE}${encodeURIComponent(normalizeDocumentFile(file))}`;
}

/** "/oznameni/<slug>/<file>.pdf": a printed parte lives under its notice and expires with it. */
export function parteHref(noticeId: string, file: string): string {
  return `/oznameni/${noticeId}/${encodeURIComponent(normalizeDocumentFile(file))}`;
}
