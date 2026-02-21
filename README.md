🌿 Handicraft Hub – MERN E-Commerce Website

A full-stack MERN application for showcasing and managing handcrafted products.

Built using:

⚛ React (Frontend)

🟢 Node.js + Express (Backend)

🍃 MongoDB Atlas (Database)

☁ Deployed on Vercel + Render

🚀 Live Demo

Frontend: (Add Vercel link after deployment)
Backend API: (Add Render link after deployment)

📌 Features

🛍 Product Listing

📂 Category Management

🖼 Image Upload & Display

📬 Contact Form API

🔍 RESTful API Integration

🌐 Cloud Database (MongoDB Atlas)

📦 Full CRUD Operations

🏗 Tech Stack
Frontend

React

Axios

React Router

CSS

Backend

Node.js

Express.js

MongoDB (Mongoose)

CORS

dotenv

Database

MongoDB Atlas (Cloud)

📁 Project Structure
handicraft-website/
│
├── client/        # React frontend
├── server/        # Express backend
│   ├── routes/
│   ├── models/
│   ├── uploads/
│   └── index.js
│
└── README.md
⚙️ Installation (Local Setup)
1️⃣ Clone the Repository
git clone https://github.com/chandugithubui/handicraft-website.git
cd handicraft-website
2️⃣ Backend Setup
cd server
npm install

Create .env file inside server/:

MONGODB_URI=your_mongodb_connection_string
PORT=5000

Run backend:

node index.js

Server runs on:

http://localhost:5000
3️⃣ Frontend Setup
cd client
npm install
npm start

Frontend runs on:

http://localhost:3000
🔌 API Endpoints
Method	Endpoint	Description
GET	/api/products	Get all products
POST	/api/products	Add new product
GET	/api/categories	Get categories
POST	/api/contacts	Submit contact form
🌍 Deployment

Frontend → Vercel
Backend → Render
Database → MongoDB Atlas

🔐 Environment Variables

Create a .env file in server folder:

MONGODB_URI=your_atlas_connection_string
PORT=5000

⚠️ Never commit .env to GitHub.

👨‍💻 Author

Chandan Sahoo
GitHub: https://github.com/chandugithubui

📜 License

This project is for learning and portfolio purposes.