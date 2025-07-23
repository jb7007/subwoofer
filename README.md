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

## 📂 Project Structure

🎷 PRACTICE TRACKER (SUBWOOFER) PROJECT TREE 🎷

practice-tracker/
├── 📋 Project Config
│ ├── .env # Environment variables (API keys, secrets)
│ ├── .gitignore # Git ignore patterns
│ ├── README.md # Project documentation
│ ├── requirements.txt # Python dependencies
│ └── run.py # Flask application entry point
│
├── 🏗️ Backend (Python/Flask)
│ └── app/
│ ├── \_\_init\_\_.py # Flask app factory & configuration
│ ├── models.py # SQLAlchemy database models
│ ├── instrument_map.py # Instrument categorization
│ │
│ ├── 🛣️ routes/ # Blueprint route handlers
│ │ ├── \_\_init\_\_.py # Blueprint registration
│ │ ├── auth.py # Authentication (login/register/logout)
│ │ ├── dash.py # Dashboard & chart API endpoints
│ │ ├── logs.py # Practice log CRUD operations
│ │ ├── main.py # Core app routes (home page)
│ │ └── stats.py # Statistics & pieces management
│ │
│ ├── 🔧 utils/ # Utility functions
│ │ ├── \_\_init\_\_.py # Utility exports
│ │ ├── auth.py # Authentication helpers
│ │ ├── db.py # Database operations
│ │ ├── formatting.py # Data serialization & formatting
│ │ ├── query.py # Database query helpers
│ │ ├── stats.py # Statistical calculations & chart data
│ │ └── time.py # Timezone utilities
│ │
│ └── 📄 templates/ # Jinja2 HTML templates
│ ├── dashboard.html # Main dashboard page
│ ├── index.html # Home/landing page
│ ├── log.html # Practice log entry page
│ └── stats.html # Statistics page
│
├── 🎨 Frontend (HTML/CSS/JS)
│ └── static/
│ ├── style.css # Main stylesheet
│ │
│ ├── 🖼️ images/ # Static assets
│ │ ├── home/ # Homepage images
│ │ └── shared/ # Shared icons & backgrounds
│ │
│ └── 📜 js/ # JavaScript modules
│ ├── init.js # Global app initialization
│ │
│ ├── 🎬 animation/ # GSAP animations
│ │ ├── homepage.js # Landing page animations
│ │ └── modal.js # Modal transition effects
│ │
│ ├── 🌐 api/ # Backend communication
│ │ ├── index.js # API exports
│ │ ├── api-helper.js # Fetch wrapper & error handling
│ │ ├── auth.js # Authentication API calls
│ │ ├── dash.js # Dashboard statistics API
│ │ └── logs.js # Practice log API calls
│ │
│ ├── 🧩 components/ # Reusable UI components
│ │ ├── index.js # Component exports
│ │ ├── dash-metrics.js # Dashboard metrics display
│ │ ├── graph-display.js # Plotly chart rendering
│ │ ├── log-table.js # Practice log table
│ │ ├── recent-logs.js # Recent sessions display
│ │ └── time-format.js # Duration formatting
│ │
│ ├── 📝 forms/ # Form handling
│ │ ├── index.js # Form exports
│ │ ├── log-form.js # Practice log entry form
│ │ ├── login-form.js # User login form
│ │ └── signup-form.js # User registration form
│ │
│ ├── 🧠 logic/ # Business logic
│ │ ├── index.js # Logic exports
│ │ └── logs/ # Log processing logic
│ │ └── logs.js # Log data processing
│ │
│ ├── 🎭 modals/ # Modal system
│ │ ├── index.js # Modal exports
│ │ ├── modal-helper.js # Modal utilities
│ │ ├── modal-safety.js # Safe modal operations
│ │ └── modal-setup.js # Modal initialization
│ │
│ ├── 📱 pages/ # Page-specific logic
│ │ ├── dashboard.js # Dashboard initialization
│ │ └── log.js # Log page logic
│ │
│ ├── 💾 state/ # Client-side state
│ │ └── logs.js # Log state management
│ │
│ └── 🛠️ utils/ # JavaScript utilities
│ ├── index.js # Utility exports
│ ├── instrument-map.js # Instrument categorization
│ └── log-utils.js # Log processing helpers
│
├── 🗄️ Database
│ └── instance/
│ └── practice.db # SQLite database file
│
├── 🧪 Testing
│ └── tests/
│ ├── \_\_init\_\_.py # Test package
│ ├── conftest.py # Pytest configuration
│ ├── test_auth.py # Authentication tests
│ ├── test_dashboard.py # Dashboard tests
│ ├── test_logs.py # Practice log tests
│ ├── test_pieces.py # Piece management tests
│ └── test_utils.py # Utility function tests
│
└── 🛡️ Development Environment
├── .venv/ # Python virtual environment
├── .vscode/ # VS Code configuration
│ └── settings.json # Editor settings
└── **pycache**/ # Python bytecode cache
