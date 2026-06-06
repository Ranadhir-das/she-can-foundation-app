# 💜 She Can Foundation - Web Portal & Admin Dashboard

A modern, full-stack web application designed to empower women globally through skills bootcamps, mentorship hubs, and community networking. This platform features a responsive public landing page, a secure dual-role authentication system (Member/Admin), and a protected administrative dashboard for managing community inquiries and registered accounts.

## 🚀 Tech Stack

**Frontend:**
* React.js (via Vite)
* Tailwind CSS v4 (for responsive UI and dark/light modes)
* Framer Motion (for fluid animations and page transitions)
* Lucide React (for modern iconography)

**Backend:**
* Node.js & Express.js
* MongoDB Atlas (Cloud Database) & Mongoose
* JSON Web Tokens (JWT) for secure authentication
* Bcrypt.js for password hashing

## ✨ Key Features

* **Creative UI/UX:** Fully responsive design with smooth scroll animations, glassmorphism navbars, and interactive hover states.
* **Native Dark Mode:** Seamless toggle between carefully crafted high-contrast Light and Dark themes.
* **Dual-Role Authentication:** Secure login/signup portal that differentiates between regular `user` members and `admin` staff.
* **Member Portal:** A personalized dashboard for verified community members.
* **Admin Command Center:** A protected route where administrators can view/delete incoming contact messages and manage registered user accounts.
* **RESTful API:** A robust Node.js backend handling form submissions, user creation, and database queries.

---

## 🛠️ Local Development Setup

Follow these steps to run the application on your local machine.

### 1. Prerequisites
Make sure you have the following installed:
* [Node.js](https://nodejs.org/) (v18 or higher recommended)
* A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account and cluster

### 2. Clone the Repository
*(If you are downloading this from GitHub)*
```bash
git clone [https://github.com/Ranadhir-das/she-can-foundation-app.git](https://github.com/YOUR_USERNAME/she-can-foundation-app.git)
cd she-can-foundation-app