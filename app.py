from flask import Flask, render_template

app = Flask(__name__)

@app.route("/")
def home():
    user = "Jeremiah"
    minutes = 145
    logs = [
        {"date": "Apr 30", "minutes": 25, "activity": "Scales & Arpeggios"},
        {"date": "Apr 29", "minutes": 45, "activity": "Rhapsody in Blue"},
        {"date": "Apr 28", "minutes": 30, "activity": "Chromatic Exercises"},
    ]
    return render_template("index.html", user=user, minutes=minutes, logs=logs)

@app.route("/log")
def log_page():
    return render_template("log.html")

if __name__ == "__main__":
    app.run(debug=True)