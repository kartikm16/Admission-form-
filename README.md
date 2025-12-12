## Pillai College of Engineering — Admission Enquiry

Next.js (App Router) site with a persistent admission enquiry widget and API-backed JSON storage.

### Quick start
1) Install dependencies
```bash
npm install
```
2) Run the dev server
```bash
npm run dev
```
3) Open http://localhost:3000. The Admission Enquiry widget floats on every page; the main form is on the homepage.

### Project structure (key files)
- `app/page.js` — hero + primary admission form.
- `components/AdmissionForm.jsx` — reusable enquiry form with validation.
- `components/AdmissionWidget.jsx` — floating widget (left desktop, bottom mobile) with modal form and focus trap.
- `app/api/enquiries/route.js` — API to store enquiries in `data/enquiries.json` (creates the file on first write).
- `app/admin/enquiries/page.js` — simple admin view (disabled by default; set `ADMIN_VIEW_ENABLED=true` in env to enable).
- `data/enquiries.json` — local JSON store for submissions.
- `tailwind.config.js`, `postcss.config.mjs`, `app/globals.css` — Tailwind setup and global styles.

### API + storage
- `POST /api/enquiries` accepts `{ name, email, phone, program }`, validates on the server, appends to `data/enquiries.json`, and returns `201` on success.
- `GET /api/enquiries` returns the current list (useful for local debugging).
- Storage is purely file-based using `fs.promises`; no external DB. Ensure the server process has write permissions to the project directory.

### Admin helper page
- Path: `/admin/enquiries`.
- Disabled unless `ADMIN_VIEW_ENABLED=true` is set in your environment (local-use only).
- Reads from `data/enquiries.json` and shows a simple table.

### Styling & accessibility
- TailwindCSS with a calm blue/neutral palette, soft shadows, and responsive layout.
- Widget traps focus while open, closes on Esc, and restores focus to the trigger button.
- Inputs include labels, aria attributes, and inline error messages.

### Notes
- If you deploy, ensure your hosting allows file writes (the JSON store) or adapt the API to your preferred database.
- For CORS, the built-in Next.js API is same-origin; no extra config needed for typical usage.
