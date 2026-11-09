# Zveřejnit změny: promote the CMS branch `content` to `main` (production), but only after the
# production build, including the publication gate, has passed.
#
# Started by the Pages CMS Action "Zveřejnit změny" (workflow_dispatch on the current branch).
# Pages CMS sends one input, `payload` (JSON); it is accepted and not used.
# `main` is only ever fast-forwarded: if it has commits that `content` does not contain, the run
# fails and nothing is overwritten.
name: Zveřejnit změny

on:
  workflow_dispatch:
    inputs:
      payload:
        description: "Data from Pages CMS (not used)"
        required: false
        type: string

permissions:
  contents: read

concurrency:
  group: content-branch
  cancel-in-progress: false

jobs:
  build:
    name: Production build and gate
    if: github.ref == 'refs/heads/content'
    runs-on: ubuntu-latest
    permissions:
      contents: read
    steps:
      - name: Check out the dispatched commit
        uses: actions/checkout@{{checkoutSha}} # {{checkoutVersion}}
        with:
          ref: ${{ github.sha }}
          persist-credentials: false

      - name: Set up Node.js from .nvmrc
        uses: actions/setup-node@{{setupNodeSha}} # {{setupNodeVersion}}
        with:
          node-version-file: .nvmrc
          cache: npm

      - name: Install exact dependencies
        run: npm ci --no-audit --no-fund

      - name: Build in production mode (publication gate)
        run: npm run build
        env:
          SITE_MODE: production

  promote:
    name: Fast-forward main
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

      - name: Fast-forward main to the built commit
        env:
          BUILT_SHA: ${{ github.sha }}
        run: |
          git fetch origin main
          if ! git merge-base --is-ancestor origin/main "$BUILT_SHA"; then
            echo "::error::Větev main obsahuje změny, které nejsou ve větvi content. Nic nebylo zveřejněno; obraťte se na správce webu. (main has commits that content does not contain; refusing to overwrite.)"
            exit 1
          fi
          git push origin "$BUILT_SHA:refs/heads/main"
          echo "Zveřejněno: main = $BUILT_SHA"
