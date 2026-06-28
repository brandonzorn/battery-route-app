from pydantic import BaseModel, Field


class SimulationInput(BaseModel):
    total_ascent_m: float = Field(default=0, ge=0)
    total_descent_m: float = Field(ge=0)
    distance_km: float = Field(ge=0)

    mass_kg: float = Field(gt=0)
    speed_kmh: float = Field(ge=0)
    rolling_resistance_crr: float = Field(ge=0)
    wheel_radius_mm: float = Field(gt=0)
    drag_coefficient_cx: float = Field(ge=0)
    frontal_area_m2: float = Field(gt=0)
    inefficiency_percent: float = Field(ge=0, le=100)

    regen_efficiency_percent: float = Field(ge=0, le=100)

    battery_voltage_v: float = Field(gt=0)
    charger_efficiency_percent: float = Field(gt=0, le=100)
    bms_losses_percent: float = Field(ge=0, le=100)
    thermal_losses_percent: float = Field(ge=0, le=100)


class EnergyResult(BaseModel):
    climb_energy_kj: float
    rolling_energy_kj: float
    air_energy_kj: float
    inertia_energy_kj: float
    inefficiency_energy_kj: float
    total_energy_kj: float
    total_energy_wh: float


class BatteryResult(BaseModel):
    required_capacity_ah: float
    required_energy_wh: float
    total_efficiency_percent: float


class SimulationResponse(BaseModel):
    energy: EnergyResult
    battery: BatteryResult
