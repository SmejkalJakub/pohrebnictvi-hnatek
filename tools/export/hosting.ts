/**
 * Hosting provider of an exported site (publishing.json → hosting, docs/cms/setup.md).
 *
 * Either way GitHub Actions deploy the built dist/ after the integrity check; the host never builds
 * the repository itself. This module renders what differs per provider: the host's config file,
 * the deploy steps of preview.yml / publish.yml, and the hosting sentences of README / HANDOVER.
 *
 *   cloudflare: Workers Static Assets, Worker "<name>" (production) and "<name>-preview".
 *   netlify:    one Netlify project; production deploys with --prod, the preview is a draft deploy
 *               with the alias "preview" (https://preview--<project>.netlify.app). Netlify Forms
 *               receive the contact form.
 */
import type { ResolvedHosting } from "../cms/settings.ts";

/** Wrangler used by the workflows to deploy to Cloudflare Workers (2026-10-28). */
export const WRANGLER_VERSION = "4.155.0";
/** Netlify CLI used by the workflows to deploy to Netlify (2026-10-27). */
export const NETLIFY_CLI_VERSION = "27.15.0";
/** Alias of the preview draft deploy on Netlify: https://preview--<project>.netlify.app. */
export const NETLIFY_PREVIEW_ALIAS = "preview";

export interface HostingFile {
  name: string;
  content: string;
}

export interface HostingPlan {
  provider: ResolvedHosting["provider"];
  /** wrangler.jsonc or netlify.toml at the root of the export. */
  configFile: HostingFile;
  previewDeployStep: string;
  productionDeployStep: string;
  /** Header-comment lines of the workflows (without the leading "#"). */
  previewTarget: string;
  productionTarget: string;
  secrets: string;
  /** Text blocks of README.md / HANDOVER.md. */
  text: Record<string, string>;
}

const DEPLOY_CONDITION = "vars.DEPLOY == 'true'";

function step(name: string, run: string, env: Record<string, string>): string {
  const lines = [
    `      - name: ${name}`,
    `        if: ${DEPLOY_CONDITION}`,
    `        run: ${run}`,
    "        env:",
  ];
  for (const [key, value] of Object.entries(env)) {
    lines.push(`          ${key}: ${value}`);
  }
  return lines.join("\n");
}

function wranglerConfig(workerName: string): string {
  const assets = [
    '"assets": {',
    '    "directory": "./dist",',
    '    "not_found_handling": "404-page",',
    '    "html_handling": "auto-trailing-slash"',
    "  }",
  ];
  return [
    "// Cloudflare Workers Static Assets: serves dist/ as it is; there is no Worker code.",
    `// Production Worker "${workerName}" (deployed only by .github/workflows/publish.yml) and preview`,
    `// Worker "${workerName}-preview" (deployed by .github/workflows/preview.yml, \`--env preview\`).`,
    "// The custom domain is added in the Cloudflare dashboard (README.md), not here.",
    "{",
    `  "name": "${workerName}",`,
    '  "compatibility_date": "2026-11-01",',
    '  "workers_dev": true,',
    '  "preview_urls": false,',
    `  ${assets.join("\n  ")},`,
    '  "env": {',
    '    "preview": {',
    `      "name": "${workerName}-preview",`,
    '      "workers_dev": true,',
    '      "preview_urls": false,',
    `      ${assets.join("\n      ")}`,
    "    }",
    "  }",
    "}",
    "",
  ].join("\n");
}

function netlifyConfig(): string {
  return [
    "# Netlify: this repository is deployed only by GitHub Actions. preview.yml and publish.yml run",
    "# `netlify deploy --no-build --dir dist` after the integrity check. Netlify must never build it",
    "# from Git: such a build would publish commits that skipped the check. Keep the project",
    '# unlinked from GitHub (or set "Stopped builds"); if it gets linked anyway, the ignore command',
    "# below cancels every Git-triggered build.",
    "[build]",
    '  publish = "dist"',
    '  ignore = "exit 0"',
    "",
  ].join("\n");
}

export function hostingPlan(hosting: ResolvedHosting): HostingPlan {
  if (hosting.provider === "cloudflare") {
    const env = {
      CLOUDFLARE_API_TOKEN: "${{ secrets.CLOUDFLARE_API_TOKEN }}",
      CLOUDFLARE_ACCOUNT_ID: "${{ secrets.CLOUDFLARE_ACCOUNT_ID }}",
    };
    const worker = hosting.workerName;
    return {
      provider: "cloudflare",
      configFile: { name: "wrangler.jsonc", content: wranglerConfig(worker) },
      previewDeployStep: step(
        'Deploy to the preview Worker (only when DEPLOY is "true")',
        `npx --yes wrangler@${WRANGLER_VERSION} deploy --env preview`,
        env,
      ),
      productionDeployStep: step(
        'Deploy dist/ to the production Worker (only when DEPLOY is "true")',
        `npx --yes wrangler@${WRANGLER_VERSION} deploy --env=""`,
        env,
      ),
      previewTarget: `the preview Worker "${worker}-preview"`,
      productionTarget: `the production Worker "${worker}"`,
      secrets: "secrets CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID",
      text: {
        hostingName: "Cloudflare Workers",
        hostingFile: "`wrangler.jsonc` – nastavení Cloudflare Workers (ostrý web a náhled)",
        hostingFileEn: "Cloudflare Workers Static Assets is configured in `wrangler.jsonc`",
        previewTargetCs: `do Workeru \`${worker}-preview\``,
        previewTargetEn: `the \`${worker}-preview\` Worker`,
        productionTargetEn: `the production Worker \`${worker}\``,
        secretsCs:
          "proměnnou `DEPLOY` = `true` a tajné hodnoty `CLOUDFLARE_API_TOKEN` a `CLOUDFLARE_ACCOUNT_ID`",
        secretsEn:
          "the repository variable `DEPLOY` is `true` and the secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` exist",
        rollbackCs: "nebo na Cloudflare vrátí předchozí verzi Workeru (Deployments → Rollback)",
        setupCs: `Cloudflare: Worker \`${worker}\` pro ostrý web s doménou klienta a \`${worker}-preview\` pro náhled; na GitHubu proměnná \`DEPLOY\` = \`true\` a tajné hodnoty \`CLOUDFLARE_API_TOKEN\` a \`CLOUDFLARE_ACCOUNT_ID\`.`,
        formCs: "",
      },
    };
  }
  const env = { NETLIFY_AUTH_TOKEN: "${{ secrets.NETLIFY_AUTH_TOKEN }}" };
  const site = hosting.siteId;
  const deploy = `npx --yes netlify-cli@${NETLIFY_CLI_VERSION} deploy --no-build --dir dist --site ${site}`;
  return {
    provider: "netlify",
    configFile: { name: "netlify.toml", content: netlifyConfig() },
    previewDeployStep: step(
      `Deploy to the Netlify preview (alias "${NETLIFY_PREVIEW_ALIAS}"; only when DEPLOY is "true")`,
      `${deploy} --alias ${NETLIFY_PREVIEW_ALIAS} --message "Náhled $GITHUB_SHA"`,
      env,
    ),
    productionDeployStep: step(
      'Deploy dist/ to Netlify production (only when DEPLOY is "true")',
      `${deploy} --prod --message "Zveřejněno $GITHUB_SHA"`,
      env,
    ),
    previewTarget: `the Netlify draft deploy "${NETLIFY_PREVIEW_ALIAS}" (https://${NETLIFY_PREVIEW_ALIAS}--<project>.netlify.app)`,
    productionTarget: "Netlify production",
    secrets: "secret NETLIFY_AUTH_TOKEN",
    text: {
      hostingName: "Netlify",
      hostingFile: "`netlify.toml` – nastavení Netlify (Netlify web nikdy nesestavuje sám)",
      hostingFileEn:
        "Netlify is configured in `netlify.toml`, which stops Netlify from building the repository itself",
      previewTargetCs: `na Netlify jako náhled \`https://${NETLIFY_PREVIEW_ALIAS}--<projekt>.netlify.app\``,
      previewTargetEn: `the Netlify draft deploy \`https://${NETLIFY_PREVIEW_ALIAS}--<project>.netlify.app\``,
      productionTargetEn: "Netlify production",
      secretsCs: "proměnnou `DEPLOY` = `true` a tajnou hodnotu `NETLIFY_AUTH_TOKEN`",
      secretsEn: "the repository variable `DEPLOY` is `true` and the secret `NETLIFY_AUTH_TOKEN` exists",
      rollbackCs:
        "nebo na Netlify znovu zveřejní předchozí nasazení (Deploys → vybrané nasazení → Publish deploy)",
      setupCs:
        "Netlify: jeden projekt; ostrý web s doménou klienta, náhled jako nasazení `preview`; na GitHubu proměnná `DEPLOY` = `true` a tajná hodnota `NETLIFY_AUTH_TOKEN`; v Netlify zapnuté Forms → Form detection a e-mailové upozornění na nové zprávy.",
      formCs:
        "Zprávy z kontaktního formuláře přijímá Netlify (Forms). Najdete je v Netlify v sekci Forms; e-mailem chodí na adresy nastavené v upozorněních projektu (form submission notifications).",
    },
  };
}
