
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

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
