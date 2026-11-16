"""
Damage Assessment and Affected-Area Analysis Engine for AI Disaster Mapper.
Calculates estimated human displacement, casualties, infrastructure damage,
agricultural losses, and direct financial impact based on disaster type,
severity score, impact radius, and regional demographics.
"""
import numpy as np
import math

def calculate_damage_assessment(
    disaster_type: str,
    severity_score: float,
    impact_radius_km: float,
    population_density: float = 400.0,
    infrastructure_resilience: float = 0.5,
    crop_hectares_density: float = 80.0
) -> dict:
    """
    Computes multi-dimensional damage assessment:
    - Impacted Land Area (sq km)
    - Total Exposed Population
    - Displaced Population
    - Estimated Casualties & Injuries
    - Damaged Residential Homes & Critical Infrastructure
    - Inundated / Parched Agricultural Land (hectares)
    - Estimated Financial Loss (in USD Millions & INR Crores)
    """
    # 1. Total Impact Footprint Area: A = pi * r^2
    area_sq_km = math.pi * (impact_radius_km ** 2)
    
    # 2. Exposed Population
    total_exposed_population = int(area_sq_km * population_density)
    
    # Vulnerability scalar: inverse of resilience (higher resilience = lower damage)
    vulnerability_multiplier = max(0.2, (1.2 - infrastructure_resilience))
    severity_factor = (severity_score / 100.0) ** 1.8

    # Disaster-specific exposure factors
    impact_factors = {
        "Flood": {"displaced_ratio": 0.18, "casualty_ratio": 0.00012, "home_damage_ratio": 0.08, "crop_loss_ratio": 0.65, "loss_per_capita": 420},
        "Earthquake": {"displaced_ratio": 0.25, "casualty_ratio": 0.00085, "home_damage_ratio": 0.14, "crop_loss_ratio": 0.05, "loss_per_capita": 1250},
        "Cyclone": {"displaced_ratio": 0.22, "casualty_ratio": 0.00018, "home_damage_ratio": 0.12, "crop_loss_ratio": 0.55, "loss_per_capita": 580},
        "Landslide": {"displaced_ratio": 0.35, "casualty_ratio": 0.00180, "home_damage_ratio": 0.20, "crop_loss_ratio": 0.30, "loss_per_capita": 890},
        "Forest Fire": {"displaced_ratio": 0.15, "casualty_ratio": 0.00008, "home_damage_ratio": 0.06, "crop_loss_ratio": 0.40, "loss_per_capita": 640},
        "Drought": {"displaced_ratio": 0.04, "casualty_ratio": 0.00001, "home_damage_ratio": 0.001, "crop_loss_ratio": 0.85, "loss_per_capita": 280}
    }
    params = impact_factors.get(disaster_type, impact_factors["Flood"])

    # Computed human impacts
    displaced_people = int(total_exposed_population * params["displaced_ratio"] * severity_factor * vulnerability_multiplier)
    casualties = int(total_exposed_population * params["casualty_ratio"] * severity_factor * vulnerability_multiplier)
    injured = int(casualties * 4.5) + (1 if casualties > 0 else 0)

    # Physical Infrastructure Impacts
    estimated_households = max(1, int(total_exposed_population / 4.5))
    damaged_homes = int(estimated_households * params["home_damage_ratio"] * severity_factor * vulnerability_multiplier)
    critical_infra_damaged = max(1, int(damaged_homes * 0.008))

    # Agricultural Cropland Losses
    total_crop_hectares = area_sq_km * crop_hectares_density
    agricultural_loss_hectares = round(total_crop_hectares * params["crop_loss_ratio"] * severity_factor, 1)

    # Financial Loss Estimation ($ Millions & INR Crores)
    raw_financial_loss_usd = total_exposed_population * params["loss_per_capita"] * severity_factor * vulnerability_multiplier
    loss_usd_millions = round(raw_financial_loss_usd / 1_000_000.0, 2)
    # Currency conversion standard: 1 USD ~ 85 INR -> Loss in Crores (1 Crore = 10 Million INR)
    loss_inr_crores = round(loss_usd_millions * 8.5, 2)

    # Severity Tier Classification
    if severity_score >= 80 or loss_usd_millions >= 100:
        emergency_tier = "Tier-1 (National / International Response Required)"
        tier_badge = "🔴 Tier-1 Emergency"
    elif severity_score >= 60 or loss_usd_millions >= 25:
        emergency_tier = "Tier-2 (State Level Disaster Mobilization)"
        tier_badge = "🟠 Tier-2 Emergency"
    elif severity_score >= 35:
        emergency_tier = "Tier-3 (District Rapid Response)"
        tier_badge = "🟡 Tier-3 Alert"
    else:
        emergency_tier = "Tier-4 (Local Preparedness Watch)"
        tier_badge = "🟢 Tier-4 Local"

    return {
        "area_sq_km": round(area_sq_km, 1),
        "total_exposed_population": total_exposed_population,
        "displaced_people": displaced_people,
        "casualties": casualties,
        "injured": injured,
        "damaged_homes": damaged_homes,
        "critical_infra_damaged": critical_infra_damaged,
        "agricultural_loss_hectares": agricultural_loss_hectares,
        "loss_usd_millions": loss_usd_millions,
        "loss_inr_crores": loss_inr_crores,
        "emergency_tier": emergency_tier,
        "tier_badge": tier_badge
    }
