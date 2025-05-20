from flask import Flask, request, jsonify
from datetime import datetime

app = Flask(__name__)

LOG_FILE = "log.txt"

@app.route("/log", methods=["POST"])
def log_data():
    data = request.get_json()
    if not data or 'value' not in data:
        return jsonify({"error": "Missing 'value' in JSON"}), 400

    log_line = f"{datetime.utcnow().isoformat()} - {data['value']}\n"
    with open(LOG_FILE, "a") as f:
        f.write(log_line)

    return jsonify({"message": "Logged"}), 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
