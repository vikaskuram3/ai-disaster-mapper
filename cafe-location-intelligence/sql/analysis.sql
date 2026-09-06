-- ====================================================================
-- Café Location Intelligence & Market Opportunity Analysis
-- SQLite Analytical Queries for Hyderabad Market Decision Support
-- ====================================================================

-- 1. Top 5 Locations by Overall Opportunity Score
-- Identifies prime market opportunity areas for new café placement
SELECT 
    area,
    overall_score,
    opportunity_category,
    avg_monthly_rent,
    average_customer_footfall,
    cafes AS existing_cafes
FROM hyderabad_cafes
ORDER BY overall_score DESC
LIMIT 5;

-- 2. Locations with Lowest Competition
-- Finds areas with minimal competing coffee shops
SELECT 
    area,
    cafes AS existing_cafes,
    restaurants,
    average_customer_footfall,
    competition_score,
    overall_score
FROM hyderabad_cafes
ORDER BY cafes ASC, competition_score DESC
LIMIT 5;

-- 3. Locations with Highest Footfall and Demand
-- Ranks areas generating maximum customer footfall & population volume
SELECT 
    area,
    average_customer_footfall,
    population,
    offices,
    colleges,
    demand_score
FROM hyderabad_cafes
ORDER BY demand_score DESC, average_customer_footfall DESC
LIMIT 5;

-- 4. Locations with Most Affordable Rent
-- Identifies cost-effective commercial spaces to minimize lease expense
SELECT 
    area,
    avg_monthly_rent,
    rent_score,
    average_customer_footfall,
    overall_score
FROM hyderabad_cafes
ORDER BY avg_monthly_rent ASC
LIMIT 5;

-- 5. High Demand & Low Competition Sweet Spot Analysis
-- Filters for locations with above-average demand and below-average competition
SELECT 
    area,
    demand_score,
    competition_score,
    cafes AS existing_cafes,
    average_customer_footfall,
    avg_monthly_rent,
    overall_score
FROM hyderabad_cafes
WHERE demand_score > 50 AND competition_score > 50
ORDER BY overall_score DESC;

-- 6. Average Rent by Opportunity Category
-- Aggregates commercial rent statistics across business classification tiers
SELECT 
    opportunity_category,
    COUNT(*) AS total_areas,
    ROUND(AVG(avg_monthly_rent), 2) AS avg_monthly_rent,
    MIN(avg_monthly_rent) AS min_rent,
    MAX(avg_monthly_rent) AS max_rent
FROM hyderabad_cafes
GROUP BY opportunity_category
ORDER BY AVG(overall_score) DESC;

-- 7. Average Café Count by Opportunity Category
-- Analyzes market saturation across opportunity tiers
SELECT 
    opportunity_category,
    COUNT(*) AS total_areas,
    ROUND(AVG(cafes), 1) AS avg_competing_cafes,
    ROUND(AVG(average_customer_footfall), 0) AS avg_daily_footfall
FROM hyderabad_cafes
GROUP BY opportunity_category
ORDER BY AVG(overall_score) DESC;

-- 8. Complete Ranking Using SQL Window Functions
-- Demonstrates SQL analytical capabilities using RANK() window function
SELECT 
    RANK() OVER (ORDER BY overall_score DESC) AS sql_rank,
    area,
    opportunity_category,
    overall_score,
    demand_score,
    competition_score,
    rent_score,
    accessibility_score,
    avg_monthly_rent,
    cafes AS competing_cafes
FROM hyderabad_cafes;
