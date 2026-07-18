# SLC Level Exam — Setup Guide

A 50-question, 1-hour, multiple-choice English placement exam for **Shakespeare
Language Center (SLC)** — dark mode, a student panel, and a teacher panel with
SLC's own 6-tier level system, backed by its own Supabase database and
deployed as a static site + serverless functions on Netlify.

This is a completely separate deployment from any other exam site — its own
GitHub repo, its own Supabase project, its own Netlify site. Nothing here
connects to or shares data with any other project.

Follow these steps in order. None of it requires coding experience — just
copying and pasting values into the right places.

---

## SLC's level system

Scores are out of 50:

| Score range | Level |
|---|---|
| 0–18 | Level Intro |
| 19–25 | Level 1 |
| 26–32 | Level 2 |
| 33–39 | Level 3 |
| 40–46 | Level 4 |
| 47–50 | Level 5 |

---

## Part 1 — Create a NEW, separate Supabase project

1. Go to https://supabase.com and log in (same account is fine, but this must
   be a **new project**, separate from any other exam site).
2. Click **New project**. Name it something like `slc-level-exam`, set a
   database password (save it), pick a region, and click **Create new
   project**. Wait ~2 minutes.
3. Left sidebar → **SQL Editor** → **New query**.
4. Open `supabase/schema.sql` from this project, copy **all** of it, paste it
   into the SQL editor, and click **Run**. You should see "Success. No rows
   returned." This creates the `students`, `attempts`, and `reports` tables
   with SLC's 6-tier level constraint already built in.
5. Left sidebar → **Project Settings** → **API Keys**. Note down:
   - **Project URL**
   - **Publishable key** (also called the anon/public key)
   - **Secret key** (also called the service_role key) — click reveal, keep
     this one private, it never goes in the browser code

### Create your teacher login (SLC teachers only — separate from any other project's teachers)

6. Left sidebar → **Authentication** → **Users** → **Add user** → **Create
   new user**. Enter the email/password for SLC teacher access. Leave
   **Auto Confirm User** on.
7. Repeat for any other SLC teacher who needs access.

---

## Part 2 — Configure the project

1. Open `public/js/config.js`.
2. Replace `YOUR_SUPABASE_URL_HERE` with the SLC Project URL.
3. Replace `YOUR_SUPABASE_ANON_KEY_HERE` with the SLC Publishable key.

The Secret key does **not** go in any file — it only goes into Netlify's
environment variables (Part 4).

---

## Part 3 — Push to GitHub

Create a **new** repository (e.g. `slc-level-exam` — different name/repo from
any other exam project) and upload every file and folder in this project to
it, including the `public/images/` folder with the SLC logo and cover banner.

---

## Part 4 — Deploy to Netlify

1. https://app.netlify.com → **Add new site** → **Import an existing
   project** → connect GitHub → choose the `slc-level-exam` repo.
2. Build settings auto-detect from `netlify.toml`:
   - Build command: `npm install`
   - Publish directory: `public`
   - Functions directory: `netlify/functions`
3. Before/after the first deploy, go to **Site configuration** →
   **Environment variables** → add:
   - `SUPABASE_URL` = the SLC Project URL
   - `SUPABASE_SERVICE_ROLE_KEY` = the SLC Secret key
4. Deploy (or trigger a redeploy if you added the variables after the first
   deploy). You'll get a URL like `https://slc-level-exam.netlify.app`.

---

## Part 5 — Test before giving it to students

1. Take a test exam on the live site, submit it.
2. Check `/student.html` shows the right level for the test email.
3. Log into `/teacher.html`, confirm you can see the student, generate a
   report, download the PDF, and see SLC branding throughout (logo in the
   header, cover banner on the start page, "Shakespeare Language Center" in
   the PDF header, and the correct Level Intro–5 badge colors).
4. Delete the test student row from Supabase (Table Editor → `students`)
   before handing it to real students.

---

## Branding assets

- `public/images/slc-logo.png` — shown in the top bar of every page
- `public/images/slc-cover.png` — shown as a banner on the exam start page

To change either, just replace the file (keep the same filename) and
re-upload to GitHub.

## How the rules are enforced

Same as the underlying system: one attempt per student (checked by email),
one attempt per device (checked by a stored device ID), autosaved answers as
the student progresses, and a teacher-only reset button that keeps full
history in the database. See the code comments in `netlify/functions/` for
details on each endpoint.

## Editing exam questions

If you ever need to change a question, update it in **both**:
1. `public/js/questions.js` (text/options shown to students, no answers)
2. `netlify/functions/_shared/examData.js` (same text/options + correct
   answer + topic category, used only server-side for grading)
