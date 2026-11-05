/**
 * Media file names. Content may store a bare file name or a CMS-written path such as
 * "/src/assets/media/foo.jpg"; both normalise to "foo.jpg" inside the flat media directory.
 */
export const MEDIA_EXTENSIONS = ["png", "jpg", "jpeg", "webp", "avif", "svg"] as const;

export function normalizeMediaFile(file: string): string {
  const trimmed = file.trim().replace(/\\/g, "/");
  if (trimmed.split("/").includes("..")) {
    throw new Error(`Media path must not contain "..": "${file}"`);
  }
  const segments = trimmed.split("/").filter((segment) => segment !== "" && segment !== ".");
  const name = segments[segments.length - 1];
  if (name === undefined) {
    throw new Error(`Empty media path: "${file}"`);
  }
  return name;
}

export function isSupportedMediaFile(name: string): boolean {
  const extension = name.split(".").pop()?.toLowerCase();
  if (extension === undefined) {
    return false;
  }
  return (MEDIA_EXTENSIONS as readonly string[]).includes(extension);
}
