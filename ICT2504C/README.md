# HRMS -- Human Resource Management System

A secure **Human Resource Management System (HRMS)** developed for the
**Full Stack Secured Development assignment**.

The system allows HR administrators, managers, and employees to manage
employee accounts and leave applications while enforcing security
through authentication, role-based access control, and audit logging.

------------------------------------------------------------------------

# System Architecture

Frontend (React + Vite)\
↓\
Backend API (Node.js + Express)\
↓\
Database (MySQL)

The system follows a **three‑tier architecture** separating the UI,
business logic, and database layer.

------------------------------------------------------------------------

# Technology Stack

## Frontend

-   React (Vite)
-   React Router
-   Axios

## Backend

-   Node.js
-   Express.js
-   Sequelize ORM

## Database

-   MySQL

## Security Features

-   JWT Authentication
-   Refresh Token Rotation
-   Brute‑Force Login Protection
-   Role‑Based Access Control
-   Account Lockout and Admin Unlock
-   Password Reset with Expiring Tokens
-   Audit Logging

------------------------------------------------------------------------

# System Roles

  Role       Description
  ---------- -------------------------------------------
  Admin      Creates employees and manages accounts
  Manager    Approves or rejects leave requests
  Employee   Applies for leave and views leave history

------------------------------------------------------------------------

# Core Features

## Employee Onboarding & Authentication

Admin can: - Create employee accounts - Assign roles (Employee / Manager
/ Admin)

Employees can: - Login using email and password - Change password -
Update personal profile

Security mechanisms include: - JWT authentication - Login brute‑force
protection - Account lockout after repeated failed login attempts -
Password reset system

------------------------------------------------------------------------

## Leave Management System

Employees can: - Apply for leave - Select leave dates - View leave
history

Managers can: - Approve leave requests - Reject leave requests

Admins can: - Manage employee accounts - Unlock locked user accounts

------------------------------------------------------------------------

# Installation Guide

## 1. Install Required Software

Install the following:

-   Node.js (v18 or above recommended)
-   MySQL Server
-   MySQL Workbench (optional)
-   Visual Studio Code

------------------------------------------------------------------------

# 2. Setup MySQL Database

Open MySQL Workbench and run:

CREATE DATABASE hrms_db;

------------------------------------------------------------------------

# 3. Configure Backend Environment

Inside the **backend folder**, create a file named:

.env

Add the following configuration:

DB_NAME=hrms_db
DB_USER=root
DB_PASSWORD=YOUR_MYSQL_PASSWORD
DB_HOST=localhost

JWT_SECRET=supersecretjwtkey
JWT_EXPIRES_IN=15m

REFRESH_TOKEN_SECRET=supersecretrefreshkey
REFRESH_TOKEN_EXPIRES_DAYS=7

MAX_LOGIN_ATTEMPTS=5
RESET_TOKEN_EXPIRES_MINUTES=15
DEFAULT_ANNUAL_LEAVE=14

FRONTEND_URL=http://localhost:5173

PORT=5000

------------------------------------------------------------------------

# 4. Install Backend Dependencies

Navigate to the backend folder:

cd backend npm install

Start the backend server:

npm run dev

Backend runs on:

http://localhost:5000

Database tables will be automatically created by Sequelize.

------------------------------------------------------------------------

# 5. Install Frontend Dependencies

Open another terminal and navigate to the frontend folder:

cd frontend npm install

Run the frontend:

npm run dev

Application will be available at:

http://localhost:5173

------------------------------------------------------------------------

# First Time Setup (Create Admin)

Send a POST request using Postman:

POST http://localhost:5000/api/auth/bootstrap-admin

Body:

{ "name": "Admin", "email": "admin@test.com", "password": "123456" }

You can now login with the admin account.

------------------------------------------------------------------------

# Demonstration Flow

1.  Admin logs in
2.  Admin creates employee and manager accounts
3.  Employee logs in and applies for leave
4.  Manager reviews and approves leave
5.  Admin manages users and unlocks locked accounts

------------------------------------------------------------------------

# Security Features Demonstration

The system includes:

-   Login attempt lockout after repeated failures
-   Admin unlock functionality
-   Role‑based route protection
-   JWT authentication with refresh token rotation
-   Audit logging of sensitive actions

------------------------------------------------------------------------

# Project Structure

project-root

backend\
controllers / models / routes / middleware / server.js

frontend\
src / components / pages / api

README.md\
TEAMWORK.md

------------------------------------------------------------------------

Developed for **Full Stack Secured Development**.
