"""
Emergency Routing and Resource Allocation Module for AI Disaster Mapper.
Calculates geospatial distance (Haversine formula) to nearest hospitals,
relief camps, and rescue shelters, and computes essential emergency supply requirements.
"""
import math
import pandas as pd
import config

EARTH_RADIUS_KM = 6371.0

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Computes great-circle distance between two geographic coordinates
    using the Haversine trigonometric formula.
    """
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (math.sin(delta_phi / 2.0) ** 2 +
         math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2)
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))

    return round(EARTH_RADIUS_KM * c, 2)

def find_nearest_facilities(origin_lat: float, origin_lon: float, facilities_df: pd.DataFrame, max_results: int = 5, facility_type: str = None) -> pd.DataFrame:
    """
    Finds and ranks the closest emergency facilities to a disaster location.
    Calculates distance (km), estimated response travel time, and occupancy status.
    """
    if facilities_df.empty:
        return facilities_df

    df = facilities_df.copy()
    if facility_type and facility_type != "All":
        df = df[df["facility_type"] == facility_type]

    if df.empty:
        return df

    # Calculate distance for each facility
    distances = []
    travel_times_min = []
    
    # Average emergency vehicle transit speed across terrain: 45 km/h
    avg_speed_kmh = 45.0

    for _, row in df.iterrows():
        dist = haversine_distance(origin_lat, origin_lon, row["latitude"], row["longitude"])
        # Travel time in minutes: (dist / speed) * 60 + 5 min dispatch overhead
        t_min = round((dist / avg_speed_kmh) * 60.0 + 5.0, 1)
        distances.append(dist)
        travel_times_min.append(t_min)

    df["distance_km"] = distances
    df["est_travel_time_min"] = travel_times_min
    
    # Calculate occupancy percentage
    df["occupancy_pct"] = df.apply(
        lambda r: round(((r["total_capacity"] - r["available_capacity"]) / max(1, r["total_capacity"])) * 100.0, 1),
        axis=1
    )

    df = df.sort_values(by="distance_km", ascending=True).head(max_results).reset_index(drop=True)
    return df

def calculate_relief_requirements(affected_population: int, days: int = 7) -> dict:
    """
    Computes recommended disaster relief supply allocations based on SPHERE standards.
    """
    pop = max(0, affected_population)
    d = max(1, days)
    standards = config.RELIEF_STANDARDS

    drinking_water_liters = int(pop * standards["drinking_water_liters_per_person_day"] * d)
    food_rations_kg = int(pop * standards["food_rations_kg_per_person_day"] * d)
    medical_kits = max(5, int((pop / 100.0) * standards["medical_kits_per_100_people"]))
    shelter_tents = max(2, int((pop / 5.0) * standards["shelter_tents_per_family_of_5"]))
    emergency_responders = max(10, int((pop / 1000.0) * standards["emergency_responders_per_1000_people"]))
    rescue_boats_vehicles = max(2, int(pop / 1200.0))

    return {
        "duration_days": d,
        "affected_population": pop,
        "drinking_water_liters": drinking_water_liters,
        "food_rations_kg": food_rations_kg,
        "medical_kits": medical_kits,
        "shelter_tents": shelter_tents,
        "emergency_responders": emergency_responders,
        "rescue_boats_vehicles": rescue_boats_vehicles
    }
