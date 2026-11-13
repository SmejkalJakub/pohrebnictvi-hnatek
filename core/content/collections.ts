/**
 * Content Layer collections. A template's src/content.config.ts is just:
 *   export { collections } from "@core/content/collections.ts";
 * Every collection is always defined, so Astro generates entry types for all of them and
 * `getCollection("documents")` type-checks on every site. A collection whose directory does not exist
 * (e.g. articles for Hnátek, or notices, people, faq and documents on a site without those features)
 * gets an empty loader instead of glob(), which would warn about the missing directory on every build.
 */
import { existsSync } from "node:fs";
import path from "node:path";
import { defineCollection } from "astro:content";
import { glob, type Loader } from "astro/loaders";
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

/** A loader for a collection whose directory does not exist: the collection is defined but empty. */
function emptyLoader(name: string): Loader {
  return {
    name: `site-core-empty:${name}`,
    load: async ({ store }) => {
      store.clear();
    },
  };
}

function markdownIn(name: string): Loader {
  const base = path.join(contentDir, name);
  if (!existsSync(base)) {
    return emptyLoader(name);
  }
  return glob({ pattern: "*.md", base });
}

export const collections = {
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
