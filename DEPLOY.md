# Deploying to Vercel

Vercel runs your backend as **serverless functions** with a read-only filesystem,
so this app now uses:

- **Vercel Marketplace Redis (Upstash)** for data storage, instead of a local JSON file
- A **JWT cookie** for admin login, instead of a server-side session

Locally (`npm start`) it still falls back to a JSON file automatically, so local dev needs no setup.

## Steps

### 1. Push the project to a GitHub repo
Vercel deploys from a Git repository (GitHub/GitLab/Bitbucket).

```
git init
git add .
git commit -m "Notice board app"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

### 2. Import the project into Vercel
- Go to https://vercel.com/new
- Import the GitHub repo
- Framework preset: **Other** (it's plain Node/Express) — Vercel will auto-detect
  `api/index.js` as a serverless function and `public/` as static files
- Click **Deploy** (it will succeed even before the database step below — the
  site loads, but login/posting won't work yet)

### 3. Add a Redis database (for persistent storage)
- In your Vercel project, go to the **Storage** tab
- Click **Create Database** → choose **Redis** (powered by Upstash) from the Marketplace
- Once created, connect it to your project — this automatically adds the
  `KV_REST_API_URL` and `KV_REST_API_TOKEN` (or `UPSTASH_REDIS_REST_URL` /
  `UPSTASH_REDIS_REST_TOKEN`) environment variables to your project

### 4. Set a JWT secret
- Go to **Settings → Environment Variables**
- Add `JWT_SECRET` with any long random string (used to sign admin login tokens)

### 5. Redeploy
- Go to **Deployments** and redeploy (or just push a new commit) so the new
  environment variables take effect

### 6. Visit your site
- Public board: `https://<your-project>.vercel.app/`
- Admin login: `https://<your-project>.vercel.app/admin.html`
- Default credentials: `admin` / `admin123` (change these before sharing the
  link widely — see below)

## Changing the default admin password

The admin account is seeded once into Redis the first time the app runs. To set
your own password before that first run:

1. Generate a bcrypt hash for your chosen password (e.g. run this once locally):
   ```
   node -e "console.log(require('bcryptjs').hashSync('yourNewPassword', 10))"
   ```
2. In `db.js`, replace the seeded password hash in `SEED_NOTICES`'s neighbouring
   admin-seed line with your generated hash, redeploy, and let it seed.

(Or, simpler: log in with the default credentials once deployed, then treat
that as a temporary password — since there's no "change password" UI yet, the
cleanest option for a class demo is just to keep `admin123` and mention in
your report that a password-change feature would be a natural next addition.)

## Notes for your project report

- Storage: Upstash Redis (serverless-friendly key-value store), accessed via
  the `@upstash/redis` client
- Auth: stateless JWT stored in an httpOnly cookie, verified on each protected
  request — this design works across serverless function invocations, unlike
  in-memory sessions
- Hosting: Vercel serverless functions (`/api/index.js`) + static hosting for
  the frontend (`/public`)
