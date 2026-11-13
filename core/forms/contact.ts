/**
 * The contact form protocol shared by every template (template-contract §8, features.contactForm).
 *
 * The form is plain HTML: no JavaScript, POST to the hosting provider's form handler, success page
 * at CONTACT_FORM.successPath. Templates only lay it out (core/components/ContactForm.astro);
 * names, limits and the handler attributes live here so every template submits the same fields.
 *
 * Handlers:
 *   - "netlify": Netlify Forms. Netlify finds the form in the deployed HTML (form detection must be
 *     switched on for the site), removes data-netlify / netlify-honeypot and stores submissions in
 *     the Netlify dashboard, which also sends the notification e-mails. Works only when the site is
 *     hosted on Netlify (the export refuses another host, docs/cms/setup.md).
 */
export const CONTACT_FORM_HANDLERS = ["netlify"] as const;
export type ContactFormHandler = (typeof CONTACT_FORM_HANDLERS)[number];

export const CONTACT_FORM = {
  /** The form's name in the Netlify dashboard and e-mail notifications. */
  name: "kontakt",
  successPath: "/kontakt/odeslano/",
  /** Route parameter of the success page (pages/kontakt/[sent].astro). */
  successSlug: "odeslano",
  /** Spam trap: a field people never see; submissions that fill it are dropped. */
  honeypot: "bot-field",
  fields: {
    name: "jmeno",
    reply: "telefon-nebo-email",
    message: "zprava",
  },
  maxLength: {
    name: 120,
    reply: 160,
    message: 3000,
  },
} as const;

/** Generic wording shared by the templates. Nothing here states a business fact. */
export const CONTACT_FORM_TEXT = {
  heading: "Napište nám",
  urgent: "Formulář je pro dotazy, které nespěchají. Úmrtí a převoz zesnulého řešte telefonicky:",
  nameLabel: "Jméno a příjmení",
  replyLabel: "Telefon nebo e-mail",
  replyHint: "Na tento kontakt vám odpovíme.",
  messageLabel: "Vaše zpráva",
  privacyBefore: "Údaje z formuláře použijeme jen k odpovědi na váš dotaz. Více na stránce",
  privacyLink: "Ochrana osobních údajů",
  submit: "Odeslat zprávu",
  honeypotLabel: "Toto pole nevyplňujte",
  sentTitle: "Děkujeme, zprávu jsme přijali",
  sentLead: "Ozveme se vám na kontakt, který jste uvedli.",
  sentBack: "Zpět na kontakty",
} as const;

export const PRIVACY_PATH = "/ochrana-osobnich-udaju/";

/** Attributes of the <form> element for a handler. */
export function contactFormAttributes(handler: ContactFormHandler): Record<string, string> {
  if (handler === "netlify") {
    return {
      "data-netlify": "true",
      "netlify-honeypot": CONTACT_FORM.honeypot,
    };
  }
  throw new Error(`Unknown contact form handler "${String(handler)}".`);
}
