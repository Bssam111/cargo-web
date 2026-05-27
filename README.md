# CarGo Admin & Employee Portal

A Next.js 14 web portal for CarGo platform operations — separate from the Flutter mobile app.

## Roles

| Role | Access |
|---|---|
| `admin` | Full platform management |
| `employee` | Hub operations only |

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.local.example .env.local
# Fill in Firebase config values from Firebase Console

# 3. Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## First-Time Setup

### Create Admin User

1. Create a user in Firebase Auth (email/password)
2. In Firestore, create `users/{uid}` with:
   ```json
   {
     "email": "admin@cargo.sa",
     "fullName": "Admin Name",
     "phone": "+966xxxxxxxxx",
     "role": "admin",
     "isActive": true,
     "createdAt": "<timestamp>"
   }
   ```
3. Sign in at `/login`

### Create Employee Users

Use the **Employees** page in the Admin portal to create employee accounts.

## Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules --project car-rental-app-d5d67
```

## Project Structure

```
cargo-portal/
├── app/
│   ├── (auth)/login/         # Login page
│   ├── admin/                # Admin pages
│   │   ├── page.tsx          # Dashboard
│   │   ├── users/            # User management
│   │   ├── cars/             # Car management
│   │   ├── bookings/         # Booking management
│   │   ├── earnings/         # Revenue & transactions
│   │   ├── payouts/          # Payout management
│   │   ├── hub/              # Hub overview
│   │   └── employees/        # Employee management
│   └── employee/             # Employee pages
│       ├── page.tsx          # Dashboard
│       ├── dropoffs/         # Confirm owner drop-offs
│       ├── ready-cars/       # Mark cars as ready
│       ├── pickups/          # Confirm renter pickups
│       ├── returns/          # Confirm renter returns
│       ├── damage-reports/   # Damage management
│       └── inventory/        # Hub inventory
├── components/
│   ├── ui/                   # Base UI components
│   ├── shared/               # Sidebar, Header, StatCard
│   └── employee/             # InspectionForm, PickupModal, ReturnModal
├── contexts/AuthContext.tsx  # Auth state + role
├── services/                 # Firestore operations
├── types/index.ts            # TypeScript interfaces
├── lib/firebase.ts           # Firebase initialization
├── lib/utils.ts              # Formatters and helpers
└── middleware.ts             # Route protection
```

## Hub Vehicle Lifecycle

```
Owner adds car → awaiting_owner_dropoff
     ↓  (employee confirms arrival)
pending_inspection → at_hub
     ↓  (employee marks ready)
ready_for_rental
     ↓  (employee confirms renter pickup)
in_trip
     ↓  (employee confirms return)
completed + ready_for_rental / maintenance
```

## Security Rules

- **Admins**: full read/write on all collections
- **Employees**: can update car status, create inspections, confirm pickups/returns
- **Owners**: cannot self-mark hub delivery — employees only
- **Renters**: cannot self-confirm pickup/return
