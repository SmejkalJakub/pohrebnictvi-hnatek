/**
 * Reading a site's content from disk and validating it with the contract schemas.
 * Used by the Node CLIs, the Astro integration (build gate) and unit tests.
 * One code path, so `npm run validate` and `astro build` can never disagree.
 */
import { existsSync } from "node:fs";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { parse as parseYaml } from "yaml";
import type { z } from "astro/zod";
import { SiteConfig } from "./config.ts";
import {
  COLLECTION_NAMES,
  COLLECTION_SCHEMAS,
  PageId,
  SINGLETON_NAMES,
  SINGLETON_SCHEMAS,
  type Article,
  type Coffin,
  type CollectionName,
  type Company,
  type Contact,
  type EmergencyTransport,
  type FlowerArrangement,
  type Guidance,
  type OfficeHours,
  type Page,
  type Pricing,
  type Service,
  type SingletonName,
} from "./schemas.ts";
import { sitePaths, type SitePaths } from "../paths.ts";
import { isSupportedMediaFile } from "../media/normalize.ts";

// ---------------------------------------------------------------------------
// Raw snapshot (what is on disk)
// ---------------------------------------------------------------------------

export interface RawFile {
  /** Path relative to the site root, for messages. */
  file: string;
  data: unknown;
  /** Set when the file could not be read or parsed. */
  parseError: string | null;
}

export interface RawEntry extends RawFile {
  collection: CollectionName;
  id: string;
  body: string;
}

export interface RawSnapshot {
  paths: SitePaths;
  config: RawFile;
  singletons: Partial<Record<SingletonName, RawFile>>;
  entries: RawEntry[];
  mediaFiles: string[];
  articlesDirExists: boolean;
}

function relative(paths: SitePaths, absolute: string): string {
  return path.relative(paths.root, absolute).split(path.sep).join("/");
}

export function splitFrontmatter(source: string): { frontmatter: string; body: string } | null {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(source);
  if (match === null) {
    return null;
  }
  return { frontmatter: match[1] ?? "", body: match[2] ?? "" };
}

async function readJsonFile(paths: SitePaths, absolute: string): Promise<RawFile> {
  const file = relative(paths, absolute);
  try {
    const source = await readFile(absolute, "utf8");
    return { file, data: JSON.parse(source), parseError: null };
  } catch (error) {
    return { file, data: undefined, parseError: (error as Error).message };
  }
}

async function readCollection(paths: SitePaths, collection: CollectionName): Promise<RawEntry[]> {
  const directory = path.join(paths.contentDir, collection);
  if (!existsSync(directory)) {
    return [];
  }
  const names = (await readdir(directory)).filter((name) => name.endsWith(".md")).sort();
  const entries: RawEntry[] = [];
  for (const name of names) {
    const absolute = path.join(directory, name);
    const file = relative(paths, absolute);
    const id = name.replace(/\.md$/, "");
    const source = await readFile(absolute, "utf8");
    const parts = splitFrontmatter(source);
    if (parts === null) {
      entries.push({
        collection,
        id,
        file,
        data: undefined,
        body: "",
        parseError: "Missing --- frontmatter block.",
      });
      continue;
    }
    try {
      const data: unknown = parseYaml(parts.frontmatter) ?? {};
      entries.push({ collection, id, file, data, body: parts.body, parseError: null });
    } catch (error) {
      entries.push({
        collection,
        id,
        file,
        data: undefined,
        body: parts.body,
        parseError: (error as Error).message,
      });
    }
  }
  return entries;
}

async function readConfig(paths: SitePaths): Promise<RawFile> {
  const file = relative(paths, paths.configFile);
  if (!existsSync(paths.configFile)) {
    return { file, data: undefined, parseError: "src/site.config.ts not found." };
  }
  try {
    // Cache-bust so repeated reads in one process (dev server, tests) see edits.
    const url = `${pathToFileURL(paths.configFile).href}?t=${Date.now()}`;
    const module = (await import(url)) as { default?: unknown };
    return { file, data: module.default, parseError: null };
  } catch (error) {
    return { file, data: undefined, parseError: (error as Error).message };
  }
}

export interface SnapshotOptions {
  /** Absolute path of a site.config.ts to use instead of <root>/src/site.config.ts. */
  configFile?: string | null;
}

export async function readSiteSnapshot(root: string, options: SnapshotOptions = {}): Promise<RawSnapshot> {
  const paths = sitePaths(root, options.configFile ?? null);
  const singletons: Partial<Record<SingletonName, RawFile>> = {};
  for (const name of SINGLETON_NAMES) {
    const absolute = path.join(paths.contentDir, "site", `${name}.json`);
    if (existsSync(absolute)) {
      singletons[name] = await readJsonFile(paths, absolute);
    }
  }
  const entries: RawEntry[] = [];
  for (const collection of COLLECTION_NAMES) {
    entries.push(...(await readCollection(paths, collection)));
  }
  let mediaFiles: string[] = [];
  if (existsSync(paths.mediaDir)) {
    mediaFiles = (await readdir(paths.mediaDir)).filter(isSupportedMediaFile).sort();
  }
  return {
    paths,
    config: await readConfig(paths),
    singletons,
    entries,
    mediaFiles,
    articlesDirExists: existsSync(path.join(paths.contentDir, "articles")),
  };
}

// ---------------------------------------------------------------------------
// Validated content
// ---------------------------------------------------------------------------

export interface ContentEntry<T> {
  id: string;
  file: string;
  data: T;
  body: string;
}

export interface ValidatedContent {
  paths: SitePaths;
  config: SiteConfig;
  files: Record<SingletonName, string>;
  company: Company;
  contact: Contact;
  officeHours: OfficeHours;
  emergency: EmergencyTransport;
  pricing: Pricing;
  pages: ContentEntry<Page>[];
  services: ContentEntry<Service>[];
  guidance: ContentEntry<Guidance>[];
  coffins: ContentEntry<Coffin>[];
  flowers: ContentEntry<FlowerArrangement>[];
  articles: ContentEntry<Article>[];
  mediaFiles: string[];
  articlesDirExists: boolean;
}

export interface SchemaProblem {
  file: string;
  path: string;
  message: string;
}

export interface ValidationResult {
  content: ValidatedContent | null;
  problems: SchemaProblem[];
}

function formatIssuePath(issuePath: readonly PropertyKey[]): string {
  return issuePath.map((segment) => String(segment)).join(".");
}

function parseWith<S extends z.ZodType>(
  schema: S,
  raw: RawFile,
  problems: SchemaProblem[],
): z.infer<S> | null {
  if (raw.parseError !== null) {
    problems.push({ file: raw.file, path: "", message: `Soubor nelze načíst: ${raw.parseError}` });
    return null;
  }
  const result = schema.safeParse(raw.data);
  if (!result.success) {
    for (const issue of result.error.issues) {
      problems.push({ file: raw.file, path: formatIssuePath(issue.path), message: issue.message });
    }
    return null;
  }
  return result.data;
}

const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function validateSnapshot(raw: RawSnapshot): ValidationResult {
  const problems: SchemaProblem[] = [];

  const config = parseWith(SiteConfig, raw.config, problems);

  const singletonValues: Partial<Record<SingletonName, unknown>> = {};
  const files = {} as Record<SingletonName, string>;
  for (const name of SINGLETON_NAMES) {
    const file = raw.singletons[name];
    const expectedPath = `src/content/site/${name}.json`;
    files[name] = expectedPath;
    if (file === undefined) {
      problems.push({ file: expectedPath, path: "", message: "Povinný soubor chybí." });
      continue;
    }
    singletonValues[name] = parseWith(SINGLETON_SCHEMAS[name], file, problems);
  }

  const collections: Record<CollectionName, ContentEntry<unknown>[]> = {
    pages: [],
    services: [],
    guidance: [],
    coffins: [],
    flowers: [],
    articles: [],
  };
  for (const entry of raw.entries) {
    if (!ID_PATTERN.test(entry.id)) {
      problems.push({
        file: entry.file,
        path: "",
        message: "Název souboru smí obsahovat jen malá písmena bez diakritiky, číslice a pomlčky.",
      });
      continue;
    }
    if (entry.collection === "pages" && !PageId.safeParse(entry.id).success) {
      problems.push({ file: entry.file, path: "", message: `Neznámá stránka "${entry.id}".` });
      continue;
    }
    const data = parseWith(COLLECTION_SCHEMAS[entry.collection], entry, problems);
    if (data !== null) {
      collections[entry.collection].push({ id: entry.id, file: entry.file, data, body: entry.body });
    }
  }

  if (problems.length > 0 || config === null) {
    return { content: null, problems };
  }

  return {
    content: {
      paths: raw.paths,
      config,
      files,
      company: singletonValues.company as Company,
      contact: singletonValues.contact as Contact,
      officeHours: singletonValues["office-hours"] as OfficeHours,
      emergency: singletonValues.emergency as EmergencyTransport,
      pricing: singletonValues.pricing as Pricing,
      pages: collections.pages as ContentEntry<Page>[],
      services: collections.services as ContentEntry<Service>[],
      guidance: collections.guidance as ContentEntry<Guidance>[],
      coffins: collections.coffins as ContentEntry<Coffin>[],
      flowers: collections.flowers as ContentEntry<FlowerArrangement>[],
      articles: collections.articles as ContentEntry<Article>[],
      mediaFiles: raw.mediaFiles,
      articlesDirExists: raw.articlesDirExists,
    },
    problems,
  };
}

export async function loadValidatedContent(
  root: string,
  options: SnapshotOptions = {},
): Promise<ValidationResult> {
  return validateSnapshot(await readSiteSnapshot(root, options));
}
