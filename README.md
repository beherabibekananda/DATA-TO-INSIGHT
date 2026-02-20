# 📊 Data To Insight — Student Analytics Platform

> **Transforming raw student data into actionable insights** through intelligent analytics, risk prediction, and AI-powered recommendations.

![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?logo=supabase&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss&logoColor=white)
![Recharts](https://img.shields.io/badge/Recharts-2.12-FF6384?logo=chart.js&logoColor=white)

---

## 🎯 Project Overview

**Data To Insight** is a full-stack student data analytics platform designed to help educational institutions monitor student performance, predict dropout risks, and generate AI-driven intervention strategies — all from a single, unified dashboard.

The platform follows a complete **Data → Processing → Insight** pipeline:

```
📁 Raw Data (CSV/Excel Upload)
    → 🗄️ Database Storage (Supabase PostgreSQL)
        → ⚙️ Analytics Processing (Risk Scoring, Trend Analysis)
            → 📊 Interactive Visualizations (Charts, Heatmaps)
                → 🧠 AI Insights & Recommendations
```

---

## ✨ Key Features

### 📈 Analytics Dashboard
- **Real-time statistics** — Total students, at-risk count, department count, average GPA
- **Performance trend charts** — GPA and attendance trends across academic years
- **Department distribution** — Pie charts showing student distribution by department
- **Risk heatmap** — Department × Year matrix showing at-risk percentages

### 🔮 Predictive Risk Analysis
- **Multi-factor risk scoring** — Weighted model using GPA (40%), Attendance (30%), Engagement (20%), Year Standing (10%)
- **Batch predictions** — Analyze risk for all students simultaneously
- **Scatter plot visualization** — GPA vs Risk Score correlation
- **Department risk comparison** — Bar charts comparing risk levels across departments
- **Feature importance radar** — Visual breakdown of risk factor weights

### 🧠 AI-Powered Insights
- **Automated alerts** — Low attendance warnings, high-risk student identification
- **Academic performance flags** — Students below 2.0 GPA flagged for probation
- **High performer recognition** — Students with GPA ≥ 3.5 and attendance ≥ 85% identified
- **Department-level analysis** — Departments needing curriculum review highlighted
- **Actionable recommendations** — Specific intervention strategies for each insight

### 🛡️ Intervention Management
- **AI-generated intervention plans** — Based on real student metrics
- **Program creation** — Create and manage intervention programs
- **Priority-based recommendations** — Categorized by severity (critical, high, medium, low)

### 🏫 Department Analytics
- **Detailed department breakdowns** — Per-department student performance metrics
- **Time-period filtering** — Analyze data by custom time ranges
- **Excel export** — Download analytics data for offline analysis

### 👥 User Management
- **Role-based access** — Admin and regular user roles
- **Admin dashboard** — Full student management, user approval, CRUD operations
- **Public student view** — Searchable student directory with filters
- **User registration & approval** — New users require admin approval
- **Profile management** — Users can complete and update their profiles

### 📂 Data Management
- **CSV/Excel file upload** — Bulk import student data via file upload
- **Manual student entry** — Add/edit/delete students through forms
- **Real-time sync** — Live updates via Supabase real-time subscriptions
- **Sample data fallback** — 65 pre-loaded students across 8 departments for demo/offline use

---

## 🗂️ Project Structure

```
Data To Insight Project/
├── public/                       # Static assets
├── src/
│   ├── api/                      # API service layer
│   │   ├── studentAnalytics.js   # Performance trends, risk heatmaps, department stats
│   │   ├── predictiveAPI.js      # Risk scoring, batch predictions, AI insights
│   │   └── geographicAPI.js      # Department distribution & demographics
│   ├── components/
│   │   ├── Dashboard.jsx         # Main analytics dashboard with charts
│   │   ├── RiskAnalysis.jsx      # Predictive risk analysis & model metrics
│   │   ├── InterventionPanel.jsx # AI insights & intervention management
│   │   ├── DepartmentAnalytics.jsx # Detailed department-level analytics
│   │   ├── PublicStudentView.jsx # Public searchable student directory
│   │   ├── AdminDashboard.jsx    # Admin panel for student/user management
│   │   ├── AdminLogin.jsx        # Secure admin authentication
│   │   ├── AuthPage.jsx          # User login & registration
│   │   ├── StudentProfile.jsx    # Individual student detail view
│   │   ├── StudentManagementForm.jsx # Add/edit student forms
│   │   ├── UploadStudentsDataFile.jsx # CSV/Excel data upload
│   │   ├── Sidebar.jsx           # Navigation sidebar
│   │   ├── UserDashboard.jsx     # Regular user dashboard
│   │   ├── CreateUserForm.jsx    # Admin user creation form
│   │   ├── AdminApprovalPanel.jsx # User approval management
│   │   ├── ApprovalRequestForm.jsx # Data change request forms
│   │   ├── UserRequestsView.jsx  # View pending requests
│   │   ├── ProfileCompletion.jsx # User profile setup
│   │   └── ui/                   # shadcn/ui component library
│   ├── data/
│   │   └── sampleStudents.js     # 65 pre-loaded sample students (8 departments)
│   ├── hooks/
│   │   └── useAuth.js            # Authentication hook
│   ├── integrations/
│   │   └── supabase/
│   │       └── client.js         # Supabase client configuration
│   ├── App.jsx                   # Main app with routing
│   ├── main.jsx                  # Application entry point
│   └── index.css                 # Global styles
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18 | Component-based UI |
| **Build Tool** | Vite 5 | Fast development & bundling |
| **Styling** | TailwindCSS 3 | Utility-first CSS framework |
| **UI Components** | shadcn/ui + Radix UI | Accessible, customizable components |
| **Charts** | Recharts | Interactive data visualizations |
| **Icons** | Lucide React | Modern icon library |
| **Database** | Supabase (PostgreSQL) | Backend-as-a-service with real-time |
| **Authentication** | Supabase Auth | Secure user authentication |
| **File Processing** | xlsx | Excel/CSV file parsing |
| **Routing** | React Router v6 | Client-side navigation |
| **Form Handling** | React Hook Form + Zod | Validation and form management |
| **Date Utilities** | date-fns | Date formatting and manipulation |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- A **Supabase** project (optional — the app works with sample data if Supabase is offline)

### Installation

```bash
# Step 1: Clone the repository
git clone <repository-url>

# Step 2: Navigate to the project directory
cd "Data To Insight Project"

# Step 3: Install dependencies
npm install

# Step 4: Start the development server
npm run dev
```

The app will be available at **http://localhost:8080**

### Environment Setup (Optional)

If you have a Supabase project, configure the connection in `src/integrations/supabase/client.js`:

```javascript
const SUPABASE_URL = "https://your-project.supabase.co";
const SUPABASE_ANON_KEY = "your-anon-key";
```

> **Note:** The app includes 65 sample students across 8 departments as fallback data, so it works perfectly even without a Supabase connection.

---

## 📖 How to Use — Complete User Guide

Once the app is running at `http://localhost:8080`, here's how each type of user interacts with the platform:

---

### 🌐 Step 1: Public View (No Login Required)

When you first open the app, you land on the **Public Student Directory**. Anyone can:

- ✅ View all student records (names, IDs, departments, GPA, attendance, risk levels)
- ✅ Search students by name, department, or student ID
- ✅ See summary statistics (Total Students, Departments, Average GPA)
- ✅ Browse student cards with color-coded risk badges (🟢 Low, 🟡 Medium, 🔴 High)

**No login needed** — this page is accessible to everyone.

---

### 👤 Step 2: Register as a New User

To get additional access, click the **"Login / Register"** button on the homepage:

1. Click **"Don't have an account? Sign up"**
2. Fill in the registration form:
   - **Full Name** (required)
   - **Mobile Number** (required)
   - **Email** (required)
   - **Password** (required)
3. Click **"Sign Up"**
4. Check your email for a confirmation link (if Supabase is configured)
5. After confirming, sign in with your email and password

> 🧪 **Demo User Credentials** (no registration needed):
> - **Email:** `user@test.com`
> - **Password:** `User@1234`

**What registered users see on their dashboard:**
- ✅ **Stats Cards** — Total Students (66), High Risk (18), Avg GPA (3.03), Avg Attendance (73.8%)
- ✅ **Department Distribution Pie Chart** — Visual breakdown of students across 8 departments
- ✅ **Risk by Department Bar Chart** — Stacked bar chart showing Low/Medium/High risk per department
- ✅ **Risk Summary** — Progress bars for Low (48%), Medium (24%), High (27%) risk
- ✅ **Top At-Risk Students** — List of students needing immediate attention with GPA & attendance
- ✅ **Student Directory Table** — Searchable, filterable table of all students with sorting

---

### 🔑 Step 3: Admin Login (Full Access)

To access the **Admin Dashboard** with all analytics and management features:

1. Click the **"Admin Login"** button on the homepage
2. Enter admin credentials:

> 🔐 **Admin Credentials:**
> - **Email:** `bibek@admin.com`
> - **Password:** `Bibek@1920`

3. You'll be redirected to the **Admin Dashboard**

---

### 🎫 Quick Reference — Demo Credentials

| Role | Email | Password | Access |
|------|-------|----------|--------|
| **👤 User** | `user@test.com` | `User@1234` | User Dashboard with analytics, charts, student table |
| **🔐 Admin** | `bibek@admin.com` | `Bibek@1920` | Full admin panel with sidebar, management, uploads |

---

### 🖥️ Step 4: Using the Admin Dashboard

After admin login, you get access to the full **sidebar navigation** with these sections:

#### 📊 Dashboard (Analytics Overview)
- View **real-time stats**: Total Students, At-Risk Count, Departments, Avg GPA
- **Performance Trend Chart**: GPA and Attendance trends by academic year
- **Department Distribution Pie Chart**: Student spread across departments
- **Risk Heatmap**: Department × Year at-risk percentage matrix
- **AI Insights**: Automated alerts and recommendations

#### 🔮 Risk Analysis
- **Feature Importance Radar**: Visual breakdown of risk factor weights
- **Risk Scatter Plot**: GPA vs Risk Score for all students
- **Department Risk Comparison**: Bar chart comparing risk levels by department
- **Model Metrics**: Total Students, Low/Medium/High risk percentages

#### 🛡️ Interventions
- **AI-Generated Insights**: Automated alerts like "Low Attendance", "High Risk Students"
- **Create Intervention Programs**: Set up targeted support plans
- **View Recommendations**: Priority-based action items with severity levels

#### 🏫 Department Analytics
- **Detailed per-department breakdowns**: Student counts, risk levels, GPA averages
- **Time period filtering**: Analyze data by custom date ranges
- **Export to Excel**: Download analytics data for offline analysis

#### 👥 Student Management
- **View all students** in a table format
- **Add new students** manually via form
- **Edit/Delete** existing student records
- **Upload CSV/Excel files** to bulk-import student data

#### 📂 Upload Student Data (CSV/Excel)
- Navigate to **Upload Students Data File** from the sidebar
- Upload a `.csv` or `.xlsx` file with columns:
  ```
  student_id, name, email, department, year, gpa, attendance_rate, engagement_score, risk_level
  ```
- Preview data before confirming
- Data is inserted into the database

#### 👤 User Management
- **Create new users** (admin-created accounts)
- **Approve/Reject** user registration requests
- **View all registered users** and their roles

---

### 📍 Route Reference

| URL Path | Access Level | Description |
|----------|-------------|-------------|
| `/` | 🌐 Public | Student directory with search & filter |
| `/admin-login` | 🌐 Public | Admin login page |
| `/adminDashboard` | 🔐 Admin | Full admin panel with sidebar navigation |
| `/adminDashboard/approvals` | 🔐 Admin | User approval management |
| `/createUser` | 🔐 Admin | Create new user accounts |
| `/UploadStudentsDataFile` | 🔐 Admin | Bulk upload student data |
| `/dashboard` | 👤 User | Registered user's personal dashboard |
| `/requests` | 👤 User | View user's data change requests |

---

### 🔄 Quick Start Flow (For Demo)

```
1. Open http://localhost:8080          → See 65 students with data
2. Click "Admin Login"                 → Enter: bibek@admin.com / Bibek@1920
3. Explore Dashboard                   → Charts, stats, AI insights
4. Click "Risk Analysis" in sidebar    → Scatter plots, risk comparison
5. Click "Interventions" in sidebar    → AI recommendations
6. Click "Department Analytics"        → Per-department deep dive
7. Upload new data via sidebar         → Add more student records
```

---

## 📊 Sample Dataset

The platform includes a built-in dataset of **65 students** spanning **8 departments** for demonstration:

| Department | Students | Year Range |
|-----------|----------|------------|
| Computer Science | 12 | 1–4 |
| Mathematics | 10 | 1–4 |
| Electronics & Communication | 8 | 1–4 |
| Mechanical Engineering | 8 | 1–4 |
| Electrical Engineering | 8 | 1–4 |
| Civil Engineering | 7 | 1–4 |
| Information Technology | 7 | 1–4 |
| Biotechnology | 6 | 1–4 |

**Data features per student:**
- `student_id` — Unique identifier (e.g., CS2024001)
- `name` — Full name
- `department` — Academic department
- `year` — Academic year (1–4)
- `gpa` — Grade point average (0.0–4.0)
- `attendance_rate` — Attendance percentage (0–100%)
- `engagement_score` — Engagement metric (0–100)
- `risk_level` — Computed risk: low, medium, or high

---

## 🔐 Authentication

| Role | Access |
|------|--------|
| **Public** | View student directory, search & filter students |
| **Registered User** | Personal dashboard, request data changes, profile management |
| **Admin** | Full CRUD on students, user management, analytics dashboards, approval panel |

---

## 🧠 Risk Prediction Model

The platform uses a **Weighted Multi-Factor Risk Assessment Model**:

```
Risk Score = 1 - (GPA_score × 0.4 + Attendance_score × 0.3 + Engagement_score × 0.2 + Year_score × 0.1)
```

| Factor | Weight | Calculation |
|--------|--------|-------------|
| GPA | 40% | `gpa / 4.0` |
| Attendance | 30% | `attendance_rate / 100` |
| Engagement | 20% | `engagement_score / 100` |
| Year Standing | 10% | `1 - (year - 1) × 0.2` |

**Risk Classification:**
- 🟢 **Low Risk** — Score < 0.35
- 🟡 **Medium Risk** — Score 0.35 – 0.60
- 🔴 **High Risk** — Score > 0.60

---

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build production bundle |
| `npm run build:dev` | Build with development mode |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint for code quality |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -m 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Open a Pull Request

---

## 📄 License

This project is developed as part of an academic initiative for student data analytics and educational insights.

---

<p align="center">
  Built with ❤️ by <strong>Bibekananda Behera</strong>
  <br/>
  <em>Data To Insight — Because every student's success starts with understanding the data.</em>
</p>
