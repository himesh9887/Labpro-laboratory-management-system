# LabPro LIMS — Enterprise Super Admin & Multi-Tenant System

## Phase 1 — Core Wiring
- [x] Add `SuperAdminProvider` to `main.jsx`
- [x] Add `/admin/*` routes + `AdminProtectedRoute` to `App.jsx`
- [x] Remove public `/register` route (registration only via Super Admin)
- [x] Create `AdminProtectedRoute` component

## Phase 2 — Shared Admin UI Components
- [x] `AdminPageHeader`, `AdminModal`, `StatusPill`, `AdminStatCard`, `AdminConfirmDialog`
- [x] `src/data/defaultStaff.js` (shared staff defaults)

## Phase 3 — Admin Pages
- [x] AdminLabsPage (table + create/edit/view/reset-password/extend/backup/delete)
- [x] AdminSubscriptionsPage
- [x] AdminPaymentsPage
- [x] AdminActivityPage
- [x] AdminLoginHistoryPage
- [x] AdminNotificationsPage
- [x] AdminBackupPage
- [x] AdminSettingsPage

## Phase 4 — Admin Navigation (Mobile + Desktop)
- [x] `AdminMobileDrawer` (hamburger menu)
- [x] Update `AdminLayout` to include mobile drawer

## Phase 5 — Unified Login (Admin first, then Laboratory)
- [x] Rewrite `LoginPage` — remove register tab, check admin then lab

## Phase 6 — Lab App Bug Fixes
- [x] DashboardPage greeting uses logged-in admin name
- [x] GlobalSearch patient link — remove broken `/patients` route
- [x] Modal ESC close + body scroll lock
- [x] Topbar user dropdown — click-based (works on touch)
- [x] Invoice / Report preview branding uses current lab profile
- [x] LabService — reject suspended / deleted / expired accounts on login
- [x] AdminService.createLab — auto-seed isolated lab storage (settings, tests, staff)

## Phase 7 — QA
- [x] Production build passes (no compile/runtime errors)

