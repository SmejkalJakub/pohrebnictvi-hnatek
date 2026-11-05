/** Phone formatting: E.164 storage → Czech display with non-breaking spaces (content-contract §6.0). */

export const NBSP = " ";

export interface FormattedPhone {
  /** Display form, e.g. "+420 517 352 020" (non-breaking spaces). */
  display: string;
  /** Plain-space form for accessible names and plain text, e.g. "+420 517 352 020". */
  spoken: string;
  /** tel: URI, e.g. "tel:+420517352020". */
  href: string;
}

function groupInThrees(digits: string): string[] {
  const groups: string[] = [];
  for (let index = 0; index < digits.length; index += 3) {
    groups.push(digits.slice(index, index + 3));
  }
  return groups;
}

export function formatPhone(e164: string): FormattedPhone {
  if (!/^\+[1-9]\d{7,14}$/.test(e164)) {
    throw new Error(`Invalid E.164 phone number: "${e164}"`);
  }
  let parts: string[];
  if (e164.startsWith("+420") && e164.length === 13) {
    parts = ["+420", ...groupInThrees(e164.slice(4))];
  } else {
    parts = [e164.slice(0, 3), ...groupInThrees(e164.slice(3))];
  }
  return {
    display: parts.join(NBSP),
    spoken: parts.join(" "),
    href: `tel:${e164}`,
  };
}
