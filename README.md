<div align="center">

# 🏢 AttendEase

### Modern Role-Based Office Attendance & Payroll Management System

[![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript_5-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB_Atlas-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![JWT](https://img.shields.io/badge/JWT_Auth-black?style=for-the-badge&logo=JSON%20web%20tokens)](https://jwt.io/)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed_on_Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

<br/>

> **AttendEase** is a comprehensive, production-ready attendance and HR platform built for modern offices and teams. It features dual role-based portals (Admin & Employee), GPS geofence validation, leave workflows, automated payroll calculation, PDF/Excel reports, and full audit tracking.

</div>

---

## 🚀 Key Features

### 👨‍💼 Admin Portal
- **Dashboard Analytics**: Real-time stats on employee attendance, daily check-ins, monthly summaries, and department breakdowns.
- **Employee Management**: Create, view, update, and manage employee accounts with custom Login IDs (`EMP-001`).
- **Attendance Monitoring**: View live attendance history, manual status overrides (Present, Absent, Half-Day, Late), and batch Excel/CSV export.
- **Leave Management**: Review leave requests (Sick, Casual, Annual, Unpaid) with one-click approve/reject actions and automated quota deductions.
- **Automated Payroll**: One-click monthly salary generation based on attendance records, automated late/absent deductions, custom bonuses, and PDF payslips.
- **Departments & Shifts**: Manage company departments and flexible shift schedules with late grace periods.
- **System Settings**: Office GPS coordinates configuration, geofence radius settings, and toggleable strict check-in enforcement.
- **Audit Logs**: Secure, immutable activity log tracking administrative changes, IP addresses, and timestamps.

### 👨‍💻 Employee Portal
- **Quick GPS Check-In / Check-Out**: Clock in with browser geolocation verification within the office geofence radius.
- **Personal Attendance Calendar**: Interactive monthly calendar with color-coded status badges and attendance statistics.
- **Leave Application**: Submit leave requests with reason and dates; track real-time approval status and remaining balances.
- **Payslip Downloads**: View monthly salary statements and download official PDF payslips.
- **In-App Notifications**: Real-time alerts for leave approvals, status changes, and HR announcements.

---

## 🛠 Tech Stack

| Component | Technology | Description |
|-----------|------------|-------------|
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript | High-performance, server-rendered React framework |
| **Styling** | Tailwind CSS v4, Lucide Icons | Clean, responsive UI with light neutral theme |
| **Database** | MongoDB Atlas, Mongoose v9 | Scalable cloud NoSQL database with connection caching |
| **Authentication** | JWT (`httpOnly` Cookies), Bcrypt.js | Secure, stateless authentication with role-based routing |
| **Location & Geofence** | HTML5 Geolocation API, Haversine formula | Accurate office distance verification |
| **Export Engines** | SheetJS (XLSX), jsPDF | Client & server-side Excel spreadsheets and PDF payslips |
| **Deployment** | Vercel | Seamless edge deployment with CI/CD integration |

---

## 🔑 Default Accounts

After database initialization, you can log in immediately:

| Role | Login ID / Email | Password | Access |
|------|-------------------|----------|--------|
| **Admin** | `admin` / `admin@attendance.com` | `admin` | Full system control |
| **Employee** | `EMP-001` / `employee` / `employee@attendance.com` | `employee` | Employee portal |

> **Note:** Employee login supports custom Employee IDs (`EMP-001`), usernames, or emails with case-insensitive matching.

---

## ⚙️ Quick Start (Local Setup)

### 1. Clone the repository
```bash
git clone https://github.com/vishwamharitwal/lean-office-attendance-ready-for-live-.git
cd lean-office-attendance-ready-for-live-
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env.local` file in the root directory:
```env
# MongoDB Atlas Connection
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/attendance?retryWrites=true&w=majority

# JWT Authentication
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# Geofencing (Optional)
STRICT_GEOFENCE=false
OFFICE_LAT=24.8607
OFFICE_LNG=67.0011
OFFICE_RADIUS_METERS=100
```

### 4. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Production Deployment (Vercel)

1. Push your code to GitHub:
   ```bash
   git push origin main
   ```
2. Import the project in [Vercel Dashboard](https://vercel.com).
3. Under **Settings ➔ Environment Variables**, configure:
   - `MONGODB_URI`: Your MongoDB Atlas URI
   - `JWT_SECRET`: A secure random secret string
   - `STRICT_GEOFENCE`: `false` (or `true` if geofencing is enabled)
4. Trigger deployment — Next.js 16 builds automatically with Turbopack!

---

## 📁 Project Structure

```
├── app/
│   ├── (auth)/             # Login & Register views
│   ├── (dashboard)/
│   │   ├── admin/          # Admin portal (Employees, Attendance, Leaves, Payroll, Reports)
│   │   └── employee/       # Employee portal (Check-in, History, Leaves, Payslips)
│   └── api/                # Dynamic REST API routes (Auth, Attendance, Payroll, etc.)
├── components/             # Reusable UI components, tables, modals & layouts
├── lib/                    # Database connection, JWT auth, geolocation, utils
├── models/                 # Mongoose schemas (User, Attendance, Leave, Payroll, etc.)
├── types/                  # TypeScript interface definitions
└── public/                 # Static assets & icons
```

---

<div align="center">

## 👨‍💻 Created & Maintained By

**Vishwam Haritwal**  
[GitHub Profile](https://github.com/vishwamharitwal) • [Repository](https://github.com/vishwamharitwal/lean-office-attendance-ready-for-live-)

</div>
