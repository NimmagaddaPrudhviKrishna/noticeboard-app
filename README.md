# College Notice Board Announcement System

A simple full-stack web application for posting and viewing college notices/announcements.
Built as a minor project — deliberately kept small and easy to explain.

## Tech Stack

- **Backend:** Node.js + Express
- **Storage:** local JSON file when run on your own machine; Upstash Redis
  (via Vercel Marketplace) when deployed to Vercel — see `db.js` and `DEPLOY.md`
- **Auth:** JWT stored in an httpOnly cookie for admin login (`jsonwebtoken` +
  `bcryptjs` for password hashing) — stateless, so it works locally and on
  serverless hosting alike
- **Frontend:** Plain HTML, CSS, and JavaScript (no framework/build step)

Want to deploy this on Vercel? See **DEPLOY.md** for step-by-step instructions.

## Features

- Public notice board — anyone can view notices, no login required
- Search notices by keyword
- Filter by category (General, Academic, Exam, Event, Placement, Holiday)
- Filter by priority (Urgent / Normal) — urgent notices are highlighted
- Admin login (default: `admin` / `admin123`)
- Admin dashboard to Create, Edit, and Delete notices
- Data persists in a local JSON file, so it survives server restarts

## Project Structure

```
notice-board/
├── server.js          # Express app + REST API routes
├── db.js               # Data layer: local JSON file, or Upstash Redis on Vercel
├── api/index.js         # Vercel serverless entry point (wraps server.js)
├── vercel.json           # Routes /api/* to the serverless function
├── package.json
├── DEPLOY.md              # Vercel deployment steps
├── data/                # Auto-created on first LOCAL run (gitignored)
└── public/
    ├── index.html       # Public notice board
    ├── admin.html        # Admin login + dashboard
    ├── css/style.css
    └── js/
        ├── main.js       # Public board logic
        └── admin.js       # Admin login/CRUD logic
```

## How to Run

1. Make sure [Node.js](https://nodejs.org) (v16+) is installed.
2. Open a terminal in the project folder.
3. Install dependencies:
   ```
   npm install
   ```
4. Start the server:
   ```
   npm start
   ```
5. Open your browser at **http://localhost:3000**
   - Public board: `http://localhost:3000/`
   - Admin login: `http://localhost:3000/admin.html`

Default admin credentials:
- **Username:** `admin`
- **Password:** `admin123`

(You can change these by deleting `data/admin.json`, editing the seed password in `db.js`,
and restarting the server — or by hashing a new password with bcrypt yourself.)

## API Endpoints (for reference in your project report)

| Method | Endpoint            | Auth required | Description                  |
|--------|----------------------|----------------|-------------------------------|
| GET    | /api/notices          | No             | List notices (supports `?q=`, `?category=`, `?priority=`) |
| GET    | /api/notices/:id      | No             | Get a single notice           |
| POST   | /api/notices          | Yes (admin)    | Create a new notice           |
| PUT    | /api/notices/:id      | Yes (admin)    | Update a notice               |
| DELETE | /api/notices/:id      | Yes (admin)    | Delete a notice               |
| POST   | /api/login            | No             | Admin login                   |
| POST   | /api/logout           | Yes (admin)    | Admin logout                  |
| GET    | /api/session          | No             | Check current login state     |

## Possible Extensions (if you want to expand the project)

- Multiple admin accounts / roles (e.g. faculty vs. student council)
- File attachments on notices (PDF circulars, images)
- Email or push notifications for urgent notices
- Swap the JSON file storage for MySQL/MongoDB
- Comments or acknowledgement ("Seen by") tracking on notices
