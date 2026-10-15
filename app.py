
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

from flask import session, redirect, url_for
import os

app.secret_key = os.environ.get("SECRET_KEY", "temporary-demo-key-change-this")

@app.route("/login-page")
def login_page():
    if session.get("logged_in"):
        return redirect(url_for("home"))
    return render_template("login.html")

@app.route("/login", methods=["POST"])
def login():
    username = request.form.get("username", "")
    password = request.form.get("password", "")

    expected_username = os.environ.get("LOGIN_USERNAME", "admin")
    expected_password = os.environ.get("LOGIN_PASSWORD", "ChangeMe123!")

    if username == expected_username and password == expected_password:
        session["logged_in"] = True
        return redirect(url_for("home"))

    return "Invalid username or password. Please go back and try again.", 401

@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("login_page"))


@app.route("/")
def home():
    return render_template("index.html")

@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()

    temperature = float(data.get("temperature", 72))
    vibration = float(data.get("vibration", 4.2))
    pressure = float(data.get("pressure", 70))
    rpm = float(data.get("rpm", 1450))

    risk = 0

    if temperature > 80:
        risk += 30
    if vibration > 5:
        risk += 30
    if pressure > 90 or pressure < 40:
        risk += 20
    if rpm > 1600 or rpm < 600:
        risk += 20

    risk = min(risk, 100)
    status = "Warning" if risk >= 30 else "Normal"

    return jsonify({
        "failure_probability": risk,
        "status": status
    })

if __name__ == "__main__":
    app.run(debug=True)
