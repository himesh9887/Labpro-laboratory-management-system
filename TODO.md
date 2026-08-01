# LabPro LIMS — Authentication Architecture Fix

## Progress Tracker

### Step 1 — Services Layer
- [x] `adminService.js`: store admin name; `verifyAdminLogin` returns name; `createLab` supports startDate + status
- [x] `adminService.js`: add `savePlatformSettings`/`getPlatformSettings`
- [x] `adminService.js`: fix backup methods (`createBackup`, `getBackupHistory`, `importBackup`, `restoreBackup`)
- [x] `labService.js`: reject Suspended / Inactive / Expired / Deleted labs at login (already implemented)

### Step 2 — Contexts
- [x] `SuperAdminContext.jsx`: session stores admin name; expose `superAdminCreated` flag
- [x] `AuthContext.jsx`: session restore rejects Suspended / Deleted / Inactive labs

### Step 3 — Authentication Pages (single unified login)
- [ ] `LoginPage.jsx`: unified login — try Super Admin first, then Laboratory, else "Invalid Email or Password." Remove any register/create-account button.
- [ ] `SetupPage.jsx`: add Administrator Name field; button label "Create Super Admin"; mark superAdminCreated

### Step 4 — Routing & Route Guards
- [ ] `App.jsx`: remove `/admin/login` (redirect to `/login`); `/setup` only when no admin; `/login` only when admin exists; loading gate; catch-all by state
- [ ] `AdminProtectedRoute.jsx`: redirect to `/login`
- [ ] `AdminSidebar.jsx` + `AdminMobileDrawer.jsx`: sign-out navigates to `/login`

### Step 5 — Lab Management (Admin)
- [ ] `AdminLabsPage.jsx`: status filter dropdown; Status field in create form; startDate wiring

### Step 6 — Admin Pages bug fixes
- [ ] `AdminSettingsPage.jsx`: wire to `savePlatformSettings`/`getPlatformSettings`; default self-registration OFF
- [ ] `AdminBackupPage.jsx`: works with fixed service methods

### Step 7 — Final QA
- [ ] `npm run build` passes with ZERO errors
- [ ] `npm run lint` passes with ZERO errors
- [ ] Verify full auth flow (setup → login → admin/lab dashboards → logout → session)

