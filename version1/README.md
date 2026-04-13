# Big "O" Minds – Premium Self-Discovery Platform

A calm, premium, human-centered web platform for coaching, self-discovery, and purposeful experiences.

## Pages

| Page | URL | Description |
|------|-----|-------------|
| Home | `/` | Main landing page with hero, services, Circle of Awareness, events, testimonials |
| Turning Point | `/turning-point.html` | Guided self-discovery journey builder (select goal → format → level → personalized result) |
| Events | `/events.html` | Browse events, view details, register with payment flow |
| Admin | `/admin.html` | Admin panel for managing events, viewing journeys and registrations |

## Quick Start

```bash
cd server
npm install
node server.js
```

Open `http://localhost:3000` in your browser.

## Tech Stack

- **Frontend:** Vanilla HTML/CSS/JS (preserving existing design system)
- **Backend:** Node.js + Express
- **Database:** MongoDB (optional – falls back to in-memory storage)
- **Email:** Nodemailer (configure SMTP in `server/.env`)

## Design System

- **Fonts:** Cormorant Garamond (headings), Inter (body)
- **Colors:** Cream, sand, warm-white, blue, sage, terracotta earth tones
- **Patterns:** Circle-based elements, pills/chips, soft gradients, generous spacing

## Admin Credentials

Default login: `admin` / `bigominds`

## Configuration

Edit `server/.env` to configure:
- `PORT` – Server port (default: 3000)
- `MONGODB_URI` – MongoDB connection string
- `SMTP_*` – Email delivery settings
