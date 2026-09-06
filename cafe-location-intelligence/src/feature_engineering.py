"""
Feature Engineering Module for Café Location Intelligence System.
Calculates normalization scales (0-100) and analytical ratios for scoring.
"""

import pandas as pd
import numpy as np
from typing import Union


def min_max_scale(series: pd.Series, invert: bool = False) -> pd.Series:
    """
    Scales a pandas Series to a 0-100 range using Min-Max Normalization.
    
    If invert=True, lower original values produce higher scores (useful for Rent or Metro Distance).
    """
    min_val = series.min()
    max_val = series.max()
    
    if min_val == max_val:
        return pd.Series(50.0, index=series.index)
        
    if invert:
        scaled = ((max_val - series) / (max_val - min_val)) * 100.0
    else:
        scaled = ((series - min_val) / (max_val - min_val)) * 100.0
        
    return scaled.round(2)


def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Engineers normalized sub-metrics and analytical features:
    - footfall_to_cafe_ratio
    - office_college_hub_score
    - normalized metrics for scoring inputs
    """
    df = df.copy()

    # Derived business metrics
    df['footfall_per_cafe'] = (df['average_customer_footfall'] / (df['cafes'] + 1)).round(1)
    df['total_food_venues'] = df['cafes'] + df['restaurants']
    df['office_college_hub'] = df['offices'] * 1.5 + df['colleges'] * 2.0

    # Normalized 0-100 Sub-Features
    df['norm_population'] = min_max_scale(df['population'])
    df['norm_footfall'] = min_max_scale(df['average_customer_footfall'])
    df['norm_offices'] = min_max_scale(df['offices'])
    df['norm_colleges'] = min_max_scale(df['colleges'])
    df['norm_res_density'] = min_max_scale(df['residential_density'])
    df['norm_com_density'] = min_max_scale(df['commercial_density'])

    # Competition Opportunity (Fewer cafes = higher score)
    df['norm_competition_opportunity'] = min_max_scale(df['cafes'], invert=True)

    # Rent Affordability (Lower rent = higher score)
    df['norm_rent_affordability'] = min_max_scale(df['avg_monthly_rent'], invert=True)

    # Accessibility (Lower metro distance & higher parking = higher score)
    df['norm_metro_proximity'] = min_max_scale(df['metro_distance_km'], invert=True)
    df['norm_parking'] = min_max_scale(df['parking_availability'])
    df['norm_accessibility'] = (df['norm_metro_proximity'] * 0.6 + df['norm_parking'] * 0.4).round(2)

    # Rating Scaled
    df['norm_cafe_rating'] = min_max_scale(df['avg_cafe_rating'])

    return df
