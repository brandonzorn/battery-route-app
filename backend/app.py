from flask import Flask, request, jsonify
from flask_cors import CORS

from configs import PRESETS

app = Flask(__name__)

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

CORS(app, origins=origins)


def calculate_energy(mass, delta_h, distance, speed_kmh, rolling_resistance_mm, wheel_radius_mm,
                     drag_coefficient, frontal_area_m2, air_density, inefficiency_percent, 
                     regen_efficiency=0, total_descent=0):
    """
    Расчет энергии на движение по формулам из документа
    """
    g = 9.81
    speed_ms = speed_kmh / 3.6
    
    # 1. Энергия на подъем (формула 1)
    U_n = mass * g * delta_h  # Дж
    U_n_kj = U_n / 1000
    
    # 2. Энергия на трение качения (формулы 3 и 5)
    F_rolling = (rolling_resistance_mm / 1000) * (mass * g) / (wheel_radius_mm / 1000)  # Н
    U_rolling = F_rolling * distance * 1000  # Дж (distance в км -> м)
    U_rolling_kj = U_rolling / 1000
    
    # 3. Энергия на аэродинамическое сопротивление (формулы 6 и 8)
    F_air = 0.5 * drag_coefficient * frontal_area_m2 * air_density * (speed_ms ** 2)  # Н
    U_air = F_air * distance * 1000  # Дж
    U_air_kj = U_air / 1000
    
    # 4. Энергия на инерционные силы (упрощенно - на разгон, формула 10)
    num_accelerations = 20
    accel_distance = 50  # м
    acceleration = 0.5  # м/с²
    U_inertia = mass * acceleration * accel_distance * num_accelerations  # Дж
    U_inertia_kj = U_inertia / 1000
    
    # Суммарная энергия
    total_energy_kj = U_n_kj + U_rolling_kj + U_air_kj + U_inertia_kj
    
    # Неучтенные потери
    total_energy_kj *= (1 + inefficiency_percent / 100)
    
    # Рекуперация
    if total_descent > 0:
        regen_energy = mass * g * total_descent * (regen_efficiency / 100) / 1000  # кДж
        total_energy_kj = max(total_energy_kj - regen_energy, total_energy_kj * 0.7)
    
    return {
        'climb_energy': round(U_n_kj, 1),
        'rolling_energy': round(U_rolling_kj, 1),
        'air_energy': round(U_air_kj, 1),
        'inertia_energy': round(U_inertia_kj, 1),
        'total_energy_kj': round(total_energy_kj, 1),
        'total_energy_wh': round(total_energy_kj / 3.6, 1)
    }

def calculate_battery(voltage, energy_wh, charger_efficiency, bms_losses, thermal_losses):
    """
    Расчет необходимой емкости АКБ с учетом потерь при зарядке
    """
    total_efficiency = (charger_efficiency / 100) * ((100 - bms_losses) / 100) * ((100 - thermal_losses) / 100)
    required_energy_wh = energy_wh / total_efficiency
    required_capacity_ah = required_energy_wh / voltage
    
    return {
        'required_capacity_ah': round(required_capacity_ah, 1),
        'required_energy_wh': round(required_energy_wh, 1),
        'total_efficiency': round(total_efficiency * 100, 1)
    }


@app.route("/vehicles", methods=["GET"])
def vehicles():
    return jsonify(PRESETS)

@app.route('/calculate', methods=["POST"])
def calculate():
    data = request.json
    
    mass = float(data.get('mass', 100))
    speed = float(data.get('speed', 25))
    rolling_resistance = float(data.get('rolling_resistance', 2))
    wheel_radius = float(data.get('wheel_radius', 350))
    drag_coefficient = float(data.get('drag_coefficient', 1))
    frontal_area = float(data.get('frontal_area', 0.4))
    inefficiency = float(data.get('inefficiency', 10))
    delta_h = float(data.get('delta_h', 0))
    total_descent = float(data.get('total_descent', 0))
    distance = float(data.get('distance', 0))
    regen_efficiency = float(data.get('regen_efficiency', 0))
    battery_voltage = float(data.get('battery_voltage', 48))
    charger_efficiency = float(data.get('charger_efficiency', 85))
    bms_losses = float(data.get('bms_losses', 5))
    thermal_losses = float(data.get('thermal_losses', 5))
    
    energy_result = calculate_energy(
        mass, delta_h, distance, speed,
        rolling_resistance, wheel_radius,
        drag_coefficient, frontal_area, 1.2,
        inefficiency, regen_efficiency, total_descent
    )
    
    battery_result = calculate_battery(
        battery_voltage, energy_result['total_energy_wh'],
        charger_efficiency, bms_losses, thermal_losses
    )
    
    return jsonify({
        'energy': energy_result,
        'battery': battery_result
    })

if __name__ == '__main__':
    app.run(debug=True)