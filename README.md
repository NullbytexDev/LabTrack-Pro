# LabTrack Pro

**Source audit copy — all rights reserved.**

© 2026 LabTrack Pro · FCI. All rights reserved to Nullbytex.

This repository is published **solely so the implementation can be inspected and
audited**. It is not open source, and no licence of any kind is granted. Read
[Restrictions](#restrictions) before doing anything with these files.

## What this is

- The complete front end of LabTrack Pro, the lab management interface used for
  the FCI computer labs: live PC status, issue reporting, repair history, lab
  layouts, messaging and instructor tools.
- Read-only material for review: what the interface does, how it handles member
  data, what it stores in the browser, and what it sends to a server.

## What this is not

- Not a template, starter kit, boilerplate, demo or reference implementation to
  build on.
- Not a distributable release. The absence of a permissive licence is deliberate.
- No backend, database or server code is included; the interface needs an API to
  show live data.

## Running the copy to inspect it

The interface can be started locally so the behaviour described in an audit can
be checked. It requires Node.js 20 or newer.

```bash
npm install
cp .env.example .env.local    # set VITE_API_BASE_URL
npm run dev                    # http://localhost:5173
npm run build                  # confirms the code compiles
npm run lint
```

The only configuration file the front end reads is `.env.local`, which is
ignored by Git and must never be committed.

| Variable | Default | Meaning |
| --- | --- | --- |
| `VITE_API_BASE_URL` | `/api` | Base URL of the API the interface talks to |

## Information the operator has to supply

None of it ships in this repository — there are no keys, access codes, tokens or
credentials of any kind inside these files.

| Where | What is needed | Why |
| --- | --- | --- |
| Front end (`.env.local`) | `VITE_API_BASE_URL` | Where the interface sends its requests |
| Server / API | Accounts for the three roles: student, lab assistant, instructor | The role-specific screens are only reachable with a signed-in account of that role |
| Server / API | The role access codes for registration | Verified by the API, never by the interface |
| Server / API | Transactional mail credentials | Sends report receipts, verification and security emails |
| Server / API | Model provider credentials | Powers the assistant, triage and troubleshooting suggestions |

Without an API the interface still renders, but every screen that lists, reports
or edits lab data stays empty.

## API contract the interface expects

All requests go through one module, `src/api/client.js`. It is plain `fetch`
with a bearer token kept in `localStorage` under `labtrack-token`, which is the
entire client-side state an auditor needs to know about.

| Call | Request |
| --- | --- |
| `api.auth.me()` | `GET /auth/me` |
| `api.auth.updateMe(data)` | `PATCH /auth/me` |
| `api.auth.login(email, password)` | `POST /auth/login` |
| `api.auth.register({ email, password })` | `POST /auth/register` |
| `api.auth.verifyOtp({ email, otpCode })` | `POST /auth/verify-otp` |
| `api.auth.resendOtp(email)` | `POST /auth/resend-otp` |
| `api.auth.resetPasswordRequest(email)` | `POST /auth/reset-password-request` |
| `api.auth.resetPassword({ resetToken, newPassword })` | `POST /auth/reset-password` |
| `api.auth.changePassword(payload)` | `POST /auth/change-password` |
| `api.auth.options()` | `GET /auth/options` |
| `api.auth.loginWithProvider(provider, returnTo)` | redirect to `/auth/oauth/{provider}/start?return_to=…` |
| `api.auth.logout()` | clears the token, then `POST /auth/logout` |
| two-factor calls (`src/lib/authMfaFlow.js`) | `POST /auth/mfa/{verify,resend,totp/setup,totp/verify,sms/send-code,sms/verify,disable,trusted-devices/clear}` |
| `api.entities.X.list / filter / get / count / aggregate` | `GET /entities/X`, `/entities/X/{id}`, `/entities/X/count`, `/entities/X/aggregate` |
| `api.entities.X.create / update / delete / bulkCreate / bulkUpdate / updateMany / deleteMany` | `POST`, `PATCH`, `DELETE` on `/entities/X`, `/bulk`, `/update-many`, `/delete-many` |
| live updates | server-sent events on `/entities/X/stream` |
| `api.functions.invoke(name, payload)` | `POST /functions/{name}` → `{ data }` |
| `api.app.getPublicSettings()` | `GET /public-settings` |

## Where to look

```
src/
  api/client.js        the only network layer
  components/          interface, grouped by area (labs, reports, account, layout, ui…)
  hooks/               data and preference hooks
  lib/                 auth context, formatting, helpers, two-factor flows
  pages/               one file per route
  index.css            design tokens and page textures
```

Routes are declared in `src/App.jsx`.

## Privacy findings for the audit

No analytics, pixels, session recorders or third-party trackers are included.
The "Send Usage Statistics" switch stores the member's preference locally and
nothing else: `trackEvent()` in `src/lib/tracking.js` sends no request. The
bearer token described above is the only credential kept in the browser.

## Restrictions

No licence, express or implied, is granted. In particular, you may **not**:

- copy, reproduce, republish or redistribute these files, in whole or in part;
- clone, fork or mirror the repository for anything other than private,
  read-only review;
- modify, translate or create derivative works from the code;
- reuse the interface, layouts, artwork, animations, wording or design system to
  build or restyle another product, template, client project or competing tool;
- use any part of it commercially or in deliverables for a client.

Automated scraping, bulk extraction or use of this code as training data is not
permitted. Quoting short excerpts inside a written security or quality audit is
allowed; anything beyond that needs written permission from Nullbytex.

© 2026 LabTrack Pro · FCI. All rights reserved to Nullbytex and Tanbihul Asrar.
