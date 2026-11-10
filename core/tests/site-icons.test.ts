import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { detectSiteIcons } from "../media/site-icons.ts";

const temporary: string[] = [];

afterAll(async () => {
  for (const dir of temporary) {
    await rm(dir, { recursive: true, force: true });
  }
});

async function siteRoot(files: string[]): Promise<string> {
  const root = await mkdtemp(path.join(os.tmpdir(), "site-icons-"));
  temporary.push(root);
  if (files.length > 0) {
    await mkdir(path.join(root, "public"));
  }
  for (const file of files) {
    await writeFile(path.join(root, "public", file), "x");
  }
  return root;
}

describe("detectSiteIcons", () => {
  it("reports no icons when the site has no public/ folder", async () => {
    const root = await siteRoot([]);
    expect(detectSiteIcons(root)).toEqual({ svg: false, ico: false, appleTouch: false, manifest: false });
  });

  it("reports each fixed file name that exists", async () => {
    const root = await siteRoot(["favicon.svg", "favicon.ico", "site.webmanifest", "logo.png"]);
    expect(detectSiteIcons(root)).toEqual({ svg: true, ico: true, appleTouch: false, manifest: true });
  });
});
