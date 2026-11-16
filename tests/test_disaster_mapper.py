"""
Unit & Integration Test Suite for AI Disaster Mapper Platform.
Verifies database operations, SQL window functions, API feeds and fallback,
pure-NumPy AI risk predictor, damage assessment, and emergency routing algorithms.
"""
import pytest
import pandas as pd
import numpy as np

from src.database import (
    init_db, get_connection, get_all_events, get_emergency_facilities,
    get_regional_vulnerability, get_events_with_damages, execute_custom_query
)
from src.api_client import fetch_all_realtime_disasters, get_fallback_realtime_events
from src.ml_risk_model import get_risk_predictor
from src.damage_assessment import calculate_damage_assessment
from src.emergency_routing import haversine_distance, find_nearest_facilities, calculate_relief_requirements
from src.visualizations import build_disaster_map, plot_severity_gauge, plot_disaster_type_distribution

@pytest.fixture(scope="module", autouse=True)
def setup_database():
    """Ensure database schema and seed data are initialized."""
    init_db(seed_if_empty=True)

def test_database_tables_and_seed():
    """Verify tables exist and seed data contains events and facilities."""
    events = get_all_events()
    assert len(events) >= 15, "Expected at least 15 disaster events in seed database"
    
    facilities = get_emergency_facilities()
    assert len(facilities) >= 10, "Expected at least 10 emergency facilities in seed database"
    
    vuln = get_regional_vulnerability()
    assert len(vuln) >= 10, "Expected at least 10 regional vulnerability records"

def test_sql_window_functions():
    """Tests executing SQL window functions (RANK() OVER, DENSE_RANK() OVER)."""
    sql = """
    SELECT 
        event_id, title, disaster_type, severity_score,
        RANK() OVER (PARTITION BY disaster_type ORDER BY severity_score DESC) as rnk
    FROM disaster_events;
    """
    df, err = execute_custom_query(sql)
    assert err is None, f"Window query failed: {err}"
    assert df is not None
    assert "rnk" in df.columns
    assert len(df) > 0

def test_api_client_and_fallback():
    """Tests real-time API client returns valid event structures covering all disaster types."""
    events = fetch_all_realtime_disasters()
    assert len(events) >= 6, "Expected at least 6 active disaster events"
    
    required_keys = ["event_id", "title", "disaster_type", "severity_score", "latitude", "longitude", "impact_radius_km"]
    for ev in events:
        for k in required_keys:
            assert k in ev, f"Missing key {k} in event {ev}"
        assert 0 <= ev["severity_score"] <= 100, "Severity score must be between 0 and 100"

def test_ml_risk_predictor_inference():
    """Tests AI risk predictor training, output bounds, and explainability."""
    predictor = get_risk_predictor()
    
    test_scenario = {
        "disaster_type": "Flood",
        "rainfall_24h_mm": 240.0,
        "soil_moisture_pct": 92.0,
        "wind_speed_kmh": 65.0,
        "slope_angle_deg": 12.0,
        "population_density": 850.0,
        "infrastructure_resilience": 0.35
    }
    
    result = predictor.predict(test_scenario)
    assert "risk_score" in result
    assert 0.0 <= result["risk_score"] <= 100.0, "Risk score must be within 0-100"
    assert result["risk_class"] in ["Low", "Moderate", "High", "Critical"]
    assert result["impact_radius_km"] > 0
    assert len(result["top_features"]) > 0
    assert len(result["recommendations"]) > 0

def test_damage_assessment_engine():
    """Tests damage assessment calculations for population, crop loss, and economic damage."""
    dmg = calculate_damage_assessment(
        disaster_type="Cyclone",
        severity_score=85.0,
        impact_radius_km=120.0,
        population_density=500.0,
        infrastructure_resilience=0.45
    )
    
    assert dmg["area_sq_km"] > 0
    assert dmg["total_exposed_population"] > 1000
    assert dmg["displaced_people"] > 0
    assert dmg["damaged_homes"] > 0
    assert dmg["agricultural_loss_hectares"] > 0
    assert dmg["loss_usd_millions"] > 0
    assert "Tier-1" in dmg["emergency_tier"] or "Tier-2" in dmg["emergency_tier"]

def test_haversine_distance_and_routing():
    """Tests Haversine distance and nearest emergency facility finder."""
    # Distance between Mumbai (19.0760, 72.8777) and Pune (18.5204, 73.8567) is ~120 km
    dist = haversine_distance(19.0760, 72.8777, 18.5204, 73.8567)
    assert 110.0 <= dist <= 135.0, f"Expected distance around 120km, got {dist}"

    facilities = get_emergency_facilities()
    nearest = find_nearest_facilities(26.1445, 91.7362, facilities, max_results=3)
    assert len(nearest) == 3
    assert nearest.iloc[0]["distance_km"] <= nearest.iloc[1]["distance_km"]

def test_relief_supply_calculator():
    """Tests SPHERE standard emergency relief supply calculations."""
    supplies = calculate_relief_requirements(affected_population=10000, days=7)
    assert supplies["drinking_water_liters"] == 10000 * 3.0 * 7
    assert supplies["food_rations_kg"] == 10000 * 1.5 * 7
    assert supplies["shelter_tents"] > 0
    assert supplies["emergency_responders"] > 0

def test_visualizations():
    """Tests Folium map creation and Plotly figure generation."""
    events = get_all_events()
    facilities = get_emergency_facilities()
    
    m = build_disaster_map(events, facilities)
    assert m is not None
    
    gauge = plot_severity_gauge(75.0)
    assert gauge is not None
    
    pie = plot_disaster_type_distribution(events)
    assert pie is not None
