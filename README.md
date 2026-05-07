# StreamPro – Content Broadcasting System

A professional content broadcasting platform for educational institutions. Teachers upload subject-based content, principals review and approve/reject submissions, and students view live broadcasts on a public page.

![React](https://img.shields.io/badge/React-18-blue) ![Vite](https://img.shields.io/badge/Vite-5-purple) ![Tailwind](https://img.shields.io/badge/Tailwind-3-cyan) ![Supabase](https://img.shields.io/badge/Supabase-Auth%2BDB-green)

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [User Flows & Roles](#user-flows--roles)
- [Authentication & Security](#authentication--security)
- [Frontend Architecture](#frontend-architecture)
- [Pages & Components](#pages--components)
- [API Service Layer](#api-service-layer)
- [Database Schema](#database-schema)
- [State Management](#state-management)
- [Form Handling & Validation](#form-handling--validation)
- [Performance Optimizations](#performance-optimizations)
- [Edge Case Handling](#edge-case-handling)
- [UI/UX Features](#uiux-features)

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | React 18 + Vite | SPA with fast HMR |
| Styling | Tailwind CSS + shadcn/ui | Utility-first CSS + accessible components |
| Forms | React Hook Form + Zod | Type-safe form validation |
| State | React Context API | Global auth state |
| Backend | Supabase | Auth, PostgreSQL, Storage |
| Animations | Framer Motion + Lottie | Page transitions + decorative animations |
| Routing | React Router v6 | Client-side routing |
| Notifications | Sonner | Toast notifications |
| Date Utils | date-fns | Date formatting |
| HTTP | @supabase/supabase-js | Built-in REST client |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- A Supabase project ([create one free](https://supabase.com))

### Installation

```bash
# 1. Clone the repository
git clone <repository-url>
cd content-streaming-platform

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials:
#   VITE_SUPABASE_URL=https://your-project.supabase.co
#   VITE_SUPABASE_ANON_KEY=your-anon-key

# 4. Run the database migrations (in order)
# Go to Supabase Dashboard > SQL Editor and run:
#   supabase/migrations/001_initial_schema.sql
#   supabase/migrations/002_public_views.sql
#   supabase/migrations/003_viewer_role.sql

# 5. Start the dev server
npm run dev
```

### Build for Production

```bash
npm run build
npm run preview
```

### Testing & Admin Setup

To facilitate easy testing of all platform features without database access, a temporary bootstrap admin panel is included.

**How to test:**
1. Navigate to `/admin/setup` (e.g., `http://localhost:5173/admin/setup`).
2. This page allows you to bypass regular auth flows and directly manage the `profiles` database table.
3. You can instantly promote any user to **Principal** or **Teacher** with a single click.
4. **Pre-configured Test Accounts:**
   - **Principal:** `subhajitpathak9900@gmail.com` | Password: `12345678`
   - **Teacher:** `subhajitofficial9900@gmail.com` | Password: `00000000`
5. *Note: Ensure you remove or secure the `/admin/setup` route before deploying to production.*

---

## Project Structure

```
src/
├── components/
│   ├── principal/              # Principal-specific components
│   │   └── ApprovalModal.jsx     # Approve/reject dialog with mandatory reason
│   ├── shared/                 # Shared across roles
│   │   ├── AuthForm.jsx          # Login + viewer signup page
│   │   ├── DashboardLayout.jsx   # Protected layout wrapper with sidebar
│   │   ├── RootRedirect.jsx      # Auth-aware root redirect
│   │   ├── Sidebar.jsx           # Role-based navigation sidebar
│   │   └── StatsCards.jsx        # Reusable 4-card stats grid
│   ├── teacher/                # Teacher-specific components
│   │   └── UploadForm.jsx        # Multi-field upload form with preview
│   └── ui/                     # shadcn/ui primitives
│       ├── button.jsx, card.jsx, input.jsx, table.jsx
│       ├── dialog.jsx, select.jsx, badge.jsx
│       ├── form.jsx, label.jsx, textarea.jsx
│       ├── skeleton.jsx, sonner.jsx
│       └── ...
├── context/
│   └── AuthContext.jsx         # Global auth state + login/logout/refresh
├── hooks/                      # Custom hooks (extensible)
├── lib/
│   ├── supabase.js             # Supabase client initialization
│   └── utils.js                # Utility functions (cn for class merging)
├── pages/
│   ├── Landing.jsx             # Public marketing landing page
│   ├── live/
│   │   └── LiveBroadcast.jsx     # Public broadcast viewer (view-gated)
│   ├── principal/
│   │   ├── AllContent.jsx        # Filterable content library
│   │   ├── Dashboard.jsx         # Principal overview dashboard
│   │   ├── ManageTeachers.jsx    # Staff account creation
│   │   └── Pending.jsx           # Pending approval queue
│   ├── shared/
│   │   └── Profile.jsx           # Profile edit page (all roles)
│   └── teacher/
│       ├── Content.jsx           # Teacher's content list
│       ├── Dashboard.jsx         # Teacher overview dashboard
│       └── Upload.jsx            # Upload page wrapper
├── services/                   # API service layer (NO direct calls in components)
│   ├── approval.service.js       # Approval workflow operations
│   ├── auth.service.js           # Authentication + profile management
│   ├── content.service.js        # Content CRUD + stats
│   └── viewer.service.js         # View tracking for free-tier gating
├── utils/                      # Shared utilities
├── App.jsx                     # Route definitions
├── main.jsx                    # Entry point + providers
└── globals.css                 # Tailwind directives + global styles
```

---

## User Flows & Roles

### Three Roles

| Role | Access | Created By |
|------|--------|------------|
| **Principal** | Full admin: approve/reject, manage staff, view all content | Initial setup or by another principal |
| **Teacher** | Upload content, view own submissions, check status | Created by a principal via Manage Staff |
| **Viewer** | Watch live broadcasts (unlimited when logged in) | Self-registration on the auth page |

> **Important:** Teacher and Principal accounts cannot be created publicly. Only principals can create staff accounts via the "Manage Staff" page. Public signup only creates Viewer accounts.

### Principal Flow

1. Login → Principal Dashboard (personalized greeting, stats)
2. **Pending Approvals** → Review content → Approve or Reject (mandatory reason via modal)
3. **All Content** → Browse/filter by status + search
4. **Manage Staff** → Create teacher/principal accounts, view staff list
5. **Profile** → Edit display name and avatar

### Teacher Flow

1. Login → Teacher Dashboard (personalized greeting, quick actions)
2. **Upload Content** → Fill form (title, subject, description, schedule, file) → Submit
3. **My Content** → View all submissions with status + rejection feedback
4. **Profile** → Edit display name and avatar

### Viewer Flow

1. Public signup → Create viewer account
2. Login → Redirected to `/live/all`
3. Watch unlimited broadcasts
4. **Profile** → Edit display name

### Anonymous User Flow

1. Visit `/live/:teacherId` → Watch up to 10 unique content items free
2. After 10 views → Paywall screen → Sign up as viewer for unlimited access
3. View count is tracked server-side (tamper-proof via browser fingerprint)

---

## Authentication & Security

### Authentication Flow

```
1. User enters credentials on /auth
2. Supabase Auth validates → returns session JWT
3. AuthContext fetches profile from `profiles` table
4. Role-based redirect: principal→/principal/dashboard, teacher→/teacher/dashboard, viewer→/live/all
5. JWT auto-refreshes via Supabase client
```

### Route Protection

- **DashboardLayout** component wraps all protected pages
- Checks `user` is authenticated and `user.profile.role` matches `allowedRole`
- Redirects unauthenticated users to `/auth`
- Redirects role-mismatched users to their correct dashboard
- Shows skeleton loading state during auth check

### Row Level Security (RLS)

All authorization is enforced **server-side** via PostgreSQL RLS policies:

| Table | Policy |
|-------|--------|
| `profiles` | Users can read all, update only their own |
| `content` | Teachers CRUD own; principals read all + update status; anon read approved+live only |
| `public_views` | Anyone can insert/select; NO update/delete (tamper-proof) |
| `storage` | Authenticated upload; public read; owner delete |

---

## Frontend Architecture

### Separation of Concerns

```
Components (UI) ← Pages (Composition) ← Services (API) ← Supabase (Backend)
```

- **Components** render UI, handle user interactions
- **Pages** compose components, manage page-level state
- **Services** encapsulate all API calls (never called directly in components)
- **Context** provides global state (auth only)

### Key Design Decisions

1. **No prop drilling** — AuthContext provides user data globally
2. **Service layer** — All Supabase calls abstracted behind `services/*.js`
3. **Replaceable API** — Swap Supabase services with any REST/GraphQL backend
4. **Role-aware layout** — Single `DashboardLayout` + `Sidebar` adapts to all roles
5. **Reusable components** — `StatsCards`, `ApprovalModal`, `UploadForm` used across pages

---

## Pages & Components

### Reusable Components

| Component | Used By | Purpose |
|-----------|---------|---------|
| `StatsCards` | Teacher & Principal Dashboard | 4-card grid: total, pending, approved, rejected |
| `DashboardLayout` | All protected pages | Sidebar + content wrapper + auth guard |
| `Sidebar` | All protected pages | Role-aware navigation links |
| `ApprovalModal` | Principal Pending | Approve/reject dialog with reason input |
| `UploadForm` | Teacher Upload | Multi-field form with file preview + validation |

---

## API Service Layer

### `auth.service.js`

| Method | Description |
|--------|-------------|
| `login(email, password)` | Sign in with credentials |
| `signup(email, password, role, fullName)` | Create new account |
| `logout()` | Sign out and clear session |
| `getCurrentUser()` | Get auth user + profile |
| `getSession()` | Get current session |
| `updateProfile(userId, updates)` | Update profile fields |

### `content.service.js`

| Method | Description |
|--------|-------------|
| `uploadContent(data, file)` | Upload file + save metadata |
| `getMyContent(teacherId)` | Get teacher's own content |
| `getPendingContent()` | Get all pending items |
| `getAllContent(filters)` | Filter by status + search |
| `updateContentStatus(id, status, reason)` | Approve/reject |
| `deleteContent(id)` | Delete a content item |
| `getLiveContent(teacherId)` | Get currently broadcasting content |
| `getStats(role, userId)` | Get status counts |

### `approval.service.js`

| Method | Description |
|--------|-------------|
| `getPendingContent()` | Get pending items |
| `approveContent(contentId)` | Set status to approved |
| `rejectContent(contentId, reason)` | Set status to rejected + reason |
| `getApprovalStats()` | Get approval counts |

### `viewer.service.js`

| Method | Description |
|--------|-------------|
| `recordView(contentId)` | Record a content view |
| `getViewCount()` | Get viewer's total unique views |
| `checkViewAccess()` | Check if free tier exceeded |

---

## Database Schema

### `profiles`

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | References auth.users (PK) |
| email | TEXT | User email |
| full_name | TEXT | Display name |
| role | TEXT | `teacher`, `principal`, or `viewer` |
| avatar_url | TEXT | Profile image URL |
| created_at | TIMESTAMPTZ | Auto-set |
| updated_at | TIMESTAMPTZ | Auto-updated via trigger |

### `content`

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| teacher_id | UUID | FK → profiles |
| title | TEXT | Content title (required) |
| subject | TEXT | Subject category |
| description | TEXT | Optional description |
| file_url | TEXT | Uploaded file URL |
| file_type | TEXT | `image`, `video`, `document` |
| status | TEXT | `pending`, `approved`, `rejected` |
| rejection_reason | TEXT | Why it was rejected |
| start_time | TIMESTAMPTZ | Broadcast start |
| end_time | TIMESTAMPTZ | Broadcast end |
| rotation_duration | INTEGER | Seconds on screen |

### `public_views`

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| viewer_fingerprint | TEXT | Browser fingerprint hash |
| content_id | UUID | FK → content |
| viewed_at | TIMESTAMPTZ | When viewed |

---

## State Management

- **Global**: React Context (AuthContext) — `user`, `login`, `logout`, `refreshUser`
- **Local**: `useState` for page-specific data (content lists, filters, modals)
- **Forms**: React Hook Form manages form state independently
- **No Redux/Zustand** — complexity doesn't warrant it
- **Derived state** — filtered lists computed from base data, not stored separately

---

## Form Handling & Validation

| Form | Library | Validation |
|------|---------|------------|
| Login | React Hook Form + Zod | Email format, password min 6 |
| Signup | React Hook Form + Zod | Email, password, name required |
| Upload | React Hook Form + Zod | Title, subject, schedule required; file type JPG/PNG/GIF; max 10MB; end > start |
| Profile | React Hook Form + Zod | Name min 2 chars; avatar URL format |
| Create Staff | React Hook Form + Zod | Email, password, name, role |
| Rejection | Manual state | Reason is mandatory (enforced in modal) |

---

## Performance Optimizations

- **Skeleton loaders** on all data-fetching pages (no layout shift)
- **Debounced search** (300ms) on AllContent page
- **Memoized callbacks** (`useCallback`) for filter-dependent fetches
- **Image lazy loading** via native browser behavior
- **Minimal re-renders** — state kept close to where it's used
- **Vite** for fast builds and HMR

---

## Edge Case Handling

| Scenario | Handling |
|----------|---------|
| Empty data | Dedicated empty state UI with helpful message |
| API errors | Toast notifications, UI doesn't break |
| Slow responses | Loading spinners/skeletons |
| Invalid login | Toast error with message from Supabase |
| Upload failure | Toast error, form stays filled |
| Invalid file type | Client-side validation + toast |
| File too large | Client-side 10MB check + toast |
| Broken API response | Try-catch in all services, graceful fallback |
| Unauthorized access | DashboardLayout redirects to correct page |
| Role mismatch | Automatic redirect to user's dashboard |
| View limit exceeded | Paywall screen with sign-up CTA |

---

## UI/UX Features

- ✅ **Fully Responsive** mobile-first layout (highly optimized for iPads/tablets)
- ✅ **Real-time Live Chat** and **Like system** on live broadcasts
- ✅ **Watch History** tracking and engagement metrics
- ✅ **Role-aware** navigation and page access
- ✅ **Personalized greetings** (time-based + user name)
- ✅ **Skeleton loaders** on all tables and stat cards
- ✅ **Empty states** with icons and helpful text
- ✅ **Toast notifications** for all actions
- ✅ **File preview** before upload
- ✅ **Modal dialogs** for approval/rejection and staff creation
- ✅ **Status badges** (color-coded: pending/approved/rejected)
- ✅ **Gradient hero banners** on dashboards
- ✅ **Hover animations** on action cards
- ✅ **Dark-themed** auth page with glassmorphism
- ✅ **Lottie animations** on landing and auth pages
- ✅ **Copy-to-clipboard** for created credentials
- ✅ **View counter** on live broadcast page

---

## License

Private – All rights reserved.
