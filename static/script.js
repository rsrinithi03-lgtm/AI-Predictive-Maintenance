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

let sensorChartInstance = null;
let historyChartInstance = null;

function createMonitoringCharts() {
    const sensorCanvas = document.getElementById("sensorChart");
    const historyCanvas = document.getElementById("historyChart");

    if (!sensorCanvas || !historyCanvas || typeof Chart === "undefined") {
        return;
    }

    // Sensor chart
    if (sensorChartInstance) {
        sensorChartInstance.destroy();
    }

    sensorChartInstance = new Chart(sensorCanvas, {
        type: "bar",
        data: {
            labels: ["Temperature (°C)", "Vibration (mm/s)", "Pressure (PSI)", "RPM"],
            datasets: [{
                label: "Current Sensor Values",
                data: [
                    Number(document.getElementById("temperature")?.value || 72),
                    Number(document.getElementById("vibration")?.value || 4.2),
                    Number(document.getElementById("pressure")?.value || 70),
                    Number(document.getElementById("rpm")?.value || 1450)
                ],
                backgroundColor: [
                    "#2563eb",
                    "#16a34a",
                    "#f59e0b",
                    "#9333ea"
                ]
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });

    // Prediction history chart
    fetch("/history-data")
        .then(response => {
            if (!response.ok) {
                throw new Error("History data request failed");
            }
            return response.json();
        })
        .then(records => {
            if (historyChartInstance) {
                historyChartInstance.destroy();
            }

            historyChartInstance = new Chart(historyCanvas, {
                type: "line",
                data: {
                    labels: records.map(record => record.date),
                    datasets: [{
                        label: "Failure Probability (%)",
                        data: records.map(record => record.probability),
                        borderColor: "#dc2626",
                        backgroundColor: "rgba(220, 38, 38, 0.12)",
                        fill: true,
                        tension: 0.3
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100
                        }
                    }
                }
            });
        })
        .catch(error => {
            console.error("Could not load prediction history chart:", error);
        });
}

document.addEventListener("DOMContentLoaded", function () {
    createMonitoringCharts();

    const inputIds = ["temperature", "vibration", "pressure", "rpm"];

    inputIds.forEach(id => {
        const input = document.getElementById(id);

        if (input) {
            input.addEventListener("input", function () {
                createMonitoringCharts();
            });
        }
    });
});

