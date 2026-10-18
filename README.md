# J.K. Construction and Suppliers Pvt. Ltd. – Website

A full company website (Next.js) with an admin area where the company adds and edits its own
content: company details, projects with photo galleries, supplies, services, team, equipment,
client logos, testimonials, certificates, blueprints and other documents, news, FAQs and job
openings. It also receives customer enquiries.

**Where things are stored (works on Vercel's free tier):**
- **MongoDB** (Atlas free cluster) – all the text: settings, projects, news, enquiries …
- **Supabase Storage** (free) – all photos and documents, in a bucket named `company-files`.

---

## 1. One-time setup

### A. MongoDB Atlas (text data)
1. Create a free account and a free **M0** cluster at https://www.mongodb.com/atlas
2. **Database Access** → add a database user (username + password).
3. **Network Access** → **Add IP Address** → **Allow access from anywhere** (`0.0.0.0/0`).
   Vercel uses changing addresses, so this is needed. The database password keeps it safe.
4. **Connect → Drivers** → copy the connection string and put your password in it.
   This is your `MONGODB_URI`. (The database and collections are created automatically.)

### B. Supabase (photos and documents)
1. Create a free project at https://supabase.com
2. **Storage → New bucket** → name it exactly **`company-files`** and switch **Public bucket** ON
   (visitors must be able to see the photos).
3. Recommended: in the bucket settings set **File size limit** to `20 MB`.
4. **Project Settings → API**: copy the **Project URL** (`SUPABASE_URL`) and the **`service_role`**
   key (`SUPABASE_KEY`). The `service_role` key is a **secret** – only ever put it in `.env.local`
   or Vercel's settings, never in the code or the browser.

### C. Fill in the settings
```bash
npm install
cp .env.example .env.local     # then open .env.local and fill in the values
npm run dev
```
Open http://localhost:3000. The admin area is at http://localhost:3000/admin.

| Setting                | What it is                                                         |
| ---------------------- | ------------------------------------------------------------------ |
| `ADMIN_EMAIL`          | Email of your **first** admin (see "Admin login" below)            |
| `ADMIN_PASSWORD`       | Password of your first admin (at least 12 characters)              |
| `ADMIN_SESSION_SECRET` | Long random text (32+ characters). Make one: `openssl rand -hex 32` |
| `MONGODB_URI`          | MongoDB connection string (step A)                                 |
| `SUPABASE_URL`         | Supabase Project URL (step B)                                      |
| `SUPABASE_KEY`         | Supabase `service_role` key (step B)                               |
| `RESEND_API_KEY`, `NOTIFY_EMAIL` | *Optional* – email alerts for new enquiries (section 3)   |

You need Node.js 20.9 or newer (22 recommended). No keys or addresses are written in the code –
everything is read from these settings.

## Admin login (email + password)

- **First sign-in:** open `/admin/login` and sign in with `ADMIN_EMAIL` and `ADMIN_PASSWORD`. This creates
  your admin account in MongoDB. From then on the password is stored only as a salted scrypt hash
  (never as readable text). You can then **delete `ADMIN_EMAIL` and `ADMIN_PASSWORD`** from your settings.
- **More admins / changing passwords:** Admin → **Admin accounts**. You can change your password, add
  another admin (email + password) and remove admins. Adding an admin or changing a password asks for
  your current password again.
- **Passwords** must be at least 12 characters. Changing a password signs out that admin on every other
  device. Removing an admin signs them out immediately.
- **Forgot your password?** Two ways:
  1. If there is another admin: they open **Admin accounts**, remove your account and add it again with a new password.
  2. If you are the only admin: in MongoDB Atlas open the `admins` collection and delete your document
     (the first-admin settings only work while **no** admin exists). Then set `ADMIN_EMAIL` +
     `ADMIN_PASSWORD` again in `.env.local` / Vercel, redeploy, and sign in.
- **Protection:** the sign-in cookie is signed, `httpOnly`, `Secure` (on https) and `SameSite=Strict`, and
  is checked against MongoDB on every admin request. A wrong email and a wrong password get the same
  answer. After 5 wrong attempts an address must wait 15 minutes.

## 2. Put it on Vercel

1. Put the project in a GitHub repository (`.env.local` is ignored by git – good).
2. On https://vercel.com → **Add New → Project** → import the repository.
3. Under **Environment Variables** add the same names and values as in `.env.local`.
4. Press **Deploy**. Open `https://your-project.vercel.app/admin` and sign in.
5. Later, add your own domain in Vercel and put it in Admin → Company & pages → "Website address".

## 3. Email alerts for new enquiries (optional, but recommended)

Without this, a customer's enquiry waits in the admin until somebody looks. With it, you also get an email.

1. Make a free account at https://resend.com and create an **API key**.
2. Set `RESEND_API_KEY` to that key and `NOTIFY_EMAIL` to the address that should get the alerts
   (several addresses: separate with commas).
3. Done. Each new enquiry sends an email; pressing **Reply** writes to the customer (if they gave an email).
   At first the free test sender is used, and Resend then only delivers to the email address of your own
   Resend account. To send to anyone and use your own name, verify your domain in Resend and set `NOTIFY_FROM`
   (for example `J.K. Construction <website@yourdomain.com>`).

If the email service ever fails, the enquiry is still saved and still shows in the admin.

---

## How uploads work

Vercel does not accept requests bigger than about 4.5 MB, so files never pass through our server:

1. In the admin you choose a photo or document.
2. The browser asks our server (`src/app/api/admin/upload/route.ts`) for permission. The server checks
   you are signed in and the file type/size is allowed, then asks Supabase for a one-time upload
   address and works out the file's public web address.
3. The browser sends the file **straight to Supabase Storage** (`uploadFile` in `src/app/admin/fields.tsx`).
4. The public web address is placed in the project / document / news item. When you press **Save**
   it is stored in MongoDB together with the rest of the item.

Allowed files: JPG, PNG, WebP, AVIF (up to 8 MB; they are also shrunk in the browser first),
and PDF, Word, Excel, DWG, DXF (up to 20 MB).

## How the site stays fast, and what happens if something breaks

- **Fast:** public pages are kept ready-made on Vercel's network, so visitors get them almost instantly. When
  you press **Save** in the admin, the pages are rebuilt straight away. (If you ever edit the database directly,
  pages catch up within 5 minutes.)
- **If MongoDB is unreachable** (rare): pages that are already ready-made keep working. Pages that need the
  database show a friendly "Something went wrong" page with a phone number and a *Try again* button, and the
  site recovers by itself when the database is back. The contact form tells the visitor to call instead.
- **Two admins at once:** every save is checked. If someone else saved while you were editing, your save is
  refused with a clear message (reload, then redo your change) instead of silently wiping their work.
- **Spam:** the contact form has a hidden trap for bots, and one address can send at most 20 messages per hour.
  You can delete spam in Admin → Enquiries.

## What the admin can manage (/admin)

Press **Save** (top right) after making changes. Items need **Published** ticked to appear on the site.
A section with nothing published is simply hidden, so the website never shows empty boxes.

| Admin tab           | What it is for                                              | Where it shows on the website                         |
| ------------------- | ----------------------------------------------------------- | ----------------------------------------------------- |
| Enquiries           | Messages from the contact form (mark New / In progress / Closed) | –                                                |
| Admin accounts      | Change your password, add / remove admins                   | –                                                     |
| Company & pages     | Phone, emails, address, hours, social links, PAN/VAT, banner text and photo, the 4 numbers, About text, mission/vision, director's message, Google description | Everywhere |
| Projects            | Cover photo, gallery, type, status, location, year          | Home, Projects, each project's own page               |
| Supplies            | Materials with category, unit, price (or "Price on request")| Supplies page (with filter buttons)                   |
| Services            | Name, icon, short + full description (use ↑ ↓ to reorder)   | Home, Services                                        |
| Testimonials        | Client quotes                                               | Home                                                  |
| Team                | Staff with photo and bio                                    | About                                                 |
| Equipment           | Machines and vehicles                                       | About                                                 |
| Clients & Partners  | Logos                                                       | Home                                                  |
| Documents           | Certificates, profile, brochure, price list, blueprints (PDF/Word/Excel/DWG/DXF) | Downloads page; "Certificate" ones also on About |
| News                | Updates with photo                                          | Home, News                                            |
| FAQs                | Questions and answers                                       | Contact page                                          |
| Careers             | Job openings (hidden automatically after the "apply by" date)| Careers page                                         |

The menu links **News, Downloads and Careers** appear (under "More") only once something is published there.

## "I want to change…" – where to do it

| I want to change…                                    | Do this                                                  |
| ---------------------------------------------------- | -------------------------------------------------------- |
| Phone, address, text on the site, banner, About page | Admin → **Company & pages** (no code)                    |
| Add / edit / hide projects, supplies, news, documents…| Admin → the matching tab (no code)                      |
| The starting text before anything is saved           | `src/lib/site.ts` (top of the file)                      |
| The 3 "how it works" steps, "how we work" points, contact-form drop-down options | `src/lib/site.ts` (bottom of the file) |
| Menu links (Home, About…)                            | `src/components/header.tsx` (`mainLinks`)                |
| Brand colours                                        | top of `src/app/globals.css` (section 1)                 |
| Logo                                                 | Replace `public/images/jk-logo.jpg` (and `src/app/icon.png` for the browser-tab icon) |

Text and details typed in the admin **win** over what is written in `site.ts`.

## Adding a new field to a section (example: "Client name" on Projects)

1. Open `src/lib/collections.ts`, find the `projects` section and add one line to its `fields`:
   `{ key: "client", label: "Client name", type: "text" },`
2. The admin form and the safety checks pick it up automatically. MongoDB needs no change (no fixed schema).
3. Show it where you want, e.g. in `src/app/(website)/projects/[id]/page.tsx`: `{project.client}`.

(Field types you can use: text, textarea, select, date, image, images, file, url.)

## Folder map

```
src/
  lib/db.ts              <- connects to MongoDB (MONGODB_URI)
  lib/supabase.ts        <- connects to Supabase Storage (SUPABASE_URL, SUPABASE_KEY)
  lib/store.ts           <- reads/writes everything in MongoDB
  lib/admins.ts          <- admin accounts in MongoDB (email + hashed password)
  lib/password.ts        <- password hashing (scrypt)
  lib/rate-limit.ts      <- "not too often" counters (wrong passwords, enquiry spam), kept in MongoDB
  lib/notify.ts          <- the optional enquiry email alert
  lib/collections.ts     <- the list of everything the admin can manage (fields of each section)
  lib/site.ts            <- starting text + the few things not in admin
  lib/clean.ts           <- checks everything the admin saves (lengths, links)
  lib/auth.ts            <- the signed sign-in cookie (who is signed in)
  app/globals.css        <- all the styling (labelled sections)
  app/(website)/         <- the public pages
  app/admin/             <- the admin pages (page.tsx = shell, list-editor.tsx, settings-editor.tsx, account-editor.tsx, fields.tsx = uploads)
  app/api/               <- the small server parts (contact form, login, saving, upload permission)
  components/            <- header, footer, buttons, MediaCard (the picture cards) and other repeated pieces
public/images/           <- logo and the banner drawing
```

MongoDB (database `jk_construction`) holds four collections:
`content` (one document, `_id: "site"`: settings + every list), `enquiries` (one document per message),
`admins` (one document per admin: email + hashed password), `rateLimits` (the "not too often" counters).

## Good to know

1. **Enquiries:** switch on the email alerts (step D) so no enquiry is missed. They are always saved in Admin → Enquiries too.
2. Admin sign-in security is described in "Admin login" above. Use a password manager and a password nobody else uses.
3. Files go straight from the browser to Supabase, so the server cannot look inside them. That is why only
   admins can upload, and why setting a **file size limit on the bucket** (step B3) is recommended.
4. Deleting an item in admin does not delete its files from the Supabase bucket (they just stop being used).
   You can clean the bucket in Supabase → Storage whenever you like.
5. **Free-tier limits:** Supabase pauses free projects after about a week with no activity (photos stop
   showing until you press "Restore" in Supabase). Visiting the site/admin regularly avoids this.
   MongoDB Atlas M0 has 512 MB, which is plenty for text.
6. Back up by exporting the `content`, `enquiries` and `admins` collections from MongoDB Atlas now and then.

## Before you go live: checklist

- [ ] Open the live site on a real phone and click through every page.
- [ ] **Admin → Company & pages:** check the phone, emails, address, working hours and your real **website address**.
- [ ] Fill in the things only the company knows: the 4 numbers (only true ones), the director's message,
      social media links, the registration/PAN numbers.
- [ ] Add real **projects with photos**, the **certificates** (Documents) and a few real **testimonials**
      (with the client's permission). Real photos matter more than anything else on the site.
- [ ] Read the starting text (Services, FAQs, About, **Privacy policy**) and change anything that is not exactly
      how the company works. The privacy page is a plain-language starting point, not legal advice.
- [ ] Switch on the **email alerts** and send yourself a test enquiry from the contact form.
- [ ] In Vercel → Settings → Functions, set the **Function Region** to Mumbai (`bom1`), and create the MongoDB Atlas
      cluster and Supabase project in a nearby region (Mumbai / Singapore). It makes the site quicker for visitors in Nepal.
- [ ] Add the company to **Google Business Profile** (free) with the same name, address and phone. It is the best
      thing you can do to be found by people searching "construction Janakpur".
- [ ] In Google Search Console, add the site and submit `https://your-site/sitemap.xml`.
- [ ] Sign in to the admin once to create your account, then delete `ADMIN_EMAIL` / `ADMIN_PASSWORD` from the settings.
