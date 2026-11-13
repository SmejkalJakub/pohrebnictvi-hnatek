<!doctype html>
<html lang="cs">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex, nofollow" />
    <meta name="referrer" content="same-origin" />
    <title>Správa obsahu – {{brandName}}</title>
    <link href="/admin/config.yml" type="text/yaml" rel="cms-config-url" />
    <style>
      .admin-notice {
        max-width: 36rem;
        margin: 4rem auto;
        padding: 1.5rem 1.75rem;
        border: 1px solid #c9c4b8;
        border-radius: 8px;
        background: #fbfaf7;
        color: #1f2a24;
        font: 16px/1.55 system-ui, -apple-system, "Segoe UI", sans-serif;
      }
      .admin-notice h1 {
        margin: 0 0 0.75rem;
        font-size: 1.25rem;
      }
      .admin-notice code {
        font-size: 0.9em;
      }
      .admin-publish-button {
        display: inline-flex;
        align-items: center;
        margin-right: 12px;
        padding: 0 16px;
        height: 36px;
        border-radius: 5px;
        background: #2f6b4b;
        color: #fff;
        font: 600 14px/1 system-ui, -apple-system, "Segoe UI", sans-serif;
        text-decoration: none;
        white-space: nowrap;
      }
      .admin-publish-button:hover,
      .admin-publish-button:focus-visible {
        background: #24553b;
        color: #fff;
      }
      .admin-publish-button-fallback {
        position: fixed;
        left: 16px;
        bottom: 16px;
        z-index: 10000;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
      }
      .admin-publish-status {
        position: fixed;
        right: 1rem;
        bottom: 1rem;
        z-index: 10000;
        max-width: 26rem;
        padding: 1rem 1.25rem;
        border: 1px solid #3d6b52;
        border-radius: 8px;
        background: #f1f7f3;
        color: #1f2a24;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        font: 15px/1.5 system-ui, -apple-system, "Segoe UI", sans-serif;
      }
      .admin-publish-status strong {
        display: block;
        margin-bottom: 0.25rem;
      }
      .admin-publish-status button {
        margin-top: 0.5rem;
        padding: 0.25rem 0.75rem;
        border: 1px solid #3d6b52;
        border-radius: 4px;
        background: #fff;
        color: inherit;
        font: inherit;
        cursor: pointer;
      }
    </style>
  </head>
  <body>
    <noscript>
      <div class="admin-notice">
        <h1>Správa obsahu</h1>
        <p>Správa obsahu potřebuje zapnutý JavaScript.</p>
      </div>
    </noscript>
    <div class="admin-notice" id="admin-notice" role="alert" hidden>
      <h1>Správa obsahu zatím není připojená</h1>
      <p id="admin-notice-text"></p>
      <p>Obraťte se prosím na správce webu.</p>
    </div>
    <div class="admin-publish-status" id="admin-publish-status" role="status" hidden>
      <strong>Zveřejnění spuštěno</strong>
      Web se teď kontroluje a nasazuje. Asi za 2 minuty obnovte ostrý web a změny zkontrolujte. Když se
      neobjeví, kontrola zveřejnění zastavila a ostrý web zůstal beze změny; obraťte se na správce webu.
      <br />
      <button type="button" id="admin-publish-status-close">Zavřít</button>
    </div>
    <!-- Decap CMS {{decapVersion}}, self-hosted and pinned (docs/cms/architecture.md). -->
    <script>
      window.CMS_MANUAL_INIT = true;
    </script>
    <script src="/admin/{{decapDir}}/decap-cms.js" integrity="{{decapIntegrity}}"></script>
    <script>
      (function () {
        var PLACEHOLDER = "{{placeholder}}";
        // Saving this collection's entry commits the publish request, which starts publish.yml.
        var PUBLISH_COLLECTION = "{{publishCollection}}";
        var local = ["localhost", "127.0.0.1", "[::1]"].indexOf(window.location.hostname) !== -1;

        function notice(text) {
          document.getElementById("admin-notice-text").textContent = text;
          document.getElementById("admin-notice").hidden = false;
        }

        if (window.location.pathname === "/admin") {
          window.location.replace("/admin/" + window.location.hash);
          return;
        }
        if (typeof window.CMS === "undefined") {
          notice("Editor se nepodařilo načíst (soubor decap-cms.js chybí nebo nesouhlasí jeho kontrolní součet).");
          return;
        }

        // Decap calls a save "Publikovat", but a save only reaches the preview (branch `content`).
        // Production changes only after the separate, checked publication step, so say "save".
        var WORDING = {
          publish: "Uložit do náhledu",
          publishNow: "Uložit do náhledu",
          publishing: "Ukládání do náhledu…",
          published: "Uloženo v náhledu",
          publishAndCreateNew: "Uložit a vytvořit další",
          publishAndDuplicate: "Uložit a duplikovat",
          deletePublishedEntry: "Smazat položku",
          onPublishing: "Uložit změny do náhledu webu?",
          onDeletePublishedEntry:
            "Opravdu chcete tuto položku smazat? Smazání se projeví v náhledu; ostrý web se změní až po zveřejnění.",
          entryPublished: "Uloženo do náhledu. Na ostrý web se změny dostanou po zveřejnění (tlačítko Zveřejnit změny nahoře).",
          onFailToPublishEntry: "Uložení se nezdařilo: %{details}",
        };
        function reword(phrases) {
          Object.keys(phrases).forEach(function (key) {
            var value = phrases[key];
            if (typeof value === "string" && Object.prototype.hasOwnProperty.call(WORDING, key)) {
              phrases[key] = WORDING[key];
            } else if (value !== null && typeof value === "object") {
              reword(value);
            }
          });
          return phrases;
        }
        var czech = window.CMS.getLocale("cs");
        if (czech) {
          window.CMS.registerLocale("cs", reword(JSON.parse(JSON.stringify(czech))));
        }

        // Image rights belong to one file. Decap keeps every other key of an image when the photo is
        // replaced, so a new photo would inherit "Mám právo tuto fotografii použít". On save, record
        // which file a confirmation is for, and clear a confirmation that belongs to a different file.
        // The publication gate (G-033) applies the same rule, so this is a convenience, not the guard.
        function baseName(value) {
          var parts = String(value).replace(/\\/g, "/").split("/");
          var name = "";
          parts.forEach(function (part) {
            if (part !== "") {
              name = part;
            }
          });
          return name;
        }
        function collectImages(value, path, found) {
          if (Array.isArray(value)) {
            value.forEach(function (item, index) {
              collectImages(item, path.concat(index), found);
            });
            return;
          }
          if (value === null || typeof value !== "object") {
            return;
          }
          if (typeof value.file === "string" && Object.prototype.hasOwnProperty.call(value, "rightsConfirmed")) {
            found.push({ path: path, image: value });
          }
          Object.keys(value).forEach(function (key) {
            collectImages(value[key], path.concat(key), found);
          });
        }
        window.CMS.registerEventListener({
          name: "preSave",
          handler: function (event) {
            var data = event.entry.get("data");
            var found = [];
            collectImages(data.toJS(), [], found);
            found.forEach(function (item) {
              var file = baseName(item.image.file);
              var confirmedFor = item.image.rightsConfirmedFor ? baseName(item.image.rightsConfirmedFor) : "";
              if (item.image.rightsConfirmed === true && file !== "") {
                if (confirmedFor === "") {
                  data = data.setIn(item.path.concat("rightsConfirmedFor"), file);
                } else if (confirmedFor !== file) {
                  data = data
                    .setIn(item.path.concat("rightsConfirmed"), false)
                    .setIn(item.path.concat("rightsConfirmedFor"), null);
                }
              } else if (confirmedFor !== "") {
                data = data.setIn(item.path.concat("rightsConfirmedFor"), null);
              }
            });
            if (event.entry.get("collection") === PUBLISH_COLLECTION) {
              data = data.set("requestedAt", new Date().toISOString());
            }
            return data;
          },
        });

        // A "Zveřejnit změny" button in Decap's top bar on every list screen, and on the publish form
        // the save button reads "Zveřejnit na ostrém webu". Decap has no API for either, so a
        // MutationObserver adds the link and renames text nodes. It relies on the Emotion class labels
        // of the pinned Decap 3.17.3 (AppHeaderActions, PublishButton); when Decap is upgraded, check
        // both. Without the header slot the button is shown at the bottom left instead.
        var PUBLISH_HASH = "#/collections/" + PUBLISH_COLLECTION + "/entries/request";
        var PUBLISH_TEXT = {
          "Uložit do náhledu": "Zveřejnit na ostrém webu",
          "Ukládání do náhledu…": "Spouštím zveřejnění…",
          // Shown while the note is unchanged: Decap enables saving only after an edit.
          "Uloženo v náhledu": "Nejdřív napište, co se mění",
          "Uloženo do náhledu. Na ostrý web se změny dostanou po zveřejnění (tlačítko Zveřejnit změny nahoře).":
            "Zveřejnění spuštěno.",
        };
        function onPublishForm() {
          return window.location.hash.indexOf(PUBLISH_HASH) === 0;
        }
        function publishButton(className) {
          var link = document.createElement("a");
          link.id = "admin-publish-button";
          link.className = className;
          link.href = PUBLISH_HASH;
          link.textContent = "Zveřejnit změny";
          return link;
        }
        function placePublishButton() {
          var header = document.querySelector("header");
          var existing = document.getElementById("admin-publish-button");
          if (header === null) {
            if (existing !== null) {
              existing.remove();
            }
            return;
          }
          var actions = header.querySelector('[class*="AppHeaderActions"]');
          if (actions !== null) {
            if (existing === null || existing.parentNode !== actions) {
              if (existing !== null) {
                existing.remove();
              }
              actions.insertBefore(publishButton("admin-publish-button"), actions.firstChild);
            }
            return;
          }
          if (existing === null) {
            document.body.appendChild(publishButton("admin-publish-button admin-publish-button-fallback"));
          }
        }
        function renamePublishTexts() {
          if (!onPublishForm()) {
            return;
          }
          var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
          var node = walker.nextNode();
          while (node !== null) {
            var text = node.nodeValue.trim();
            if (Object.prototype.hasOwnProperty.call(PUBLISH_TEXT, text)) {
              node.nodeValue = PUBLISH_TEXT[text];
            }
            node = walker.nextNode();
          }
        }
        var pending = false;
        new MutationObserver(function () {
          if (pending) {
            return;
          }
          pending = true;
          window.requestAnimationFrame(function () {
            pending = false;
            placePublishButton();
            renamePublishTexts();
          });
        }).observe(document.body, { childList: true, subtree: true, characterData: true });

        // After the publish request is saved, say that publishing started (Decap's own toast only says "saved").
        var publishStatus = document.getElementById("admin-publish-status");
        document.getElementById("admin-publish-status-close").addEventListener("click", function () {
          publishStatus.hidden = true;
        });
        window.CMS.registerEventListener({
          name: "postSave",
          handler: function (event) {
            if (event.entry.get("collection") === PUBLISH_COLLECTION) {
              publishStatus.hidden = false;
            }
          },
        });
        fetch("/admin/config.yml", { cache: "no-store" })
          .then(function (response) {
            if (!response.ok) {
              throw new Error("config.yml: HTTP " + response.status);
            }
            return response.text();
          })
          .then(function (text) {
            // Unfilled repository or DecapBridge site: say so instead of showing a login that cannot work.
            // On localhost the agency tests against `npx decap-server` (local_backend), so the check is skipped.
            if (!local && text.indexOf(PLACEHOLDER) !== -1) {
              notice(
                "V nastavení editoru chybí údaje o úložišti obsahu nebo o přihlašování (hodnota " +
                  PLACEHOLDER +
                  " v /admin/config.yml). Web je potřeba znovu exportovat s vyplněným souborem publishing.json.",
              );
              return;
            }
            window.CMS.init();
          })
          .catch(function (error) {
            notice("Nastavení editoru se nepodařilo načíst (" + error.message + ").");
          });
      })();
    </script>
  </body>
</html>
