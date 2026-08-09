# Complete AWS Deployment Guide (Docker + EC2)

This guide walks you step-by-step through deploying your **FreightLedger / FundsRoom** application to AWS using Docker and Docker Compose on an AWS EC2 instance.

---

## 📋 Prerequisites Checklist

Before you begin, ensure you have:
1. An **AWS Account** ([aws.amazon.com](https://aws.amazon.com)).
2. A **Supabase PostgreSQL Connection String** (`DATABASE_URL`).
3. (Optional) A custom domain name registered (e.g. through Namecheap, GoDaddy, or AWS Route 53).

---

## 🚀 Step 1: Launch an AWS EC2 Instance

1. Log into your **AWS Management Console** and navigate to **EC2**.
2. Click **Launch Instance**.
3. **Name**: `fundsroom-production-server`
4. **Application and OS Image (AMI)**: Select **Ubuntu** (Ubuntu Server 22.04 LTS or 24.04 LTS, 64-bit x86).
5. **Instance Type**: Select `t3.micro` (Free Tier eligible) or `t3.small` (recommended for production with 2GB RAM).
6. **Key Pair (login)**:
   - Click **Create new key pair**.
   - Name: `fundsroom-key`.
   - File format: `.pem` (OpenSSH).
   - Click **Create key pair** and save the downloaded file securely on your computer.
7. **Network Settings (Security Group)**:
   - Check **Allow SSH traffic from** (Select *Anywhere 0.0.0.0/0* or *My IP*).
   - Check **Allow HTTP traffic from the internet** (Port 80).
   - Check **Allow HTTPS traffic from the internet** (Port 443).
8. Click **Launch Instance**.

---

## 🔑 Step 2: Connect to Your EC2 Instance

Open your terminal (PowerShell / Git Bash / Command Prompt on Windows) and run:

```bash
# Set file permission for your private key (Linux/Mac)
chmod 400 fundsroom-key.pem

# SSH into your EC2 instance (Replace YOUR_EC2_PUBLIC_IP with your actual EC2 Public IPv4 address)
ssh -i "path/to/fundsroom-key.pem" ubuntu@YOUR_EC2_PUBLIC_IP
```

---

## 🛠️ Step 3: Install Docker & Git on EC2

Once connected inside your EC2 server terminal, run the following commands to install Docker & Git:

```bash
# 1. Update system packages
sudo apt update && sudo apt upgrade -y

# 2. Install Docker and Git
sudo apt install -y docker.io docker-compose-v2 git

# 3. Enable Docker to start automatically on system reboot
sudo systemctl enable docker
sudo systemctl start docker

# 4. Allow your ubuntu user to run Docker without 'sudo'
sudo usermod -aG docker ubuntu

# 5. Apply the user group changes (or log out and log back in)
newgrp docker

# 6. Verify Docker installation
docker --version
docker compose version
```

---

## 📁 Step 4: Clone Your Project & Configure Secrets

```bash
# 1. Clone your Git repository (replace with your repo URL)
git clone https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPO_NAME.git
cd YOUR_REPO_NAME

# 2. Create the production environment (.env) file
nano .env
```

Paste your production environment variables into `.env`:

```env
# Database (Supabase PostgreSQL URI)
DATABASE_URL=postgresql://postgres:YOUR_ACTUAL_DB_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres

# Auth
JWT_SECRET=your_generated_random_64_byte_secret_key
JWT_EXPIRES_IN=7d

# Server
PORT=5000
NODE_ENV=production

# Frontend API URL
VITE_API_URL=/api
```

*(Press `Ctrl + O`, hit `Enter` to save, and `Ctrl + X` to exit `nano`)*.

---

## 🚢 Step 5: Build and Start Containers

With `.env` configured, start your entire application stack in detached mode:

```bash
docker compose up --build -d
```

### Check Container Status:
```bash
docker compose ps
docker compose logs -f
```

Visit `http://YOUR_EC2_PUBLIC_IP` in your browser! Your app will be live! 🎉

---

## 🔒 Step 6: Set Up Custom Domain & SSL (HTTPS) with Certbot

To secure your site with `https://yourdomain.com`:

1. Point your domain's **A Record** in your DNS provider (Cloudflare/Namecheap/Route53) to `YOUR_EC2_PUBLIC_IP`.
2. Install Certbot on EC2:
   ```bash
   sudo apt install -y certbot python3-certbot-nginx
   ```
3. Request a free SSL certificate:
   ```bash
   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
   ```
4. Certbot will automatically issue and configure the HTTPS certificate for you!

---

## 🔄 Updating / Redeploying Code

Whenever you make changes to your codebase and push to GitHub:

```bash
# On your EC2 server inside the project folder:
git pull origin main
docker compose up --build -d
```
