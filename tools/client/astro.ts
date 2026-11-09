/**
 * Run the client's template with the client's content (docs/client-workflow.md).
 *
 *   npm run client:dev -- <id> [astro dev flags, e.g. --port 4400]
 *   npm run client:build -- <id> [--production]
 *
 * Starts Astro in templates/<template>/ (the template named in clients/<id>/src/site.config.ts)
 * with SITE_ROOT=clients/<id> and SITE_CONFIG=clients/<id>/src/site.config.ts, the same wiring
 * the template's own scripts use for the neutral fixture. The build writes templates/<template>/dist
 * (prototype unless --production) and is a render check; ship with client:export.
 */
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { templateDir } from "../lib/repo.ts";
import { clientConfigFile, existingClient, readClientConfig } from "./clients.ts";

export interface AstroRun {
  command: "dev" | "build";
  cwd: string;
  args: string[];
  env: Record<string, string>;
}

/** What to spawn for `astro <command>` on a client; kept separate so tests can check the wiring. */
export async function planAstroRun(
  command: "dev" | "build",
  id: string,
  rest: string[],
  clientsDir?: string,
): Promise<AstroRun> {
  const dir = existingClient(id, clientsDir);
  const config = await readClientConfig(dir);
  const env: Record<string, string> = { SITE_ROOT: dir, SITE_CONFIG: clientConfigFile(dir) };
  const args: string[] = [command];
  for (const arg of rest) {
    if (arg === "--production" && command === "build") {
      env.SITE_MODE = "production";
    } else {
      args.push(arg);
    }
  }
  if (env.SITE_MODE === undefined) {
    env.SITE_MODE = "prototype";
  }
  return { command, cwd: templateDir(config.template), args, env };
}

async function main(): Promise<void> {
  const [command, id, ...rest] = process.argv.slice(2);
  if ((command !== "dev" && command !== "build") || id === undefined || id.startsWith("--")) {
    throw new Error(
      "Usage: npm run client:dev -- <id> [astro flags] | npm run client:build -- <id> [--production]",
    );
  }
  const run = await planAstroRun(command, id, rest);
  console.log(
    `astro ${run.args.join(" ")} in ${path.basename(run.cwd)} (SITE_ROOT=${run.env.SITE_ROOT}, SITE_MODE=${run.env.SITE_MODE})`,
  );
  const child = spawn("npx", ["--no-install", "astro", ...run.args], {
    cwd: run.cwd,
    env: { ...process.env, ...run.env },
    stdio: "inherit",
  });
  const code = await new Promise<number>((resolve) => {
    child.on("close", (exitCode) => {
      resolve(exitCode ?? 1);
    });
  });
  process.exitCode = code;
}

if (process.argv[1] !== undefined && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    await main();
  } catch (error) {
    console.error(`client astro failed: ${(error as Error).message}`);
    process.exitCode = 1;
  }
}
