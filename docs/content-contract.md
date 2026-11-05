# Content contract

**Status:** Phase 1 contract, draft 1 (2026-11-05). Applies to every client site built from this template system. Hnátek-specific values appear only in §10 and §11.

**Inputs:** `hnatek-business-brief.md`, `hnatek-test-plan.md`, `hnatek-claude-code-prompt.md`. The handoff prompt refers to `01-business-and-design-brief.md` and `02-pilot-test-plan.md`. Those files do not exist; the `hnatek-*` files are treated as the same documents.

Related: [template-contract.md](template-contract.md) · [editable-fields.md](editable-fields.md) · [design-differentiation.md](design-differentiation.md) · [phase-2-plan.md](phase-2-plan.md)

---

## 1. Principles

1. **One factual model, many designs.** Every template reads the same content files through the same typed loaders. Templates never hard-code business facts.
2. **Absence beats invention.** An unknown fact is `null`/absent and is not rendered in production. It is never filled with a plausible-looking value.
3. **Synthetic content is always marked.** Placeholder text, placeholder images and demo prices are flagged in data. Core components always render a visible marker for them. A production build fails if any of them remain.
4. **Provenance lives beside content, not inside it.** The render-facing content files stay flat and CMS-friendly. Where each fact came from is tracked in a separate ledger that the pipeline checks before launch (§3).
5. **Validation runs at build time, and the build is the gate.** The CMS validates only as a convenience. The authoritative check is Zod plus the publication gate during `astro build`. A failed build deploys nothing.
6. **Emergency transport is not opening hours.** They use separate files, separate schemas and separate display rules (§6.4, §6.5).

## 2. File layout (identical in the system repo template and the exported client site)

```
src/
  site.config.ts                # agent-only configuration (template options, features). Never CMS.
  content/
    site/                       # singletons (JSON), loaded + Zod-parsed by core
      company.json
      contact.json              # locations, office/department phones, e-mails
      office-hours.json
      emergency.json            # nonstop transport ONLY
      pricing.json
    pages/                      # one Markdown file per fixed route (page copy)
      home.md  jak-postupovat.md  sluzby.md  rakve.md  kvetiny.md
      o-nas.md  kontakt.md  cenik.md  ochrana-osobnich-udaju.md
    services/*.md               # collection
    guidance/*.md               # collection ("Jak postupovat" steps)
    coffins/*.md                # collection (catalogue)
    flowers/*.md                # collection (arrangement gallery)
    articles/*.md               # OPTIONAL collection; directory absent when feature off
  assets/
    media/                      # all raster images used by content (processed by astro:assets)
provenance/                     # outside src/: never bundled, never deployed
  facts.json                    # fact ledger (Phase 0 input format, §3)
  approvals.json                # human sign-offs (copy, pricing, guidance, images)
```

Format decisions:

- **Singletons are JSON** and are imported and parsed by `core/content/load.ts`. Using a `file()` loader for singletons would force an artificial `id` structure. Plain JSON import with `Schema.parse` gives exact error paths and needs no extra tooling.
- **Collections are Markdown with YAML frontmatter**, loaded via Astro Content Layer `glob()` loaders in `src/content.config.ts`. The body is restricted Markdown (§7.3).
- **Schemas are flat and CMS-shaped:** no discriminated unions, no deeply nested optional objects, and selects instead of free strings where meaning matters. Pages CMS (Phase 6) cannot edit unions comfortably.
- All schemas import `z` from `astro/zod` so they stay on the Zod version bundled with the pinned Astro release.

## 3. Provenance model

### 3.1 Status vocabulary (fact ledger)

| Status | Meaning | May render in prototype | May render in production |
| --- | --- | --- | --- |
| `VERIFIED` | A named human confirmed the value for publication (`verifiedBy`, `verifiedAt`). | yes | yes |
| `CLIENT_PROVIDED` | Supplied by the client but not independently checked (e.g., "about 40 years"). | yes | only with an approved public wording in `approvals.json` |
| `EXISTING_WEBSITE` | Copied from the client's current website (`source` URL + `retrievedAt`). | yes | **no**: must be re-confirmed to `VERIFIED` before launch |
| `UNKNOWN` | Not known. `value` is `null`. | marker only (`[Doplnit: …]`) | no; required → build fails, optional → section omitted |

Synthetic stand-ins are **not** a provenance status. They are content flags:

| Content flag | Where | Meaning |
| --- | --- | --- |
| `placeholder: true` | any collection entry / page | Synthetic copy used only to exercise layout. |
| `ImageRef.source = "placeholder"` | any image | Neutral placeholder graphic, never a realistic photo. |
| `PriceItem.status = "demo"` | price items | Invented demonstration price. |

This split is deliberate. `UNKNOWN` means "render nothing". A placeholder means "render something fake, loudly labelled". Merging them would either hide gaps or make fakes look like data.

### 3.2 Ledger format (`provenance/facts.json`)

This is the Phase 0 deliverable, written by the research/normalisation session and read by the content-generation session and by `npm run check:launch`.

```jsonc
{
  "client": "hnatek",
  "createdAt": "2026-11-05",
  "facts": {
    "company.legalName": {
      "value": "Pohřebnictví Hnátek s.r.o.",
      "status": "EXISTING_WEBSITE",
      "source": "https://pohrebnictvihnatek.cz",
      "retrievedAt": "2026-11-05",
      "verifiedBy": null,
      "verifiedAt": null,
      "note": "Confirm with client before launch."
    },
    "company.legalIds.ico": { "value": null, "status": "UNKNOWN", "source": null, "note": "Required on website by company law – see U10." }
  }
}
```

**Key format:** `<file>.<path>`. Array members are addressed by their `id`, never by index. Examples: `contact.phones.office-main.number`, `office-hours.weekly.weekdays` (the whole group), `emergency.phone`. A ledger key also covers everything beneath it, so `office-hours.weekly` would cover every group. The facts the launch check tracks, and at what granularity, are listed in `collectTrackedFacts()` in `core/gate/launch-check.ts`.

**Copy and asset approvals** (`provenance/approvals.json`):

```jsonc
{
  "facts":    { "company.tradition.publicWording": { "approvedBy": null, "approvedAt": null } },  // CLIENT_PROVIDED wording sign-offs
  "copy":     { "pages/o-nas.md": { "status": "DRAFT", "approvedBy": null, "approvedAt": null } },
  "pricing":  { "status": "NOT_APPROVED", "approvedBy": null, "approvedAt": null, "method": null },
  "guidance": { "guidance/umrti-doma.md": { "reviewedBy": null, "reviewedAt": null } },
  "images":   { "src/assets/media/kancelar.jpg": { "rightsEvidence": null } }
}
```

### 3.3 How the layers interact

| Check | Runs in | What it does |
| --- | --- | --- |
| Zod schema | every build (prototype, production, CMS-triggered) | Shape, formats and value ranges. Fails the build. |
| Publication gate (`core/gate`) | every build | Mode-dependent rules on content flags (§8). Fails a production build. |
| Launch check (`npm run check:launch`) | the pipeline, once before first public launch, and again before any re-launch by the agent | Cross-checks every rendered fact against the ledger: status must be `VERIFIED` or approved `CLIENT_PROVIDED`, and the **content value must equal the ledger value**. Also requires guidance review, pricing sign-off and image rights evidence. Rules L-001 to L-008 (implemented in S1): L-001 production gate passes; L-002 every displayed fact has provenance; L-003 status is VERIFIED or an approved CLIENT_PROVIDED; L-004 content equals the ledger; L-005 content has no value for a fact the ledger marks UNKNOWN (possible invention); L-006 copy approved; L-007 pricing and guidance signed off; L-008 image rights evidence recorded. |

After handover the client owns the content. CMS edits are by definition client-provided, so the ledger is **not** consulted by CMS-triggered builds; it is archived in the export as a record (see template-contract §9). The content-flag rules (no placeholders, no demo prices, schema validity) keep applying to every production build for the life of the site.

## 4. Information types → files (coverage map)

| Required business information (brief) | File | Schema |
| --- | --- | --- |
| Company identity, legal identifiers, tradition, logo | `site/company.json` | `Company` §6.1 |
| Branches / locations, addresses, map links | `site/contact.json` → `locations[]` | `Contact` §6.2 |
| Office and department phones, e-mails | `site/contact.json` → `phones[]`, `emails[]` | `Contact` §6.2 |
| Ordinary opening (office) hours | `site/office-hours.json` | `OfficeHours` §6.4 |
| Nonstop deceased transport | `site/emergency.json` | `EmergencyTransport` §6.5 |
| Services incl. ceremony types and transport | `services/*.md` | `Service` §6.7 |
| Practical guidance after a death | `guidance/*.md` + `pages/jak-postupovat.md` | `Guidance` §6.8 |
| Coffins catalogue | `coffins/*.md` + `pages/rakve.md` | `Coffin` §6.9 |
| Flowers | `flowers/*.md` + `pages/kvetiny.md` | `FlowerArrangement` §6.10 |
| Family story / About | `pages/o-nas.md` + `company.tradition` | `Page` §6.6 |
| Approved imagery | inline `ImageRef` objects wherever images appear | `ImageRef` §6.3 |
| Optional pricing | `site/pricing.json` | `Pricing` §6.11 |
| Optional articles | `articles/*.md` (absent for Hnátek) | `Article` §6.12 |
| Page copy and SEO for every route | `pages/*.md` | `Page` §6.6 |

## 5. Route conventions

Owned by core; templates cannot rename them. Details of template-optional routes are in template-contract §4.

- Lowercase ASCII slugs without diacritics, words joined by hyphens.
- `trailingSlash: "always"`, `build.format: "directory"`, so every page is `/<slug>/index.html`.
- In-page anchors are ASCII (`#prevoz`, `#kremace`).
- Collection entry slugs come from file names (`services/kremace.md` → `kremace`). After launch they are stable; renaming one needs a developer-added redirect.
- Old-site URLs are mapped through `redirects` in `astro.config` after Phase 3 research (U24).

| Route | Page id | Presence |
| --- | --- | --- |
| `/` | `home` | required |
| `/jak-postupovat/` | `jak-postupovat` | required |
| `/sluzby/` | `sluzby` | required |
| `/sluzby/<slug>/` | – | only if the template declares `serviceDetailPages: true` |
| `/rakve/` | `rakve` | required |
| `/kvetiny/` | `kvetiny` | required |
| `/o-nas/` | `o-nas` | required |
| `/kontakt/` | `kontakt` | required |
| `/cenik/` | `cenik` | only if `pricing.visible` is `true` |
| `/ochrana-osobnich-udaju/` | `ochrana-osobnich-udaju` | required when the contact form, a map embed or analytics is enabled; otherwise recommended (U9) |
| `/clanky/`, `/clanky/<slug>/` | – | only if `features.articles` is `true` **and** the template supports articles. **Off for Hnátek.** |
| `/404.html` | – | required |

## 6. Schemas (minimal, Zod)

The snippets below are the normative contract. Phase 2 implements them in `core/content/schemas.ts`. Error messages are Czech because CMS users see them in build logs.

### 6.0 Shared primitives

```ts
import { z } from "astro/zod";

export const Id = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Použijte malá písmena bez diakritiky a pomlčky.");
export const Phone = z.string().regex(/^\+[1-9]\d{7,14}$/, "Telefon zadejte ve tvaru +420123456789 (bez mezer).");
export const Time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Čas zadejte ve tvaru HH:MM, např. 07:00.");
export const IsoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Datum zadejte ve tvaru RRRR-MM-DD.");
export const Day = z.enum(["mon", "tue", "wed", "thu", "fri", "sat", "sun"]);
export const text = (max: number) => z.string().trim().min(1).max(max);
export const optionalText = (max: number) => z.string().trim().max(max).nullable().default(null);
```

Phones are stored in E.164 form. Core formats them for display as `+420 517 352 020`, with non-breaking spaces, and builds `tel:+420517352020` hrefs.

### 6.1 Company (`site/company.json`)

```ts
export const Address = z.object({
  street: text(120),                    // kept verbatim, e.g. "Dědická ev.č. 38/22"
  city: text(80),
  postalCode: z.string().regex(/^\d{3}\s?\d{2}$/),
  country: z.literal("CZ").default("CZ"),
});

export const Company = z.object({
  brandName: text(80),                  // public name, e.g. "Pohřebnictví Hnátek"
  legalName: text(120),                 // e.g. "Pohřebnictví Hnátek s.r.o."
  legalIds: z.object({
    ico: z.string().regex(/^\d{8}$/).nullable(),
    dic: z.string().regex(/^CZ\d{8,10}$/).nullable(),
    registryEntry: optionalText(200),   // "C ##### vedená u Krajského soudu v …"
    registeredOffice: Address.nullable(),
  }),
  tradition: z.object({
    publicWording: optionalText(120),   // the ONLY text used for tradition claims
    foundedYear: z.number().int().min(1800).max(2100).nullable(),
  }),
  familyOwned: z.boolean().nullable(),
  logo: ImageRef.nullable(),            // null → templates render a text wordmark
});
```

Rules:

- `tradition.foundedYear` is **never** derived from the commercial register incorporation date, because the family business predates the current legal entity. Templates never compute "X let" from it. If shown at all, it renders as "od roku YYYY", and only when the ledger status is `VERIFIED`.
- `tradition.publicWording` is the single approved phrase for any tradition claim (e.g. "rodinná firma s tradicí přibližně 40 let"). Templates must not paraphrase it with a number of their own.
- `legalIds.*` are required in production (gate G-011). Czech company law (zákon č. 90/2012 Sb., § 435) requires a company's website to show its name, registered office, IČO and commercial register entry. The client or their adviser must confirm the exact obligation (U10).

### 6.2 Contact (`site/contact.json`)

```ts
export const Contact = z.object({
  locations: z.array(z.object({
    id: Id,
    name: text(80),                                   // "Kancelář Vyškov"
    address: Address,
    geo: z.object({ lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180) }).nullable(),
    mapUrl: z.string().url().nullable(),              // e.g. a mapy.cz link
    accessNote: optionalText(400),                    // parking, entrance, accessibility
  })).min(1),
  phones: z.array(z.object({
    id: Id,
    label: text(60),                                  // "Kancelář", "Objednávky květin"
    number: Phone,
    department: z.enum(["office", "flowers", "other"]),  // "emergency" is deliberately NOT an option
    locationId: Id.nullable(),
  })).min(1),
  emails: z.array(z.object({ id: Id, label: text(60), address: z.string().email() })),
}).superRefine((contact, ctx) => {
  const officePhones = contact.phones.filter((p) => p.department === "office");
  if (officePhones.length === 0) {
    ctx.addIssue({ code: "custom", path: ["phones"], message: "Uveďte alespoň jeden telefon kanceláře." });
  }
});
```

The model supports several locations, but templates only need to handle one well in the pilot (`supports.multipleLocations` in the template manifest). The emergency number is **not** in this file and cannot be entered here.

### 6.3 Image metadata (`ImageRef`, inline everywhere)

```ts
export const ImageRef = z.object({
  file: z.string().min(1),          // file under src/assets/media/ (bare name or CMS path; core normalises)
  alt: z.string().trim().max(200).default(""),
  decorative: z.boolean().default(false),
  caption: optionalText(240),
  credit: optionalText(120),
  source: z.enum(["client", "existing-website", "own-photo", "licensed-stock", "placeholder"]),
  depicts: z.enum(["actual-business", "generic", "placeholder"]),
  rightsConfirmed: z.boolean().default(false),
  focus: z.enum(["center", "top", "bottom", "left", "right"]).default("center"),
}).superRefine((img, ctx) => {
  if (!img.decorative && img.alt.length < 5) {
    ctx.addIssue({ code: "custom", path: ["alt"], message: "Doplňte popis obrázku (alt) nebo jej označte jako dekorativní." });
  }
  const isPlaceholderSource = img.source === "placeholder";
  const isPlaceholderSubject = img.depicts === "placeholder";
  if (isPlaceholderSource !== isPlaceholderSubject) {
    ctx.addIssue({ code: "custom", path: ["depicts"], message: "Zástupný obrázek musí mít zdroj i obsah 'placeholder'." });
  }
  const canShowRealBusiness = ["client", "existing-website", "own-photo"].includes(img.source);
  if (img.depicts === "actual-business" && !canShowRealBusiness) {
    ctx.addIssue({ code: "custom", path: ["depicts"], message: "Skutečné prostory, osoby či vozidla firmy smí ukazovat jen fotografie od klienta." });
  }
});
```

Decisions and rules:

- **Inline image objects** are used instead of an id-based media registry. Clients replace an image in place (Phase 6, action 4) without managing references. The **media inventory** that Phase 0 asks for is *generated* by `npm run media:inventory`, which scans every `ImageRef` and the files in `src/assets/media/`.
- **File resolution:** core builds a map with `import.meta.glob("/src/assets/media/*", { eager: true })` and normalises `file` to a basename inside that directory. An unknown file fails the build with the content path. This keeps behaviour stable whatever path format the CMS writes.
- **Generated or AI imagery** may only ever be `source: "placeholder"`. Placeholders are flat, neutral graphics labelled "Zástupný obrázek". They are never realistic photos, and never anything that could pass as the real premises, staff or Cadillac.
- `depicts: "actual-business"` covers the real premises, staff, vehicles and products. It requires a client, existing-website or own photo, plus rights evidence in `approvals.json` before launch.
- Intrinsic width and height come from `astro:assets`, and templates always render via `<Image>`/`<Picture>`. Each template declares the aspect ratio of each image slot (template-contract §6). `focus` maps to `object-position` for cropping.

### 6.4 Office hours (`site/office-hours.json`)

```ts
export const OfficeHours = z.object({
  locationId: Id,
  label: text(60).default("Kancelář"),
  weekly: z.array(z.object({
    id: Id,                                  // e.g. "weekdays"
    days: z.array(Day).min(1),
    open: Time,
    close: Time,
    breaks: z.array(z.object({ from: Time, to: Time })).default([]),
  })),
  holidayNote: optionalText(200),            // "Ve státní svátky zavřeno." (UNKNOWN for Hnátek)
  exceptions: z.array(z.object({
    from: IsoDate, to: IsoDate, closed: z.boolean(), open: Time.nullable(), close: Time.nullable(), note: optionalText(160),
  })).default([]),
  outsideHoursNote: optionalText(200),       // must point to emergency line only for transport, see §6.5
}).superRefine((hours, ctx) => {
  const seen = new Set<string>();
  hours.weekly.forEach((group, i) => {
    if (group.open >= group.close) {
      ctx.addIssue({ code: "custom", path: ["weekly", i, "close"], message: "Konec musí být později než začátek." });
    }
    if (group.open === "00:00" && group.close >= "23:59") {
      ctx.addIssue({ code: "custom", path: ["weekly", i], message: "Nepřetržitou službu uveďte v části Nonstop převoz, ne v úředních hodinách kanceláře." });
    }
    group.breaks.forEach((b, j) => {
      const insideOpening = b.from > group.open && b.to < group.close && b.from < b.to;
      if (!insideOpening) {
        ctx.addIssue({ code: "custom", path: ["weekly", i, "breaks", j], message: "Přestávka musí ležet uvnitř otevírací doby." });
      }
    });
    group.days.forEach((d) => {
      if (seen.has(d)) {
        ctx.addIssue({ code: "custom", path: ["weekly", i, "days"], message: `Den ${d} je uveden vícekrát.` });
      }
      seen.add(d);
    });
  });
});
```

Display rules (enforced by core helpers and template review):

- Days that are not listed render explicitly as closed ("So–Ne: zavřeno"). They are never silently omitted.
- Czech format: day abbreviations `Po Út St Čt Pá So Ne`, times `7:00–15:30` with an en dash, breaks as "(polední přestávka 12:00–12:30)". Core provides `formatOfficeHours(hours): HoursRow[]`, and templates decide the markup.
- Every hours block is headed by its `label` (e.g., "Kancelář – úřední hodiny"). The word "nonstop" or "24 hodin" may never appear inside it.
- There is **no "open now" indicator** (rejected: static builds cannot know the time, and a client-side clock adds failure modes around holidays and exceptions).

### 6.5 Emergency transport (`site/emergency.json`)

```ts
export const EmergencyTransport = z.object({
  enabled: z.boolean(),
  label: text(60),                    // "Nonstop převoz zesnulých"
  phone: Phone,
  availability: z.literal("24/7"),    // pilot; a "schedule" variant is reserved for future clients
  shortNote: optionalText(160),       // e.g. "Volejte kdykoli, ve dne i v noci." (copy approval needed)
  serviceArea: optionalText(160),     // UNKNOWN for Hnátek
});
```

Display rules (mandatory for every template; tested in Phase 2 QA):

1. The emergency number appears on **every page**. At 375 px width it is reachable without scrolling: as a visible `tel:` link or button in the first viewport, or in a persistent bar.
2. The label always names the service, e.g. "Nonstop převoz zesnulých". The word "Nonstop" is never used on its own or next to office details.
3. It is never placed inside the office-hours list, table or `<dl>`, and never shares a heading with office hours. On the contact page and in the footer it has its own heading.
4. Its accessible name includes both the purpose and the number, e.g. `aria-label="Nonstop převoz zesnulých, volat +420 720 283 499"` if the visible text is shortened.
5. The tap target is at least 44 × 44 CSS px. Its contrast is AA (4.5:1 for text, 3:1 against adjacent colours for the control boundary).
6. If `enabled` is `false`, no emergency UI renders and no template falls back to an office number labelled as emergency.
7. The gate warns (it does not fail) when `emergency.phone` equals an office phone, since that may be deliberate.

### 6.6 Pages (`pages/<id>.md`)

```ts
export const PageId = z.enum([
  "home", "jak-postupovat", "sluzby", "rakve", "kvetiny", "o-nas", "kontakt", "cenik", "ochrana-osobnich-udaju", "clanky",
]);

export const Page = z.object({
  title: text(70),                    // H1
  navLabel: text(24),                 // label in navigation
  metaTitle: optionalText(60),        // falls back to `title | brandName`
  metaDescription: text(160),
  lead: optionalText(400),            // intro paragraph under H1
  excerpt: optionalText(400),         // teaser used on other pages (e.g. family story on home)
  heroImage: ImageRef.nullable().default(null),
  secondaryImage: ImageRef.nullable().default(null),
  placeholder: z.boolean().default(false),
});
// Markdown body = main page copy (restricted, §7.3)
```

Page files are fixed. A missing required page file fails the build, and CMS users cannot create new pages (editable-fields §4). Each template declares which page fields it renders (template-contract §6). Fields a template ignores are hidden in that client's CMS configuration.

### 6.7 Services (`services/*.md`)

```ts
export const Service = z.object({
  title: text(80),
  summary: text(240),                 // used in overviews / index lists
  category: z.enum(["ceremony", "transport", "arrangements", "cremation", "memorial", "other"]),
  order: z.number().int().min(0).max(999).default(100),
  featured: z.boolean().default(false),   // eligible for homepage overview
  published: z.boolean().default(true),
  image: ImageRef.nullable().default(null),
  priceGroupId: Id.nullable().default(null),  // link to a pricing group (render only if pricing visible)
  placeholder: z.boolean().default(false),
});
```

Ceremony types (e.g., funeral with or without a ceremony, cremation, burial) are `Service` entries with `category: "ceremony"`. Transport is `category: "transport"`. The nonstop number shown with a transport service is *read from `emergency.json`*, never typed into the service body. The gate fails if a service body contains a phone number (G-030).

### 6.8 Guidance (`guidance/*.md`)

```ts
export const Guidance = z.object({
  title: text(90),
  summary: text(240),
  phase: z.enum(["first-hours", "first-days", "arrangements", "after-funeral"]),
  situations: z.array(z.enum(["any", "home", "hospital", "care-home", "abroad"])).min(1).default(["any"]),
  order: z.number().int().min(0).max(999),
  contactPrompt: z.enum(["emergency", "office", "none"]).default("none"),
  checklist: z.array(text(160)).default([]),    // documents/things to prepare
  review: z.object({
    reviewedBy: optionalText(80),
    reviewedAt: IsoDate.nullable().default(null),
    sources: z.array(z.object({ title: text(120), url: z.string().url() })).default([]),
  }),
  published: z.boolean().default(true),   // added in S1, consistent with the other collections
  placeholder: z.boolean().default(false),
});
```

Medical, legal and procedural statements need human subject-matter review. A production build fails without `review.reviewedAt` (G-040), and warns when the review is older than 12 months (G-041, warning only, so client edits after handover are never blocked by the calendar).

### 6.9 Coffins (`coffins/*.md`)

```ts
export const Coffin = z.object({
  name: text(80),
  code: optionalText(40),             // catalogue code if the client uses one
  material: optionalText(120),
  summary: text(400),
  image: ImageRef.nullable().default(null),
  order: z.number().int().min(0).max(999).default(100),
  published: z.boolean().default(true),
  placeholder: z.boolean().default(false),
});
```

Prices are not shown on catalogue items in the pilot. Pricing lives only in `pricing.json`, so every price passes through the demo/approval gate. Urns can be added later as a sibling collection with the same shape. The pilot does not need them.

### 6.10 Flowers (`flowers/*.md`)

```ts
export const FlowerArrangement = z.object({
  title: text(80),
  type: z.enum(["wreath", "spray", "bouquet", "urn-arrangement", "other"]),
  summary: optionalText(300),
  image: ImageRef.nullable().default(null),
  order: z.number().int().min(0).max(999).default(100),
  published: z.boolean().default(true),
  placeholder: z.boolean().default(false),
});
```

`pages/kvetiny.md` carries the intro text. The ordering contact is a `contact.phones[]` entry with `department: "flowers"`. Whether flowers are in-house or a partner florist is unknown (U12). The template must not imply either.

### 6.11 Pricing (`site/pricing.json`), with robust validation of demo prices

```ts
export const PriceItem = z.object({
  id: Id,
  label: text(100),
  description: optionalText(240),
  kind: z.enum(["fixed", "from", "range", "on-request"]),
  amount: z.number().int().min(0).max(2_000_000).nullable(),     // whole CZK
  amountMax: z.number().int().min(0).max(2_000_000).nullable(),  // only for "range"
  unit: optionalText(30),                                         // "za km", "ks"
  status: z.enum(["demo", "approved"]),
});

export const Pricing = z.object({
  visible: z.boolean(),
  currency: z.literal("CZK"),
  vatNote: optionalText(120),          // "Ceny jsou uvedeny včetně DPH." – depends on VAT status (U16)
  validFrom: IsoDate.nullable(),
  generalNote: optionalText(400),
  groups: z.array(z.object({
    id: Id,
    title: text(80),
    description: optionalText(240),
    items: z.array(PriceItem).min(1),
  })),
}).superRefine((pricing, ctx) => {
  const ids = new Set<string>();
  pricing.groups.forEach((group, g) => {
    group.items.forEach((item, i) => {
      const path = ["groups", g, "items", i];
      if (ids.has(item.id)) {
        ctx.addIssue({ code: "custom", path: [...path, "id"], message: "Duplicitní id položky." });
      }
      ids.add(item.id);
      if (item.kind === "on-request") {
        if (item.amount !== null || item.amountMax !== null) {
          ctx.addIssue({ code: "custom", path, message: "Položka 'na dotaz' nesmí mít částku." });
        }
      } else if (item.amount === null) {
        ctx.addIssue({ code: "custom", path: [...path, "amount"], message: "Doplňte částku." });
      }
      if (item.kind === "range") {
        const validRange = item.amount !== null && item.amountMax !== null && item.amountMax > item.amount;
        if (!validRange) {
          ctx.addIssue({ code: "custom", path: [...path, "amountMax"], message: "Horní mez musí být vyšší než dolní." });
        }
      } else if (item.amountMax !== null) {
        ctx.addIssue({ code: "custom", path: [...path, "amountMax"], message: "Horní mez vyplňte jen u rozpětí." });
      }
    });
  });
});
```

Demo-price safeguards, in layers:

1. **Data:** every item carries `status`. The agent may only ever write `"demo"` (editable-fields §3). Only the client sets `"approved"`, either in the CMS or through a recorded sign-off.
2. **Rendering:** templates can only output a price through the core `<PriceValue>` component. It formats the amount (`12 500 Kč`, `od 3 900 Kč`, `2 000–4 000 Kč`, `na dotaz`, with non-breaking spaces). For `demo` items it always adds the visible text "UKÁZKA" to the accessible name and visible label, plus a `data-demo` attribute for styling. Templates cannot opt out.
3. **Page-level notice:** if any visible item is `demo`, `/cenik/` renders the core `<DemoPricingNotice>` before the first price: "Ukázkový ceník – ceny jsou smyšlené a slouží pouze k vyzkoušení vzhledu webu. Nejde o skutečné ceny {brandName}." The page also gets `noindex`.
4. **Containment:** prices appear only on `/cenik/` and, if a template links services to price groups, on service detail pages through the same component. They never appear in structured data while any item is `demo`.
5. **Build gate:** a production build fails if `pricing.visible` is `true` and any item is `demo` (G-020), or if `validFrom` or `vatNote` is missing (G-021).
6. **Launch check:** requires `approvals.pricing.status = "APPROVED"` with `approvedBy` and `approvedAt`.
7. **Escape hatch:** with no approved prices at launch, the client or agent sets `visible: false`. The route, nav item and CMS teaser links all disappear.

### 6.12 Articles (optional, `articles/*.md`)

```ts
export const Article = z.object({
  title: text(100),
  summary: text(240),
  publishedAt: IsoDate,
  updatedAt: IsoDate.nullable().default(null),
  image: ImageRef.nullable().default(null),
  draft: z.boolean().default(true),
  placeholder: z.boolean().default(false),
});
```

**For Hnátek: `features.articles = false`.** The result: no `/clanky/` routes are generated (the dynamic route returns no paths), there is no nav item, no sitemap entries, no CMS collection, and the `articles/` directory is absent. If the directory exists while the feature is off, the gate warns (G-050). If the feature is on but the template does not support articles, the build fails (G-051).

## 7. Cross-cutting content rules

### 7.1 Missing data

| Situation | Prototype build | Production build |
| --- | --- | --- |
| Required fact `null` (e.g., IČO) | visible marker `[Doplnit: IČO]` styled as a review flag | build fails (gate) |
| Optional fact `null` (e.g., `serviceArea`) | omitted | omitted |
| Optional section with zero published entries (e.g., no coffins) | page shows the intro text and a neutral "Katalog připravujeme" note | page shows the intro and contact prompt; nav item stays (rakve and kvetiny are required pages) |
| No image for an image slot | template's image-less variant | template's image-less variant |

Templates **must** look complete with zero photographs. Rights are unconfirmed for Hnátek (U5).

### 7.2 Copy language and tone

Copy is plain professional Czech. There is no sentimental marketing, no superlatives that cannot be verified ("nejlepší", "nejlevnější"), no testimonials unless real, approved and attributed, and no invented names, quotations or anecdotes. AI-drafted copy is recorded as `DRAFT` in `approvals.json` until the client approves it.

### 7.3 Restricted Markdown bodies

A core checker (`core/markdown/restrict-body.ts`) fails the build with the file and line when it finds the items below. S1 implemented it as a line-based checker rather than a remark plugin: the same code then runs in the Node validator, the build gate and the unit tests with no extra dependencies. It skips fenced code and inline code.

- raw HTML;
- `#` (H1) headings, because the H1 comes from `title`; bodies start at `##`;
- skipped heading levels;
- inline images, because images come from `ImageRef` fields;
- phone numbers in body text (pattern `+420` or nine-digit groups), because phones come from contact data so that a number edit in one place is complete;
- links with `javascript:`, or bare URLs to non-HTTPS sites.

## 8. Build modes and the publication gate

The mode comes from the environment variable `SITE_MODE`, either `prototype` or `production`. **The default when unset is `prototype`**, so a misconfigured build produces a no-index test site, not a public one.

| | `prototype` | `production` |
| --- | --- | --- |
| Global banner "Testovací verze webu – obsahuje neověřené a ukázkové údaje" | yes | no |
| `<meta name="robots" content="noindex,nofollow">` and `robots.txt: Disallow: /` | yes | no (except `/cenik/` while demo, which cannot happen in production) |
| Sitemap | not emitted | emitted (excludes noindex pages) |
| Placeholders, demo prices, missing-data markers | allowed and visibly marked | build fails |

Gate rules. Each has an id; the `prototype` column gives its behaviour in prototype mode and the `production` column its behaviour in production:

| Id | Rule | prototype | production |
| --- | --- | --- | --- |
| G-001 | Schema-valid content | fail | fail |
| G-002 | Required page file present | fail | fail |
| G-003 | Every referenced image file exists in `src/assets/media` (even on unpublished entries) | fail | fail |
| G-004 | References resolve (`phones[].locationId`, `officeHours.locationId`, `services[].priceGroupId`) | fail | fail |
| G-010 | Required fact present: office hours not empty; each location has `mapUrl` or `geo` | marker | fail |
| G-011 | `company.legalIds` (IČO, registered office, register entry) present | marker | fail |
| G-012 | `siteUrl` is a real domain (not `example.invalid`) | – | fail |
| G-020 | Visible pricing contains `demo` items | notice + marker | fail |
| G-021 | Visible pricing lacks `validFrom` or `vatNote` | warn | fail |
| G-030 | Phone number found in a Markdown body | fail | fail |
| G-031 | Any `placeholder: true` page or entry is published | marker | fail |
| G-032 | Any `ImageRef.source = "placeholder"` rendered | marker | fail |
| G-033 | Any rendered image with `rightsConfirmed: false` | warn | fail |
| G-034 | Markdown body breaks the restricted format (§7.3) in any way other than a phone number | fail | fail |
| G-040 | Published guidance without `review.reviewedAt` | marker "Neověřený text" | fail |
| G-041 | Guidance review older than 12 months | – | warn |
| G-042 | Emergency phone equals an office phone | warn | warn |
| G-050 | `articles/` exists while the feature is off | warn | warn |
| G-051 | Articles on, template unsupported | fail | fail |
| G-060 | Contact form enabled without provider + privacy page | fail | fail |
| G-061 | Map embed (iframe) enabled without privacy page | fail | fail |

The gate prints one line per violation with its id, file and field path, in Czech and English. CMS users read Czech; developers read English.

## 9. Non-goals of this contract

Obituaries, online booking, payments, client portal, multi-tenant hosting and a custom CMS are out of scope (brief §5, test plan non-goals).

## 10. Hnátek: fact ledger seed (from the brief, not yet researched further)

| Ledger key | Value | Status | Notes |
| --- | --- | --- | --- |
| `company.brandName` | Pohřebnictví Hnátek | EXISTING_WEBSITE | confirm logo/wordmark form (U22) |
| `company.legalName` | Pohřebnictví Hnátek s.r.o. | EXISTING_WEBSITE | |
| `company.legalIds.*` | – | UNKNOWN | U10 |
| `company.tradition.publicWording` | "přibližně 40 let" (draft) | CLIENT_PROVIDED | approximate; not from incorporation date (U1) |
| `company.tradition.foundedYear` | – | UNKNOWN | U1 |
| `company.familyOwned` | true | CLIENT_PROVIDED | wording needs approval |
| `contact.locations.vyskov.address` | Dědická ev.č. 38/22, 682 01 Vyškov | EXISTING_WEBSITE | "ev.č." form and map position to verify (U11) |
| `contact.phones.office-main.number` | +420517352020 | EXISTING_WEBSITE | |
| `contact.phones.office-mobile.number` | +420739404909 | EXISTING_WEBSITE | label to confirm |
| `contact.phones.flowers.number` | +420731175835 | EXISTING_WEBSITE | U12 |
| `contact.emails.office.address` | pohrebnictvi@vyskov.cz | EXISTING_WEBSITE | confirm still current/preferred (U20) |
| `office-hours.weekly.weekdays` | Po–Pá 07:00–15:30, break 12:00–12:30 | EXISTING_WEBSITE | U8, U23 |
| `office-hours.holidayNote` | – | UNKNOWN | U15 |
| `emergency.phone` | +420720283499 | EXISTING_WEBSITE | |
| `emergency.availability` | 24/7 | CLIENT_PROVIDED + EXISTING_WEBSITE | transport only, not the office |
| `emergency.serviceArea` | – | UNKNOWN | U19 |
| Founder / successor names, dates | – | UNKNOWN | never invent (U2, U3) |
| Cadillac | used for funeral transport | CLIENT_PROVIDED | text mention needs approval; no image until a real photo is approved (U4) |
| Services list, ceremony types | – | UNKNOWN until Phase 3 research | U14 |
| Coffin catalogue | – | UNKNOWN | U13 |
| Prices | – | none supplied | demo only (U6) |

## 11. Hnátek: uncertainty and sign-off register

"Blocks" says what stage the item blocks: **P** = prototype, **L** = public launch. Nothing below blocks Phase 2, which uses neutral fixture content.

| Id | Open item | Prototype-only handling | Blocks | Sign-off by |
| --- | --- | --- | --- | --- |
| U1 | Founding date and exact wording of "about 40 years" | `publicWording` drafted as "rodinná firma s tradicí přibližně 40 let", `DRAFT`; no year shown | L | client |
| U2 | Whether and how to tell the succession story publicly | `o-nas.md` story section `placeholder: true` with neutral text that names no one | L | client |
| U3 | Founder and successor names | not used anywhere | L (only if story uses names) | client |
| U4 | Real photo of the Cadillac | no vehicle image; text mention only as `DRAFT` | L | client |
| U5 | Image rights, asset files, logo | text wordmark; neutral placeholder graphics | L | client |
| U6 | Real price list | demo prices (`status: "demo"`), visibly marked; otherwise `visible: false` | L | client |
| U7 | Procedural/legal guidance correctness | drafted from general knowledge, marked "Neověřený text"; sources listed | L | named reviewer (client or adviser) |
| U8 | Re-verification of all contact details and hours | use existing-website values | L | client |
| U9 | Contact form data handling, privacy page, cookies | form disabled; privacy page drafted as `placeholder` | L (if form, embed or analytics enabled) | client |
| U10 | IČO, DIČ, registered office, commercial register entry; confirm § 435 ZOK duty | `[Doplnit]` markers | L | client (public registers may be consulted in Phase 3, then confirmed) |
| U11 | Address form "ev.č. 38/22", map coordinates, parking/access | address verbatim; map as link only, no coordinates | L | client |
| U12 | Flowers: in-house or partner florist; who answers +420 731 175 835 | neutral wording "Objednávky květin" | L | client |
| U13 | Coffin catalogue: does the existing site have one, rights, availability | placeholder entries with placeholder images | L | client |
| U14 | Exact services and ceremony types offered; cremation partner | services from Phase 3 research, `EXISTING_WEBSITE`; nothing extra invented | L | client |
| U15 | Holiday closures; what callers should do outside office hours (non-transport) | `holidayNote` null, `outsideHoursNote` null | L | client |
| U16 | VAT payer status (price notes "včetně DPH") | demo price notice only | L (with pricing) | client |
| U17 | Domain, hosting, GitHub owner, CMS user accounts | `siteUrl: https://example.invalid` | L | client |
| U18 | Licence terms for template code at handover | – | handover | business owner of template system |
| U19 | Emergency transport: service area, call handling | `serviceArea` null | L | client |
| U20 | E-mail `pohrebnictvi@vyskov.cz` still the preferred address | use as is | L | client |
| U21 | Analytics (none planned) and map embed consent | no analytics; map link only | L | client |
| U22 | Brand name and logo treatment. **Update 2026-11-05:** the project owner supplied a new logo design, kept as a reference mockup in `Hnátek H · H ve věnci s plamenem-html/`: an emblem (an H with a mourning drape inside a wreath, topped by a candle flame), a "HNÁTEK" wordmark in Bodoni Moda with "POHŘEBNICTVÍ · VYŠKOV" in Jost, a horizontal version on dark green, and two icon versions. Colours: ink `#1F3D2E`, wreath `#2E5A42`, flame `#C9A44A`, drape `#9EA3A1`, background `#F3F3EF`. Still open: whether the client has approved it, and what rights terms apply. | Phase 3: export a static SVG with the colours fixed and the wordmark converted to outlines, plus favicon and icon sizes; store it in `clients/hnatek/assets/media/` as `source: "client"`, `depicts: "actual-business"`. Until then, use the text wordmark. | L | client |
| U23 | Are office phones answered during the 12:00–12:30 break? | show the break as published | L | client |
| U24 | Old-site URL structure for redirects | none | L | Phase 3 research |
