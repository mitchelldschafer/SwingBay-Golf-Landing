# Mile High Fairway — Golf Simulator Website

## Overview
A premium cinematic landing page and booking platform for a Denver-based indoor golf simulator facility. Features GSAP scroll animations, booking scheduling, user authentication, admin tooling, and a Google Sheets-powered blog feed.

## Architecture

### Frontend
- **Framework**: React 19 + Vite 8
- **Styling**: Tailwind CSS 3 + custom CSS variables (off-white / forest green / gold palette)
- **Animations**: GSAP with ScrollTrigger
- **Routing**: React Router DOM v6
- **Dev port**: 5173 (proxies `/api` → `http://localhost:5000`)

### Backend
- **Framework**: Express.js (ESM, port 5000 by default)
- **Auth**: JWT (`jsonwebtoken`) + bcrypt password hashing (`bcryptjs`)
- **Database**: PostgreSQL via `pg`
- **Entry point**: `server/index.js`

### Database
- **Core tables**: `users`, `bookings`, `bays`, `site_settings`
- **Connection**: `DATABASE_URL` environment variable

### Integrations
- **PostgreSQL** via `pg`
- **Google Sheets CSV** feed for blog content in `src/pages/Blog.jsx`
- **Netlify** for production hosting and deploys from GitHub
- **GitHub** repo sync on `main`

## Key Directories
```
server/
  index.js           # Express entry point
  db/pool.js         # pg Pool instance
  db/schema.js       # bootstrapSchema() — creates app tables on startup
  middleware/auth.js # JWT verify + signToken helpers
  routes/auth.js     # /api/auth/* endpoints
  routes/bookings.js # /api/bookings/* endpoints (availability, create, my)
  routes/admin.js    # /api/admin/* endpoints
src/
  context/AuthContext.jsx  # React auth provider + useAuth hook
  context/SettingsContext.jsx
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
- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET` — secret for signing JWTs
- `PORT` — Express server port, defaults to `5000`

## Running Locally
```bash
npm run dev        # Starts both Express and Vite via concurrently
npm run dev:server # Express only
npm run dev:client # Vite only
```

## Deployment
- Production host: **Netlify**
- Live URL: `https://swingbay-golf-denver.netlify.app`
- Git provider: **GitHub**
- Production branch: `main`
- Build command: `npm run build`
- Publish dir: `dist`
- Repo-level config: `netlify.toml`

Pushing a commit to `origin/main` should trigger a new Netlify production deploy automatically.

## Auth Flow
1. User registers/logs in via `/api/auth/register` or `/api/auth/login`
2. Server returns a JWT in the JSON response
3. `AuthContext` stores the token in `localStorage` (`mhf_token`) and calls `/api/auth/me` to restore session
4. Navbar shows user name + logout when authenticated; Log In / Sign Up otherwise

## Pages
- `/` — Cinematic landing page with GSAP animations
- `/book` — Bay booking widget (Driving Range 1, Driving Range 2, VIP Simulator Bay)
- `/pricing` — Membership ($259/mo) and open play pricing
- `/blog` — Articles from Google Sheets CSV
- `/login` — Email/password login
- `/signup` — Account creation
- `/account` — Protected user dashboard (name, membership status, quick actions)
