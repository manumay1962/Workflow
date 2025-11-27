# 🚀 Workflow Automation Platform

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Built With](https://img.shields.io/badge/Built%20With-Node.js-green.svg)]()
[![Database](https://img.shields.io/badge/Database-Prisma-darkblue.svg)]()
[![Frontend](https://img.shields.io/badge/Frontend-React%2FVue%2FAngular-informational)]()

---

## 🌟 Project Overview

This is a **Full-Stack Workflow Automation and Scheduling Platform**. It allows users to create custom workflows, manage their status (Running/Paused), and access them publicly or privately based on ownership.

The core functionality visible in the server structure includes **user authentication** and a robust **workflow management API**.

**Key Features:**
* **User Authentication:** Supports standard login/register and social login functionality.
* **Workflow Management:** API endpoints for creating, reading, and updating workflow records.
* **Status Control:** Ability to change a workflow's state between 'Running' and 'Paused'.
* **Database Management:** Uses the Prisma ORM for efficient and type-safe data interactions.

---

## 🛠️ Technical Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Backend** | **Node.js, Express** | Provides server-side logic and the RESTful API. |
| **Database ORM** | **Prisma** | Type-safe interface between Node.js and the database (e.g., PostgreSQL). |
| **Language** | **TypeScript** | Used for scalable and robust backend development. |
| **Authentication** | **Custom Controllers** | Handles secure user registration, login, and social sign-in. |
| **Deployment** | **Render** | Used for cloud hosting and deployment. |

---

## ⚙️ Local Setup

Follow these instructions to get a copy of the project up and running on your local machine.

### Prerequisites
Ensure you have the following installed:
* [Node.js](https://nodejs.org/en/download/) (v18+)
* [npm] (or yarn/pnpm)
* A local database instance (e.g., PostgreSQL or SQLite).

* Photos

<img width="1882" height="870" alt="Screenshot 2025-11-27 062252" src="https://github.com/user-attachments/assets/02706c61-cb16-4056-b2ac-a09b94ffa2b7" />
<img width="1900" height="978" alt="Screenshot 2025-11-27 062358" src="https://github.com/user-attachments/assets/2c9ee8b2-f091-41c6-9ab2-0e40b9109a1e" />
<img width="1851" height="883" alt="image" src="https://github.com/user-attachments/assets/aa375b36-bc9a-4315-b6a0-688928b5387f" />




### 1. Cloning the Repository

```bash
git clone [YOUR_REPO_URL]
cd [your-project-folder]


# Frontend dependencies
npm install --prefix frontend 

# Backend dependencies
npm install --prefix backend


# .env file in the backend directory
PORT=5000
DATABASE_URL="postgresql://user:password@host:port/database_name"
JWT_SECRET="YOUR_SECRET_KEY_HERE"
# Add any other required secrets

