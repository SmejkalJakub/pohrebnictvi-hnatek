/**
 * Per-client publishing settings: clients/<id>/publishing.json (docs/cms/setup.md §2).
 *
 * Non-secret values only: the client's own GitHub repository, its DecapBridge site id and the
 * hosting target (Cloudflare Worker name or Netlify project ID). Tokens and passwords never go
 * here; they live in DecapBridge (GitHub token) and in the client repository's GitHub Actions
 * secrets (Cloudflare API token or Netlify access token).
 *
 * Unknown values stay null. The export then writes PLACEHOLDER_VALUE, and the admin page shows a
 * Czech notice instead of a login form until a re-export fills them in.
 */
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { z } from "astro/zod";

export const PUBLISHING_FILE = "publishing.json";
/** Written into generated files while a value is unknown. Never a valid repository, id or name. */
export const PLACEHOLDER_VALUE = "DOPLNIT";

const DEFAULT_AUTH_URL = "https://auth.decapbridge.com";
const DEFAULT_GATEWAY_URL = "https://gateway.decapbridge.com";

const Repository = z.string().regex(/^[A-Za-z0-9-]+\/[A-Za-z0-9._-]+$/, 'Repository must be "owner/name".');
const WorkerName = z
  .string()
  .regex(/^[a-z0-9](?:[a-z0-9-]{0,52}[a-z0-9])?$/, "Worker name: lowercase letters, digits, hyphens.");

const NetlifyProjectName = z
  .string()
  .regex(/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/, "Netlify project: its Project ID or its name.");

export const PublishingSettings = z
  .object({
    /** The client's own private repository ("owner/name"), never the agency source repository. */
    repository: Repository.nullable(),
    decapbridge: z
      .object({
        /** Site id from the DecapBridge dashboard (a UUID). */
        siteId: z.uuid().nullable(),
        /** "classic" = e-mail and password in the Decap login; "pkce" adds Google / Microsoft login. */
        authType: z.enum(["classic", "pkce"]).default("classic"),
        authUrl: z.url().default(DEFAULT_AUTH_URL),
        gatewayUrl: z.url().default(DEFAULT_GATEWAY_URL),
      })
      .strict(),
    hosting: z.discriminatedUnion("provider", [
      z
        .object({
          provider: z.literal("cloudflare"),
          /** Production Worker name; the preview Worker is "<name>-preview". */
          workerName: WorkerName,
        })
        .strict(),
      z
        .object({
          provider: z.literal("netlify"),
          /**
           * The Netlify project for `netlify deploy --site`: its Project ID (Project configuration →
           * General → Project details; stays valid after a rename) or its name (<name>.netlify.app).
           */
          siteId: z.union([z.uuid(), NetlifyProjectName]).nullable(),
        })
        .strict(),
    ]),
  })
  .strict();
export type PublishingSettings = z.infer<typeof PublishingSettings>;

export type ResolvedHosting =
  { provider: "cloudflare"; workerName: string } | { provider: "netlify"; siteId: string };

export interface ResolvedPublishingSettings {
  repository: string;
  decapbridge: { siteId: string; authType: "classic" | "pkce"; authUrl: string; gatewayUrl: string };
  hosting: ResolvedHosting;
  /** Names of the settings that are still unknown (rendered as PLACEHOLDER_VALUE). */
  missing: string[];
}

/** Fills unknown values with the placeholder, and lists which ones are missing. */
export function resolvePublishing(settings: PublishingSettings): ResolvedPublishingSettings {
  const missing: string[] = [];
  let repository = settings.repository;
  if (repository === null) {
    missing.push("repository");
    repository = `${PLACEHOLDER_VALUE}/${PLACEHOLDER_VALUE}`;
  }
  let siteId = settings.decapbridge.siteId;
  if (siteId === null) {
    missing.push("decapbridge.siteId");
    siteId = PLACEHOLDER_VALUE;
  }
  let hosting: ResolvedHosting;
  if (settings.hosting.provider === "cloudflare") {
    hosting = { provider: "cloudflare", workerName: settings.hosting.workerName };
  } else {
    let netlifySiteId = settings.hosting.siteId;
    if (netlifySiteId === null) {
      missing.push("hosting.siteId");
      netlifySiteId = PLACEHOLDER_VALUE;
    }
    hosting = { provider: "netlify", siteId: netlifySiteId };
  }
  return {
    repository,
    decapbridge: {
      siteId,
      authType: settings.decapbridge.authType,
      authUrl: settings.decapbridge.authUrl.replace(/\/+$/, ""),
      gatewayUrl: settings.decapbridge.gatewayUrl.replace(/\/+$/, ""),
    },
    hosting,
    missing,
  };
}

/** Settings for a site without a publishing.json (fixtures, clean template exports). */
export function defaultPublishing(workerName: string): PublishingSettings {
  return {
    repository: null,
    decapbridge: {
      siteId: null,
      authType: "classic",
      authUrl: DEFAULT_AUTH_URL,
      gatewayUrl: DEFAULT_GATEWAY_URL,
    },
    hosting: { provider: "cloudflare", workerName },
  };
}

export async function readPublishing(clientDir: string): Promise<PublishingSettings | null> {
  const file = path.join(clientDir, PUBLISHING_FILE);
  if (!existsSync(file)) {
    return null;
  }
  const parsed = PublishingSettings.safeParse(JSON.parse(await readFile(file, "utf8")));
  if (!parsed.success) {
    const list = parsed.error.issues.map((issue) => `  ${issue.path.join(".")}: ${issue.message}`).join("\n");
    throw new Error(`${file} is invalid:\n${list}`);
  }
  return parsed.data;
}

/** "git@github.com:owner/name.git" or "https://github.com/owner/name(.git)" → "owner/name". */
export function repositoryFromRemote(url: string): string | null {
  const match = /github\.com[:/]([^/]+\/[^/]+?)(?:\.git)?\/?$/.exec(url.trim());
  if (match === null) {
    return null;
  }
  return match[1] as string;
}

export interface NamedSettings {
  id: string;
  settings: PublishingSettings;
}

/**
 * Problems that would let two sites, or a site and the agency repository, share mutable state:
 * the same repository, DecapBridge site, Cloudflare Worker or Netlify project.
 */
export function publishingConflicts(sites: NamedSettings[], sourceRepository: string | null): string[] {
  const problems: string[] = [];
  const seen = new Map<string, string>();
  const claim = (kind: string, value: string | null, id: string): void => {
    if (value === null) {
      return;
    }
    const key = `${kind}:${value.toLowerCase()}`;
    const owner = seen.get(key);
    if (owner !== undefined && owner !== id) {
      problems.push(`${id} and ${owner} use the same ${kind} "${value}".`);
      return;
    }
    seen.set(key, id);
  };
  for (const { id, settings } of sites) {
    if (
      settings.repository !== null &&
      sourceRepository !== null &&
      settings.repository.toLowerCase() === sourceRepository.toLowerCase()
    ) {
      problems.push(
        `${id}: repository "${settings.repository}" is the agency source repository; the CMS must never edit it.`,
      );
    }
    claim("repository", settings.repository, id);
    claim("DecapBridge site", settings.decapbridge.siteId, id);
    if (settings.hosting.provider === "cloudflare") {
      claim("Cloudflare Worker", settings.hosting.workerName, id);
      claim("Cloudflare Worker", `${settings.hosting.workerName}-preview`, id);
    } else {
      claim("Netlify project", settings.hosting.siteId, id);
    }
  }
  return problems;
}
