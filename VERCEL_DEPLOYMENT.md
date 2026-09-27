# Deploying Bulk Mailer to Vercel (Unified Frontend + Backend)

Both the **React Frontend** and the **Express Backend** are configured to deploy together into **one single Vercel project**.

---

## 📁 How It Works

- **Frontend:** Built via React (`frontend/build`) and served statically across Vercel's global CDN edge network.
- **Backend:** Express API served as a Vercel Serverless Function via [`api/index.js`](api/index.js).
- **Routing:** Handled automatically by [`vercel.json`](vercel.json):
  - Requests to `/api/*` → Routed to Express Serverless Function
  - All other routes `/*` → Routed to React SPA frontend

---

## 🚀 Steps to Deploy

### Step 1: Push your code to GitHub

In your project directory, run:
```bash
git init
git add .
git commit -m "Configure full-stack Vercel deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

---

### Step 2: Import into Vercel

1. Go to [vercel.com](https://vercel.com) and log in.
2. Click **"Add New..."** → **"Project"**.
3. Select your GitHub repository and click **Import**.
4. Leave **Framework Preset** as *Other* (or Create React App).
5. Vercel will automatically detect `vercel.json`.

---

### Step 3: Add Environment Variables in Vercel

Before clicking Deploy, expand **"Environment Variables"** in the Vercel setup screen (or go to **Project Settings → Environment Variables**) and add these:

| Key | Value | Description |
|---|---|---|
| `MONGO_URI` | `mongodb+srv://princebulk:081104@cluster0.p7pt0ci.mongodb.net/bulkmail?appName=Cluster0` | MongoDB Atlas database |
| `JWT_SECRET` | `change_this_to_a_long_random_secret` | Auth JWT signing secret |
| `JWT_EXPIRES_IN` | `8h` | Token expiration |
| `EMAIL_SERVICE` | `gmail` | Email provider |
| `EMAIL_USER` | `covs0804@gmail.com` | Sending Gmail address |
| `EMAIL_PASS` | `yfwvjuizlzcvovoc` | 16-character Google App Password |
| `EMAIL_FROM_NAME` | `Bulk Mailer` | Sender name shown in emails |
| `ADMIN_USERNAME` | `admin` | Admin username |
| `ADMIN_PASSWORD` | `admin123` | Admin password |

---

### Step 4: Click Deploy!

Click **Deploy**. In ~1-2 minutes, Vercel will build both React and Express and give you a live production URL:
```text
https://your-project-name.vercel.app
```

- **Frontend:** `https://your-project-name.vercel.app`
- **Backend API:** `https://your-project-name.vercel.app/api/...`
- **Login:** Username: `admin` | Password: `admin123`
