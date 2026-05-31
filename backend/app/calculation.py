from typed_models import SimulationInput, EnergyResult, BatteryResult


def calculate_energy(data: SimulationInput) -> EnergyResult:
    g = 9.81
    speed_ms = data.speed_kmh / 3.6
    distance_m = data.distance_km * 1000

    U_n_kj = (data.mass_kg * g * data.delta_h_m) / 1000

    F_rolling = data.rolling_resistance_crr * data.mass_kg * g
    U_rolling_kj = (F_rolling * distance_m) / 1000

    F_air = 0.5 * data.drag_coefficient_cx * data.frontal_area_m2 * 1.2 * (speed_ms**2)
    U_air_kj = (F_air * distance_m) / 1000

    num_accelerations, accel_distance_m, acceleration_ms2 = 20, 50, 0.5
    U_inertia_kj = (
        data.mass_kg * acceleration_ms2 * accel_distance_m * num_accelerations
    ) / 1000

    total_energy_kj = U_n_kj + U_rolling_kj + U_air_kj + U_inertia_kj
    total_energy_kj *= 1 + (data.inefficiency_percent / 100)

    if data.total_descent_m > 0:
        regen_energy = (
            data.mass_kg
            * g
            * data.total_descent_m
            * (data.regen_efficiency_percent / 100)
        ) / 1000
        total_energy_kj = max(total_energy_kj - regen_energy, total_energy_kj * 0.7)

    return EnergyResult(
        climb_energy_kj=round(U_n_kj, 1),
        rolling_energy_kj=round(U_rolling_kj, 1),
        air_energy_kj=round(U_air_kj, 1),
        inertia_energy_kj=round(U_inertia_kj, 1),
        total_energy_kj=round(total_energy_kj, 1),
        total_energy_wh=round(total_energy_kj / 3.6, 1),
    )


def calculate_battery(energy_wh: float, data: SimulationInput) -> BatteryResult:
    total_efficiency = (
        (data.charger_efficiency_percent / 100)
        * ((100 - data.bms_losses_percent) / 100)
        * ((100 - data.thermal_losses_percent) / 100)
    )

    if total_efficiency <= 0:
        total_efficiency = 0.01

    required_energy_wh = energy_wh / total_efficiency
    required_capacity_ah = required_energy_wh / data.battery_voltage_v

    return BatteryResult(
        required_capacity_ah=round(required_capacity_ah, 1),
        required_energy_wh=round(required_energy_wh, 1),
        total_efficiency_percent=round(total_efficiency * 100, 1),
    )
