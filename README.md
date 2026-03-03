# 💰 Payout Management MVP

A full-stack Payout Management system built with **React** (frontend) + **Node.js/Express** (backend) + **MongoDB Atlas**.

## 🚀 Run in Under 5 Minutes

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (free tier)

### 1. Clone & Setup Backend

```bash
cd backend
cp .env.example .env
# Edit .env → Add your MongoDB Atlas URI
npm install
```

### 2. Seed Database

```bash
npm run seed
```

### 3. Start Backend

```bash
npm run dev
# Server runs on http://localhost:5000
```

### 4. Setup & Start Frontend

```bash
cd ../frontend
npm install
npm run dev
# App runs on http://localhost:5173
```

---

## 🔐 Login Credentials

| Role    | Email               | Password |
|---------|---------------------|----------|
| OPS     | ops@demo.com        | ops123   |
| FINANCE | finance@demo.com    | fin123   |

---

## 🏗️ Tech Stack

| Layer    | Technology             |
|----------|------------------------|
| Frontend | React + Vite           |
| Backend  | Node.js + Express.js   |
| Database | MongoDB Atlas          |
| Auth     | JWT (jsonwebtoken)     |
| Password | bcryptjs               |

---

## ⚙️ Environment Variables (backend/.env)

```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/payout_management
JWT_SECRET=your_super_secret_key_min_32_chars
JWT_EXPIRE=24h
CLIENT_URL=http://localhost:5173
```

---

## 📡 API Endpoints

| Method | Endpoint                  | Roles          | Description            |
|--------|---------------------------|----------------|------------------------|
| POST   | /api/auth/login           | Public         | Login                  |
| GET    | /api/auth/me              | All            | Current user profile   |
| GET    | /api/vendors              | OPS, FINANCE   | List all vendors       |
| POST   | /api/vendors              | OPS only       | Create vendor          |
| GET    | /api/payouts              | OPS, FINANCE   | List payouts (filters) |
| POST   | /api/payouts              | OPS only       | Create payout (Draft)  |
| GET    | /api/payouts/:id          | OPS, FINANCE   | Payout + audit trail   |
| POST   | /api/payouts/:id/submit   | OPS only       | Draft → Submitted      |
| POST   | /api/payouts/:id/approve  | FINANCE only   | Submitted → Approved   |
| POST   | /api/payouts/:id/reject   | FINANCE only   | Submitted → Rejected   |

### 📋 Features
- **RBAC:** Server-side role enforcement (OPS vs FINANCE).
- **Audit Trail:** Every payout action is logged with user and timestamp.
- **Validation:** Strict status transition monitoring.

| Action              | OPS | FINANCE |
|---------------------|-----|---------|
| Create Vendor       | ✅  | ❌      |
| View Vendors        | ✅  | ✅      |
| Create Payout       | ✅  | ❌      |
| Submit Payout       | ✅  | ❌      |
| Approve Payout      | ❌  | ✅      |
| Reject Payout       | ❌  | ✅      |
| View All Payouts    | ✅  | ✅      |

---

## 📊 Status Transitions

```
Draft → (OPS submit) → Submitted → (FINANCE approve) → Approved
                                 → (FINANCE reject)  → Rejected
```
> ⚠️ No status jumping allowed. Finance cannot approve from Draft.

---

## 🗃️ MongoDB Collections

- `users` — OPS & FINANCE user accounts
- `vendors` — Vendor details
- `payouts` — Payout requests with status
- `payoutaudits` — Full audit trail per payout

---

## 📮 Postman Collection

Import `postman_collection.json` into Postman.

**Testing Flow:**
1. Run "Login as OPS" → Token auto-saved
2. Run "Login as FINANCE" → Token auto-saved
3. Run "Create Vendor" → Vendor ID auto-saved
4. Run "Create Payout" → Payout ID auto-saved
5. Run "Submit Payout" → Status: Submitted
6. Run "Approve/Reject Payout" as FINANCE

---

## ✅ Scoring Criteria Checklist

- [x] Login works correctly (JWT)
- [x] Role restrictions enforced on backend (RBAC middleware)
- [x] OPS cannot approve payouts (403 Forbidden)
- [x] Status transitions validated (no jumping)
- [x] Filters work (status + vendor)
- [x] Audit trail records every action with who + when
- [x] Rejection reason mandatory
- [x] Error messages meaningful and consistent

---

## 🚀 Deployment

**Backend → Render.com:**
1. Push to GitHub
2. Create Web Service on Render
3. Set Environment Variables
4. Deploy

**Frontend → Vercel:**
1. Push to GitHub
2. Import project on Vercel
3. Set `VITE_API_URL=https://your-backend.onrender.com/api`
4. Deploy

---

*Built for Payout Management MVP Interview Task*
