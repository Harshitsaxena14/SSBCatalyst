# SSB Catalyst

SSB Catalyst is a browser-based SSB practice platform focused on psychology tests:

- PPDT
- TAT
- WAT
- SRT
- SD

The app uses a static frontend (vanilla HTML/CSS/JS) with modular practice pages and an optional Node.js backend for contact form handling, rate limiting, MongoDB persistence, and email notifications.

## Tech Stack

- Frontend: HTML, CSS, JavaScript (ES modules)
- Backend: Node.js, Express
- Data/Storage: In-memory/static datasets, optional MongoDB (Mongoose)
- Email: Nodemailer (Gmail transport)
- Deployment: Vercel-ready routing via `vercel.json`

## Project Structure

- `index.html`: Main landing page and app entry point
- `practice-engine.js`: Core client-side practice engine
- `components/`: Reusable UI components for practice screens
- `pages/`: Test-specific practice pages (PPDT, TAT, WAT, SRT, SD)
- `data/`: Question/prompt datasets and dataset mapping
- `utils/`: Routing and local storage helpers
- `backend/server.js`: Express server with health and contact endpoints
- `backend/package.json`: Backend dependencies and scripts
- `vercel.json`: Vercel route config

## Prerequisites

- Node.js 18+ (recommended)
- npm

## Run Locally

### 1) Install backend dependencies

```bash
cd backend
npm install
```

### 2) Configure environment variables (optional but recommended)

Create a `.env` file in `backend/`:

```env
PORT=5000
CLIENT_URL=http://localhost:5000
MONGO_URI=
EMAIL_USER=
EMAIL_PASS=
```

Notes:
- If `MONGO_URI` is empty or invalid, server still starts and continues without MongoDB.
- If `EMAIL_USER`/`EMAIL_PASS` are missing, contact submissions are accepted but email sending is skipped.

### 3) Start backend server

```bash
cd backend
npm start
```

Then open:
- App: http://localhost:5000
- Health check: http://localhost:5000/health

## API Endpoints

### `GET /health`
Returns service status.

Example response:

```json
{ "status": "ok" }
```

### `POST /contact`
Accepts contact form submissions.

Request body:

```json
{
  "name": "Your Name",
  "email": "you@example.com",
  "message": "Optional message",
  "honeypot": ""
}
```

Validation/behavior:
- `name` and `email` are required
- `message` max length is 1000 chars
- rate-limited (`20` requests / `15` minutes)
- spam trap using `honeypot`

## Deployment Notes

- `vercel.json` routes all requests to `index.html` for SPA-style navigation.
- For backend features in production (contact, MongoDB, email), deploy `backend/server.js` on a Node-compatible host and set environment variables.

## Development Tips

- Most feature work happens in `pages/`, `components/`, `data/`, and `utils/`.
- Keep datasets in `data/` grouped by test/set for easy extension.
- Use the `datasetMap.js` and page-level modules for adding new practice sets cleanly.

## License

No license file is currently defined in this repository.
