# Zveřejnit změny: publish the CMS branch `content` (preview) to production.
#
# Started in two ways:
#   - by an editor: saving the entry "Zveřejnit změny" in /admin/ commits {{publishRequestFile}}
#     to `content`, and a push that changes that file starts this workflow. The DecapBridge token needs
#     no Actions permission for this; it only writes content, like any other save.
#   - by the agency: Actions → "Zveřejnit změny" → Run workflow on branch `content`, or
#     `gh workflow run publish.yml --ref content`.
#
#   1. Integrity: every file outside the CMS content must equal the exported file, so the build
#      runs only code the agency shipped (docs/cms/security.md §3).
#   2. Exact install and a build with the publication gate, in production mode unless the repository
#      variable PUBLISH_MODE is "prototype" (trial run: the result is a noindex test site).
#   3. Deploy dist/ to {{productionTarget}}, only when the repository variable DEPLOY is "true"
#      ({{deploySecrets}}). Off by default.
#   4. Fast-forward `main` to the published commit: `main` is the record of what is live.
# If any step fails, nothing is deployed, `main` is unchanged and the live site stays as it was.
name: Zveřejnit změny

on:
  push:
    branches: [content]
    paths:
      - "{{publishRequestFile}}"
  workflow_dispatch:

permissions:
  contents: read

concurrency:
  group: content-branch
  cancel-in-progress: false

jobs:
  build:
    name: Integrity check, gated build and deploy
    if: github.ref == 'refs/heads/content'
    runs-on: ubuntu-latest
    permissions:
      contents: read
    steps:
      - name: Check out the commit to publish
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

      - name: Build with the publication gate (PUBLISH_MODE, default production)
        run: npm run build
        env:
          SITE_MODE: ${{ vars.PUBLISH_MODE || 'production' }}

{{productionDeployStep}}

  promote:
    name: Record the release on main (fast-forward)
    needs: build
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - name: Check out the full history
        uses: actions/checkout@{{checkoutSha}} # {{checkoutVersion}}
        with:
          ref: ${{ github.sha }}
          fetch-depth: 0

      - name: Fast-forward main to the published commit
        env:
          BUILT_SHA: ${{ github.sha }}
        run: |
          git fetch origin main
          if ! git merge-base --is-ancestor origin/main "$BUILT_SHA"; then
            echo "::error::Větev main obsahuje změny, které nejsou ve větvi content. Nic nebylo zaznamenáno; obraťte se na správce webu. (main has commits that content does not contain; refusing to overwrite.)"
            exit 1
          fi
          git push origin "$BUILT_SHA:refs/heads/main"
          echo "Zveřejněno: main = $BUILT_SHA"
