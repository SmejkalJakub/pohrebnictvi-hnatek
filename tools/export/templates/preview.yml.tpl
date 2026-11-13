# Náhled webu: build every CMS save on branch `content` as the noindex preview site.
#
# Runs on each push to `content` (every save in the CMS is a commit there).
#   1. Integrity: every file outside the CMS content must equal the exported file
#      (docs/cms/security.md §3), so the build runs only code the agency shipped.
#   2. Exact install and a prototype build (banner, noindex, robots.txt disallows all).
#   3. The production rules are listed in the log ("what still blocks publishing"), without failing.
#   4. Deploy to {{previewTarget}}, only when the repository variable DEPLOY is "true"
#      ({{deploySecrets}}).
# A save never changes the live site; that is publish.yml.
name: Náhled webu

on:
  push:
    branches: [content]
  workflow_dispatch:

permissions:
  contents: read

concurrency:
  group: preview
  cancel-in-progress: true

jobs:
  preview:
    name: Integrity check, preview build and deploy
    if: github.ref == 'refs/heads/content'
    runs-on: ubuntu-latest
    permissions:
      contents: read
    steps:
      - name: Check out the pushed commit
        uses: actions/checkout@{{checkoutSha}} # {{checkoutVersion}}
        with:
          ref: ${{ github.sha }}
          persist-credentials: false

{{integrityStep}}

      - name: Set up Node.js from .nvmrc
        uses: actions/setup-node@{{setupNodeSha}} # {{setupNodeVersion}}
        with:
          node-version-file: .nvmrc
          cache: npm

      - name: Install exact dependencies
        run: npm ci --no-audit --no-fund

      - name: Build the preview (prototype mode, noindex)
        run: npm run build
        env:
          SITE_MODE: prototype

      - name: What still blocks publishing (production rules, informational)
        run: npm run validate -- --mode production || echo "::notice::Ostrý web zatím nelze zveřejnit; důvody jsou výše. (Production gate has errors; see above.)"

{{previewDeployStep}}
