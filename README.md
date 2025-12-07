# 🎬 CineVerse Frontend

CineVerse is a modern movie discovery platform featuring a smart recommendation system, genre browsing, and a personal watchlist. Exploring movies has never been easier or more enjoyable.

![CineVerse Banner](https://via.placeholder.com/1200x400?text=CineVerse+Frontend)

## 🌟 Features

### 🎥 Movie Discovery
- **Latest Releases**: Stay updated with the newest movies.
- **Trending**: See what's popular right now.
- **Recommendations**: Personalized suggestions based on your interests.

### 🎭 Genre-Based Browsing
Explore movies by genre:
- Thriller, Drama, Family
- Action & Adventure, Comedy
- Horror, Animation, and more.

### � Smart Search
- Real-time search by title.
- Live suggestions and paginated results.

### 📌 User Features
- **Watchlist**: Persist your favorite movies to your personal list.
- **Reviews**: Read community reviews and write your own.
- **Authentication**: Secure Signup and Login.

---

## 🛠️ Tech Stack

- **Framework**: React (Vite)
- **Routing**: React Router DOM
- **State Management**: Context API
- **HTTP Client**: Axios
- **Styling**: Custom CSS (Responsive & Modern)

---

## 🏗️ Installation & Setup

### Prerequisites
- Node.js (v16+)
- npm or yarn

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/Pratiti-paul/CineVerse.git
cd CineVerse/frontend
```

### 2️⃣ Install Dependencies
```bash
npm install
```

### 3️⃣ Configure Environment
Create a `.env` file in the `frontend` directory:
```env
VITE_API_URL="http://localhost:8080"
VITE_TMDB_IMAGE_BASE="https://image.tmdb.org/t/p/original"
```

### 4️⃣ Start Development Server
```bash
npm run dev
```
The app will run at `http://localhost:5173`.

---

## 📁 Project Structure

```
frontend/src/
├── components/      # Reusable UI components (MovieCard, Nav, Hero, etc.)
├── contexts/        # Auth and global state contexts
├── pages/           # Application pages (Home, Details, Profile, etc.)
├── api.jsx          # Axios instance configuration
├── App.jsx          # Main application component
└── main.jsx         # Entry point
```

---

## 📜 License
MIT License.

## 👨‍💻 Author
**Pratiti Paul**  
- [GitHub](https://github.com/Pratiti-paul)