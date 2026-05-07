# StreamPro – Content Broadcasting System

A professional content broadcasting platform for educational institutions. Teachers upload subject-based content, principals review and approve/reject submissions, and students view live broadcasts on a public page.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS + shadcn/ui |
| Forms | React Hook Form + Zod |
| State | React Context API |
| Backend | Supabase (Auth, Database, Storage) |
| Animations | Framer Motion + Lottie |
| Routing | React Router v6 |
| Notifications | Sonner |

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- A Supabase project

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd content-streaming-platform

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials:
# VITE_SUPABASE_URL=https://your-project.supabase.co
# VITE_SUPABASE_ANON_KEY=your-anon-key

# Run the database migration
# Go to Supabase Dashboard > SQL Editor
# Paste and run: supabase/migrations/001_initial_schema.sql

# Start the dev server
npm run dev
```

### Build for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── principal/          # ApprovalModal
│   ├── shared/             # AuthForm, Sidebar, DashboardLayout, StatsCards
│   ├── teacher/            # UploadForm
│   └── ui/                 # shadcn/ui primitives
├── context/                # AuthContext (global auth state)
├── hooks/                  # Custom hooks
├── lib/                    # Supabase client, utilities
├── pages/
│   ├── Landing.jsx         # Public landing page
│   ├── live/               # Live broadcast viewer
│   ├── principal/          # Dashboard, Pending, AllContent
│   └── teacher/            # Dashboard, Upload, Content
├── services/               # API service layer
│   ├── auth.service.js
│   ├── content.service.js
│   └── approval.service.js
└── utils/                  # Shared utilities
```

## User Flows

### Teacher
1. Login → Teacher Dashboard (stats overview)
2. Upload Content → Fill form (title, subject, schedule, file) → Submit for approval
3. My Content → View all submissions with status (pending/approved/rejected)

### Principal
1. Login → Principal Dashboard (stats overview)
2. Pending Approvals → Review content → Approve or Reject (with mandatory reason)
3. All Content → Browse/filter entire content library by status & search

### Student (Public)
1. Visit `/live/:teacherId` → View currently active broadcasts
2. Auto-rotation between multiple active items
3. No authentication required

## Key Features

- **Role-based access control** with server-enforced RLS policies
- **File upload** with preview, type validation (JPG/PNG/GIF), and 10MB size limit
- **Content scheduling** with start/end time and rotation duration
- **Approval workflow** with mandatory rejection reasons
- **Live broadcast page** with auto-rotation and real-time countdown
- **Skeleton loading states** across all data-fetching pages
- **Empty states** for all list views
- **Error handling** with toast notifications
- **Responsive design** with mobile support

## Database Schema

### `profiles`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | References auth.users |
| email | TEXT | User email |
| full_name | TEXT | Display name |
| role | TEXT | 'teacher' or 'principal' |
| avatar_url | TEXT | Profile image URL |

### `content`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| teacher_id | UUID | References profiles |
| title | TEXT | Content title |
| subject | TEXT | Subject category |
| description | TEXT | Optional description |
| file_url | TEXT | Uploaded file URL |
| file_type | TEXT | 'image', 'video', 'document' |
| status | TEXT | 'pending', 'approved', 'rejected' |
| rejection_reason | TEXT | Reason for rejection |
| start_time | TIMESTAMPTZ | Broadcast start |
| end_time | TIMESTAMPTZ | Broadcast end |
| rotation_duration | INTEGER | Seconds on screen |

## Security

- All database access is protected by Row Level Security (RLS)
- Teachers can only CRUD their own content
- Principals can read all content and update status
- Public users can only view approved + currently live content
- Authentication tokens are managed by Supabase client (auto-refresh)

## License

Private – All rights reserved.
