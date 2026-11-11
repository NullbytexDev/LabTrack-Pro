# LabTrack Pro

LabTrack Pro is a lab management workspace for the computer labs of FCI. It lets
instructors, lab assistants and students track the state of every PC, report
faults, follow repair work and keep an accurate maintenance history.

## This repository is for review only

This is a **frontend source snapshot published for inspection and review**.

- The server side is **not included**: no API handlers, no database schema, no
  scheduled jobs and no connection details live here. The browser talks to a
  separate service through `src/api/apiClient.js`, and that service is
  deliberately absent from this tree.
- No licence is granted and none may be inferred. See [LICENSE](LICENSE).
  Copyright (c) 2026 Nullbytex. All rights reserved. Do not copy, modify,
  share or deploy any part of this code.
- The application in production is operated by its owners; this tree is not a
  runnable deployment and is not distributed as open source.

## Stack

React 18 with Vite, Tailwind CSS and shadcn/ui primitives, React Router, React
Query, Recharts and lucide icons.

## Layout

```
src/
  api/          browser client and the read adapter used by the pages
  components/   UI grouped by area (labs, reports, account, inbox, pulse, ...)
  hooks/        shared data and session hooks
  lib/          helpers: auth context, formatting, tracking, policy
  pages/        one file per route
  index.css     design tokens, textures and shared classes
public/         static assets, security headers, manifest
```

## Running it locally

Fill in the values documented in the environment template at the root of the
repository, then:

```bash
npm install
npm run dev
```

Without an API service the interface renders but no data or sign-in works; that
is expected for this snapshot.

| Script | Purpose |
| --- | --- |
| `npm run dev` | Local development server |
| `npm run build` | Production bundle in `dist/` |
| `npm run preview` | Preview the production bundle |
| `npm run lint` | ESLint |

## Credits

Built by Nullbytex and Tanbihul Asrar.

© 2026 LabTrack Pro · FCI · All rights reserved.
