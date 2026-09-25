🌿 Handicraft Hub – MERN E-Commerce Website
===========================================

A full-stack MERN application for showcasing and managing handcrafted products.

Built using modern web technologies to provide a seamless shopping experience.

---

## 🚀 Live Demo

🌐 Frontend:
https://handicraft-website-sgak-git-main-chandan-sahoos-projects.vercel.app/

🔧 Backend API:
https://handicraft-website.onrender.com/

---

## 📸 Screenshots

### 🏠 Frontend Website View

![Frontend Website](screenshots/frontend.png)

---

### 🔧 Backend API Response

![Backend API](screenshots/backend.png)

---

## 📌 Features

✅ Product Listing  
✅ Category Management  
✅ Image Upload & Display  
✅ Contact Form API  
✅ RESTful API Integration  
✅ Cloud Database (MongoDB Atlas)  
✅ Full CRUD Operations  

---

## 🏗 Tech Stack

### Frontend
- React  
- Axios  
- React Router  
- CSS  

### Backend
- Node.js  
- Express.js  
- MongoDB (Mongoose)  
- CORS  
- dotenv  

### Database
- MongoDB Atlas (Cloud)

---

## 📁 Project Structure


HANDICRAFT-WEBSITE/
├── public/
├── screenshots/
│ ├── frontend.png
│ └── backend.png
├── server/
│ ├── routes/
│ ├── models/
│ ├── uploads/
│ └── index.js
├── src/
├── .gitignore
├── package.json
└── README.md


---

## ⚙️ Installation (Local Setup)

### Clone Repository

```bash
git clone https://github.com/chandugithubui/handicraft-website.git
cd handicraft-website
Backend Setup
cd server
npm install

Create .env file inside server folder:

MONGODB_URI=your_mongodb_connection_string
PORT=5000

Run backend:

node index.js

Backend runs at:

http://localhost:5000
Frontend Setup
cd client
npm install
npm start

Frontend runs at:

http://localhost:3000
## 🔐 Google OAuth 2.0 Authentication & Production Security

This application features a production-grade **Google OAuth 2.0 Authorization Code flow** with short-lived access tokens, rotating refresh tokens (RTR) stored in `httpOnly` secure cookies, server-side ID token verification, and CSRF state parameter validation.

### 1. Google Cloud Console Setup

1. Open the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project (e.g., `Handicraft-Hub`).
3. Navigate to **APIs & Services** → **OAuth consent screen**:
   - Choose **External** user type and click **Create**.
   - Fill in App Name (`Handicraft Hub`), User support email, and Developer contact information.
   - Add scopes: `openid`, `.../auth/userinfo.profile`, `.../auth/userinfo.email`.
   - Add test users if your app is in "Testing" mode.
4. Navigate to **APIs & Services** → **Credentials**:
   - Click **Create Credentials** → **OAuth client ID**.
   - Select **Web application**.
   - Under **Authorized JavaScript origins**, add:
     - `http://localhost:3000`
     - `http://127.0.0.1:3000`
     - Your production frontend URL (e.g., `https://handicraft-website-*.vercel.app`)
   - Under **Authorized redirect URIs**, add:
     - `http://localhost:5000/api/auth/google/callback`
     - Your production backend callback URL (e.g., `https://handicraft-website.onrender.com/api/auth/google/callback`)
5. Copy the **Client ID** and **Client Secret**.

### 2. Environment Variables (.env)

In the `server/` directory, copy `.env.example` to `.env` and fill in:

```env
# Google OAuth 2.0
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
ALLOWED_REDIRECT_URIS=http://localhost:3000,http://127.0.0.1:3000

# Token Configuration
JWT_SECRET=your-primary-jwt-secret
JWT_ACCESS_SECRET=your-access-token-secret
JWT_REFRESH_SECRET=your-refresh-token-secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

### 3. Running Locally

```bash
# Terminal 1: Backend
cd server
npm install
npm run build    # Compiles TypeScript
npm start        # Starts server on http://localhost:5000

# Terminal 2: Frontend
npm install
npm start        # Starts React frontend on http://localhost:3000
```

### 4. Running Backend Tests

The backend includes service-layer unit tests (mocking Google APIs and token rotation) and Supertest integration tests:

```bash
cd server
npm test
```

### 5. Auth API Endpoints

| Method | Endpoint | Description | Protection |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/auth/google` | Initiates OAuth 2.0 code flow & sets CSRF state | Rate limited (30 req / 15m) |
| `GET` | `/api/auth/google/callback` | Google redirect callback, token exchange & cookie issuance | Rate limited (30 req / 15m) |
| `POST` | `/api/auth/refresh` | Rotates refresh token & issues new access token | Rate limited (60 req / 15m) |
| `POST` | `/api/auth/logout` | Revokes DB tokens and clears `httpOnly` cookies | Public / Authenticated |
| `GET` | `/api/auth/me` | Retrieves authenticated user profile | Bearer Token / Cookie |
| `POST` | `/api/auth/login` | Local email + password authentication | Rate limited (10 req / 15m) |
| `POST` | `/api/auth/register` | Local email + password registration | Rate limited (10 req / 15m) |

---

## 🔌 Existing API Endpoints
Method	Endpoint	Description
GET	/api/products	Get all products
POST	/api/products	Add product
GET	/api/categories	Get categories
POST	/api/contacts	Submit contact form


🔐 Environment Variables

Create .env file in server folder:

MONGODB_URI=your_atlas_connection_string
PORT=5000

⚠️ Never commit .env to GitHub.

👨‍💻 Author

Chandan Sahoo

GitHub: https://github.com/chandugithubui

📜 License

This project is for learning and portfolio purposes.