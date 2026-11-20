"""
Test Suite for Café Location Intelligence System.
Verifies data cleaning, feature engineering, score bounds, ranking consistency,
opportunity classification, and SQLite database execution.
"""

import os
import unittest
import pandas as pd
import numpy as np

from src.data_cleaning import clean_data, generate_data_quality_report
from src.feature_engineering import engineer_features, min_max_scale
from src.scoring import calculate_scores, classify_opportunity
from src.database import init_db, run_query
from src.analysis import generate_recommendation, get_kpi_summary


class TestCafeLocationIntelligence(unittest.TestCase):

    def setUp(self):
        """Creates sample raw data for testing."""
        self.raw_data = pd.DataFrame({
            "area": [" Gachibowli ", "Hitec City", "Madhapur", "Gachibowli ", "Invalid_Area"],
            "population": [120000, 95000, 110000, 120000, np.nan],
            "cafes": [40, 55, 25, 40, -5],
            "restaurants": [100, 150, 90, 100, 80],
            "colleges": [4, 2, 5, 4, 3],
            "offices": [80, 130, 90, 80, 20],
            "metro_distance_km": [2.5, 0.8, 1.2, 2.5, 3.0],
            "avg_monthly_rent": [140000, 180000, 110000, 140000, 80000],
            "avg_cafe_rating": [4.2, 4.5, 4.1, 4.2, 6.0],  # Out of range rating
            "average_customer_footfall": [18000, 24000, 21000, 18000, 12000],
            "parking_availability": [8, 9, 7, 8, 5],
            "residential_density": [4800, 3900, 5200, 4800, 4000],
            "commercial_density": [7500, 9200, 8100, 7500, 5000],
            "latitude": [17.4401, 17.4435, 17.4483, 17.4401, 17.4000],
            "longitude": [78.3489, 78.3772, 78.3915, 78.3489, 78.3500]
        })

    def test_data_cleaning(self):
        """Tests missing value imputation, duplicate removal, text trimming, and range validation."""
        df_clean, report = clean_data(self.raw_data)
        
        # Check string trimming & duplicates
        self.assertNotIn(" Gachibowli ", df_clean['area'].values)
        self.assertIn("Gachibowli", df_clean['area'].values)
        self.assertEqual(len(df_clean), 4)  # Duplicate Gachibowli dropped
        
        # Check missing value imputation
        self.assertEqual(df_clean['population'].isnull().sum(), 0)
        
        # Check clipping negative values & out of bound ratings
        self.assertGreaterEqual(df_clean['cafes'].min(), 0)
        self.assertLessEqual(df_clean['avg_cafe_rating'].max(), 5.0)

    def test_min_max_scaling(self):
        """Tests 0-100 min-max normalization."""
        s = pd.Series([10, 20, 30, 40, 50])
        scaled = min_max_scale(s)
        self.assertEqual(scaled.min(), 0.0)
        self.assertEqual(scaled.max(), 100.0)
        
        # Test inverted scaling
        scaled_inv = min_max_scale(s, invert=True)
        self.assertEqual(scaled_inv.min(), 0.0)
        self.assertEqual(scaled_inv.max(), 100.0)
        self.assertEqual(scaled_inv.iloc[0], 100.0)

    def test_score_calculation(self):
        """Tests sub-score and overall score bounds (0-100) and ranking order."""
        df_clean, _ = clean_data(self.raw_data)
        df_scored = calculate_scores(df_clean)
        
        self.assertTrue((df_scored['overall_score'] >= 0.0).all())
        self.assertTrue((df_scored['overall_score'] <= 100.0).all())
        self.assertEqual(df_scored['rank'].iloc[0], 1)
        self.assertEqual(len(df_scored['rank'].unique()), len(df_scored))

    def test_opportunity_classification(self):
        """Tests tier classification logic."""
        self.assertEqual(classify_opportunity(85.0), "Excellent Opportunity")
        self.assertEqual(classify_opportunity(70.0), "Good Opportunity")
        self.assertEqual(classify_opportunity(55.0), "Moderate Opportunity")
        self.assertEqual(classify_opportunity(40.0), "Low Opportunity")

    def test_database_operations(self):
        """Tests SQLite table initialization and query execution."""
        db_path = "test_cafe.db"
        df_clean, _ = clean_data(self.raw_data)
        df_scored = calculate_scores(df_clean)
        
        init_db(df_scored, db_path)
        res_df = run_query("SELECT COUNT(*) AS total FROM hyderabad_cafes;", db_path)
        self.assertEqual(res_df['total'].iloc[0], len(df_scored))
        
        if os.path.exists(db_path):
            os.remove(db_path)

    def test_recommendation_engine(self):
        """Tests automated recommendation engine outputs."""
        df_clean, _ = clean_data(self.raw_data)
        df_scored = calculate_scores(df_clean)
        rec = generate_recommendation(df_scored.iloc[0], df_scored)
        
        self.assertIn("area", rec)
        self.assertIn("recommendation", rec)
        self.assertIsInstance(rec['strengths'], list)
        self.assertIsInstance(rec['risks'], list)
        self.assertTrue(len(rec['suggested_strategy']) > 0)


if __name__ == "__main__":
    unittest.main()
