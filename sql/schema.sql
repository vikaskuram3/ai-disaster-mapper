-- AI Disaster Mapper - Database Schema
-- Provides structured persistence for events, emergency centers, vulnerability metrics, and damages.

CREATE TABLE IF NOT EXISTS disaster_events (
    event_id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    disaster_type TEXT NOT NULL CHECK(disaster_type IN ('Flood', 'Earthquake', 'Cyclone', 'Landslide', 'Forest Fire', 'Drought')),
    severity_level TEXT NOT NULL CHECK(severity_level IN ('Low', 'Moderate', 'High', 'Critical')),
    severity_score REAL NOT NULL CHECK(severity_score >= 0 AND severity_score <= 100),
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    location_name TEXT NOT NULL,
    country TEXT NOT NULL,
    impact_radius_km REAL NOT NULL,
    event_date TEXT NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('Active', 'Ongoing', 'Contained', 'Resolved')),
    source TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS emergency_facilities (
    facility_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    facility_type TEXT NOT NULL CHECK(facility_type IN ('Hospital', 'Relief Camp', 'Rescue Shelter', 'Fire & Disaster Response Hub')),
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    location_name TEXT NOT NULL,
    total_capacity INTEGER NOT NULL,
    available_capacity INTEGER NOT NULL,
    contact_number TEXT NOT NULL,
    ambulance_units INTEGER DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'Fully Operational',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS regional_vulnerability (
    region_id TEXT PRIMARY KEY,
    region_name TEXT NOT NULL,
    country TEXT NOT NULL,
    population INTEGER NOT NULL,
    population_density_per_sqkm REAL NOT NULL,
    social_vulnerability_index REAL NOT NULL CHECK(social_vulnerability_index >= 0 AND social_vulnerability_index <= 1),
    infrastructure_resilience_score REAL NOT NULL CHECK(infrastructure_resilience_score >= 0 AND infrastructure_resilience_score <= 1),
    agricultural_area_hectares REAL NOT NULL,
    primary_risk_disaster TEXT NOT NULL,
    elevation_meters REAL NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS damage_records (
    damage_id TEXT PRIMARY KEY,
    event_id TEXT NOT NULL,
    affected_population INTEGER NOT NULL,
    displaced_people INTEGER NOT NULL,
    casualties INTEGER DEFAULT 0,
    injured INTEGER DEFAULT 0,
    damaged_homes INTEGER DEFAULT 0,
    damaged_critical_infra INTEGER DEFAULT 0,
    agricultural_loss_hectares REAL DEFAULT 0,
    estimated_loss_usd_millions REAL DEFAULT 0,
    assessment_date TEXT NOT NULL,
    FOREIGN KEY(event_id) REFERENCES disaster_events(event_id)
);

-- Indexes for lightning fast geographical, temporal, and filter queries
CREATE INDEX IF NOT EXISTS idx_disaster_type ON disaster_events(disaster_type);
CREATE INDEX IF NOT EXISTS idx_disaster_severity ON disaster_events(severity_level);
CREATE INDEX IF NOT EXISTS idx_disaster_date ON disaster_events(event_date);
CREATE INDEX IF NOT EXISTS idx_disaster_status ON disaster_events(status);
CREATE INDEX IF NOT EXISTS idx_facility_type ON emergency_facilities(facility_type);
CREATE INDEX IF NOT EXISTS idx_damage_event_id ON damage_records(event_id);
