# Zahodit nepublikované změny: reset the CMS branch `content` to `main` (the published state).
#
# Started by the Pages CMS Action "Zahodit nepublikované změny" (workflow_dispatch on `content`).
# Every change saved in the CMS since the last publish is removed from `content`. The commits stay
# reachable in GitHub for about 90 days through the run log below (old and new commit ids).
# The push is refused if `content` moved after the Action was started (force-with-lease).
name: Zahodit nepublikované změny

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
  discard:
    name: Reset content to main
    if: github.ref == 'refs/heads/content'
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - name: Check out the full history
        uses: actions/checkout@{{checkoutSha}} # {{checkoutVersion}}
        with:
          ref: ${{ github.sha }}
          fetch-depth: 0

      - name: Reset content to main
        env:
          DISPATCHED_SHA: ${{ github.sha }}
        run: |
          git fetch origin main
          MAIN_SHA="$(git rev-parse origin/main)"
          echo "content byl / was: $DISPATCHED_SHA"
          echo "content bude / becomes: $MAIN_SHA (main)"
          if [ "$MAIN_SHA" = "$DISPATCHED_SHA" ]; then
            echo "Žádné nepublikované změny. / Nothing to discard."
            exit 0
          fi
          git push --force-with-lease="refs/heads/content:$DISPATCHED_SHA" origin "$MAIN_SHA:refs/heads/content"
