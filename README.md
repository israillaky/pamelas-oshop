Below is your **final, production-ready, beautifully formatted README.md** for your GitHub repository.
It reflects the **pamela-api + pamela-spa** monorepo structure and includes installation guides, features, tech stack, developer workflows, and clear documentation.

You can **copy/paste this entire file into `README.md`** in your repo.

---

# 📦 **Pamela Inventory System — API + SPA (Monorepo)**

A modern, barcode-powered inventory management system built with:

* **Laravel API (pamela-api)**
* **React + Vite SPA (pamela-spa)**
* Fully supports future **Electron Desktop** and **React Native Mobile** clients.

Designed for speed, clarity, and reliability across warehouse, retail, and admin workflows.

---

## 🗂 **Repository Structure**

```
pamela-inventory/
│
├── pamela-api/       # Laravel 11 API backend
├── pamela-spa/       # React + Vite Single Page Application
│
└── README.md         # You are here
```

---

# 🚀 **Features Overview**

## 🔧 **Backend — Laravel API (pamela-api)**

* API-only architecture (`/api/v1/*`)
* Token authentication via Sanctum
* Central roles system:

  * `super_admin`
  * `admin`
  * `staff`
  * `warehouse_manager`
  * `warehouse_staff`
  * `cashier`
* Product catalog (brand, category, child category)
* Stock In / Stock Out module:

  * Inline QTY editing
  * Price snapshot logic
  * Auto-calculations of totals
* Barcode generation (Code 128)
* Reporting:

  * Totals (In, Out, Sales)
  * Date filtering
  * CSV / PDF-ready endpoints
* Audit Log recording (user actions saved automatically)
* Super Admin protections (cannot delete or downgrade)
* Universal exception handler for consistent API responses

---

## 🌐 **Frontend — React SPA (pamela-spa)**

* Vite + TypeScript + Tailwind v4
* Authentication + persistent session
* Role-based access control (sidebar + routes)
* Global connection checker (online / offline / reconnecting)
* Product, Category, Brands module
* Stock In / Stock Out workflows:

  * Scanner-friendly
  * Barcode → auto-select product
  * Auto-focus quantity input
  * Press Enter to add instantly
* Reports page with filters, summaries, and export buttons
* Audit Log viewer
* Modular API client with Axios interceptors
* Fully responsive sidebar with dynamic icons

---

# 🏁 **Installation Guide**

## 1️⃣ Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/pamela-inventory.git
cd pamela-inventory
```

---

# 🖥️ **Backend Setup — pamela-api**

```bash
cd pamela-api
cp .env.example .env
composer install
php artisan key:generate
```

Configure:

* Database
* Mail (Gmail SMTP works)
* CORS
* APP_URL

### Run migrations + seeders

```bash
php artisan migrate --seed
```

### Start server

```bash
php artisan serve
```

Default API:

```
http://127.0.0.1:8000
```

---

# 🌐 **Frontend Setup — pamela-spa**

```bash
cd pamela-spa
cp .env.example .env
npm install
```

Ensure:

```
VITE_API_BASE_URL=http://127.0.0.1:8000
```

Start:

```bash
npm run dev
```

Default SPA:

```
http://127.0.0.1:5173
```

---

# 🔐 **Default Login (dev environment)**

```
username: admin
password: password
```

*(Seeded once via database seeder.)*

---

# 🧱 **Tech Stack**

## Backend

* Laravel 11
* Sanctum (API tokens)
* MySQL / MariaDB
* Code-128 Barcode generation
* PDF/CSV export-ready endpoints

## Frontend

* React 18
* Vite
* TypeScript
* Tailwind CSS v4
* Axios
* Heroicons

---

# 📊 **Core Modules**

### ✔ Products

Create, search, sort, brand + category mapping, low-stock indicators.

### ✔ Categories + Child Categories

Hierarchical filtering and clean UI.

### ✔ Stock In

Scan → confirm → add stock instantly.

### ✔ Stock Out

Barcode-based deduction with price snapshot & inline QTY edits.

### ✔ Reports

Aggregated totals, date filters, export support.

### ✔ Audit Logs

Tracks: create, update, delete, system actions.

---

# 📡 **Connection Status System**

SPA shows:

* 🟢 Online
* 🔴 Offline
* 🟡 Checking…

Based on API health endpoint:

```
GET /api/v1/health
```

---

# 📄 **.gitignore Included**

This repo uses a unified `.gitignore` covering:

* Laravel vendor + storage
* Node modules + dist
* Environment files
* Cache + logs
* Electron + React Native future folders
* OS junk files
* IDE configs

(Already included in repository for security and cleanliness.)

---

# 🤝 **Contribution Workflow**

```bash
git checkout -b feature/my-new-feature
git add .
git commit -m "Add new feature"
git push origin feature/my-new-feature
```

* Use clear commit messages
* Keep PRs small and focused
* Follow existing formatting and code patterns

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

# 📱 **Future Extensions**

* Electron desktop app (wrapped around SPA)
* React Native / Expo barcode scanner
* Offline-first mobile sync
* Thermal/printer support for labels
* QR and RFID support

---

# 📜 License

Private internal inventory system — all rights reserved.

 