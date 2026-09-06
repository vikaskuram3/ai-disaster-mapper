"""
Scoring Module for Café Location Intelligence System.
Calculates sub-scores (Demand, Competition, Rent, Accessibility, Potential, Rating)
and computes overall location opportunity scores dynamically based on configurable weights.
"""

import pandas as pd
import numpy as np
from typing import Dict, Optional
from src.feature_engineering import min_max_scale, engineer_features

# Default weighting schema as defined in requirements
DEFAULT_WEIGHTS = {
    "demand": 0.30,
    "competition": 0.20,
    "rent": 0.20,
    "accessibility": 0.15,
    "potential": 0.10,
    "rating": 0.05
}

DEFAULT_THRESHOLDS = {
    "Excellent": 80.0,
    "Good": 65.0,
    "Moderate": 50.0
}


def classify_opportunity(score: float, thresholds: Optional[Dict[str, float]] = None) -> str:
    """
    Classifies a location score into business opportunity tiers.
    
    80–100 → Excellent Opportunity
    65–79 → Good Opportunity
    50–64 → Moderate Opportunity
    Below 50 → Low Opportunity
    """
    t = thresholds or DEFAULT_THRESHOLDS
    if score >= t.get("Excellent", 80.0):
        return "Excellent Opportunity"
    elif score >= t.get("Good", 65.0):
        return "Good Opportunity"
    elif score >= t.get("Moderate", 50.0):
        return "Moderate Opportunity"
    else:
        return "Low Opportunity"


def calculate_scores(
    df: pd.DataFrame,
    weights: Optional[Dict[str, float]] = None,
    thresholds: Optional[Dict[str, float]] = None
) -> pd.DataFrame:
    """
    Computes all component sub-scores and the dynamic overall location score.
    
    Sub-scores calculated:
    - demand_score (0-100): Composite of footfall, population, commercial & residential density
    - competition_score (0-100): Opportunity based on low café competition
    - rent_score (0-100): Affordability score (lower rent = higher score)
    - accessibility_score (0-100): Proximity to metro & parking availability
    - potential_score (0-100): Hub potential derived from colleges & offices
    - rating_score (0-100): Existing average café rating benchmark
    
    Returns DataFrame with sub-scores, overall_score, rank, and opportunity_category.
    """
    w = weights if weights is not None else DEFAULT_WEIGHTS.copy()
    
    # Ensure features are engineered
    if 'norm_demand' not in df.columns:
        df = engineer_features(df)
        
    df = df.copy()

    # 1. Component Sub-Score Calculations
    # Demand Score (30% weight default)
    df['demand_score'] = (
        df['norm_footfall'] * 0.35 +
        df['norm_population'] * 0.25 +
        df['norm_com_density'] * 0.20 +
        df['norm_res_density'] * 0.20
    ).round(2)

    # Competition Score (20% weight default) - lower cafes = higher score
    df['competition_score'] = df['norm_competition_opportunity']

    # Rent Score (20% weight default) - lower rent = higher score
    df['rent_score'] = df['norm_rent_affordability']

    # Accessibility Score (15% weight default)
    df['accessibility_score'] = df['norm_accessibility']

    # Potential Score (10% weight default) - colleges & offices
    df['potential_score'] = (
        df['norm_offices'] * 0.60 +
        df['norm_colleges'] * 0.40
    ).round(2)

    # Rating Benchmark Score (5% weight default)
    df['rating_score'] = df['norm_cafe_rating']

    # 2. Normalize weights to sum to 1.0 if custom weights provided
    total_weight = sum(w.values())
    norm_w = {k: v / total_weight for k, v in w.items()}

    # 3. Dynamic Overall Score Calculation
    df['overall_score'] = (
        df['demand_score'] * norm_w['demand'] +
        df['competition_score'] * norm_w['competition'] +
        df['rent_score'] * norm_w['rent'] +
        df['accessibility_score'] * norm_w['accessibility'] +
        df['potential_score'] * norm_w['potential'] +
        df['rating_score'] * norm_w['rating']
    ).round(2)

    # 4. Rank and Opportunity Classification
    df['rank'] = df['overall_score'].rank(ascending=False, method='min').astype(int)
    df['opportunity_category'] = df['overall_score'].apply(lambda s: classify_opportunity(s, thresholds))

    # Sort by rank ascending
    df = df.sort_values('rank').reset_index(drop=True)

    return df
