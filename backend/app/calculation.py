from typed_models import SimulationInput, EnergyResult, BatteryResult

AIR_DENSITY = 1.2
G = 9.81


def calculate_energy(data: SimulationInput) -> EnergyResult:
    """
    Расчет энергии движения.

    Параметры
    ----------
    mass_kg : масса транспортного средства, кг
    speed_kmh : средняя скорость, км/ч
    rolling_resistance_mm : сопротивление качению (смещение центра колеса), мм
    wheel_radius_mm : радиус колеса, мм

    air_density : плотность воздуха, кг/м³
    drag_coefficient : коэффициент аэродинамического сопротивления Cx
    frontal_area_m2 : площадь лобовой поверхности, м²
    inefficiency_percent : дополнительные потери, %

    total_ascent_m : суммарный подъем, м
    total_descent_m : суммарный спуск, м
    distance_km : длина маршрута, км

    regen_efficiency : КПД рекуперации, %
    """
    distance_m = data.distance_km * 1000
    speed_ms = data.speed_kmh / 3.6

    climb_energy = data.mass_kg * G * data.total_ascent_m

    rolling_energy = (
        (data.rolling_resistance_crr / data.wheel_radius_mm)
        * data.mass_kg
        * G
        * distance_m
    )

    air_energy = (
        0.5
        * data.drag_coefficient_cx
        * data.frontal_area_m2
        * AIR_DENSITY
        * speed_ms**2
        * distance_m
    )

    inertia_energy = 0.01 * data.mass_kg * G * distance_m

    total_energy = climb_energy + rolling_energy + air_energy + inertia_energy
    inefficiency_energy = total_energy * (data.inefficiency_percent / 100)
    total_energy += inefficiency_energy

    return EnergyResult(
        climb_energy_kj=round(climb_energy / 1000, 2),
        rolling_energy_kj=round(rolling_energy / 1000, 2),
        air_energy_kj=round(air_energy / 1000, 2),
        inertia_energy_kj=round(inertia_energy / 1000, 2),
        inefficiency_energy_kj=round(inefficiency_energy / 1000, 2),
        total_energy_kj=round(total_energy / 1000, 2),
        total_energy_wh=round(total_energy / 3600, 2),
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
