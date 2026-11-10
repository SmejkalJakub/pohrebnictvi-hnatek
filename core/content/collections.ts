/**
 * Content Layer collections. A template's src/content.config.ts is just:
 *   export { collections } from "@core/content/collections.ts";
 * Collections whose directory does not exist (e.g. articles for Hnátek, or notices, people, faq and
 * documents on a site without those features) are not defined.
 */
import { existsSync } from "node:fs";
import path from "node:path";
import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import {
  Article,
  Coffin,
  DocumentEntry,
  Faq,
  FlowerArrangement,
  Guidance,
  Notice,
  Page,
  Person,
  Service,
} from "./schemas.ts";
import { resolveSiteRoot, sitePaths } from "../paths.ts";

const { contentDir } = sitePaths(resolveSiteRoot());

function markdownIn(name: string) {
  return glob({ pattern: "*.md", base: path.join(contentDir, name) });
}

const definitions = {
  pages: defineCollection({ loader: markdownIn("pages"), schema: Page }),
  services: defineCollection({ loader: markdownIn("services"), schema: Service }),
  guidance: defineCollection({ loader: markdownIn("guidance"), schema: Guidance }),
  coffins: defineCollection({ loader: markdownIn("coffins"), schema: Coffin }),
  flowers: defineCollection({ loader: markdownIn("flowers"), schema: FlowerArrangement }),
  articles: defineCollection({ loader: markdownIn("articles"), schema: Article }),
  notices: defineCollection({ loader: markdownIn("notices"), schema: Notice }),
  people: defineCollection({ loader: markdownIn("people"), schema: Person }),
  faq: defineCollection({ loader: markdownIn("faq"), schema: Faq }),
  documents: defineCollection({ loader: markdownIn("documents"), schema: DocumentEntry }),
};

type Definitions = typeof definitions;

function onlyExisting(all: Definitions): Partial<Definitions> {
  const result: Partial<Definitions> = {};
  for (const name of Object.keys(all) as (keyof Definitions)[]) {
    if (existsSync(path.join(contentDir, name))) {
      Object.assign(result, { [name]: all[name] });
    }
  }
  return result;
}

// Typed as the full set so Astro generates entry types from the schemas. At runtime a missing
// directory (articles for Hnátek) simply has no collection; core never queries it while the feature is off.
export const collections = onlyExisting(definitions) as Definitions;
