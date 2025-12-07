CineVerse

“CineVerse” offers a smart recommendation system that personalizes suggestions based on user preferences, genres and ratings. It also allows users to explore trending movies, search and filter by categories, and maintain their own watchlists — making movie discovery simple and enjoyable.

🌟 Features
🎥 Movie Discovery

Trending movies

Latest releases

Genre-based browsing (Thriller, Drama, Kids, Action & Adventure)

Personalized hero banner

🔍 Smart Search System

Live search suggestions

Search result page with pagination

Search by title

💾 User Watchlist

Add / remove movies from watchlist

Persisted in database

Syncs across login sessions

🔐 User Authentication

Signup & login

JWT-based authentication

Protected routes

📝 Movie Details Page

Large hero poster

Overview, ratings, genres

Cast, trailers, similar movies

Reviews section

⚡ Performance & UX

Loading skeletons

Optimized Axios calls

Global state via Context API

Smooth transitions

📱 Responsive Layout

Works on desktop & mobile

Teal-themed Netflix-style UI

🛠️ Tech Stack
Frontend

React (Vite)

JavaScript

React Router

Axios

Context API

CSS Modules / Custom CSS

TMDB API

Backend

Node.js

Express.js

Prisma ORM

MySQL

JWT Authentication

bcryptjs

CORS

dotenv

📁 Project Structure
CineVerse/
├── backend/
│   ├── server.js               # Express entry point
│   ├── prisma/
│   │   ├── schema.prisma       # Database models
│   │   └── client.js           # Prisma client
│   ├── controllers/
│   │   ├── authController.js   # Login, signup, token verification
│   │   ├── moviesController.js # TMDB API integrations
│   │   └── userController.js   # Watchlist + profile
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── moviesRoutes.js
│   │   └── userRoutes.js
│   ├── middlewares/
│   │   └── authMiddleware.js   # JWT validation
│   ├── utils/
│   └── .env
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── MovieDetails.jsx
│   │   │   ├── Watchlist.jsx
│   │   │   └── SearchResults.jsx
│   │   ├── components/
│   │   │   ├── Nav.jsx
│   │   │   ├── Hero.jsx
│   │   │   ├── MovieCard.jsx
│   │   │   ├── RankedRow.jsx
│   │   │   └── RowSkeleton.jsx
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx
│   │   ├── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   ├── .env
│   └── package.json
│
└── README.md

🚀 Getting Started
Prerequisites

Make sure you have installed:

Node.js (v16+)

NPM or Yarn

MySQL

Git

🏗️ Installation
1️⃣ Clone the Repo
git clone https://github.com/your-username/CineVerse.git
cd CineVerse

🔧 Backend Setup
cd backend
npm install

Create .env inside /backend:
DATABASE_URL="mysql://username:password@localhost:3306/cineverse"
JWT_SECRET="your-super-secret-key"
TMDB_API_KEY="your_tmdb_api_key"
PORT=8080

Run Prisma Migration
npx prisma migrate dev --name init

Start Backend
npm run dev


Backend runs at:
👉 http://localhost:8080

🎨 Frontend Setup
cd ../frontend
npm install

Create .env inside /frontend:
VITE_API_URL="http://localhost:8080"
VITE_TMDB_IMAGE_BASE="https://image.tmdb.org/t/p/w500"

Start Frontend
npm run dev


Frontend runs at:
👉 http://localhost:5173

🔐 Authentication Flow
Signup

User registers → password hashed using bcryptjs

Prisma stores user

JWT token generated

Token saved in localStorage

Login

Credentials validated

Token re-issued

React stores token & user

Protected Routes

React checks token in AuthContext

Backend checks with verifyToken middleware

Logout

Token removed from localStorage

User redirected to login

🗄️ Database Schema
model User {
  id        Int          @id @default(autoincrement())
  name      String?
  email     String       @unique
  password  String
  watchlist Watchlist[]
}

model Watchlist {
  id          Int      @id @default(autoincrement())
  userId      Int
  tmdbId      String
  title       String?
  poster      String?
  release_date String?

  user User @relation(fields: [userId], references: [id])
}

🔌 API Endpoints
⭐ Authentication
POST /api/auth/signup
POST /api/auth/login
GET  /api/auth/verify
POST /api/auth/logout

⭐ Movies (TMDB API)
GET /api/movies/trending
GET /api/movies/latest
GET /api/movies/genre/:name
GET /api/movies/search?query=
GET /api/movies/:id
GET /api/movies/:id/reviews

⭐ Watchlist
GET    /api/user/watchlist
POST   /api/user/watchlist
DELETE /api/user/watchlist/:id

🛡️ Security Features

✔ JWT Authentication
✔ Password hashing with bcryptjs
✔ Protected routes (frontend + backend)
✔ CORS configuration
✔ Environment variables hidden via .env

🧪 Troubleshooting
❗ “Watchlist not updating”

Check:

Token exists in localStorage

Axios default header set in AuthContext

❗ “TMDB API error”

Ensure in .env:

TMDB_API_KEY=your_key_here

❗ “CORS blocked”

Backend must include:

app.use(cors({ origin: "*" }));

📦 Build & Deployment
Frontend Build
npm run build

Deployment Options

Frontend: Vercel, Netlify

Backend: Render, Railway, AWS

Database: PlanetScale, Aiven MySQL, AWS RDS

👨‍💻 Author

Your Name
GitHub: https://github.com/yourusername

🙏 Acknowledgments

TMDB API for movie data

React community

Prisma ORM

Everyone contributing to open-source

🎥 CineVerse — Escape into Cinema ✨

A full-stack streaming-style platform designed with modern architecture, stunning UI, and clean code.

If you want, I can also:

✅ Add badges (build, license, tech stack icons)
✅ Add screenshots inside README
✅ Add animated demo GIF
✅ Create a cover banner for your GitHub profile

