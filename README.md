# 🎷 Practice Tracker (WIP)

Hi there! I'm Jeremiah, and this is _SUBWOOFER_ —

_A full-stack web app for musicians to track their practice sessions, visualize progress, and stay motivated over time._

## 🌟 Features (planned / in progress)

- ✅ User authentication & account management
- ✅ Session logging (piece, instrument, duration, notes)
- ✅ Dashboard with graphs & stats
- ✅ Backend-calculated chart data with timezone support
- ✅ Comprehensive code documentation and comments
- 🛠️ Goal setting and tracking
- 🛠️ Calendar heatmap
- 🛠️ Practice streaks & leaderboard

## ⚙️ Tech Stack

- **Backend:** Python (Flask), SQLite (development)
- **Frontend:** Jinja2 (server-rendered templates), Bootstrap + custom CSS
- **Client-side Logic:** Vanilla JS + GSAP (for animation)
- **Charts:** Plotly.js for interactive data visualization
- **API Architecture:** Modularized fetch logic (grouped by feature, centralized with a shared helper)

## 🧠 Why I Built This

I'm a saxophonist who wanted a better way to track my personal growth. I built this for myself — to see how far I've come and where I'm going — but I hope it helps other musicians too, especially the ones who just need a little nudge to keep going.

## 🏗️ Recent Architecture Updates

**Backend Chart Calculations:** All graph data is now calculated server-side for better performance and consistency. The dashboard API provides a unified endpoint that delivers all chart data in a single request.

**Timezone Handling:** Proper timezone conversion ensures accurate data display regardless of user location. All timestamps are stored in UTC and converted to user's local timezone for display.

**Code Documentation:** Comprehensive docstrings and inline comments have been added throughout the codebase for better maintainability and developer onboarding.

## 🚧 Status

**As of July 23, 2025:** This project is actively being developed and will be deployed once core features are complete. The core functionality is working with recent improvements to data processing and code quality.

## 📝 To Do

- [ ] Add goal editor interface
- [ ] Finalize dashboard design
- [ ] Add practice streaks calculation
- [ ] Implement calendar heatmap view
- [ ] Add data export functionality
- [ ] ...and more to come!

## 🔧 Development Setup

1. Clone the repository
2. Install dependencies: `pip install -r requirements.txt`
3. Set up environment variables in `.env` file
4. Run the application: `python run.py`
5. Access at `http://localhost:5000`

## 📊 API Endpoints

- `GET /api/dashboard/stats` - Unified dashboard data (charts + statistics)
- `GET /api/logs` - User's practice logs
- `POST /api/logs` - Create new practice log
- `GET /api/recent-logs` - Recent practice sessions for dashboard
