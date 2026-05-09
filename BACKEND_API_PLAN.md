# Backend/API Focus Plan (for FE Integration Parallel Work)

This plan aligns with the handoff: backend/API implementation here while frontend integration proceeds in parallel.

## 1) API domains to implement first

1. **Auth & Role Access**
   - Login, refresh, logout
   - Current user profile
   - Role claims (`admin`, `teacher`, `student`, `parent`)

2. **Admissions**
   - Submit application
   - List applications (admin)
   - Application detail and status updates

3. **Attendance**
   - Teacher clock-in / clock-out
   - Teacher attendance history
   - Admin surveillance logs
   - Admin anomaly logs
   - Attendance policy read/update

4. **Fees/Payments**
   - Fee invoice listing
   - Payment initialization
   - Payment webhook + verification
   - Receipt/history retrieval

## 2) Proposed endpoint sketch (v1)

### Auth
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`

### Admissions
- `POST /api/v1/admissions`
- `GET /api/v1/admin/admissions`
- `GET /api/v1/admin/admissions/:id`
- `PATCH /api/v1/admin/admissions/:id`

### Attendance
- `POST /api/v1/teacher/attendance/clock-in`
- `POST /api/v1/teacher/attendance/clock-out`
- `GET /api/v1/teacher/attendance/history`
- `GET /api/v1/admin/attendance/surveillance`
- `GET /api/v1/admin/attendance/anomalies`
- `GET /api/v1/admin/attendance/policy`
- `PUT /api/v1/admin/attendance/policy`

### Fees/Payments
- `GET /api/v1/parent/fees`
- `POST /api/v1/parent/payments/init`
- `POST /api/v1/payments/webhook`
- `GET /api/v1/parent/payments/history`

## 3) Data contracts FE will need

- `AuthUser`: `id`, `email`, `fullName`, `role`, `permissions[]`
- `AdmissionRecord`: applicant + class + status + timestamps
- `AttendanceLog`: person, date, timeIn, timeOut, sourceIp, outcome, validation
- `AttendancePolicy`: sign-in/out windows, grace rules, network/geofence settings
- `PaymentRecord`: invoice, amount, status, providerRef, paidAt

## 4) Backend delivery order (short sprints)

1. Sprint 1: Auth + role guards + `/auth/me`
2. Sprint 2: Admissions submit/list/detail/update
3. Sprint 3: Teacher clockin/clockout + history
4. Sprint 4: Admin surveillance + anomalies + policy
5. Sprint 5: Fee/payment init + webhook + history

## 5) Parallel contract workflow with FE teammate

- Publish OpenAPI spec early (`openapi.yaml`) and update incrementally.
- Freeze response envelopes (`{ data, meta, error }`) before FE hookup.
- Use versioned endpoints and additive changes only during integration.
- Provide seeded dev data and a Postman/Bruno collection.

## 6) Definition of done for each endpoint

- AuthZ checks by role
- Validation + typed error responses
- Unit/integration tests
- API docs updated
- Example payloads shared with FE
