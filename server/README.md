# Employee Management System (EMS) – Backend

This is the **backend server** for the Employee Management System (EMS) built with **Node.js, Express, and MongoDB (MERN stack)**.  
It provides APIs for authentication, employee data management, attendance, payroll, leave management, and notifications.

---

## 🚀 Features

- **Authentication & Authorization**
  - JWT-based secure login/logout.
  - Role-based access control (Admin vs Employee).

- **Employee Management**
  - CRUD operations on employees, departments, roles.

- **Attendance & Leave**
  - Clock-in/out, leave requests, and approval workflows.

- **Payroll & Benefits**
  - Manage salary records, view payslips.

- **Notifications & Email**
  - In-app notifications.
  - Email service via Nodemailer.

- **Reporting**
  - API endpoints ready for analytics dashboards.

---

## 🛠 Tech Stack

- **Node.js / Express** – REST API
- **MongoDB / Mongoose** – Database
- **JWT** – Authentication
- **Nodemailer** – Email notifications
- **Winston** – Logging
- **Helmet, CORS, Morgan** – Security & middleware

---

## 📂 Project Structure (Backend)

- **backend/**
- **│── config/** # DB, JWT, logger configs
- **│── controllers/** # Route controllers (business logic)
- **│── middleware/** # Auth & error handling
- **│── models/** # Mongoose schemas
- **│── routes/** # Express routers
- **│── utils/** # Helpers (email, notifications, response handler)
- **│── server.js** # Server entry point
- **│── .env** # Environment variables (ignored by git)
- **│── package.json** # Dependencies & scripts


---

## ⚙️ Setup & Run

### 1. Clone Repository
- **```bash**

  - git clone https://github.com/your-username/Employee-Management.git
  - cd Employee-Management/server