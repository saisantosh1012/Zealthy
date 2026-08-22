# Meridian Health — mini-EMR & Patient Portal

A small EMR admin tool and a matching patient-facing portal, built with Next.js
14 (App Router, JavaScript). Two themed experiences share one data store:

- **`/admin`** — staff view. No auth (as specced). Patient roster, patient
  detail with full CRUD on appointments and prescriptions, and a "new patient"
  form (CRU on patient records, including setting their portal password).
- **`/`** — patient portal. Email/password login, a dashboard summarizing
  what's due in the next 7 days, and full drill-down pages for appointments
  and prescriptions (occurrences projected out 3 months).

## Stack

- **Next.js 14** App Router, plain JavaScript, no UI framework — hand-rolled
  CSS (`app/globals.css`) using a sage-green "admin" theme and a blue
  "portal" theme, Fraunces for display type, IBM Plex Sans for body text, and
  IBM Plex Mono for dosages/dates/times.
- **Data layer** (`lib/store.js`): a tiny JSON-document "database" seeded from
  `lib/seed.js` (same shape as the exercise's sample JSON, with medications/
  dosages pulled from the provided list). Reads/writes go through
  `getDB()` / `mutateDB()` so every API route works with the same document.
  - Locally, and on any host with a writable filesystem, it persists to
    `data/db.local.json`.
  - On Netlify, it automatically switches to
    [Netlify Blobs](https://docs.netlify.com/blobs/overview/) instead
    (see **Deploying** below), since serverless functions don't have a
    persistent filesystem.
- **Recurring items** (`lib/occurrences.js`): expands an appointment's or
  prescription's `repeat` schedule (`weekly` / `monthly` / `none`) into
  concrete occurrences within a date window, with a hard iteration cap so a
  bad record can't loop forever. Used for the portal's "next 7 days" summary
  and its "next 3 months" full schedule.

## Running locally

```bash
npm install
npm run dev
```

Open http://localhost:3000 for the patient portal, or http://localhost:3000/admin
for the EMR. The database seeds itself on first read — no migration step.

**Sample logins** (from the exercise's sample data):

| Email | Password |
|---|---|
| mark@some-email-provider.net | Password123! |
| lisa@some-email-provider.net | Password123! |

Any patient created via `/admin/patients/new` can log in immediately with the
email/password set on that form.

To reset the data back to the seed, stop the dev server and delete
`data/db.local.json`.

## Project layout

```
app/
  admin/                  # staff-facing EMR (green theme)
    page.js               # patient roster table
    patients/[id]/page.js # patient detail: edit info, CRUD appts + rx
    patients/new/page.js  # create patient (incl. portal password)
  portal/                 # patient-facing portal (blue theme)
    page.js               # dashboard: next-7-days summary + patient info
    appointments/page.js  # full upcoming schedule (3 months out)
    prescriptions/page.js # full prescription list + refill schedule
  page.js                 # login form, root "/"
  api/                    # REST-ish JSON routes backing both UIs
lib/
  store.js                # get/save/mutate the JSON "database"
  seed.js                 # seed data (medications/dosages from the spec)
  occurrences.js          # recurrence expansion for appointments/refills
  auth.js                 # session cookie helpers
data/
  db.local.json           # local persistence file (gitignored, auto-created)
```

## API

All routes live under `/api` and return/accept JSON.

- `POST /api/login`, `POST /api/logout`, `GET /api/session`
- `GET /api/patients`, `POST /api/patients`
- `GET /api/patients/:id`, `PUT /api/patients/:id` (patients are **CRU**
  only, per the spec — no delete)
- `POST /api/appointments`, `PUT /api/appointments/:id`,
  `DELETE /api/appointments/:id`
- `POST /api/prescriptions`, `PUT /api/prescriptions/:id`,
  `DELETE /api/prescriptions/:id`
- `GET /api/meta` — the medication/dosage option lists used to populate the
  prescription form

To end a recurring appointment, `PUT` it with `{ "repeat": "none" }` (the
admin UI's "End series" button does exactly this) — the row stays for
history but stops generating future occurrences.

## Deploying

**Netlify (recommended — persistence works out of the box):**

1. Push this repo to GitHub.
2. In Netlify, "Add new site" → "Import an existing project" → pick the repo.
   The build command and publish directory are already set in
   `netlify.toml`, and `@netlify/plugin-nextjs` is in `devDependencies`.
3. Deploy. Netlify Blobs requires no extra configuration — it's available
   automatically inside Netlify Functions, which is what `lib/store.js`
   detects and uses at runtime.

**Vercel (or any other host):**

The app runs fine, but Vercel's serverless functions have an ephemeral
filesystem, so writes to `data/db.local.json` won't persist between
invocations in production (only locally, in `next dev`). If you deploy
there, swap `lib/store.js`'s local-file branch for a real datastore (Vercel
KV/Postgres, etc.) — the rest of the app (all API routes and both UIs)
doesn't need to change, since everything already goes through
`getDB()` / `mutateDB()`.

## Notes on the spec

- `/admin` has no authentication, as called out in the exercise.
- Patients are CRU (no delete) via `/api/patients`; appointments and
  prescriptions are full CRUD.
- New-patient creation lets staff set the portal password directly (per the
  FAQ, so credentials are testable immediately).
- The portal home page shows appointments/refills due in the next 7 days;
  the drill-down pages show occurrences out to 3 months, expanding
  recurrence rules rather than storing every future row.
