from flask import Flask, request, jsonify
from flask_cors import CORS
from pydantic import ValidationError

from configs import ALLOWED_ORIGINS, DEBUG, PRESETS
from database import check_db_connection
from calculation import calculate_energy, calculate_battery
from typed_models import SimulationInput, SimulationResponse

app = Flask(__name__)

CORS(app, origins=ALLOWED_ORIGINS)


@app.route("/vehicles", methods=["GET"])
def vehicles():
    return jsonify(PRESETS)


@app.route("/calculate", methods=["POST"])
def calculate():
    json_data = request.get_json(silent=True)
    if not json_data:
        return jsonify({"error": "Invalid or missing JSON payload"}), 400

    try:
        sim_input = SimulationInput(**json_data)
    except ValidationError as e:
        return jsonify({"error": "Validation Error", "details": e.errors()}), 422

    energy_res = calculate_energy(sim_input)
    battery_res = calculate_battery(energy_res.total_energy_wh, sim_input)

    response_model = SimulationResponse(energy=energy_res, battery=battery_res)
    return jsonify(response_model.model_dump())


if __name__ == "__main__":
    check_db_connection()
    app.run(debug=DEBUG)
