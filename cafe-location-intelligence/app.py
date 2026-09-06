"""
Streamlit Web Application: Café Location Intelligence & Market Opportunity Analysis
Location: Hyderabad, Telangana, India
"""

import os
import sqlite3
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as gg
import streamlit as st

# Custom modules
from src.data_cleaning import load_raw_data, clean_data
from src.feature_engineering import engineer_features
from src.scoring import calculate_scores, DEFAULT_WEIGHTS
from src.database import init_db, run_query, parse_sql_statements
from src.analysis import generate_recommendation, get_kpi_summary

# Streamlit Page Config
st.set_page_config(
    page_title="Café Location Intelligence — Hyderabad",
    page_icon="☕",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Compatibility helper for Plotly and Dataframe rendering across Streamlit versions
def render_plotly(fig):
    """Renders Plotly chart using modern width='stretch' if supported, else falls back to use_container_width=True."""
    try:
        st.plotly_chart(fig, width="stretch")
    except (TypeError, ValueError):
        st.plotly_chart(fig, use_container_width=True)

def render_dataframe(df, **kwargs):
    """Renders Dataframe using modern width='stretch' if supported, else falls back to use_container_width=True."""
    try:
        st.dataframe(df, width="stretch", **kwargs)
    except (TypeError, ValueError):
        st.dataframe(df, use_container_width=True, **kwargs)

# Custom CSS for styling
st.markdown("""
<style>
    .metric-card {
        background-color: #1E293B;
        border-radius: 8px;
        padding: 16px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        border: 1px solid #334155;
    }
    .stApp {
        background-color: #0F172A;
        color: #F8FAFC;
    }
    .badge-excellent {
        background-color: #059669; color: white; padding: 4px 12px; border-radius: 12px; font-weight: bold;
    }
    .badge-good {
        background-color: #2563EB; color: white; padding: 4px 12px; border-radius: 12px; font-weight: bold;
    }
    .badge-moderate {
        background-color: #D97706; color: white; padding: 4px 12px; border-radius: 12px; font-weight: bold;
    }
    .badge-low {
        background-color: #DC2626; color: white; padding: 4px 12px; border-radius: 12px; font-weight: bold;
    }
</style>
""", unsafe_allow_html=True)


@st.cache_data
def load_and_prepare_data():
    """Loads raw dataset, runs cleaning, feature engineering, scoring, and initializes SQLite DB."""
    raw_path = "data/raw/hyderabad_cafe_raw.csv"
    processed_csv_path = "data/processed/hyderabad_cafe_cleaned.csv"
    db_path = "data/processed/cafe_intelligence.db"

    # Ensure processed dir exists
    os.makedirs("data/processed", exist_ok=True)

    df_raw = load_raw_data(raw_path)
    df_clean, quality_report = clean_data(df_raw)
    df_clean.to_csv(processed_csv_path, index=False)
    
    # Calculate baseline scores
    df_scored = calculate_scores(df_clean)
    
    # Initialize SQLite Database
    init_db(df_scored, db_path)

    return df_raw, df_clean, df_scored, quality_report, db_path


# Load Data
df_raw, df_clean, df_base_scored, quality_report, DB_PATH = load_and_prepare_data()

# App Title & Header
st.title("☕ Café Location Intelligence & Market Opportunity Analysis")
st.markdown("##### **Target City:** Hyderabad, Telangana, India | Data-Driven Location Decision Support System")

st.caption("⚠️ **Data Attribution & Disclaimer:** Demonstration dataset created for portfolio analysis; values are synthetic and do not represent official Hyderabad statistics.")

# --- SIDEBAR FILTERS & WHAT-IF WEIGHT CONTROL ---
st.sidebar.header("🎛️ Market Filters & Scenario Setup")

# Scenario Weights Section
st.sidebar.subheader("⚖️ Scoring Weights (What-If Analysis)")
w_demand = st.sidebar.slider("Demand Importance", 0.0, 1.0, DEFAULT_WEIGHTS['demand'], 0.05)
w_comp = st.sidebar.slider("Competition Importance", 0.0, 1.0, DEFAULT_WEIGHTS['competition'], 0.05)
w_rent = st.sidebar.slider("Rent Affordability Importance", 0.0, 1.0, DEFAULT_WEIGHTS['rent'], 0.05)
w_access = st.sidebar.slider("Accessibility Importance", 0.0, 1.0, DEFAULT_WEIGHTS['accessibility'], 0.05)
w_potential = st.sidebar.slider("College/Office Hub Importance", 0.0, 1.0, DEFAULT_WEIGHTS['potential'], 0.05)
w_rating = st.sidebar.slider("Café Rating Importance", 0.0, 1.0, DEFAULT_WEIGHTS['rating'], 0.05)

custom_weights = {
    "demand": w_demand,
    "competition": w_comp,
    "rent": w_rent,
    "accessibility": w_access,
    "potential": w_potential,
    "rating": w_rating
}

# Dynamically Recalculate Scores based on Weights
df_scored = calculate_scores(df_clean, weights=custom_weights)

st.sidebar.markdown("---")
st.sidebar.subheader("🔍 Location Filters")

# Filter 1: Rent Budget
max_rent_limit = int(df_scored['avg_monthly_rent'].max())
min_rent_limit = int(df_scored['avg_monthly_rent'].min())
selected_max_rent = st.sidebar.slider(
    "Max Monthly Rent Budget (₹)",
    min_value=min_rent_limit,
    max_value=max_rent_limit,
    value=max_rent_limit,
    step=5000
)

# Filter 2: Opportunity Tiers
all_categories = list(df_scored['opportunity_category'].unique())
selected_categories = st.sidebar.multiselect(
    "Opportunity Category",
    options=all_categories,
    default=all_categories
)

# Filter 3: Minimum Score
min_score_filter = st.sidebar.slider("Minimum Opportunity Score", 0, 100, 0, 5)

# Filter 4: Specific Area Selection
all_areas = sorted(list(df_scored['area'].unique()))
selected_areas = st.sidebar.multiselect("Select Specific Areas", options=all_areas, default=[])

# Apply Filters
df_filtered = df_scored[
    (df_scored['avg_monthly_rent'] <= selected_max_rent) &
    (df_scored['opportunity_category'].isin(selected_categories)) &
    (df_scored['overall_score'] >= min_score_filter)
]

if selected_areas:
    df_filtered = df_filtered[df_filtered['area'].isin(selected_areas)]

# --- MAIN DASHBOARD BODY ---
if df_filtered.empty:
    st.warning("⚠️ No Hyderabad locations match your selected filter criteria. Try relaxing your filters in the sidebar.")
else:
    # KPI Row
    kpis = get_kpi_summary(df_filtered)
    c1, c2, c3, c4, c5 = st.columns(5)
    
    c1.metric("Locations Analyzed", f"{kpis['total_locations']}")
    c2.metric("Avg Monthly Rent", f"₹{kpis['avg_rent']:,.0f}")
    c3.metric("Avg Competitor Cafés", f"{kpis['avg_cafes']:.1f}")
    c4.metric("Top Opportunity Area", f"{kpis['best_location']}")
    c5.metric("Highest Score", f"{kpis['highest_score']:.1f} / 100")

    st.markdown("---")

    # TABS LAYOUT
    tab_overview, tab_map, tab_eda, tab_deepdive, tab_sql, tab_quality = st.tabs([
        "📊 Leaderboard & Rankings",
        "🗺️ Interactive Hyderabad Map",
        "📈 Market EDA & Scatter Plots",
        "🔍 Location Deep Dive & Strategy",
        "🗄️ SQL Analytics Engine",
        "📋 Data Audit & Methodology"
    ])

    # TAB 1: LEADERBOARD & RANKINGS
    with tab_overview:
        st.subheader("Hyderabad Area Market Rankings")
        
        col_chart, col_table = st.columns([1, 1])

        with col_chart:
            fig_rank = px.bar(
                df_filtered.sort_values('overall_score', ascending=True),
                x='overall_score',
                y='area',
                orientation='h',
                color='opportunity_category',
                color_discrete_map={
                    "Excellent Opportunity": "#10B981",
                    "Good Opportunity": "#3B82F6",
                    "Moderate Opportunity": "#F59E0B",
                    "Low Opportunity": "#EF4444"
                },
                title="Overall Location Opportunity Score by Area",
                labels={"overall_score": "Overall Score (0-100)", "area": "Hyderabad Neighborhood"},
                height=500
            )
            fig_rank.update_layout(template="plotly_dark", margin=dict(l=20, r=20, t=40, b=20))
            render_plotly(fig_rank)

        with col_table:
            st.markdown("##### Detailed Rankings Table")
            display_cols = ['rank', 'area', 'opportunity_category', 'overall_score', 'demand_score', 'competition_score', 'rent_score', 'avg_monthly_rent', 'cafes']
            render_dataframe(
                df_filtered[display_cols].rename(columns={
                    'rank': 'Rank',
                    'area': 'Area',
                    'opportunity_category': 'Category',
                    'overall_score': 'Overall Score',
                    'demand_score': 'Demand',
                    'competition_score': 'Competition Opp',
                    'rent_score': 'Rent Affordability',
                    'avg_monthly_rent': 'Avg Rent (₹)',
                    'cafes': 'Competing Cafés'
                }),
                hide_index=True,
                height=450
            )

    # TAB 2: INTERACTIVE HYDERABAD MAP
    with tab_map:
        st.subheader("Geographical Distribution of Opportunities in Hyderabad")
        
        map_func = getattr(px, 'scatter_map', None) or getattr(px, 'scatter_mapbox', None)
        
        fig_map = map_func(
            df_filtered,
            lat="latitude",
            lon="longitude",
            hover_name="area",
            hover_data={
                "overall_score": ":.1f",
                "opportunity_category": True,
                "avg_monthly_rent": ":, INR",
                "cafes": True,
                "average_customer_footfall": ":, visitors",
                "latitude": False,
                "longitude": False
            },
            color="opportunity_category",
            size="overall_score",
            size_max=22,
            zoom=10.5,
            center={"lat": 17.4100, "lon": 78.4300},
            title="Hyderabad Café Location Opportunity Map",
            color_discrete_map={
                "Excellent Opportunity": "#10B981",
                "Good Opportunity": "#3B82F6",
                "Moderate Opportunity": "#F59E0B",
                "Low Opportunity": "#EF4444"
            },
            height=600
        )
        fig_map.update_layout(template="plotly_dark", margin=dict(l=0, r=0, t=40, b=0))
        render_plotly(fig_map)

    # TAB 3: MARKET EDA & SCATTER PLOTS
    with tab_eda:
        st.subheader("Exploratory Data Analysis & Market Relationships")
        
        col_s1, col_s2 = st.columns(2)

        with col_s1:
            fig_comp = px.scatter(
                df_filtered,
                x="cafes",
                y="overall_score",
                size="average_customer_footfall",
                color="opportunity_category",
                hover_name="area",
                title="Café Competition vs. Overall Opportunity Score",
                labels={"cafes": "Existing Competing Cafés Count", "overall_score": "Overall Score"},
                color_discrete_map={
                    "Excellent Opportunity": "#10B981",
                    "Good Opportunity": "#3B82F6",
                    "Moderate Opportunity": "#F59E0B",
                    "Low Opportunity": "#EF4444"
                }
            )
            fig_comp.update_layout(template="plotly_dark")
            render_plotly(fig_comp)

        with col_s2:
            fig_rent = px.scatter(
                df_filtered,
                x="avg_monthly_rent",
                y="overall_score",
                size="average_customer_footfall",
                color="opportunity_category",
                hover_name="area",
                title="Monthly Rent vs. Overall Opportunity Score",
                labels={"avg_monthly_rent": "Avg Monthly Commercial Rent (₹)", "overall_score": "Overall Score"},
                color_discrete_map={
                    "Excellent Opportunity": "#10B981",
                    "Good Opportunity": "#3B82F6",
                    "Moderate Opportunity": "#F59E0B",
                    "Low Opportunity": "#EF4444"
                }
            )
            fig_rent.update_layout(template="plotly_dark")
            render_plotly(fig_rent)

        st.markdown("---")
        col_b1, col_b2 = st.columns(2)
        
        with col_b1:
            fig_footfall = px.bar(
                df_filtered.sort_values('average_customer_footfall', ascending=False),
                x='area',
                y='average_customer_footfall',
                color='average_customer_footfall',
                color_continuous_scale='Viridis',
                title="Daily Customer Footfall by Area",
                labels={"average_customer_footfall": "Est. Daily Footfall", "area": "Area"}
            )
            fig_footfall.update_layout(template="plotly_dark", xaxis_tickangle=-45)
            render_plotly(fig_footfall)

        with col_b2:
            fig_metro = px.scatter(
                df_filtered,
                x="metro_distance_km",
                y="accessibility_score",
                size="parking_availability",
                color="area",
                title="Metro Distance vs. Accessibility Sub-Score",
                labels={"metro_distance_km": "Distance to Metro (km)", "accessibility_score": "Accessibility Score"}
            )
            fig_metro.update_layout(template="plotly_dark")
            render_plotly(fig_metro)

    # TAB 4: LOCATION DEEP DIVE & RECOMMENDATION ENGINE
    with tab_deepdive:
        st.subheader("🔍 Location Deep Dive & Strategy Generator")
        
        selected_deep_area = st.selectbox("Select Area to Analyze:", options=sorted(list(df_filtered['area'].unique())))
        
        area_row = df_filtered[df_filtered['area'] == selected_deep_area].iloc[0]
        rec = generate_recommendation(area_row, df_scored)

        # Overview Metrics Banner
        d1, d2, d3, d4, d5 = st.columns(5)
        d1.metric("Overall Score", f"{area_row['overall_score']:.1f} / 100")
        d2.metric("Opportunity Rank", f"#{int(area_row['rank'])} of {len(df_scored)}")
        d3.metric("Est. Monthly Rent", f"₹{int(area_row['avg_monthly_rent']):,}")
        d4.metric("Daily Footfall", f"{int(area_row['average_customer_footfall']):,}")
        d5.metric("Competing Cafés", f"{int(area_row['cafes'])}")

        st.markdown("---")

        # Sub-score Radar / Breakdown Chart & Recommendation Box
        r_col1, r_col2 = st.columns([1, 1])

        with r_col1:
            st.markdown("##### Sub-Score Breakdown (0–100 Scale)")
            scores_df = pd.DataFrame({
                "Dimension": ["Demand", "Competition Opp.", "Rent Affordability", "Accessibility", "College/Office Hub", "Café Benchmark"],
                "Score": [
                    area_row['demand_score'],
                    area_row['competition_score'],
                    area_row['rent_score'],
                    area_row['accessibility_score'],
                    area_row['potential_score'],
                    area_row['rating_score']
                ]
            })
            
            fig_sub = px.bar(
                scores_df,
                x="Score",
                y="Dimension",
                orientation='h',
                color="Score",
                color_continuous_scale="Blues",
                range_x=[0, 100],
                title=f"Component Breakdown for {selected_deep_area}"
            )
            fig_sub.update_layout(template="plotly_dark", height=350)
            render_plotly(fig_sub)

        with r_col2:
            st.markdown(f"### Verdict: **{rec['recommendation']}**")
            st.markdown(f"**Category:** `{rec['category']}`")
            
            st.markdown("##### 🟢 Key Strengths")
            for s in rec['strengths']:
                st.markdown(f"- {s}")

            st.markdown("##### 🔴 Commercial Risks")
            for r in rec['risks']:
                st.markdown(f"- {r}")

            st.markdown("##### 💡 Recommended Retail Strategy")
            st.info(rec['suggested_strategy'])

    # TAB 5: SQL ANALYTICS ENGINE
    with tab_sql:
        st.subheader("🗄️ SQL Analytics Engine (SQLite)")
        st.markdown("Run pre-written business intelligence SQL queries directly against the underlying `hyderabad_cafes` database table.")

        sql_queries = parse_sql_statements("sql/analysis.sql")
        query_titles = [q[0] for q in sql_queries]
        
        selected_query_title = st.selectbox("Select Business Question (SQL Query):", options=query_titles)
        
        selected_sql = next((q[1] for q in sql_queries if q[0] == selected_query_title), "")

        st.code(selected_sql, language="sql")
        
        if st.button("▶️ Run Selected SQL Query"):
            try:
                res_df = run_query(selected_sql, DB_PATH)
                st.markdown("##### Query Results:")
                render_dataframe(res_df)
            except Exception as e:
                st.error(f"SQL Execution Error: {str(e)}")

    # TAB 6: DATA AUDIT & METHODOLOGY
    with tab_quality:
        st.subheader("📋 Data Quality Audit Report & Methodology")
        
        q1, q2, q3, q4 = st.columns(4)
        q1.metric("Raw Rows", quality_report['raw_rows'])
        q2.metric("Cleaned Rows", quality_report['clean_rows'])
        q3.metric("Missing Cells Imputed", quality_report['raw_missing_cells'])
        q4.metric("Duplicate Rows Dropped", quality_report['raw_duplicates'])

        st.markdown("---")

        st.markdown("##### Raw Dataset Preview (First 5 Rows)")
        render_dataframe(df_raw.head())

        st.markdown("##### Cleaned & Scored Dataset Preview")
        render_dataframe(df_clean.head())

        st.markdown("---")
        st.markdown("""
        ### Methodology Overview & Weighting Formulas
        1. **Demand Score (30%)**: Scaled combination of daily customer footfall, local population, commercial density, and residential density.
        2. **Competition Opportunity Score (20%)**: Inverted Min-Max scaling of existing café count (areas with fewer competing cafés score higher).
        3. **Rent Affordability Score (20%)**: Inverted Min-Max scaling of average monthly commercial lease rent per sq ft.
        4. **Accessibility Score (15%)**: Proximity to nearest Hyderabad Metro station combined with parking infrastructure score.
        5. **College & Office Potential Score (10%)**: Density of IT parks/offices and colleges/universities.
        6. **Café Rating Benchmark (5%)**: Benchmark scaling of customer ratings of active cafes in the vicinity.
        """)
