/** Tiny argument parser shared by the CLIs (no dependency). */
import { resolveSiteRoot } from "../paths.ts";

export interface CliArgs {
  root: string;
  flags: Map<string, string | true>;
}

export function parseArgs(argv: string[]): CliArgs {
  const flags = new Map<string, string | true>();
  const positional: string[] = [];
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index] as string;
    if (!arg.startsWith("--")) {
      positional.push(arg);
      continue;
    }
    const [name, inlineValue] = arg.slice(2).split("=", 2) as [string, string | undefined];
    if (inlineValue !== undefined) {
      flags.set(name, inlineValue);
      continue;
    }
    const next = argv[index + 1];
    if (next !== undefined && !next.startsWith("--")) {
      flags.set(name, next);
      index += 1;
    } else {
      flags.set(name, true);
    }
  }
  const env = { ...process.env };
  if (positional[0] !== undefined) {
    env.SITE_ROOT = positional[0];
  }
  return { root: resolveSiteRoot(process.cwd(), env), flags };
}
