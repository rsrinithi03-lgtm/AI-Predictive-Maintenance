
let sensorChartInstance = null;
let historyChartInstance = null;

async function runPrediction(event) {
    if (event) event.preventDefault();

    const temperature = Number(document.getElementById("temperature").value);
    const vibration = Number(document.getElementById("vibration").value);
    const pressure = Number(document.getElementById("pressure").value);
    const rpm = Number(document.getElementById("rpm").value);

    const button = document.getElementById("predictButton");
    const message = document.getElementById("message");
    const statusElement = document.getElementById("status");
    const probabilityElement = document.getElementById("probability");

    button.disabled = true;
    button.textContent = "Predicting...";
    message.textContent = "Analysing sensor readings...";

    try {
        const response = await fetch("/predict", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                temperature,
                vibration,
                pressure,
                rpm
            })
        });

        if (response.status === 401) {
            window.location.href = "/login-page";
            return;
        }

        if (!response.ok) {
            throw new Error("Prediction request failed");
        }

        const result = await response.json();

        probabilityElement.textContent = result.failure_probability;
        statusElement.textContent = result.status;

        statusElement.className =
            result.status === "Normal" ? "normal" : "warning";

        message.textContent =
            result.status === "Normal"
                ? "Machine readings look normal in this demo."
                : "Warning: Please check the machine readings.";

        // Update dashboard sensor cards
        document.getElementById("temperatureCard").textContent =
            temperature + " °C";
        document.getElementById("vibrationCard").textContent =
            vibration + " mm/s";
        document.getElementById("pressureCard").textContent =
            pressure + " PSI";
        document.getElementById("rpmCard").textContent = rpm;
        document.getElementById("probabilityCard").textContent =
            result.failure_probability + "%";

        document.getElementById("statusCard").textContent = result.status;
        document.getElementById("statusCard").className =
            result.status === "Normal" ? "normal" : "warning";

        updateSensorChart(temperature, vibration, pressure, rpm);
        await loadHistory();

    } catch (error) {
        console.error(error);
        statusElement.textContent = "Error";
        message.textContent =
            "Prediction failed. Please try again after checking the server.";
    } finally {
        button.disabled = false;
        button.textContent = "Run AI Prediction";
    }
}


function updateSensorChart(temperature, vibration, pressure, rpm) {
    const canvas = document.getElementById("sensorChart");

    if (!canvas || typeof Chart === "undefined") return;

    if (sensorChartInstance) {
        sensorChartInstance.destroy();
    }

    sensorChartInstance = new Chart(canvas, {
        type: "bar",
        data: {
            labels: [
                "Temperature (°C)",
                "Vibration (mm/s)",
                "Pressure (PSI)",
                "RPM"
            ],
            datasets: [{
                label: "Sensor Values",
                data: [temperature, vibration, pressure, rpm],
                backgroundColor: ["#2563eb", "#16a34a", "#f59e0b", "#9333ea"]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}


async function loadHistory() {
    const table = document.getElementById("historyTable");

    try {
        const response = await fetch("/history-data");

        if (response.status === 401) {
            window.location.href = "/login-page";
            return;
        }

        if (!response.ok) {
            throw new Error("Could not load history");
        }

        const records = await response.json();

        table.replaceChildren();

        if (records.length === 0) {
            const row = table.insertRow();
            const cell = row.insertCell();
            cell.colSpan = 7;
            cell.textContent = "No prediction records yet.";
        }

        records.slice().reverse().forEach(record => {
            const row = table.insertRow();

            [
                record.date,
                record.temperature,
                record.vibration,
                record.pressure,
                record.rpm,
                record.probability + "%",
                record.status
            ].forEach(value => {
                const cell = row.insertCell();
                cell.textContent = value ?? "";
            });
        });

        updateHistoryChart(records);

    } catch (error) {
        console.error(error);
        table.innerHTML =
            '<tr><td colspan="7">Unable to load history.</td></tr>';
    }
}


function updateHistoryChart(records) {
    const canvas = document.getElementById("historyChart");

    if (!canvas || typeof Chart === "undefined") return;

    if (historyChartInstance) {
        historyChartInstance.destroy();
    }

    historyChartInstance = new Chart(canvas, {
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
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });
}


document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("predictionForm");

    if (form) {
        form.addEventListener("submit", runPrediction);
    }

    const temperature = Number(
        document.getElementById("temperature").value || 72
    );
    const vibration = Number(
        document.getElementById("vibration").value || 4.2
    );
    const pressure = Number(
        document.getElementById("pressure").value || 70
    );
    const rpm = Number(
        document.getElementById("rpm").value || 1450
    );

    updateSensorChart(temperature, vibration, pressure, rpm);
    loadHistory();
});
