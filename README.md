# 🚀 Intern Management Platform

A complete Internship Management System built using **React (TypeScript)**, **Clerk Authentication**, **Supabase Database**, and **ShadCN UI**.  
This platform helps colleges, mentors, and students streamline the entire internship lifecycle — from uploading internship approval letters to monitoring student progress through dedicated dashboards.

---
## 📚 Table of Contents
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [User Roles](#-user-roles)
- [Dashboard Features](#-dashboard-features)
- [Database Schema](#-database-schema)
- [Setup Instructions](#-setup-instructions)
- [Environment Variables](#-environment-variables)
- [Future Enhancements](#-future-enhancements)
- [License](#-license)

---
## ✨ Features

### 🔐 **Role-Based Authentication (Clerk)**
- Secure login/signup using Clerk.
- Automatic redirection based on user role:
  - **Admin**
  - **Mentor**
  - **Student**

### 📄 **Internship Letter Upload**
- Students can upload internship approval/offer letters.
- Files stored securely via **Supabase Storage**.
- Admin + Mentor can view and verify uploads.

### 🧑‍🏫 **Mentor Assignment**
- Admin can assign mentors to each student.
- Mentor receives real-time updates after assignment.

### 📊 **Progress Tracking**
- Mentors can track each student's internship journey.
- Students can update their progress/weekly reports.
- Admin has a complete overview.

### 🖥️ **Beautiful UI**
- Built using **ShadCN UI + Tailwind CSS**.
- Clean, modern, responsive dashboard layout.

---

## 🧰 Tech Stack

### **Frontend**
- React (TypeScript)
- Vite / Next.js (choose whichever you used)
- ShadCN UI
- Tailwind CSS

### **Backend / Auth**
- Clerk (Authentication + RBAC)
- Supabase (Database + Storage)

---

## 📂 Project Structure
```bash
src/
├── components/
├── pages/
├── hooks/
├── context/
├── lib/
├── utils/
├── services/ (API helpers)
├── dashboard/
│ ├── admin/
│ ├── mentor/
│ └── student/
└── types/

```
---

---

## 🧑‍💼 User Roles

### 👨‍🎓 **Student**
- Upload internship letter.
- View assigned mentor.
- Submit progress updates.
- Track internship status.

### 🧑‍🏫 **Mentor**
- View list of assigned students.
- Approve/reject internship letters.
- Track student progress.
- Provide guidance/remarks.

### 🧑‍💼 **Admin**
- Manage all users.
- Assign mentors to students.
- Approve internship applications.
- Access complete internship overview.

---

## 📊 Dashboard Features

### **Student Panel**
- Upload offer/approval letter.
- View mentor details.
- Weekly progress submit.
- Internship status tracking.

### **Mentor Panel**
- List of assigned students.
- View letter + approve/reject.
- Track and comment on progress updates.

### **Admin Panel**
- Add/Manage users.
- Assign mentors.
- Approve internship requests.
- View entire system analytics.

---

## 🗂️ Database Schema (Supabase)

### `users`
| Field         | Type      | Description                |
|---------------|-----------|----------------------------|
| id            | uuid      | Primary key                |
| name          | text      | Full name                  |
| email         | text      | Unique email               |
| role          | text      | admin / mentor / student   |

### `internships`
| Field         | Type      | Description                     |
|---------------|-----------|---------------------------------|
| id            | uuid      | Primary key                     |
| student_id    | uuid      | References users(id)            |
| mentor_id     | uuid      | References users(id)            |
| letter_url    | text      | Supabase storage file URL       |
| status        | text      | pending / approved / rejected   |

### `progress_updates`
| Field         | Type      | Description                     |
|---------------|-----------|---------------------------------|
| id            | uuid      | Primary key                     |
| internship_id | uuid      | References internships(id)      |
| message       | text      | Weekly report / update          |
| created_at    | timestamp | Auto-generated                  |

---

## ⚙️ Setup Instructions

Clone the repository:

```bash
git clone https://github.com/your-username/intern-management-platform.git
cd intern-management-platform
