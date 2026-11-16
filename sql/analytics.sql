-- AI Disaster Mapper - Analytical SQL Queries
-- Demonstrating window functions (RANK(), DENSE_RANK(), ROW_NUMBER()), aggregations, and joins.

-- 1. Rank disasters by severity score within each disaster type using RANK() OVER
-- Identifies the most severe event recorded per disaster category
SELECT 
    event_id,
    title,
    disaster_type,
    location_name,
    country,
    severity_score,
    event_date,
    RANK() OVER (
        PARTITION BY disaster_type 
        ORDER BY severity_score DESC
    ) as severity_rank_in_category
FROM disaster_events
ORDER BY disaster_type, severity_rank_in_category;

-- 2. Regional Vulnerability Exposure Ranking
-- Combines population density and social vulnerability index to calculate total exposure score
SELECT 
    region_id,
    region_name,
    country,
    population,
    population_density_per_sqkm,
    social_vulnerability_index,
    infrastructure_resilience_score,
    ROUND(population_density_per_sqkm * social_vulnerability_index / (infrastructure_resilience_score + 0.1), 2) AS exposure_risk_index,
    DENSE_RANK() OVER (
        ORDER BY (population_density_per_sqkm * social_vulnerability_index / (infrastructure_resilience_score + 0.1)) DESC
    ) as vulnerability_rank
FROM regional_vulnerability;

-- 3. Damage and Impact Summary by Disaster Type with Financial Loss Running Totals
SELECT 
    e.disaster_type,
    COUNT(DISTINCT e.event_id) as total_events,
    SUM(d.affected_population) as total_affected_pop,
    SUM(d.displaced_people) as total_displaced,
    SUM(d.casualties) as total_casualties,
    ROUND(SUM(d.estimated_loss_usd_millions), 2) as total_financial_loss_usd_m,
    ROUND(AVG(d.estimated_loss_usd_millions), 2) as avg_financial_loss_per_event
FROM disaster_events e
LEFT JOIN damage_records d ON e.event_id = d.event_id
GROUP BY e.disaster_type
ORDER BY total_financial_loss_usd_m DESC;

-- 4. Emergency Facility Operational Capacity Analysis
-- Window function evaluating capacity utilization ratio across facility types
SELECT 
    facility_id,
    name,
    facility_type,
    location_name,
    total_capacity,
    available_capacity,
    (total_capacity - available_capacity) as occupied_capacity,
    ROUND(((total_capacity - available_capacity) * 100.0) / total_capacity, 1) as occupancy_percentage,
    ROW_NUMBER() OVER (
        PARTITION BY facility_type 
        ORDER BY available_capacity ASC
    ) as critical_capacity_rank
FROM emergency_facilities
ORDER BY facility_type, occupancy_percentage DESC;

-- 5. Active Critical and High Severity Incidents Requiring Immediate Action
SELECT 
    event_id,
    title,
    disaster_type,
    severity_level,
    severity_score,
    location_name,
    country,
    impact_radius_km,
    event_date,
    source
FROM disaster_events
WHERE status IN ('Active', 'Ongoing') AND severity_level IN ('Critical', 'High')
ORDER BY severity_score DESC;
