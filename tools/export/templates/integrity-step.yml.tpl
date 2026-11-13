      # Only content may differ from the export (docs/cms/security.md §3). The hashes below were
      # written by the agency's export; this file cannot be changed with the CMS token.
      - name: Check that only content changed since the export
        shell: bash
        run: |
          set -euo pipefail
          cat > "$RUNNER_TEMP/trusted.sha256" <<'TRUSTED'
          {{trustedManifest}}
          TRUSTED
          CMS_WRITABLE='{{cmsWritablePattern}}'
          git -c core.quotepath=off ls-files | { grep -v -i -E "$CMS_WRITABLE" || true; } | LC_ALL=C sort > "$RUNNER_TEMP/locked.txt"
          cut -c 67- "$RUNNER_TEMP/trusted.sha256" | LC_ALL=C sort > "$RUNNER_TEMP/expected.txt"
          if ! diff "$RUNNER_TEMP/expected.txt" "$RUNNER_TEMP/locked.txt" > "$RUNNER_TEMP/files.diff"; then
            echo "::error::Mimo obsah webu přibyly nebo zmizely soubory. Nic se nesestaví ani nezveřejní; obraťte se na správce webu. (Files outside the CMS content were added or removed since the export.)"
            cat "$RUNNER_TEMP/files.diff"
            exit 1
          fi
          if ! sha256sum --check --strict --quiet "$RUNNER_TEMP/trusted.sha256"; then
            echo "::error::Mimo obsah webu se změnily soubory (šablona, kód nebo nastavení). Nic se nesestaví ani nezveřejní; obraťte se na správce webu. (Files outside the CMS content differ from the export.)"
            exit 1
          fi
          echo "Integrity OK: $(wc -l < "$RUNNER_TEMP/expected.txt") locked files match the export."
