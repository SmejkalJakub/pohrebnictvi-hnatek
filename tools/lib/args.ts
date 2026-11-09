/** Minimal `--name value` / `--flag` parser shared by the tools (no dependency). */

export interface ParsedArgs {
  flags: Map<string, string | true>;
  positional: string[];
}

export function parseArgs(argv: readonly string[]): ParsedArgs {
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
  return { flags, positional };
}

/** A string flag, or null when absent. Throws when the flag was given without a value. */
export function stringFlag(args: ParsedArgs, name: string): string | null {
  const value = args.flags.get(name);
  if (value === undefined) {
    return null;
  }
  if (value === true) {
    throw new Error(`--${name} needs a value.`);
  }
  return value;
}

export function requiredFlag(args: ParsedArgs, name: string): string {
  const value = stringFlag(args, name);
  if (value === null) {
    throw new Error(`Missing --${name}.`);
  }
  return value;
}
