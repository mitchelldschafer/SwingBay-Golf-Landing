# Mile High Fairway — Golf Simulator Website

## Overview
A premium cinematic landing page and booking platform for a Denver-based indoor golf simulator facility. Features GSAP scroll animations, real booking scheduling, user authentication, and Stripe membership checkout.

## Architecture

### Frontend
- **Framework**: React 19 + Vite 8
- **Styling**: Tailwind CSS 3 + custom CSS variables (off-white / forest green / gold palette)
- **Animations**: GSAP with ScrollTrigger
- **Routing**: React Router DOM v6
- **Port**: 5000 (proxies `/api` → localhost:3001)

### Backend
- **Framework**: Express.js (ESM, port 3001)
- **Auth**: JWT (`jsonwebtoken`) + bcrypt password hashing (`bcryptjs`)
- **Database**: Replit PostgreSQL (via `pg` pool)
- **Entry point**: `server/index.js`

### Database
- **Provider**: Replit built-in PostgreSQL
- **Tables**: `users`, `bookings`
- **Connection**: `DATABASE_URL` environment variable (auto-set by Replit)

## Key Directories
```
server/
  index.js           # Express entry point (port 3001, listens on 127.0.0.1)
  db/pool.js         # pg Pool instance
  db/schema.js       # bootstrapSchema() — creates users + bookings tables on startup
  middleware/auth.js # JWT verify + signToken helpers
  routes/auth.js     # /api/auth/* endpoints
  routes/bookings.js # /api/bookings/* endpoints (availability, create, my)
src/
  context/AuthContext.jsx  # React auth provider + useAuth hook
  pages/
    Login.jsx        # /login
    Signup.jsx       # /signup
    Account.jsx      # /account (protected)
    Home.jsx         # Landing page
    Book.jsx         # Booking page
    Pricing.jsx      # Membership & pricing
    Blog.jsx         # Blog (Google Sheets CSV)
  components/
    Layout.jsx       # Navbar (auth-aware) + Footer
    BookingWidget.jsx
```

## Environment Variables
- `DATABASE_URL` — Replit PostgreSQL connection string (auto-managed)
- `JWT_SECRET` — 128-char hex secret for signing JWTs (set in shared secrets)
- `API_PORT` — Express server port, defaults to 3001 (set in shared env)

## Running Locally
```bash
npm run dev        # Starts both Express (port 3001) and Vite (port 5000) via concurrently
npm run dev:server # Express only
npm run dev:client # Vite only
```

## Deployment
- Deployment target: **static** (Vite build → `dist/`)
- Build command: `npm run build`
- Public dir: `dist`

## Auth Flow
1. User registers/logs in via `/api/auth/register` or `/api/auth/login`
2. Server returns a JWT stored in `localStorage` (`mhf_token`)
3. `AuthContext` reads the token on mount, calls `/api/auth/me` to restore session
4. Navbar shows user name + logout when authenticated; Log In / Sign Up otherwise

## Pages
- `/` — Cinematic landing page with GSAP animations
- `/book` — Bay booking widget (Driving Range 1, Driving Range 2, VIP Simulator Bay)
- `/pricing` — Membership ($259/mo) and open play pricing
- `/blog` — Articles from Google Sheets CSV
- `/login` — Email/password login
- `/signup` — Account creation
- `/account` — Protected user dashboard (name, membership status, quick actions)
