# FundsRoom — Mini ERP & CRM Operations Portal

> Production-grade Operations, Inventory, Challan, and Ledger Portal built with React, Express TypeScript, PostgreSQL, AWS S3, Docker, and Nginx.

---

## 🔗 Live Application & Links

* **GitHub Repository**: [https://github.com/Rishabhladha/fundsroom](https://github.com/Rishabhladha/fundsroom)
* **Live Application URL**: [http://3.105.245.197](http://3.105.245.197)

---

## 🔐 Test Login Credentials

| Role | Email | Password | Allowed Access |
|---|---|---|---|
| **ADMIN** | `admin@fundsroom.com` | `Admin@1234` | Full system access, Team management, All features |
| **SALES** | `sales@fundsroom.com` | `Sales@1234` | Customers, Products, Challan creation |
| **WAREHOUSE** | `warehouse@fundsroom.com` | `Warehouse@1234` | Products, Stock Logs, Challan confirmation |
| **ACCOUNTS** | `accounts@fundsroom.com` | `Accounts@1234` | Payments, Invoices, Account Statements, Ledger |

---

## 🏗️ Architecture Overview

The system uses a decoupled, microservices-style containerized architecture:

```
                  ┌──────────────────────────────────────────────┐
                  │                 User Browser                 │
                  └──────────────────────┬───────────────────────┘
                                         │ Port 80
                                         ▼
                  ┌──────────────────────────────────────────────┐
                  │          Nginx Reverse Proxy & SPA           │
                  │             (frontend container)             │
                  └──────────────┬────────────────┬──────────────┘
                                 │                │
           Static Files (React)  │                │ /api/* Requests
                                 ▼                ▼
                  ┌────────────────────┐   ┌─────────────────────┐
                  │    React 18 SPA    │   │ Express TypeScript  │
                  │   (Vite Build)     │   │ (backend container) │
                  └────────────────────┘   └──────────┬──────────┘
                                                      │
                                   ┌──────────────────┴──────────────────┐
                                   ▼                                     ▼
                     ┌──────────────────────────┐           ┌──────────────────────────┐
                     │ PostgreSQL DB (Supabase) │           │ AWS S3 Bucket (Avatars)  │
                     └──────────────────────────┘           └──────────────────────────┘
```

* **Multi-Stage Docker Builds**: Production images use Node 20 Alpine and Nginx Alpine for minimal size and high performance.
* **Nginx Web Server**: Serves built React static assets, resolves SPA client-side routes (`try_files $uri /index.html`), and reverse-proxies `/api` requests to avoid CORS restrictions.
* **AWS S3 Object Storage**: Profile photos are uploaded directly to AWS S3 (`fundsroom-avatars-app`) with a Base64 fallback for local offline development.
* **Database Optimization**: Uses `pg.Pool` connection pooling with startup pre-warming and `ipv4first` DNS resolution for sub-10ms query execution.

---

## 🛠️ Setup & Deployment Instructions

### Prerequisites
* Node.js v20+ and npm v10+
* Docker & Docker Compose v2+
* Git

---

### 1. Local Development (Without Docker)

```bash
# Clone the repository
git clone https://github.com/Rishabhladha/fundsroom.git
cd fundsroom

# 1. Install & start backend
cd backend
npm install
cp .env.example .env   # Configure your Supabase DATABASE_URL & JWT_SECRET
npm run dev

# 2. Install & start frontend (in a second terminal window)
cd ../frontend
npm install
npm run dev
```
* **Frontend**: `http://localhost:5173`
* **Backend**: `http://localhost:5000`

---

### 2. Running Locally with Docker Compose

```bash
# In project root directory
docker compose up --build -d
```
* **Access App**: `http://localhost`

---

### 3. AWS EC2 Cloud Deployment

1. **Launch EC2 Instance**: Spin up an Ubuntu 22.04 / 24.04 LTS instance (`t3.micro` or `t3.small`). Open ports `22`, `80`, and `443` in Security Group.
2. **Install Docker on EC2**:
   ```bash
   sudo apt update && sudo apt install -y docker.io docker-compose-v2 git
   sudo usermod -aG docker ubuntu && newgrp docker
   ```
3. **Clone & Configure Environment**:
   ```bash
   git clone https://github.com/Rishabhladha/fundsroom.git
   cd fundsroom
   nano .env   # Add DATABASE_URL, JWT_SECRET, AWS S3 keys
   ```
4. **Build & Run Containers**:
   ```bash
   docker compose up --build -d
   ```
5. **Static IP Assignment**: Allocate and associate an AWS Elastic IP to reserve a permanent IP address.

---

## 📖 API Documentation

Base Endpoint: `http://3.105.245.197/api/v1`

### 🔑 Authentication & Profile
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/auth/login` | Public | Login with email & password |
| `GET` | `/auth/me` | Authenticated | Get current logged-in user profile |
| `PATCH` | `/auth/profile` | Authenticated | Update display name or password |
| `POST` | `/auth/profile/avatar` | Authenticated | Upload profile picture to AWS S3 (`multipart/form-data`) |
| `GET` | `/auth/users` | Admin | List all team accounts |
| `POST` | `/auth/users` | Admin | Create a new user account |

---

### 👥 Customers Management
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/customers` | Authenticated | List customers with search, filter, and pagination |
| `POST` | `/customers` | Admin/Sales | Add a new customer |
| `GET` | `/customers/:id` | Authenticated | Get customer details and transaction ledger |
| `PATCH` | `/customers/:id` | Admin/Sales | Update customer record |

---

### 📦 Products & Inventory
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/products` | Authenticated | List inventory items with stock levels |
| `POST` | `/products` | Admin/Warehouse | Add new product item |
| `PATCH` | `/products/:id` | Admin/Warehouse | Update price, SKU, or minimum stock alert |

---

### 📜 Delivery Challans & Invoices
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/challans` | Authenticated | List delivery challans |
| `POST` | `/challans` | Admin/Sales | Draft new delivery challan |
| `POST` | `/challans/:id/confirm` | Admin/Warehouse | Confirm challan (deducts inventory & posts to ledger) |
| `GET` | `/challans/:id/pdf` | Authenticated | Download PDF Invoice |

---

### 💳 Payments & Account Statements
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/payments` | Authenticated | List received customer payments |
| `POST` | `/payments` | Admin/Accounts | Record customer payment |

---

## ⚠️ Known Limitations & Incomplete Parts

1. **HTTP / SSL Certificate**: The live AWS deployment operates over standard HTTP on port 80. For production domains, an SSL certificate via Certbot (Let's Encrypt) or AWS CloudFront should be attached for HTTPS.
2. **Role-Based Access Control (RBAC)**: Backend endpoints strictly validate user roles (Admin, Sales, Warehouse, Accounts). On the frontend, route protection hides nav links per role, but finer granular button disables are controlled server-side.
