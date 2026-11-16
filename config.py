"""
Configuration file for AI Disaster Mapper Intelligence Platform.
Contains constants, API endpoints, styling schemes, and database paths.
"""
from pathlib import Path

# Base Paths
BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
RAW_DATA_DIR = DATA_DIR / "raw"
PROCESSED_DATA_DIR = DATA_DIR / "processed"
SQL_DIR = BASE_DIR / "sql"
DB_PATH = DATA_DIR / "disaster_database.db"

# Ensure directories exist
DATA_DIR.mkdir(exist_ok=True)
RAW_DATA_DIR.mkdir(exist_ok=True)
PROCESSED_DATA_DIR.mkdir(exist_ok=True)
SQL_DIR.mkdir(exist_ok=True)

# Disaster Types and Colors
DISASTER_CATEGORIES = {
    "Flood": {
        "color": "#1E88E5",
        "icon": "water",
        "marker_color": "blue",
        "severity_scale": "Inundation Depth (m) & Rainfall (mm)",
        "emoji": "🌊"
    },
    "Earthquake": {
        "color": "#8E24AA",
        "icon": "bullseye",
        "marker_color": "purple",
        "severity_scale": "Richter Scale Magnitude (M)",
        "emoji": "🌋"
    },
    "Cyclone": {
        "color": "#00897B",
        "icon": "tornado",
        "marker_color": "cadetblue",
        "severity_scale": "Saffir-Simpson / Wind Speed (km/h)",
        "emoji": "🌀"
    },
    "Landslide": {
        "color": "#6D4C41",
        "icon": "mountain",
        "marker_color": "darkpurple",
        "severity_scale": "Debris Flow Volume (m³) & Slope Angle",
        "emoji": "⛰️"
    },
    "Forest Fire": {
        "color": "#E53935",
        "icon": "fire",
        "marker_color": "red",
        "severity_scale": "Fire Radiative Power (MW) & Burn Area",
        "emoji": "🔥"
    },
    "Drought": {
        "color": "#F57F17",
        "icon": "sun",
        "marker_color": "orange",
        "severity_scale": "Standardized Precipitation Evapotranspiration Index (SPEI)",
        "emoji": "☀️"
    }
}

# Alert Levels
SEVERITY_LEVELS = {
    "Low": {"color": "#4CAF50", "badge": "🟢 Low Risk", "threshold": (0, 35)},
    "Moderate": {"color": "#FF9800", "badge": "🟡 Moderate Risk", "threshold": (35, 60)},
    "High": {"color": "#E65100", "badge": "🟠 High Risk", "threshold": (60, 80)},
    "Critical": {"color": "#D32F2F", "badge": "🔴 Critical Alert", "threshold": (80, 100)}
}

# Real-Time API Endpoints
API_ENDPOINTS = {
    "USGS_EARTHQUAKES_DAY": "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson",
    "USGS_EARTHQUAKES_WEEK": "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson",
    "NASA_EONET_EVENTS": "https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=100",
    "OPEN_METEO_BASE": "https://api.open-meteo.com/v1/forecast"
}

# Map Defaults
DEFAULT_MAP_CENTER = [20.5937, 78.9629]  # Centralized geographical coordinates
DEFAULT_MAP_ZOOM = 4

# Relief Estimation Standards (per 1,000 affected people per day)
RELIEF_STANDARDS = {
    "drinking_water_liters_per_person_day": 3.0,
    "food_rations_kg_per_person_day": 1.5,
    "medical_kits_per_100_people": 2,
    "shelter_tents_per_family_of_5": 1,
    "emergency_responders_per_1000_people": 15
}
