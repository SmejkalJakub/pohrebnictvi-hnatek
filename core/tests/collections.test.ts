/**
 * Content collections on a client without the optional folders (S6 regression): every collection
 * must still be defined, because Astro generates the `getCollection` key types from the runtime
 * config, and core/content/load.ts names notices, people, faq and documents unconditionally.
 */
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("astro:content", () => ({
  defineCollection: <T>(config: T): T => config,
}));

const REQUIRED = ["pages", "services", "guidance", "coffins", "flowers"] as const;
const OPTIONAL = ["articles", "notices", "people", "faq", "documents"] as const;

interface TestLoader {
  name: string;
  load: (context: { store: { clear: () => void } }) => Promise<void>;
}

let siteRoot: string;
let collections: Record<string, { loader: TestLoader }>;

beforeAll(async () => {
  siteRoot = await mkdtemp(path.join(os.tmpdir(), "collections-"));
  for (const name of REQUIRED) {
    const dir = path.join(siteRoot, "src", "content", name);
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, "example.md"), "---\ntitle: Example\n---\n");
  }
  vi.stubEnv("SITE_ROOT", siteRoot);
  vi.resetModules();
  // A path variable keeps collections.ts (which needs Astro's virtual types) out of the root tsc
  // program, where tsconfig.json excludes it; Vitest still resolves it at runtime.
  const modulePath = "../content/collections.ts";
  const loaded = (await import(modulePath)) as { collections: Record<string, { loader: TestLoader }> };
  collections = loaded.collections;
});

afterAll(async () => {
  vi.unstubAllEnvs();
  await rm(siteRoot, { recursive: true, force: true });
});

describe("collections on a client without the optional folders", () => {
  it("defines every collection, so Astro generates a type for each", () => {
    expect(Object.keys(collections).sort()).toEqual([...REQUIRED, ...OPTIONAL].sort());
  });

  it("loads the existing folders with glob()", () => {
    for (const name of REQUIRED) {
      expect(collections[name]?.loader.name, name).toBe("glob-loader");
    }
  });

  it.each(OPTIONAL)("gives the missing %s folder an empty loader", async (name) => {
    const loader = collections[name]?.loader;
    expect(loader?.name).toBe(`site-core-empty:${name}`);
    const clear = vi.fn();
    await loader?.load({ store: { clear } });
    expect(clear).toHaveBeenCalledOnce();
  });
});
