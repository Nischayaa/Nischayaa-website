# Nischayaa — Dazzle of Wellness

A clean one-page wellness website with a private admin dashboard for uploading videos.

## What is included

- `index.html` — public website
- `admin.html` — private admin dashboard
- `styles.css` / `admin.css` — design
- `app.js` / `admin.js` — website and admin functionality
- `config.js` — Supabase connection settings
- `supabase.sql` — database + storage + security policies
- `assets/nischayaa-logo.jpg` — your supplied logo

## Important: video uploading

A browser-only website cannot securely store videos by itself. This version uses Supabase's free tier for:
- email/password admin login
- video storage
- video database
- public video playback

You only need to create a free Supabase project once.

### Setup

1. Create a project at https://supabase.com/
2. Open **SQL Editor**.
3. Paste everything from `supabase.sql` and run it.
4. Open **Authentication → Users** and create an admin user.
   Use:
   `nishchayaa.rtn@gmail.com`
   and a password you choose.
5. Open **Project Settings → API**.
6. Copy the **Project URL** and the **Publishable/anon key**.
7. Open `config.js` and put them here:

   const SUPABASE_URL = "YOUR_PROJECT_URL";
   const SUPABASE_ANON_KEY = "YOUR_PUBLISHABLE_OR_ANON_KEY";

8. Upload the whole folder to a free static host such as GitHub Pages, Netlify, or Cloudflare Pages.
9. Your public page is `index.html`.
10. Your admin page is `admin.html`.

### Admin workflow

Go to `/admin.html`, sign in, choose a video, add a title/description, and upload it.

The video is uploaded to Supabase Storage and automatically appears on the public website.

### Free hosting

The website itself is static, so you can host it free on:
- GitHub Pages
- Netlify
- Cloudflare Pages

The Supabase free project handles the admin login and video storage.

## Customization

The public page intentionally keeps the content simple. If you later send:
- About text
- services/programs
- Instagram link
- address
- more photos
- review videos

they can be added without changing the overall design.

## Security note

Do NOT put a Supabase `service_role` key in this website. Only use the public publishable/anon key. The SQL file enables Row Level Security.
