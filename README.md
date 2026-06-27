# Evginler E-Commerce Platform

> Modernizing a legacy e-commerce platform with React, Express.js and MongoDB while preserving production business logic.

![Status](https://img.shields.io/badge/Status-Beta-blue)
![React](https://img.shields.io/badge/React-19.x-61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248)
![License](https://img.shields.io/badge/License-Private-red)

---

# Overview

Evginler is a full-stack e-commerce modernization project developed for a long-established retail company located in Ardahan, Türkiye.

Instead of rewriting the entire system from scratch, the project follows an incremental migration strategy that preserves the existing Express + Pug application while introducing a modern React-based architecture.

The goal is to modernize the platform without interrupting existing business operations.

---

# Project Architecture

```text
                Customer
                    │
                    ▼
        evginler-store-client (React)
                    │
                    ▼
       Website-Evginler API (Express)
                    │
                    ▼
                 MongoDB


                  Admin
                    │
                    ▼
       evginler-admin-client (React)
                    │
                    ▼
        Admin-Evginler API (Express)
                    │
                    ▼
                 MongoDB
```

---

# Applications

| Application | Description | Default Port |
|------------|-------------|-------------|
| Website-Evginler | Customer Backend (Express + Legacy Pug) | 5050 |
| Admin-Evginler | Admin Backend (Express + Legacy Pug) | 3030 |
| evginler-store-client | React Storefront | 5173 |
| evginler-admin-client | React Admin Dashboard | 5174 |

---

# Features

## Customer Store

- User Authentication
- Product Listing
- Product Detail
- Shopping Cart
- Favorites
- Profile Management
- Address Management
- Order History
- Return Requests
- Cookie Session Authentication
- CSRF Protection
- Iyzico 3D Secure Payment
- Responsive Design

---

## Admin Dashboard

- Dashboard
- Product Management
- Category Management
- Brand Management
- Order Management
- Shipment Confirmation
- Cargo Tracking
- Bulk Product Visibility
- Responsive Dashboard

---

# Technology Stack

## Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- express-session
- connect-mongodb-session
- CORS
- CSRF
- Mailjet
- Iyzico

## Frontend

- React
- Vite
- React Router
- TanStack Query
- Axios
- Zustand
- Tailwind CSS
- React Hook Form
- Zod
- Lucide React
- Recharts

---

# Folder Structure

```text
Evginler Proje 2025/

├── Website-Evginler/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── views/
│   └── app.js
│
├── Admin-Evginler/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── scripts/
│   ├── views/
│   └── admin.js
│
├── evginler-store-client/
│   ├── public/
│   └── src/
│
└── evginler-admin-client/
    ├── public/
    └── src/
```

---

# Local Development

Run every application in its own terminal.

## Website Backend

```bash
cd Website-Evginler
npm install
npm start
```

Runs on:

```
http://localhost:5050
```

---

## Admin Backend

```bash
cd Admin-Evginler
npm install
npm start
```

Runs on:

```
http://localhost:3030
```

---

## React Store

```bash
cd evginler-store-client
npm install
npm run dev -- --port 5173
```

Runs on:

```
http://localhost:5173
```

---

## React Admin

```bash
cd evginler-admin-client
npm install
npm run dev -- --port 5174
```

Runs on:

```
http://localhost:5174
```

---

# Environment Variables

Every application has its own `.env.example`.

Create local `.env` files before running the project.

Never commit:

- `.env`
- API Keys
- Database Credentials
- Session Secrets
- Private Certificates
- Payment Credentials

---

# Security

The project includes:

- Cookie-based Session Authentication
- Store/Admin Session Isolation
- CSRF Protection
- Environment-based CORS
- HTTP Only Cookies
- Environment-based Secrets
- Secure Payment Flow
- Protected Admin Routes

Sensitive information is intentionally excluded from the repository.

---

# Migration Strategy

This project follows an incremental migration approach.

```text
Legacy Express + Pug
          │
          ▼
 Parallel REST APIs
          │
          ▼
 React Store
          │
          ▼
 React Admin
          │
          ▼
 Production Deployment
```

The original business logic remains intact while React applications communicate with new REST API endpoints.

---

# API Overview

## Website API

```
/api/store/*
/api/auth/*
/api/user/*
/api/cart/*
/api/checkout/*
```

---

## Admin API

```
/api/admin/dashboard
/api/admin/products
/api/admin/categories
/api/admin/brands
/api/admin/orders
```

---

# Current Project Status

Current phase:

**Beta / MVP+**

Implemented:

- React Storefront
- React Admin Dashboard
- Authentication
- Shopping Cart
- Favorites
- Checkout
- Iyzico Integration
- Product CRUD
- Category CRUD
- Brand CRUD
- Order Management
- Responsive UI
- Session Authentication
- CSRF Protection

---

# Future Improvements

- Premium UI/UX redesign
- Route-based Lazy Loading
- Docker Support
- CI/CD Pipeline
- Playwright E2E Tests
- Monitoring & Logging
- Advanced Dashboard Analytics
- Performance Optimization

---

# Screenshots

Screenshots will be added after the final UI redesign.

```
Store Home

[ Screenshot ]

Store Product

[ Screenshot ]

Checkout

[ Screenshot ]

Admin Dashboard

[ Screenshot ]
```

---

# License

This repository is intended for portfolio and technical demonstration purposes.

Commercial use, redistribution or reproduction without permission is prohibited.

---

# Developer

**Doğukan Yıldız**

Full Stack JavaScript Developer

Tech Stack:

- React
- Node.js
- Express.js
- MongoDB
- JavaScript
- REST API
- Tailwind CSS

Currently focused on building scalable full-stack applications and modernizing legacy systems.