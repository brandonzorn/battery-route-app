from sqlalchemy import String, Float, Integer, ForeignKey

from sqlalchemy.orm import (
    DeclarativeBase,
    mapped_column,
    Mapped,
    relationship,
)


class Base(DeclarativeBase):
    pass


class Transport(Base):
    __tablename__ = "transport"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(100))
    mass: Mapped[float] = mapped_column(Float)
    speed: Mapped[float] = mapped_column(Float)
    rolling_resistance: Mapped[float] = mapped_column(Float)
    wheel_radius: Mapped[float] = mapped_column(Float)
    drag_coefficient: Mapped[float] = mapped_column(Float)
    frontal_area: Mapped[float] = mapped_column(Float)
    batteries = relationship("Battery", back_populates="transport")
    routes = relationship("Route", back_populates="transport")


class Battery(Base):
    __tablename__ = "batteries"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(100))
    voltage: Mapped[float] = mapped_column(Float)
    capacity_ah: Mapped[float] = mapped_column(Float)
    charger_efficiency: Mapped[float] = mapped_column(Float)
    bms_losses: Mapped[float] = mapped_column(Float)
    thermal_losses: Mapped[float] = mapped_column(Float)
    transport_id: Mapped[int] = mapped_column(ForeignKey("transport.id"))
    transport = relationship("Transport", back_populates="batteries")


class Route(Base):
    __tablename__ = "routes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(100))
    distance: Mapped[float] = mapped_column(Float)
    delta_h: Mapped[float] = mapped_column(Float)
    total_descent: Mapped[float] = mapped_column(Float)
    transport_id: Mapped[int] = mapped_column(ForeignKey("transport.id"))
    transport = relationship("Transport", back_populates="routes")
