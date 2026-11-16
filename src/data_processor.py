"""
Data Processing & Feature Engineering module for AI Disaster Mapper.
Handles cleaning, geographic coordinate validation, feature synthesis,
and merging live API streams with historical database tables.
"""
import pandas as pd
import numpy as np
from datetime import datetime
import config

def validate_coordinates(lat: float, lon: float) -> bool:
    """Validates that latitude and longitude fall within legal geographic ranges."""
    try:
        lat = float(lat)
        lon = float(lon)
        return -90.0 <= lat <= 90.0 and -180.0 <= lon <= 180.0
    except (ValueError, TypeError):
        return False

def standardize_severity_level(score: float) -> str:
    """Maps numeric severity score (0-100) to standard severity categories."""
    if score >= 80:
        return "Critical"
    elif score >= 60:
        return "High"
    elif score >= 35:
        return "Moderate"
    return "Low"

def clean_disaster_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    """Cleans, fills nulls, and standardizes columns for disaster event tables."""
    if df.empty:
        return df

    cleaned = df.copy()
    
    # Required columns guarantee
    expected_cols = [
        "event_id", "title", "disaster_type", "severity_level", "severity_score",
        "latitude", "longitude", "location_name", "country", "impact_radius_km",
        "event_date", "status", "source"
    ]
    for col in expected_cols:
        if col not in cleaned.columns:
            cleaned[col] = "Unknown" if col in ["location_name", "country", "title", "source"] else 0.0

    # Ensure correct data types
    cleaned["latitude"] = pd.to_numeric(cleaned["latitude"], errors="coerce").fillna(0.0)
    cleaned["longitude"] = pd.to_numeric(cleaned["longitude"], errors="coerce").fillna(0.0)
    cleaned["severity_score"] = pd.to_numeric(cleaned["severity_score"], errors="coerce").clip(0.0, 100.0).fillna(50.0)
    cleaned["impact_radius_km"] = pd.to_numeric(cleaned["impact_radius_km"], errors="coerce").clip(1.0, 1000.0).fillna(25.0)

    # Filter invalid coordinates
    cleaned = cleaned[cleaned.apply(lambda r: validate_coordinates(r["latitude"], r["longitude"]), axis=1)]
    return cleaned

def combine_realtime_and_db_events(realtime_events: list, db_df: pd.DataFrame) -> pd.DataFrame:
    """
    Merges real-time in-memory events from APIs with historical database records,
    deduplicating by event_id.
    """
    if realtime_events:
        rt_df = pd.DataFrame(realtime_events)
        # Drop nested metadata for flat table combine if present
        if "metadata" in rt_df.columns:
            rt_df = rt_df.drop(columns=["metadata"])
    else:
        rt_df = pd.DataFrame()

    if db_df is not None and not db_df.empty:
        combined = pd.concat([rt_df, db_df], ignore_index=True)
    else:
        combined = rt_df

    if not combined.empty:
        combined = combined.drop_duplicates(subset=["event_id"]).reset_index(drop=True)
        combined = clean_disaster_dataframe(combined)
    return combined

def prepare_ml_training_data(n_samples: int = 1200, random_seed: int = 42) -> pd.DataFrame:
    """
    Generates a realistic multi-hazard environmental training dataset for ML models.
    Simulates real-world relationships between physical environmental indicators
    and disaster risk scores.
    """
    np.random.seed(random_seed)
    disaster_types = ["Flood", "Earthquake", "Cyclone", "Landslide", "Forest Fire", "Drought"]
    
    records = []
    for _ in range(n_samples):
        d_type = np.random.choice(disaster_types)
        
        # Environmental feature proxies
        rainfall_24h_mm = np.random.exponential(scale=60.0)
        rainfall_anomaly_pct = np.random.normal(loc=15.0, scale=45.0)
        wind_speed_kmh = np.random.gamma(shape=3.0, scale=18.0)
        temperature_c = np.random.uniform(12.0, 48.0)
        humidity_pct = np.random.uniform(15.0, 98.0)
        slope_angle_deg = np.random.uniform(2.0, 65.0)
        seismic_fault_dist_km = np.random.exponential(scale=50.0)
        seismic_pga_g = np.random.exponential(scale=0.15) if seismic_fault_dist_km < 30 else np.random.uniform(0.01, 0.08)
        soil_moisture_pct = np.random.uniform(5.0, 95.0)
        vegetation_dryness_index = np.random.uniform(0.0, 1.0)
        population_density = np.random.lognormal(mean=5.5, sigma=1.2)  # people per sq km
        infrastructure_resilience = np.random.uniform(0.1, 0.95)

        # Ground truth risk score formula with physical interactions
        base_risk = 15.0
        
        if d_type == "Flood":
            base_risk += (rainfall_24h_mm / 250.0) * 45.0 + (soil_moisture_pct / 100.0) * 25.0
            if slope_angle_deg < 10.0:  # Low lying valley
                base_risk += 15.0
        elif d_type == "Earthquake":
            base_risk += (seismic_pga_g / 0.8) * 55.0 + max(0, 30.0 - (seismic_fault_dist_km * 0.4))
        elif d_type == "Cyclone":
            base_risk += (wind_speed_kmh / 180.0) * 50.0 + (rainfall_24h_mm / 200.0) * 25.0
        elif d_type == "Landslide":
            base_risk += (slope_angle_deg / 60.0) * 35.0 + (rainfall_24h_mm / 200.0) * 35.0 + (soil_moisture_pct / 100.0) * 15.0
        elif d_type == "Forest Fire":
            base_risk += (temperature_c / 45.0) * 30.0 + (vegetation_dryness_index * 35.0) + (wind_speed_kmh / 100.0) * 20.0 - (humidity_pct / 100.0) * 20.0
        elif d_type == "Drought":
            base_risk += max(0, -rainfall_anomaly_pct * 0.5) + (1.0 - soil_moisture_pct / 100.0) * 40.0 + (temperature_c / 45.0) * 20.0

        # Vulnerability amplification by population density and low resilience
        vuln_factor = (np.log1p(population_density) / 10.0) * 15.0 - (infrastructure_resilience * 12.0)
        final_risk = float(np.clip(base_risk + vuln_factor + np.random.normal(0, 3.5), 0.0, 100.0))
        
        # Categorical risk class
        if final_risk >= 80:
            risk_class = "Critical"
        elif final_risk >= 60:
            risk_class = "High"
        elif final_risk >= 35:
            risk_class = "Moderate"
        else:
            risk_class = "Low"

        # Estimated impact radius (km)
        impact_radius_km = float(np.clip((final_risk / 100.0) * 150.0 + np.random.uniform(5.0, 20.0), 5.0, 350.0))

        records.append({
            "disaster_type": d_type,
            "rainfall_24h_mm": round(rainfall_24h_mm, 2),
            "rainfall_anomaly_pct": round(rainfall_anomaly_pct, 2),
            "wind_speed_kmh": round(wind_speed_kmh, 2),
            "temperature_c": round(temperature_c, 2),
            "humidity_pct": round(humidity_pct, 2),
            "slope_angle_deg": round(slope_angle_deg, 2),
            "seismic_fault_dist_km": round(seismic_fault_dist_km, 2),
            "seismic_pga_g": round(seismic_pga_g, 3),
            "soil_moisture_pct": round(soil_moisture_pct, 2),
            "vegetation_dryness_index": round(vegetation_dryness_index, 3),
            "population_density": round(population_density, 1),
            "infrastructure_resilience": round(infrastructure_resilience, 2),
            "risk_score": round(final_risk, 1),
            "risk_class": risk_class,
            "impact_radius_km": round(impact_radius_km, 1)
        })

    return pd.DataFrame(records)
