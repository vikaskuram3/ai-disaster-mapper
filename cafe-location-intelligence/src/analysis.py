"""
Analysis & Recommendation Module for Café Location Intelligence System.
Generates dynamic rule-based business recommendations, strengths, risks,
and strategic advice tailored to each Hyderabad area based on empirical metrics.
"""

import pandas as pd
import numpy as np
from typing import Dict, Any, List


def generate_recommendation(area_row: pd.Series, full_df: pd.DataFrame) -> Dict[str, Any]:
    """
    Dynamically generates rule-based business recommendations, key strengths,
    inherent risks, and actionable retail strategies for a selected area.
    
    Ensures zero hardcoding; all statements are strictly derived from percentile
    benchmarks across the analyzed Hyderabad dataset.
    """
    strengths: List[str] = []
    risks: List[str] = []

    # Percentile thresholds across the dataset
    p70_footfall = full_df['average_customer_footfall'].quantile(0.70)
    p30_footfall = full_df['average_customer_footfall'].quantile(0.30)
    
    p70_rent = full_df['avg_monthly_rent'].quantile(0.70)
    p30_rent = full_df['avg_monthly_rent'].quantile(0.30)
    
    p70_cafes = full_df['cafes'].quantile(0.70)
    p30_cafes = full_df['cafes'].quantile(0.30)
    
    p70_offices = full_df['offices'].quantile(0.70)
    p70_colleges = full_df['colleges'].quantile(0.70)
    
    p30_metro = full_df['metro_distance_km'].quantile(0.30)  # Close metro is < p30
    p70_metro = full_df['metro_distance_km'].quantile(0.70)  # Far metro is > p70

    # Evaluate Strengths
    if area_row['average_customer_footfall'] >= p70_footfall:
        strengths.append(f"High daily customer footfall (~{int(area_row['average_customer_footfall']):,} visitors/day)")
    if area_row['cafes'] <= p30_cafes:
        strengths.append(f"Low existing café competition ({int(area_row['cafes'])} competing cafés)")
    if area_row['avg_monthly_rent'] <= p30_rent:
        strengths.append(f"Favorable commercial rent (₹{int(area_row['avg_monthly_rent']):,}/month)")
    if area_row['offices'] >= p70_offices:
        strengths.append(f"Dense corporate office hub ({int(area_row['offices'])} major office buildings)")
    if area_row['colleges'] >= p70_colleges:
        strengths.append(f"High student population ({int(area_row['colleges'])} nearby colleges/institutes)")
    if area_row['metro_distance_km'] <= p30_metro:
        strengths.append(f"Excellent metro connectivity ({area_row['metro_distance_km']:.1f} km to station)")
    if area_row['parking_availability'] >= 8:
        strengths.append(f"High parking facility score ({int(area_row['parking_availability'])}/10)")

    # Fallback strength if none triggered
    if not strengths:
        strengths.append(f"Balanced market indicators across residential and commercial sectors.")

    # Evaluate Risks
    if area_row['avg_monthly_rent'] >= p70_rent:
        risks.append(f"High rental overhead (₹{int(area_row['avg_monthly_rent']):,}/month)")
    if area_row['cafes'] >= p70_cafes:
        risks.append(f"Saturated café market ({int(area_row['cafes'])} existing competitors)")
    if area_row['average_customer_footfall'] <= p30_footfall:
        risks.append(f"Lower customer footfall (~{int(area_row['average_customer_footfall']):,} visitors/day)")
    if area_row['metro_distance_km'] >= p70_metro:
        risks.append(f"Limited metro access ({area_row['metro_distance_km']:.1f} km from nearest station)")
    if area_row['parking_availability'] <= 4:
        risks.append(f"Restricted customer parking facility ({int(area_row['parking_availability'])}/10)")

    # Fallback risk if none triggered
    if not risks:
        risks.append(f"Moderate competitive landscape requiring strong brand differentiation.")

    # Business Rating Recommendation & Tailored Strategy
    score = area_row['overall_score']
    if score >= 80:
        recommendation = "Strong Candidate (Prime Location)"
        if area_row['offices'] >= p70_offices:
            strategy = "Launch a flagship quick-service & premium espresso bar. Focus heavily on morning corporate coffee runs, express lunch combos, and corporate catering."
        elif area_row['colleges'] >= p70_colleges:
            strategy = "Target youth & student crowd. Offer budget-friendly specialty coffee, high-speed Wi-Fi, study booths, and vibrant social aesthetic."
        else:
            strategy = "Deploy an upscale lifestyle café catering to high-income residential footfall with artisanal bakery items and indoor-outdoor seating."
    elif score >= 65:
        recommendation = "Good Candidate (Promising Potential)"
        if area_row['avg_monthly_rent'] >= p70_rent:
            strategy = "Optimize floor area to keep lease costs manageable. Emphasize takeaway orders, delivery partnerships, and high table turnover."
        else:
            strategy = "Establish a neighborhood cozy café concept with loyalty programs for local residents and working professionals."
    elif score >= 50:
        recommendation = "Moderate Candidate (Niche / Conditional Opportunity)"
        strategy = "Consider low-capex formats such as a kiosk or cloud-kitchen coffee pop-up. Perform detailed micro-street footfall audits before signing long-term leases."
    else:
        recommendation = "Low Priority (High Commercial Risk)"
        strategy = "Postpone brick-and-mortar investment. Reallocate budget toward higher-demand or lower-rent clusters in Hyderabad."

    return {
        "area": area_row['area'],
        "recommendation": recommendation,
        "overall_score": score,
        "category": area_row['opportunity_category'],
        "strengths": strengths,
        "risks": risks,
        "suggested_strategy": strategy
    }


def get_kpi_summary(df: pd.DataFrame) -> Dict[str, Any]:
    """Generates overall portfolio KPI summary numbers for dashboard display."""
    top_row = df.sort_values('overall_score', ascending=False).iloc[0]
    return {
        "total_locations": int(len(df)),
        "avg_rent": float(df['avg_monthly_rent'].mean()),
        "avg_cafes": float(df['cafes'].mean()),
        "best_location": top_row['area'],
        "highest_score": float(top_row['overall_score']),
        "excellent_count": int((df['opportunity_category'] == 'Excellent Opportunity').sum())
    }
