# 🎷 Subwoofer – Practice Tracker for Musicians  
*A clean, fast, animated full-stack web app to log practice sessions, track progress, and stay accountable.*

> **Status:** Actively developed, on temporary hiatus (college move) | Not yet deployed | Core functionality working as of August 2025

---

## 🧠 Why I Built This  
As a saxophonist and computer science major, I needed a better way to track my practice, stay motivated, and actually see my progress. Subwoofer started as a personal project but evolved into a full-featured platform that helps musicians build consistency, set goals, and visualize growth — no matter their instrument.

---

## 🌟 Features

### ✅ Completed
- 🔐 User authentication and session management  
- 📝 Log practice sessions by piece, instrument, duration, and notes  
- 📈 Dashboard with stats, charts, and recent activity  
- 🌍 Timezone-aware backend logic (UTC storage, local display)  
- 🧱 Modular API structure & centralized fetch logic  
- 📊 Plotly-based interactive charts (total, daily, average)  
- 🧾 Fully documented codebase with docstrings and inline comments  

### 🚧 In Progress / Planned
- 🎯 Goal setting and progress tracking  
- 📅 Calendar heatmap view  
- 🔥 Practice streaks and daily consistency tracker  
- 🏆 Leaderboard with top users or personal bests  
- 📤 Data export (CSV / PDF)  
- 🧪 Test suite (PyTest, Jest)  

---

## ⚙️ Tech Stack

- **Backend:** Python (Flask), SQLite (dev), SQLAlchemy ORM  
- **Frontend:** Jinja2 templates, Bootstrap 5, custom CSS  
- **Client-side:** Vanilla JavaScript, GSAP animations  
- **Data Visualization:** Plotly.js  
- **Authentication:** Flask-Login (sessions + protected routes)  
- **API Architecture:** Modularized by feature, shared helpers  

---

## 🏗️ Recent Architecture Updates

### 📈 Backend Graph Calculations  
All dashboard chart data is now calculated server-side for improved performance and accuracy. The unified `/api/dashboard/stats` endpoint returns all charts and key statistics in a single response.

### 🌐 Timezone Handling  
Practice logs are timestamped in UTC and displayed in the user's local timezone to ensure consistent cross-region usage.

### 📚 Code Documentation  
Comprehensive docstrings and inline comments have been added across the codebase to support developer onboarding, refactoring, and future contributions.

---

## 📊 API Endpoints

| Endpoint                | Method | Description                            |
|------------------------|--------|----------------------------------------|
| `/api/dashboard/stats` | GET    | Returns all chart and stat data        |
| `/api/logs`            | GET    | Returns all logs for current user      |
| `/api/logs`            | POST   | Creates a new practice log entry       |
| `/api/recent-logs`     | GET    | Returns logs for recent activity box   |

---

## 🚧 To Do

- [ ] Build goal editor UI  
- [ ] Finalize dashboard layout and polish  
- [ ] Add streak-tracking logic  
- [ ] Add calendar heatmap visualization  
- [ ] Allow export of practice data  
- [ ] Write tests (backend + frontend)  

---

## 🔧 Local Development Setup

```bash
git clone https://github.com/jb7007/subwoofer.git
cd subwoofer
pip install -r requirements.txt

# Set up a .env file with your Flask config variables
python run.py
```

Visit:  
`http://localhost:5000`

---

## 📸 Screenshots  
*(Coming soon – UI cleanup and animations in progress)*

---

## ✨ Future Plans

- Mobile-responsive layout  
- OAuth or social login support  
- Public profile pages or practice sharing  

---

## 📇 Author

**Jeremiah Branch**  
Sophomore CS Major @ Michigan Tech  
Musician 🎷 | Developer 💻 | Tired 😓  
[github.com/jb7007](https://github.com/jb7007)

---

> This project is built with love, frustration, caffeine, and absolutely way too many browser tabs. 🤍
