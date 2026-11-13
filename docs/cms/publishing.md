# Preview, publish, discard, roll back

Related: [security.md](security.md) · [setup.md](setup.md) · [../content-contract.md](../content-contract.md) §8 (gate)

## 1. The flow

```
editor at /admin/ ── "Uložit do náhledu" ──► commit on branch content
                                                 │ push
                                                 ▼
                              preview.yml: integrity check → npm ci → prototype build
                                           → (log) what still blocks production
                                           → deploy preview            [if DEPLOY]
                                             Netlify: draft deploy https://preview--<project>.netlify.app
                                             Cloudflare: Worker <name>-preview
editor at /admin/ ── saves "Zveřejnit změny" ──► commit of src/content/publish/request.json on content
                                                 │ push changing that file (also runs preview.yml)
agency ── gh workflow run publish.yml --ref content
                                                 ▼
                              publish.yml: integrity check → npm ci → production build + gate
                                           → deploy production         [if DEPLOY]
                                             Netlify: netlify deploy --prod · Cloudflare: Worker <name>
                                           → fast-forward main (record of what is live)
                              any failure: nothing deployed, main unchanged, live site unchanged
```

Decap's editorial workflow (a branch and pull request per entry, statuses Draft / In review / Ready) is **not** used. It does not match the shared `content` branch, needs the *Pull requests* permission on the token, and would let an editor merge into the branch that is published. Simple mode commits every save to `content`.

## 2. Who can publish

**Editors, from the editor.** The last menu entry is "Zveřejnit změny" (`src/content/publish/request.json`, fields `note` "Co se zveřejňuje", required, and a hidden `requestedAt`). Saving it is an ordinary content commit on `content`; `publish.yml` runs on every push to `content` that changes that file (`on.push.paths`). So:

- the DecapBridge token keeps only *Contents: write*; no Actions permission, no server of ours, no secret in the browser;
- the admin page adds a green **Zveřejnit změny** button to Decap's top bar (it opens this entry; the entry is also the last menu item), renames the save button on this entry to "Zveřejnit na ostrém webu" (and the unchanged state to "Nejdřív napište, co se mění": Decap enables saving only after an edit, so each publish needs a new note), sets `requestedAt` on save and shows "Zveřejnění spuštěno" afterwards. Decap has no API for buttons or per-entry labels, so a MutationObserver does this, relying on the class labels `AppHeaderActions` and the toolbar texts of the pinned Decap 3.17.3; check it when upgrading Decap. The commit message names the editor ("Obsah: upraveno … – <name> (Decap CMS)");
- it publishes the whole `content` branch as it is at that commit, not only the last edit;
- the request file lives in `src/content/publish/`, which no Astro collection, gate rule or other menu entry reads, and it matches the CMS-writable pattern, so the integrity check accepts it. It does not exist until the first save (Decap creates it);
- the editor does not see whether the run passed. The admin message says to check the live site after about 2 minutes and to call the agency if nothing changed. GitHub e-mails a failed run to the account that owns the token in DecapBridge (by default).

**The agency**, as before: Actions → "Zveřejnit změny" → Run workflow → branch `content`, or

```
gh workflow run publish.yml --repo <owner>/<id>-web --ref content
```

Earlier versions allowed only the agency to publish ("hotovo" → agency publishes). Editor publishing removes that human review; the integrity check and the production gate still run on every publish ([security.md](security.md) §4).

## 3. What publish checks

1. **Integrity:** every tracked file outside the content allowlist must equal the exported file (SHA-256 list embedded in the workflow), and no file may be added or removed outside it ([security.md](security.md) §3).
2. **Production build with the gate:** `SITE_MODE=production npm run build`, unless the repository variable `PUBLISH_MODE` is `prototype` (trial run). The gate rejects demo prices, placeholder copy and images, unconfirmed image rights (including a confirmation recorded for another file), missing required facts, unreviewed guidance, unsafe Markdown, invalid links, features the template does not support and the placeholder domain. Czech messages with file and field are in the run log.
3. **Deploy**, then **fast-forward `main`**. The fast-forward refuses if `main` has commits `content` lacks.

## 4. Discard

`gh workflow run discard.yml --ref content` resets `content` to `main`: every saved but unpublished change disappears from the editor and, after the next preview run, from the preview. The run log prints the old commit id; the commits stay reachable in GitHub for about 90 days. The push uses `--force-with-lease`, so a save that lands while the run starts is not lost silently (the run fails instead).

## 5. Roll back

| Situation | Action |
| --- | --- |
| Wrong text saved, not published | fix forward in the editor, or discard (§4) |
| Wrong text published | fix forward and publish again; or revert the commit on `content` in GitHub and publish |
| A deploy broke the site | Netlify → Deploys → the previous production deploy → **Publish deploy** (instant; do not pick a `preview` draft, which is a prototype build). Cloudflare → Workers → `<worker>` → Deployments → Rollback. Then fix and publish |
| Publish failed | nothing to roll back: the live site and `main` are unchanged; read the run log |

## 6. Approvals after handover

The launch check (`check:launch`, L-001 to L-008) is a one-time check before go-live against the agency's provenance ledger. It does not approve future edits. After handover:

| Change in the editor | What renews approval |
| --- | --- |
| Price amount | Nothing is approved automatically: a new item starts as "Ukázková – nezveřejňovat" and the gate blocks publication until the editor sets "Schválená skutečná cena". Editing an already approved price keeps it approved: the client approves their own prices (editable-fields §4.9). Editors publish themselves, so the agency sees price changes only afterwards, in the commits on `main` |
| Guidance text | The hint asks the editor to re-enter `review.reviewedBy` and `reviewedAt`. Not enforced: the gate only requires a review date (G-040) and warns when it is older than 12 months (G-041). Enforcing "review newer than the last text change" is a possible follow-up |
| Photo replaced | The editor clears the rights confirmation on save; G-033 rejects a confirmation recorded for another file. The editor must confirm again |
| Photo added | `rightsConfirmed` has no default; the gate blocks it until confirmed |
| New staff member, notice | Consent records stay agency-only (G-074, G-070) |

Editors publish themselves, so no human at the agency sees a change set before it goes live; only the gate does. To review afterwards: the commits on `main` since the previous publish (each publish run's log names the published commit). To return to agency-only publishing, remove the `push` trigger from `publish.yml` and the "Zveřejnit změny" entry (a generator change and re-export).

## 7. Updating code or settings after handover (re-export)

A new template version, a change to `site.config.ts` or `publishing.json`, or a new CMS field means a new export. CMS edits live only in the client repository, so the new export must not overwrite content:

```
npm run client:export -- <id> --out /tmp/<id>-export --force
cd ../<id>-web && git switch content && git pull
rsync -a --delete --exclude .git --exclude src/content --exclude src/assets/media --exclude src/assets/documents /tmp/<id>-export/ ./
git add -A && git commit -m "Export <date>" && git push origin content
```

The new workflows carry the new integrity manifest, so the next preview and publish runs check against the new export. Publish as usual; `main` fast-forwards. Content added in the agency repository after handover (`clients/<id>/src/content`) is **not** carried over this way; copy single files by hand if needed.
