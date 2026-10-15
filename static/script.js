async function runPrediction() {
    const temperature = Number(document.getElementById("temperature").value);
    const vibration = Number(document.getElementById("vibration").value);
    const pressure = Number(document.getElementById("pressure").value);
    const rpm = Number(document.getElementById("rpm").value);

    const probabilityElement = document.getElementById("probability");
    const statusElement = document.getElementById("status");
    const messageElement = document.getElementById("message");

    try {
        const response = await fetch("/predict", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ temperature, vibration, pressure, rpm })
        });

        if (!response.ok) {
            throw new Error("Prediction request failed");
        }

        const result = await response.json();

        probabilityElement.textContent = result.failure_probability;
        statusElement.textContent = result.status;
        messageElement.textContent =
            result.status === "Normal"
                ? "Machine readings look normal in this demo."
                : "Warning: Check the machine readings.";
    } catch (error) {
        statusElement.textContent = "Error";
        messageElement.textContent =
            "Prediction failed. Check whether the Flask server is running.";
    }
}

