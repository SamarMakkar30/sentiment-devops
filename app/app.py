from flask import Flask, request, jsonify, render_template, Response
import joblib
import os
import time
from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
FRONTEND_DIST = os.path.join(BASE_DIR, "frontend", "dist")

app = Flask(__name__, static_folder=FRONTEND_DIST, static_url_path="")

REQUEST_COUNT = Counter(
    "http_requests_total",
    "Total HTTP requests",
    ["method", "endpoint", "http_status"],
)
REQUEST_LATENCY = Histogram(
    "http_request_latency_seconds",
    "HTTP request latency in seconds",
    ["endpoint"],
)

# Load the trained model
model_path = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "model", "model.pkl")
)
model = joblib.load(model_path)


@app.before_request
def start_timer():
    request.start_time = time.perf_counter()


@app.after_request
def record_metrics(response):
    endpoint = request.path
    REQUEST_COUNT.labels(
        method=request.method, endpoint=endpoint, http_status=response.status_code
    ).inc()
    if hasattr(request, "start_time"):
        REQUEST_LATENCY.labels(endpoint=endpoint).observe(
            time.perf_counter() - request.start_time
        )
    return response


@app.route("/")
def home():
    index_path = os.path.join(app.static_folder, "index.html")
    if os.path.exists(index_path):
        return app.send_static_file("index.html")
    return render_template("index.html")


@app.route("/<path:path>")
def static_proxy(path):
    file_path = os.path.join(app.static_folder, path)
    if os.path.isfile(file_path):
        return app.send_static_file(path)
    index_path = os.path.join(app.static_folder, "index.html")
    if os.path.exists(index_path):
        return app.send_static_file("index.html")
    return render_template("index.html")


@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json(silent=True)

    if not data or "text" not in data:
        return jsonify({"error": "Please send JSON with a \"text\" field"}), 400

    text = data["text"]
    prediction = model.predict([text])[0]
    confidence = float(model.predict_proba([text])[0].max())

    result = "positive" if prediction == 1 else "negative"

    return jsonify(
        {
            "text": text,
            "sentiment": result,
            "confidence": round(confidence * 100, 1),
        }
    )


@app.route("/health")
def health():
    return jsonify({"status": "ok"})


@app.route("/metrics")
def metrics():
    return Response(generate_latest(), mimetype=CONTENT_TYPE_LATEST)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
