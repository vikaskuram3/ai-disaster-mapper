"""
Database module for AI Disaster Mapper.
Handles SQLite connection, schema initialization, seeding historical/active records,
and executing analytical queries.
"""
import sqlite3
import pandas as pd
from pathlib import Path
from datetime import datetime, timedelta
import random
import config

def get_connection():
    """Returns a SQLite database connection with row factory configured."""
    conn = sqlite3.connect(str(config.DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn

def init_db(seed_if_empty=True):
    """Initializes tables using schema.sql and seeds realistic default data if empty."""
    conn = get_connection()
    schema_path = config.SQL_DIR / "schema.sql"
    
    if schema_path.exists():
        with open(schema_path, "r", encoding="utf-8") as f:
            conn.executescript(f.read())
    conn.commit()

    if seed_if_empty:
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM disaster_events")
        count = cursor.fetchone()[0]
        if count == 0:
            seed_default_data(conn)
    conn.close()

def seed_default_data(conn=None):
    """Populates realistic historical & active disaster records, emergency hubs, and vulnerability metrics."""
    should_close = False
    if conn is None:
        conn = get_connection()
        should_close = True

    # 1. Seed Regional Vulnerability Data
    regions = [
        ("REG-001", "Assam & Brahmaputra Valley", "India", 31205576, 398.0, 0.78, 0.42, 2812000, "Flood", 85.0),
        ("REG-002", "Odisha Coastal Belt", "India", 41974218, 270.0, 0.72, 0.58, 4150000, "Cyclone", 22.0),
        ("REG-003", "Uttarakhand Garhwal & Kumaon", "India", 10086292, 189.0, 0.65, 0.48, 712000, "Landslide", 1850.0),
        ("REG-004", "Kerala Western Ghats", "India", 33406061, 860.0, 0.45, 0.75, 2010000, "Landslide", 350.0),
        ("REG-005", "Vidarbha & Marathwada", "India", 23500000, 310.0, 0.81, 0.46, 5600000, "Drought", 290.0),
        ("REG-006", "Himachal Pradesh Valley", "India", 6864602, 123.0, 0.52, 0.60, 540000, "Landslide", 2100.0),
        ("REG-007", "Similipal Forest Range", "India", 1250000, 95.0, 0.68, 0.38, 320000, "Forest Fire", 480.0),
        ("REG-008", "Gujarat Kutch Fault Zone", "India", 2092700, 46.0, 0.59, 0.64, 1890000, "Earthquake", 15.0),
        ("REG-009", "Sundarbans Delta Zone", "India", 4500000, 1020.0, 0.84, 0.35, 1400000, "Cyclone", 5.0),
        ("REG-010", "Bundelkhand Dryland Basin", "India", 8200000, 240.0, 0.88, 0.32, 2950000, "Drought", 210.0),
        ("REG-011", "Java Volcanic Arc", "Indonesia", 145000000, 1120.0, 0.76, 0.51, 8500000, "Earthquake", 420.0),
        ("REG-012", "California Sierra Foothills", "United States", 39000000, 97.0, 0.28, 0.89, 10200000, "Forest Fire", 820.0),
        ("REG-013", "Honshu Seismic Zone", "Japan", 104000000, 450.0, 0.18, 0.96, 3800000, "Earthquake", 120.0),
        ("REG-014", "Horn of Africa Arid Zone", "Kenya", 18500000, 85.0, 0.92, 0.21, 4100000, "Drought", 650.0),
        ("REG-015", "Chiapas Highlands", "Mexico", 5543828, 75.0, 0.74, 0.44, 1650000, "Flood", 1200.0)
    ]
    conn.executemany("""
        INSERT OR REPLACE INTO regional_vulnerability 
        (region_id, region_name, country, population, population_density_per_sqkm, 
         social_vulnerability_index, infrastructure_resilience_score, agricultural_area_hectares, 
         primary_risk_disaster, elevation_meters)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, regions)

    # 2. Seed Emergency Facilities (Hospitals, Shelters, Hubs)
    facilities = [
        ("FAC-001", "Guwahati Central Trauma Medical Institute", "Hospital", 26.1445, 91.7362, "Guwahati, Assam", 650, 140, "+91-361-2234000", 18, "Fully Operational"),
        ("FAC-002", "Bhubaneswar Coastal Super-Specialty Hospital", "Hospital", 20.2961, 85.8245, "Bhubaneswar, Odisha", 800, 210, "+91-674-2301900", 24, "Fully Operational"),
        ("FAC-003", "Dehradun Himalayan Emergency Center", "Hospital", 30.3165, 78.0322, "Dehradun, Uttarakhand", 400, 65, "+91-135-2712000", 12, "Near Capacity"),
        ("FAC-004", "Kochi Naval & Civil Relief Camp 1", "Relief Camp", 9.9312, 76.2673, "Kochi, Kerala", 2500, 850, "+91-484-2423111", 8, "Fully Operational"),
        ("FAC-005", "Puri Cyclone Storm Shelter Alpha", "Rescue Shelter", 19.8135, 85.8312, "Puri, Odisha", 3500, 1200, "+91-6752-222010", 6, "Fully Operational"),
        ("FAC-006", "Kaziranga North Flood Evacuation Camp", "Rescue Shelter", 26.5775, 93.1711, "Kaziranga, Assam", 1800, 420, "+91-3776-268001", 5, "Fully Operational"),
        ("FAC-007", "Shimla Alpine Disaster Command Hub", "Fire & Disaster Response Hub", 31.1048, 77.1734, "Shimla, HP", 500, 280, "+91-177-2803322", 15, "Fully Operational"),
        ("FAC-008", "Nagpur Water & Food Logistics Relief Depot", "Relief Camp", 21.1458, 79.0882, "Nagpur, Maharashtra", 5000, 2600, "+91-712-2561100", 10, "Fully Operational"),
        ("FAC-009", "Bhuj Earthquake Rapid Response Hospital", "Hospital", 23.2420, 69.6669, "Bhuj, Gujarat", 450, 180, "+91-2832-250345", 14, "Fully Operational"),
        ("FAC-010", "Canning Sundarbans Community Cyclone Hub", "Rescue Shelter", 22.3082, 88.6651, "Canning, West Bengal", 3000, 950, "+91-3218-255201", 7, "Fully Operational"),
        ("FAC-011", "Munnar Mountain Rescue & Trauma Post", "Rescue Shelter", 10.0889, 77.0595, "Munnar, Kerala", 850, 190, "+91-4865-230456", 4, "Near Capacity"),
        ("FAC-012", "Jhansi Bundelkhand Drought Supply Base", "Relief Camp", 25.4484, 78.5685, "Jhansi, UP", 4000, 2100, "+91-510-2331900", 6, "Fully Operational"),
        ("FAC-013", "Jakarta Metropolitan Emergency Hospital", "Hospital", -6.2088, 106.8456, "Jakarta, Indonesia", 1200, 310, "+62-21-3904567", 30, "Fully Operational"),
        ("FAC-014", "Sacramento Wildfire Command Base", "Fire & Disaster Response Hub", 38.5816, -121.4944, "California, USA", 1500, 620, "+1-916-555-0199", 25, "Fully Operational"),
        ("FAC-015", "Tokyo Disaster Medical Center", "Hospital", 35.6762, 139.6503, "Tokyo, Japan", 1500, 480, "+81-3-3269-8111", 35, "Fully Operational")
    ]
    conn.executemany("""
        INSERT OR REPLACE INTO emergency_facilities 
        (facility_id, name, facility_type, latitude, longitude, location_name, 
         total_capacity, available_capacity, contact_number, ambulance_units, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, facilities)

    # 3. Seed Realistic Historical & Active Events
    now = datetime.now()
    events = [
        # Active Events (Recent days)
        ("EVT-ACT-001", "Brahmaputra Major River Basin Flash Flooding", "Flood", "Critical", 91.5, 26.2006, 92.9376, "Morigaon & Nagaon, Assam", "India", 65.0, (now - timedelta(hours=4)).strftime("%Y-%m-%d %H:%M:%S"), "Active", "Live Monitoring Station"),
        ("EVT-ACT-002", "Bay of Bengal Severe Tropical Cyclone 'Tej'", "Cyclone", "Critical", 94.2, 18.4500, 87.2100, "Offshore Coastal Odisha", "India", 140.0, (now - timedelta(hours=8)).strftime("%Y-%m-%d %H:%M:%S"), "Active", "NASA EONET / IMD"),
        ("EVT-ACT-003", "Wayanad Highland Landslide & Debris Flow", "Landslide", "High", 79.4, 11.6854, 76.1320, "Meppadi, Wayanad, Kerala", "India", 18.0, (now - timedelta(hours=14)).strftime("%Y-%m-%d %H:%M:%S"), "Ongoing", "State Disaster Control"),
        ("EVT-ACT-004", "Similipal National Park Active Canopy Fire", "Forest Fire", "Moderate", 58.0, 21.8500, 86.3500, "Mayurbhanj, Odisha", "India", 25.0, (now - timedelta(hours=22)).strftime("%Y-%m-%d %H:%M:%S"), "Ongoing", "Forest Survey Satellite"),
        ("EVT-ACT-005", "Marathwada Severe Agricultural Moisture Deficit", "Drought", "High", 73.0, 19.8762, 75.3433, "Aurangabad & Jalna, Maharashtra", "India", 180.0, (now - timedelta(days=2)).strftime("%Y-%m-%d %H:%M:%S"), "Active", "Open-Meteo Drought Index"),
        ("EVT-ACT-006", "Kutch Offshore Moderate Tremor M5.4", "Earthquake", "Moderate", 54.5, 23.4500, 70.1200, "Bhuj Basin, Gujarat", "India", 45.0, (now - timedelta(hours=36)).strftime("%Y-%m-%d %H:%M:%S"), "Resolved", "USGS Seismic Feed"),
        ("EVT-ACT-007", "Sundarbans Coastal Surge Inundation", "Flood", "High", 76.8, 22.1800, 88.7500, "Sundarbans Mangrove Belt, WB", "India", 50.0, (now - timedelta(days=3)).strftime("%Y-%m-%d %H:%M:%S"), "Ongoing", "Coastal Gauge Station"),
        ("EVT-ACT-008", "Chamoli High-Altitude Rockslide & Damming", "Landslide", "Critical", 86.4, 30.4000, 79.3500, "Chamoli, Uttarakhand", "India", 22.0, (now - timedelta(days=4)).strftime("%Y-%m-%d %H:%M:%S"), "Contained", "Geological Survey"),
        
        # Historical Major Events (Past years for deep analytics & trend modeling)
        ("EVT-HIST-009", "Assam Great Monsoonal Inundation 2024", "Flood", "Critical", 93.0, 26.5000, 93.0000, "Brahmaputra Valley, Assam", "India", 85.0, "2024-07-12 10:00:00", "Resolved", "Historical Catalog"),
        ("EVT-HIST-010", "Super Cyclone Mocha Landfall 2023", "Cyclone", "Critical", 96.5, 20.1500, 92.8500, "Bay of Bengal Coastal Zone", "Myanmar/India", 180.0, "2023-05-14 06:30:00", "Resolved", "Historical Catalog"),
        ("EVT-HIST-011", "Uttarakhand Flash Floods & Debris Surge 2021", "Landslide", "Critical", 95.0, 30.3800, 79.7200, "Rishi Ganga Valley, Uttarakhand", "India", 30.0, "2021-02-07 09:45:00", "Resolved", "Historical Catalog"),
        ("EVT-HIST-012", "Vidarbha Extreme Summer Heat & Drought 2022", "Drought", "Critical", 84.5, 20.9000, 77.7500, "Amravati Division, Maharashtra", "India", 250.0, "2022-05-20 12:00:00", "Resolved", "Historical Catalog"),
        ("EVT-HIST-013", "Bandipur Tiger Reserve Megafire 2019", "Forest Fire", "High", 78.0, 11.6667, 76.6333, "Bandipur, Karnataka", "India", 40.0, "2019-02-23 14:15:00", "Resolved", "Historical Catalog"),
        ("EVT-HIST-014", "Nepal-Bihar Border Earthquake M7.8", "Earthquake", "Critical", 98.0, 28.1470, 84.7080, "Gorkha-Kathmandu Belt", "Nepal/India", 190.0, "2015-04-25 11:56:00", "Resolved", "Historical Catalog"),
        ("EVT-HIST-015", "Kerala Mega Monsoonal Deluge 2018", "Flood", "Critical", 97.2, 10.1632, 76.6413, "Idukki & Ernakulam, Kerala", "India", 95.0, "2018-08-16 08:00:00", "Resolved", "Historical Catalog"),
        ("EVT-HIST-016", "Cyclone Fani High-Velocity Impact 2019", "Cyclone", "Critical", 96.0, 19.8135, 85.8312, "Puri & Khurda, Odisha", "India", 130.0, "2019-05-03 08:30:00", "Resolved", "Historical Catalog"),
        ("EVT-HIST-017", "Sierra Nevada Complex Wildfire 2021", "Forest Fire", "Critical", 92.0, 39.8700, -121.3800, "California Sierra Foothills", "United States", 110.0, "2021-08-10 15:00:00", "Resolved", "Historical Catalog"),
        ("EVT-HIST-018", "Central Java Shallow Earthquake M6.3", "Earthquake", "Critical", 88.0, -7.9800, 110.4500, "Yogyakarta Basin, Java", "Indonesia", 50.0, "2022-11-21 13:21:00", "Resolved", "Historical Catalog"),
        ("EVT-HIST-019", "Kenya Eastern Counties Extended Drought 2023", "Drought", "Critical", 89.0, 0.0236, 37.9062, "Garissa & Wajir", "Kenya", 320.0, "2023-03-15 10:00:00", "Resolved", "Historical Catalog"),
        ("EVT-HIST-020", "Himachal Monsoon Cloudburst & Landslide 2023", "Landslide", "Critical", 91.0, 31.9579, 77.1095, "Kullu & Mandi, HP", "India", 35.0, "2023-08-14 07:15:00", "Resolved", "Historical Catalog")
    ]
    conn.executemany("""
        INSERT OR REPLACE INTO disaster_events
        (event_id, title, disaster_type, severity_level, severity_score, latitude, longitude,
         location_name, country, impact_radius_km, event_date, status, source)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, events)

    # 4. Seed Damage Records linked to the disaster events
    damage_data = [
        ("DMG-001", "EVT-ACT-001", 385000, 42000, 12, 85, 14200, 84, 62000.0, 48.5, now.strftime("%Y-%m-%d")),
        ("DMG-002", "EVT-ACT-002", 720000, 115000, 8, 140, 28500, 160, 85000.0, 125.0, now.strftime("%Y-%m-%d")),
        ("DMG-003", "EVT-ACT-003", 45000, 8200, 48, 120, 1850, 22, 4200.0, 24.2, now.strftime("%Y-%m-%d")),
        ("DMG-004", "EVT-ACT-004", 12500, 1800, 0, 15, 240, 6, 18500.0, 9.8, now.strftime("%Y-%m-%d")),
        ("DMG-005", "EVT-ACT-005", 1450000, 18000, 0, 0, 0, 4, 380000.0, 210.0, now.strftime("%Y-%m-%d")),
        ("DMG-006", "EVT-ACT-006", 18000, 1200, 0, 14, 450, 12, 120.0, 6.5, now.strftime("%Y-%m-%d")),
        ("DMG-007", "EVT-ACT-007", 195000, 31000, 3, 42, 6800, 38, 24000.0, 35.4, now.strftime("%Y-%m-%d")),
        ("DMG-008", "EVT-ACT-008", 8500, 1400, 14, 35, 320, 18, 950.0, 18.0, now.strftime("%Y-%m-%d")),
        
        ("DMG-009", "EVT-HIST-009", 1850000, 280000, 124, 650, 78000, 320, 240000.0, 310.0, "2024-07-20"),
        ("DMG-010", "EVT-HIST-010", 1200000, 210000, 145, 980, 85000, 410, 190000.0, 480.0, "2023-05-25"),
        ("DMG-011", "EVT-HIST-011", 65000, 12000, 204, 310, 2800, 52, 6500.0, 95.0, "2021-02-15"),
        ("DMG-012", "EVT-HIST-012", 3200000, 45000, 0, 0, 0, 10, 920000.0, 540.0, "2022-06-05"),
        ("DMG-013", "EVT-HIST-013", 22000, 3500, 2, 28, 110, 8, 48000.0, 42.0, "2019-03-01"),
        ("DMG-014", "EVT-HIST-014", 8000000, 2800000, 8964, 22300, 600000, 2400, 150000.0, 10000.0, "2015-05-10"),
        ("DMG-015", "EVT-HIST-015", 5400000, 1400000, 483, 3100, 220000, 1100, 145000.0, 2900.0, "2018-08-30"),
        ("DMG-016", "EVT-HIST-016", 16000000, 3500000, 89, 1200, 500000, 1800, 188000.0, 4200.0, "2019-05-15"),
        ("DMG-017", "EVT-HIST-017", 450000, 85000, 8, 45, 3400, 120, 280000.0, 1750.0, "2021-08-25"),
        ("DMG-018", "EVT-HIST-018", 380000, 72000, 602, 7700, 62000, 210, 18000.0, 890.0, "2022-11-28"),
        ("DMG-019", "EVT-HIST-019", 4200000, 120000, 0, 0, 0, 15, 650000.0, 820.0, "2023-04-10"),
        ("DMG-020", "EVT-HIST-020", 95000, 16000, 112, 340, 4200, 65, 12500.0, 145.0, "2023-08-22")
    ]
    conn.executemany("""
        INSERT OR REPLACE INTO damage_records
        (damage_id, event_id, affected_population, displaced_people, casualties, 
         injured, damaged_homes, damaged_critical_infra, agricultural_loss_hectares, 
         estimated_loss_usd_millions, assessment_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, damage_data)

    conn.commit()
    if should_close:
        conn.close()

def get_all_events(disaster_type=None, severity=None, status=None):
    """Fetches disaster events with optional filtering as a pandas DataFrame."""
    conn = get_connection()
    query = "SELECT * FROM disaster_events WHERE 1=1"
    params = []

    if disaster_type and disaster_type != "All":
        query += " AND disaster_type = ?"
        params.append(disaster_type)
    if severity and severity != "All":
        query += " AND severity_level = ?"
        params.append(severity)
    if status and status != "All":
        query += " AND status = ?"
        params.append(status)

    query += " ORDER BY event_date DESC"
    df = pd.read_sql_query(query, conn, params=params)
    conn.close()
    return df

def get_emergency_facilities(facility_type=None):
    """Fetches emergency facilities as a pandas DataFrame."""
    conn = get_connection()
    query = "SELECT * FROM emergency_facilities WHERE 1=1"
    params = []
    if facility_type and facility_type != "All":
        query += " AND facility_type = ?"
        params.append(facility_type)
    query += " ORDER BY name ASC"
    df = pd.read_sql_query(query, conn, params=params)
    conn.close()
    return df

def get_regional_vulnerability():
    """Fetches regional vulnerability records."""
    conn = get_connection()
    df = pd.read_sql_query("SELECT * FROM regional_vulnerability ORDER BY social_vulnerability_index DESC", conn)
    conn.close()
    return df

def get_events_with_damages():
    """Fetches joined events and damage assessments."""
    conn = get_connection()
    query = """
        SELECT e.*, d.affected_population, d.displaced_people, d.casualties, d.injured,
               d.damaged_homes, d.damaged_critical_infra, d.agricultural_loss_hectares,
               d.estimated_loss_usd_millions
        FROM disaster_events e
        LEFT JOIN damage_records d ON e.event_id = d.event_id
        ORDER BY e.severity_score DESC
    """
    df = pd.read_sql_query(query, conn)
    conn.close()
    return df

def execute_custom_query(sql_query: str):
    """Executes a user SQL query safely and returns (DataFrame, None) or (None, error_str)."""
    conn = get_connection()
    try:
        # Only allow SELECT statements for analytics exploration
        sql_stripped = sql_query.strip().upper()
        if not (sql_stripped.startswith("SELECT") or sql_stripped.startswith("WITH")):
            return None, "Only SELECT and WITH analytical queries are allowed in this console."
        df = pd.read_sql_query(sql_query, conn)
        return df, None
    except Exception as e:
        return None, str(e)
    finally:
        conn.close()
