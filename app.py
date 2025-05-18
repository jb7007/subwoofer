from flask import Flask, render_template

app = Flask(__name__)

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/dashboard")
def dashboard():
    user = "Jeremiah"
    minutes = 145
    return render_template("dashboard.html", user=user, minutes=minutes)

@app.route("/log")
def log_page():
    return render_template("log.html")

if __name__ == "__main__":
    app.run(debug=True)