# ScrollIt — Frontend

The frontend for the ScrollIt live streaming platform built with **Next.js 14** and **TypeScript**.  
Connects to the Spring Boot backend at `http://localhost:8080`.

---

## 🛠 Tech Stack

| Technology | Purpose |
|---|---|
| Next.js 14 | React framework with App Router |
| TypeScript | Type safety |
| CSS-in-JS (inline styles) | Styling — no extra library needed |
| localStorage | Store JWT token and user info |
| fetch API | HTTP requests to backend |

---

##  Project Structure
```
srcollit/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx          — login form
│   │   ├── register/
│   │   │   └── page.tsx          — register form
│   │   └── forgot-password/
│   │       └── page.tsx          — forgot password form
│   ├── admin/
│   │   └── page.tsx              — admin dashboard (stats, users, streams, gifts)
│   ├── streams/
│   │   ├── page.tsx              — Pinterest-style live streams grid
│   │   ├── create/
│   │   │   └── page.tsx          — create stream with thumbnail upload
│   │   └── [id]/
│   │       └── page.tsx          — stream detail, chat, gifts, join/leave
│   ├── profile/
│   │   └── page.tsx              — user profile, my streams, gift history
│   ├── layout.tsx                — root layout
│   ├── globals.css               — global styles
│   └── page.tsx                  — redirects to /streams
├── components/
│   ├── Navbar.tsx                — top navigation bar
│   └── StreamCard.tsx            — stream card used in the grid
└── lib/
    ├── api.ts                    — base fetch helper
    └── auth.ts                   — token helpers (save, get, logout)
```

---

## Getting Started

### Prerequisites
- Node.js 18 or higher
- Backend running at `http://localhost:8080`

### Step 1 — Install dependencies

```bash
npm install
```

### Step 2 — Run the development server

```bash
npm run dev
```

Frontend runs at `http://localhost:3000`

---

## 📄 Pages

### `/` — Home
Automatically redirects to `/streams`

---

### `/login` — Login Page
- Email and password form
- On success saves JWT token and user to localStorage
- Redirects to `/streams`
- Shows error messages from backend (wrong password, email not verified etc)
- Guest button to browse without logging in

---

### `/register` — Register Page
- Username, email, password form
- On success shows message to check email for verification
- Validates all fields before submitting

---

### `/forgot-password` — Forgot Password
- Enter email to receive reset link via Mailtrap
- Shows success or error message

---

### `/streams` — Streams Grid
- Pinterest-style masonry grid of all LIVE streams
- Auto-refreshes every 5 seconds to show updated viewer counts
- Search bar in navbar filters streams by title
- Each card shows thumbnail, title, host, viewer count, like count, status badge
- Guests can see all streams without logging in

---

### `/streams/create` — Create Stream (User only)
- Title and description fields
- Thumbnail image upload with preview
- On submit — creates stream with JSON first then uploads thumbnail separately
- Redirects to stream detail page after creation

---

### `/streams/[id]` — Stream Detail Page
- Shows stream thumbnail or placeholder
- LIVE badge when stream is live
- Viewer count and like count (updates every 3 seconds)
- Your coin balance shown if logged in
- Like button
- Join/Leave stream button
  - Logged in users join as registered viewer
  - Guests type a name and join without account
- Gift panel — shows all gifts with emoji and coin cost
  - Gifts greyed out if you cannot afford them
  - Shows recent gifts sent on this stream
- Live chat section
  - Comment box for logged in users
  - Login prompt for guests
  - Comments update automatically
  - Delete your own comments

---

### `/profile` — Profile Page (User only)
- Shows username, email, role, coin balance
- Click avatar to upload new profile picture
- Edit username inline
- Two tabs:
  - **My Streams** — list of your streams with Start/End/Delete buttons
  - **Gift History** — all gifts you have sent with amounts

---

### `/admin` — Admin Dashboard (Admin only)
- Redirects to login if not admin
- Four tabs:
  - **Stats** — total users, live streams, total streams
  - **Users** — all users with coins, role, status. Add coins, deactivate, delete
  - **Streams** — all streams. Force end live streams, delete any stream
  - **Gifts** — create gifts, edit coin value, deactivate gifts

---

##  Auth Flow

```
User logs in
    ↓
Backend returns accessToken + user object
    ↓
Frontend saves both to localStorage
    ↓
Every request sends: Authorization: Bearer TOKEN
    ↓
User logs out → localStorage cleared → redirected to login
```

**Helper functions in `lib/auth.ts`:**

```typescript
saveToken(token)     — save JWT to localStorage
getToken()           — get current JWT
saveUser(user)       — save user object
getUser()            — get current user object
logout()             — clear everything
isLoggedIn()         — check if token exists
```

---

## API Connection

All requests go to `http://localhost:8080`

The frontend uses the native `fetch` API — no axios or other library needed.

**Example pattern used throughout the app:**
```typescript
const res = await fetch("http://localhost:8080/api/streams", {
  headers: {
    Authorization: `Bearer ${getToken()}`,
    "Content-Type": "application/json",
  },
})
const data = await res.json()
```

---

## Design

- Dark theme — black background `#0a0a0a`
- Purple gradient accent `#a855f7` to `#ec4899`
- No external UI library — all inline styles
- Responsive — works on mobile and desktop
- Live badge with red pulse on live streams
- Toast notifications for actions (liked, joined, gift sent)
- Auto-refresh on stream pages every 3 seconds

---

##  Navbar Behavior

| User Type | Sees |
|---|---|
| Not logged in | Login + Sign Up buttons |
| Logged in as USER | + Go Live button + Profile avatar + Logout |
| Logged in as ADMIN | Admin Panel button + Profile avatar + Logout |

Admin users do NOT see the Go Live button — they can only manage through the admin panel.

---

##  Notes

- Tokens expire after 24 hours — user is redirected to login automatically
- Guests can watch streams, join as viewers, but cannot like, comment, or send gifts
- Stream counts refresh every 3 seconds on the detail page
- Stream grid refreshes every 5 seconds on the main page
- All images served from backend at `http://localhost:8080/uploads/filename.jpg`
- Make sure backend is running before starting frontend
