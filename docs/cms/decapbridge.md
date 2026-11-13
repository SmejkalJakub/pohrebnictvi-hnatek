# DecapBridge

DecapBridge (<https://decapbridge.com>) gives Decap CMS a login for people without a GitHub account and relays their edits to GitHub. It replaces the deprecated Netlify Identity + Git Gateway.

Sources, read 2026-11-12: the docs at <https://decapbridge.com/docs/getting-started> and `/docs/architecture`, the pricing on the home page, and the public source of its dashboard (`github.com/decapbridge/decapbridge-web`) and gateway (`github.com/decapbridge/decapbridge-gateway`). **Nothing here has been tried against the hosted service yet** (no site registered).

## 1. How it works

| Part | Host | Role |
| --- | --- | --- |
| Auth API | `auth.decapbridge.com` | user accounts, invitations, sessions; issues the token the editor's browser holds |
| Git gateway | `gateway.decapbridge.com` | a fork of Netlify's git-gateway: checks the browser's token, then calls the GitHub API with the repository token stored for the site |
| Dashboard | `decapbridge.com` | register sites, store the GitHub token, invite editors |

The browser never receives the GitHub token: the gateway adds `Authorization: Bearer <stored token>` to each proxied request (gateway source, `api/github.go`, `director()`).

## 2. What it needs from GitHub

From the docs: a personal access token, fine-grained or classic; "the token needs read and write access to the repository's Contents, and if using the Editorial Workflow, Pull requests as well". We do not use the editorial workflow, so: **fine-grained, one repository, Contents read and write, nothing else**. In particular no *Workflows* permission: that is what keeps `.github/workflows/` (and the integrity manifest in them) out of reach of the CMS ([security.md](security.md) §3).

The docs do not say how the token is stored. It is entered in the dashboard and used by the gateway server-side.

## 3. Config shape

The dashboard generates the `backend:` block. From its source (`src/pages/dashboard/sites/edit/InstallConfig/useCmsYamlConfig.ts`), with our branch:

**Classic** (e-mail and password inside the Decap login; our default):

```yaml
backend:
  name: git-gateway
  repo: <owner>/<id>-web
  branch: content
  identity_url: https://auth.decapbridge.com/sites/<site-id>
  gateway_url: https://gateway.decapbridge.com
```

**PKCE** (DecapBridge's login page, adds Google and Microsoft; needs Decap > 3.8.3, we pin 3.17.3):

```yaml
backend:
  name: git-gateway
  repo: <owner>/<id>-web
  branch: content
  auth_type: pkce
  base_url: https://auth.decapbridge.com
  auth_endpoint: /sites/<site-id>/pkce
  auth_token_endpoint: /sites/<site-id>/token
  gateway_url: https://gateway.decapbridge.com
```

The hostnames come from the architecture page; the source has them as build-time settings. `tools/cms/decap-config.ts` → `decapBackend()` produces exactly these blocks from `publishing.json`. **Check against the dashboard when the first site is registered** ([setup.md](setup.md) §4.5).

No script besides Decap is needed in `admin/index.html` (no Netlify Identity widget).

## 4. What it does not restrict

The gateway allows these GitHub API paths for the repository, for any logged-in editor of the site: `git`, `contents`, `pulls`, `branches`, `merges`, `statuses`, `compare`, `commits`, `issues/<n>/labels` (gateway source, `allowedRegexp`). It does **not** restrict branches or file paths. An editor's session, or a bug or breach at DecapBridge, can therefore write any file on any branch of the client repository, within what the token allows. See [security.md](security.md) for what stops that from reaching production.

## 5. Plans (home page, 2026-11-12)

| Plan | Price | Limits |
| --- | --- | --- |
| Free | $0 | 3 sites, 10 collaborators per site |
| Professional | $9/month | unlimited sites and collaborators, admin role, branded login and e-mails, support |
| Lifetime Pro | $199 once | as Professional, plus a self-hosting commercial licence |

Both Hnátek variants fit the free plan (2 sites). More than three live clients need Professional, or self-hosting (the source is available; not evaluated).

## 6. Roles

Invitees join as collaborators (edit content). The owner of the DecapBridge site (the agency) manages users and settings; the admin role (delegating user management) is a paid feature. Ownership can be transferred to an existing collaborator, which is how a client can take the site over.
