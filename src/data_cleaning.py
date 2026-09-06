"""
Data Cleaning Module for Café Location Intelligence System.
Handles data loading, standardization, missing values, duplicate removal,
data validation, and quality auditing for Hyderabad market analysis.
"""

import pandas as pd
import numpy as np
import logging
from typing import Tuple, Dict, Any

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")


def load_raw_data(filepath: str) -> pd.DataFrame:
    """Loads raw dataset from specified CSV path with error handling."""
    try:
        df = pd.read_csv(filepath)
        logging.info(f"Successfully loaded raw data from {filepath} with {len(df)} rows.")
        return df
    except Exception as e:
        logging.error(f"Failed to load raw data from {filepath}: {str(e)}")
        raise e


def generate_data_quality_report(df_raw: pd.DataFrame, df_clean: pd.DataFrame = None) -> Dict[str, Any]:
    """
    Generates a structured data quality audit report summarizing row/col counts,
    missing values, duplicate rows, and data types before and after cleaning.
    """
    report = {
        "raw_rows": len(df_raw),
        "raw_cols": len(df_raw.columns),
        "raw_missing_cells": int(df_raw.isnull().sum().sum()),
        "raw_duplicates": int(df_raw.duplicated(subset=['area']).sum()) if 'area' in df_raw.columns else int(df_raw.duplicated().sum()),
        "columns_dtypes": {col: str(dtype) for col, dtype in df_raw.dtypes.items()},
    }
    
    if df_clean is not None:
        report.update({
            "clean_rows": len(df_clean),
            "clean_cols": len(df_clean.columns),
            "clean_missing_cells": int(df_clean.isnull().sum().sum()),
            "clean_duplicates": int(df_clean.duplicated(subset=['area']).sum()),
        })
        
    return report


def clean_data(df_raw: pd.DataFrame) -> Tuple[pd.DataFrame, Dict[str, Any]]:
    """
    Executes end-to-end data cleaning pipeline:
    1. Trims and standardizes area strings.
    2. Drops exact and standardized area duplicates.
    3. Handles missing values via median imputation for numerical columns.
    4. Validates and clips negative/out-of-bound values to valid ranges.
    5. Converts numeric columns to appropriate integer/float dtypes.
    
    Returns cleaned DataFrame and Data Quality Report.
    """
    df = df_raw.copy()

    # 1. Standardize text columns (area names)
    if 'area' in df.columns:
        df['area'] = df['area'].astype(str).str.strip().str.title()

    # 2. Drop duplicates based on standardized area name
    df = df.drop_duplicates(subset=['area'], keep='first').reset_index(drop=True)

    # List of expected numerical columns
    num_cols = [
        'population', 'cafes', 'restaurants', 'colleges', 'offices',
        'metro_distance_km', 'avg_monthly_rent', 'avg_cafe_rating',
        'average_customer_footfall', 'parking_availability',
        'residential_density', 'commercial_density', 'latitude', 'longitude'
    ]

    # 3. Ensure numeric conversion & handle missing values
    for col in num_cols:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce')
            # Impute missing values with median if any exist
            if df[col].isnull().sum() > 0:
                median_val = df[col].median()
                df[col] = df[col].fillna(median_val)
                logging.info(f"Imputed missing values in '{col}' with median: {median_val}")

    # 4. Handle impossible / negative values (clip at 0 for counts and distances)
    non_negative_cols = [
        'population', 'cafes', 'restaurants', 'colleges', 'offices',
        'metro_distance_km', 'avg_monthly_rent', 'average_customer_footfall',
        'parking_availability', 'residential_density', 'commercial_density'
    ]
    for col in non_negative_cols:
        if col in df.columns:
            df[col] = df[col].clip(lower=0)

    # Rating bound validation (1.0 to 5.0)
    if 'avg_cafe_rating' in df.columns:
        df['avg_cafe_rating'] = df['avg_cafe_rating'].clip(lower=1.0, upper=5.0)

    # 5. Type casting
    int_cols = ['population', 'cafes', 'restaurants', 'colleges', 'offices', 'average_customer_footfall']
    for col in int_cols:
        if col in df.columns:
            df[col] = df[col].astype(int)

    report = generate_data_quality_report(df_raw, df)
    logging.info(f"Data cleaning completed. Cleaned dataset has {len(df)} rows.")
    return df, report


import os

if __name__ == "__main__":
    raw_path = "data/raw/hyderabad_cafe_raw.csv"
    processed_path = "data/processed/hyderabad_cafe_cleaned.csv"
    proc_dir = os.path.dirname(processed_path)
    if proc_dir:
        os.makedirs(proc_dir, exist_ok=True)

    df_raw = load_raw_data(raw_path)
    df_cleaned, report = clean_data(df_raw)
    df_cleaned.to_csv(processed_path, index=False)
    print("Data Quality Report Summary:")
    for k, v in report.items():
        print(f"  {k}: {v}")

