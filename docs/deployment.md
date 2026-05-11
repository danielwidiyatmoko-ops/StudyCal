# Deployment Guide

## Frontend — Vercel

1. Push your repo to GitHub
2. Go to https://vercel.com and sign in with GitHub
3. Click **Add New Project** → select **StudyCal**
4. Set **Root Directory** to `frontend`
5. Vercel auto-detects Vite — no build config needed
6. Add environment variable:
   - `VITE_API_URL` = your Oracle Cloud backend URL (after step below)
7. Click **Deploy**

Every push to `main` auto-deploys. Your frontend URL will be something like `https://studycal.vercel.app`.

---

## Backend — Oracle Cloud Free Tier

Oracle Cloud Always Free includes 2 AMD VMs (1GB RAM each) — plenty for Flask.

### Step 1 — Create Oracle Cloud account
- Go to https://cloud.oracle.com
- Sign up for Always Free (requires a credit card for verification, won't be charged)

### Step 2 — Create a VM instance
1. Go to **Compute → Instances → Create Instance**
2. Choose **Always Free** shape: `VM.Standard.E2.1.Micro`
3. OS: **Ubuntu 22.04**
4. Download the SSH private key when prompted — keep it safe

### Step 3 — Open ports
1. Go to your instance → **Subnet** → **Security List**
2. Add Ingress Rules:
   - Port 22 (SSH) — already open
   - Port 5000 (Flask) or 80/443 if you add Nginx

### Step 4 — Connect and set up
```bash
# Connect via SSH (replace with your instance IP)
ssh -i your-key.pem ubuntu@<your-oracle-ip>

# Update system
sudo apt update && sudo apt upgrade -y

# Install Python + pip + git
sudo apt install python3 python3-pip python3-venv git -y

# Clone your repo
git clone https://github.com/yourusername/StudyCal.git
cd StudyCal/backend

# Set up virtualenv
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Create .env from example
cp .env.example .env
nano .env   # fill in JWT_SECRET_KEY and FRONTEND_URL
```

### Step 5 — Run with Gunicorn (production server)
```bash
pip install gunicorn

# Test it works
gunicorn --bind 0.0.0.0:5000 run:app

# Keep it running with nohup (simple method)
nohup gunicorn --bind 0.0.0.0:5000 --workers 2 run:app &
```

Your API is now live at `http://<your-oracle-ip>:5000/api`

### Step 6 — Update frontend environment
In Vercel, update `VITE_API_URL` to `http://<your-oracle-ip>:5000/api` and redeploy.

---

## Updating the deployment

When you push new code to GitHub:
```bash
# SSH into Oracle VM
ssh -i your-key.pem ubuntu@<your-oracle-ip>

# Pull latest code
cd StudyCal
git pull

# Restart backend
cd backend
source venv/bin/activate
pkill gunicorn
nohup gunicorn --bind 0.0.0.0:5000 --workers 2 run:app &
```

Frontend on Vercel redeploys automatically on every push to main.
