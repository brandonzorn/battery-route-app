import os

from dotenv import load_dotenv

load_dotenv()


ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "").split(",")
DEBUG = os.getenv("DEBUG", False) in (
    "True",
    "true",
)

PRESETS = [
    {
        "kind": "bike",
        "name": "Электровелосипед",
        "mass_kg": 100.0,
        "speed_kmh": 25.0,
        "rolling_resistance_crr": 2.0,
        "wheel_radius_mm": 350.0,
        "drag_coefficient_cx": 1.0,
        "frontal_area_m2": 0.4,
        "inefficiency_percent": 10.0,
        "regen_efficiency_percent": 10.0,
        "battery_voltage_v": 48.0,
        "charger_efficiency_percent": 85.0,
        "bms_losses_percent": 5.0,
        "thermal_losses_percent": 5.0,
    },
    {
        "kind": "car",
        "name": "Электромобиль",
        "mass_kg": 1500.0,
        "speed_kmh": 60.0,
        "rolling_resistance_crr": 2.0,
        "wheel_radius_mm": 320.0,
        "drag_coefficient_cx": 0.35,
        "frontal_area_m2": 2.2,
        "inefficiency_percent": 10.0,
        "regen_efficiency_percent": 60.0,
        "battery_voltage_v": 400.0,
        "charger_efficiency_percent": 85.0,
        "bms_losses_percent": 5.0,
        "thermal_losses_percent": 5.0,
    },
    {
        "kind": "scooter",
        "name": "Электросамокат",
        "mass_kg": 85.0,
        "speed_kmh": 20.0,
        "rolling_resistance_crr": 2.5,
        "wheel_radius_mm": 200.0,
        "drag_coefficient_cx": 1.1,
        "frontal_area_m2": 0.3,
        "inefficiency_percent": 10.0,
        "regen_efficiency_percent": 5.0,
        "battery_voltage_v": 36.0,
        "charger_efficiency_percent": 85.0,
        "bms_losses_percent": 5.0,
        "thermal_losses_percent": 5.0,
    },
]
