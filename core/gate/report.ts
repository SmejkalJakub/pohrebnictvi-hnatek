/** Human-readable gate output (Czech for editors, English for developers). */
import { RULES, type Finding } from "./rules.ts";

const LEVEL_LABEL: Record<Finding["level"], string> = {
  error: "CHYBA / error",
  warning: "VAROVÁNÍ / warning",
  marker: "ZNAČKA / marker (prototype only)",
};

export function formatFindings(findings: readonly Finding[]): string {
  if (findings.length === 0) {
    return "Bez nálezů / no findings.";
  }
  const order: Finding["level"][] = ["error", "warning", "marker"];
  const lines: string[] = [];
  for (const level of order) {
    const group = findings.filter((finding) => finding.level === level);
    if (group.length === 0) {
      continue;
    }
    lines.push(`${LEVEL_LABEL[level]} (${group.length})`);
    for (const finding of group) {
      const location = finding.path === "" ? finding.file : `${finding.file} → ${finding.path}`;
      lines.push(`  ${finding.rule} ${location}`);
      lines.push(`      ${finding.cs}`);
      lines.push(`      ${finding.en} [${RULES[finding.rule].title}]`);
    }
  }
  return lines.join("\n");
}

export function summarize(findings: readonly Finding[]): Record<Finding["level"], number> {
  return {
    error: findings.filter((finding) => finding.level === "error").length,
    warning: findings.filter((finding) => finding.level === "warning").length,
    marker: findings.filter((finding) => finding.level === "marker").length,
  };
}
