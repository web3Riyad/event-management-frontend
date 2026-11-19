# UNIQUE — Luxury Community & Social Service Event Management (Frontend)

[![Next.js](https://img.shields.io/badge/Next.js-16.4.6-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.3.0-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Better Auth](https://img.shields.io/badge/Better_Auth-1.7.26-orange?style=for-the-badge)](https://www.better-auth.com/)
[![HeroUI](https://img.shields.io/badge/HeroUI-3.2.7-000000?style=for-the-badge)](https://heroui.com/)
[![Vercel Ready](https://img.shields.io/badge/Vercel-Deployment_Ready-black?style=for-the-badge&logo=vercel)](https://vercel.com/)

A luxury, fully-responsive frontend web application built with **Next.js 16 (App Router)** and **React 19** for grassroots volunteerism and civic welfare drives.

---

## Key Features

1. **Brand Identity & Luxury Palette**:
   - Styled with champagne gold (`#D9A441`), deep teal (`#0f766e`), soft ivory (`#FAF8F5`), and charcoal (`#101010`).
2. **Chronological Scheduling & Smart Sorting**:
   - Upcoming events displayed nearest date first.
   - Interactive category filtering pills and live multi-field keyword search.
3. **Form Validation**:
   - Real-time client-side validation on event creation/updates and authentication forms (email regex, live password checklist, character lengths).
4. **Theme Customization (Light / Dark)**:
   - Full-system theme toggle persisted in `localStorage` with zero-flash hydration.
   - Adaptive navbar header, cards, modals, and skeletons.
5. **Custom Loading Skeletons**:
   - Layout-matched skeletons for event cards, event details, manage events, and route-level loading suspense.
6. **User Profile View & Update**:
   - Dedicated profile dashboard showing user statistics (created drives, joined drives, active status).
   - Profile editor for updating display name and profile picture (supporting local device uploads with client-side canvas downsampling to Base64 JPEG or image URL).
7. **Volunteer Participation**:
   - One-click drive enrollment with duplicate participation prevention.

---

## Tech Stack
- **Framework**: Next.js 16.4.6 (App Router, Turbopack)
- **UI Library**: React 19.3.0
- **Styling**: Tailwind CSS v4, DaisyUI v5, HeroUI
- **Icons**: Lucide React
- **Auth Client**: Better Auth + Google & GitHub OAuth
- **Date Handling**: date-fns & Native Intl API

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` or `.env.local` file in the root of the frontend project:
```env
BETTER_AUTH_SECRET=your_better_auth_secret_key
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:5000

MONGODB_URL=your_mongodb_atlas_connection_string

# Optional: Google & GitHub OAuth Credentials
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application in your browser.

### 4. Build for Production
```bash
npm run build
npm start
```

---

## Deploying to Vercel

1. Push this repository to GitHub: `https://github.com/web3Riyad/event-management-frontend`.
2. In your [Vercel Dashboard](https://vercel.com/dashboard), click **Add New...** &rarr; **Project**.
3. Import **`web3Riyad/event-management-frontend`**.
4. In **Environment Variables**, add:
   - `BETTER_AUTH_SECRET`
   - `BETTER_AUTH_URL` (set to your Vercel URL, e.g. `https://your-frontend.vercel.app`)
   - `NEXT_PUBLIC_BETTER_AUTH_URL` (set to your Vercel URL)
   - `NEXT_PUBLIC_API_URL` (set to your deployed backend URL, e.g. `https://your-backend.vercel.app`)
   - `MONGODB_URL`
5. Click **Deploy**.
