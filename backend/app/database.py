from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker


DATABASE_URL = "sqlite:///database.db"

engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(bind=engine)


def check_db_connection():
    try:
        with engine.connect():
            print("Successfully connected to the database.")
    except Exception as e:
        print(f"Database connection failed: {e}")