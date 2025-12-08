<p align="center">
  <img src="https://placehold.co/900x200?text=Pamela+Inventory+System" alt="Pamela Inventory Banner" />
</p>

<h1 align="center">Pamela Inventory System</h1>

<p align="center">A modern, barcode-powered inventory platform built with Laravel + React.</p>

<p align="center">
  <a href="https://github.com/israillaky/pamela-inventory">
    <img src="https://img.shields.io/github/repo-size/israillaky/pamela-inventory?color=blue&style=for-the-badge" />
  </a>
  <a href="#">
    <img src="https://img.shields.io/badge/Laravel-11-red?style=for-the-badge" />
  </a>
  <a href="#">
    <img src="https://img.shields.io/badge/React-18-blue?style=for-the-badge" />
  </a>
  <a href="#">
    <img src="https://img.shields.io/badge/Vite-fast-purple?style=for-the-badge" />
  </a>
  <a href="https://github.com/israillaky/pamela-inventory/issues">
    <img src="https://img.shields.io/github/issues/israillaky/pamela-inventory?style=for-the-badge" />
  </a>
  <a href="#">
    <img src="https://img.shields.io/badge/license-Private-red?style=for-the-badge" />
  </a>
</p>

> **Pamela Inventory System** is a unified multi-platform inventory system built for warehouse and retail environments — featuring barcode automation, stock management, reporting, role-based security, and a clean React SPA interface backed by a Laravel API.
```

# **📦 Pamela Inventory System — API + SPA (Monorepo)**

<p align="center">
  <img src="https://via.placeholder.com/900x200.png?text=Pamela+Inventory+System" alt="Pamela Inventory System Banner" />
</p>

<p align="center">
  <a href="https://github.com/YOUR_USERNAME/pamela-inventory">
    <img src="https://img.shields.io/github/repo-size/YOUR_USERNAME/pamela-inventory?color=blue&style=for-the-badge" />
  </a>
  <img src="https://img.shields.io/badge/Laravel-11-red?style=for-the-badge" />
  <img src="https://img.shields.io/badge/React-18-blue?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Vite-fast-purple?style=for-the-badge" />
  <a href="https://github.com/YOUR_USERNAME/pamela-inventory/issues">
    <img src="https://img.shields.io/github/issues/YOUR_USERNAME/pamela-inventory?style=for-the-badge" />
  </a>
  <img src="https://img.shields.io/badge/license-Private-red?style=for-the-badge" />
</p>

> **Pamela Inventory System** is a unified multi-platform inventory solution designed for retail and warehouse operations, featuring barcode-driven workflows, stock management, reporting, and secure role-based access — powered by Laravel API and a React SPA frontend.

---

## 🗂 **Repository Structure**

```
pamela-inventory/
│
├── pamela-api/       # Laravel 11 API backend
├── pamela-spa/       # React + Vite Single Page Application
│
└── README.md
```

---

## 🚀 **Features Overview**

### 🔧 Backend — Laravel API (`pamela-api`)

* API-only architecture using `/api/v1/*`
* Authentication via Sanctum
* Role-based permissions
* Products, Brands, Categories, Child Categories
* Stock In / Stock Out with inline editing & price snapshot
* Code-128 barcode generation
* Reports (Totals, Sales, Filters, Export-ready)
* Audit log tracking
* Super Admin protection rules
* Global exception handler

---

### 🌐 Frontend — React SPA (`pamela-spa`)

* React + Vite + TypeScript
* TailwindCSS v4
* Axios API client with interceptors
* Role-based routing + sidebar
* Online/offline server connection checker
* Stock In/Out workflow optimized for barcode scanners
* Reports UI with filters
* Audit Logs page
* Reusable components and hooks

---

# 🏁 **Installation Guide**

## 📥 1. Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/pamela-inventory.git
cd pamela-inventory
```

---

# 🖥️ Backend Setup — pamela-api

```bash
cd pamela-api
cp .env.example .env
composer install
php artisan key:generate
```

Configure `.env`:

* Database
* Mail (Gmail SMTP supported)
* APP_URL

Run migrations:

```bash
php artisan migrate --seed
```

Start API:

```bash
php artisan serve
```

---

# 🌐 Frontend Setup — pamela-spa

```bash
cd pamela-spa
cp .env.example .env
npm install
```

Set API endpoint:

```
VITE_API_BASE_URL=http://127.0.0.1:8000
```

Start development server:

```bash
npm run dev
```

---

# 🔐 Default Login

```
username: admin
password: password
```

---

# 🧱 Tech Stack

### Backend

* Laravel 11
* Sanctum
* MySQL
* Code-128 Barcode

### Frontend

* React 18
* Vite
* TypeScript
* TailwindCSS
* Axios

---

# 📊 Core Modules

* Products
* Categories & Child Categories
* Stock In
* Stock Out
* Reports
* Audit Logs

---

# 📡 Connection Status System

SPA checks API health via:

```
GET /api/v1/health
```

Displays:

* 🟢 Online
* 🔴 Offline
* 🟡 Checking…

---

# 🤝 Contribution Workflow

```bash
git checkout -b feature/my-feature
git commit -m "Add new feature"
git push origin feature/my-feature
```

---

# 🛠 Useful Commands

### Laravel

```
php artisan route:list
php artisan migrate:fresh --seed
php artisan tinker
```

### React

```
npm run dev
npm run build
npm run lint
```

---

# 📱 Future Extensions

* Electron Desktop App
* React Native App
* Offline-first mode
* Label/receipt printer support
* QR + RFID integration

---

# 📜 License

Private internal inventory system — all rights reserved.
 