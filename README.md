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