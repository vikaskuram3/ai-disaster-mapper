# Café Location Intelligence & Market Opportunity Analysis (Hyderabad, Telangana)

> **A Data-Driven Analytics System for Optimal Retail Location Decision Support**

![Python](https://img.shields.io/badge/Python-3.10%2B-blue.svg)
![Streamlit](https://img.shields.io/badge/Streamlit-1.25%2B-FF4B4B.svg)
![SQLite](https://img.shields.io/badge/Database-SQLite3-003B57.svg)
![Plotly](https://img.shields.io/badge/Visuals-Plotly%20Express-3F4F75.svg)
![License](https://img.shields.io/badge/License-MIT-green.svg)

---

## 📌 Problem Statement

Opening a new café requires significant capital investment in lease agreements, interior build-out, equipment, and initial staffing. Selecting the wrong neighborhood in a rapidly expanding metropolis like **Hyderabad, Telangana** can lead to low customer footfall, unsustainable rental overhead, or brutal competition from established coffee chains. 

This project answers the critical business question:
> **"Which area in Hyderabad, Telangana is the best location for opening a new café given specific business requirements, budget constraints, and market priorities?"**

---

## 🎯 Project Objective

To build an end-to-end, reproducible business intelligence & analytics application that:
1. **Cleans & Standardizes** raw market indicators across 20 key Hyderabad neighborhoods.
2. **Engineers Multi-Criteria Sub-Scores** for **Demand**, **Competition Opportunity**, **Rent Affordability**, **Accessibility**, and **College/Office Potential**.
3. **Calculates Dynamic Location Rankings** without hard-coded assumptions or static winning locations.
4. **Executes SQL Analytics** using SQLite window functions (`RANK() OVER`) and multi-variable aggregations.
5. **Provides an Interactive Streamlit Dashboard** with real-time "What-If" scenario planning, interactive Plotly maps, and rule-based business risk/strength recommendations.

---

## 📊 Dataset Dictionary & Data Attribution

> [!IMPORTANT]
> **Data Attribution Disclaimer:** Demonstration dataset created for portfolio analysis; values are synthetic and do not represent official Hyderabad statistics.

The dataset covers **20 major commercial & residential hubs** across Hyderabad:
*Gachibowli, Hitec City, Madhapur, Jubilee Hills, Banjara Hills, Kondapur, Kukatpally, Ameerpet, Begumpet, Secunderabad, Koti, Dilsukhnagar, Charminar, Tolichowki, Manikonda, Financial District, Himayatnagar, LB Nagar, Uppal, and Miyapur.*

| Column | Data Type | Description |
| :--- | :--- | :--- |
| `area` | String | Name of the Hyderabad neighborhood/district |
| `population` | Integer | Estimated population density / local residential count |
| `cafes` | Integer | Count of existing competing cafés in the area |
| `restaurants` | Integer | Count of general restaurants & eateries |
| `colleges` | Integer | Count of nearby colleges, universities, and institutes |
| `offices` | Integer | Count of major IT parks & corporate office buildings |
| `metro_distance_km` | Float | Distance to the nearest Hyderabad Metro Rail station (km) |
| `avg_monthly_rent` | Float | Average monthly commercial lease rent per sq ft / shop (INR ₹) |
| `avg_cafe_rating` | Float | Average customer rating of existing cafés (1.0 to 5.0 scale) |
| `average_customer_footfall` | Integer | Estimated daily pedestrian & customer footfall volume |
| `parking_availability` | Integer | Parking facility & accessibility rating (1 to 10 scale) |
| `residential_density` | Integer | Residential population density per sq km |
| `commercial_density` | Integer | Business & commercial establishment density per sq km |
| `latitude` | Float | Geographic latitude coordinate for map plotting |
| `longitude` | Float | Geographic longitude coordinate for map plotting |

---

## 🛠️ Methodology & Architecture

```text
cafe-location-intelligence/
├── data/
│   ├── raw/                       # Raw input datasets
│   │   └── hyderabad_cafe_raw.csv
│   └── processed/                 # Cleaned datasets & SQLite database
│       ├── hyderabad_cafe_cleaned.csv
│       └── cafe_intelligence.db
├── website/                       # Standalone Web Portal & Landing Page
│   ├── index.html                 # Interactive website UI & Leaflet Map
│   ├── css/style.css              # Custom Tailwind dark styling
│   └── js/
│       ├── data.js                # Embedded location records & scoring weights
│       └── app.js                 # JS scoring engine, Leaflet map & Chart.js
├── src/                           # Modular Python packages
│   ├── data_cleaning.py           # Missing value imputation & validation pipeline
│   ├── feature_engineering.py     # MinMax 0-100 normalization scalers & ratios
│   ├── scoring.py                 # Dynamic sub-score & overall opportunity engine
│   ├── database.py                # SQLite table writer & SQL query executor
│   └── analysis.py                # Rule-based business recommendation generator
├── sql/
│   └── analysis.sql               # Complex analytical queries & window functions
├── tests/
│   └── test_pipeline.py           # Pytest unit testing suite
├── app.py                         # Streamlit interactive web application
├── requirements.txt               # Dependencies
├── README.md                      # Documentation
├── .gitignore
└── LICENSE
```

### 1. Data Cleaning Pipeline (`src/data_cleaning.py`)
- Standardizes text strings (trims whitespace, title case).
- Identifies and drops exact & standardized duplicates.
- Handles missing numerical values via median imputation.
- Validates and clips out-of-range ratings (1.0 - 5.0) and negative values.
- Outputs an automated Data Quality Audit Report.

### 2. Feature Engineering & Normalization (`src/feature_engineering.py`)
- Transforms variables into uniform **0–100 scales** using Min-Max scaling:
  $$\text{Scaled Value} = \frac{x - x_{\min}}{x_{\max} - x_{\min}} \times 100$$
- Inverts inverse cost variables like Rent and Metro Distance so that lower rents and closer metro stations score higher.

### 3. Dynamic Multi-Criteria Scoring Model (`src/scoring.py`)
Calculates sub-scores and applies normalized weights:
- **Demand Score (30%)**: Scaled footfall, population, residential & commercial density.
- **Competition Opportunity Score (20%)**: Inverted café count (fewer competitors = higher opportunity).
- **Rent Affordability Score (20%)**: Inverted commercial lease rent.
- **Accessibility Score (15%)**: Proximity to Hyderabad Metro + parking rating.
- **College & Office Potential (10%)**: Office and college density.
- **Benchmark Café Rating (5%)**: Scaled average rating.

**Business Tiers Classification**:
- **80 – 100**: `Excellent Opportunity`
- **65 – 79**: `Good Opportunity`
- **50 – 64**: `Moderate Opportunity`
- **Below 50**: `Low Opportunity`

---

## ❓ Business Questions Answered

### 1. Which area has the highest opportunity score?
*Result*: Under default balanced weighting, **Hitec City** and **Madhapur** emerge as top candidates due to high office density and massive daily customer footfall.

### 2. Which areas have high demand but low competition?
*Result*: **Kondapur** and **Kukatpally** demonstrate high footfall and student/office density while having relatively lower café saturation compared to Hitec City.

### 3. Which areas are expensive?
*Result*: **Jubilee Hills** and **Banjara Hills** command the highest commercial rents (₹210,000–₹220,000/month), requiring premium pricing and high basket sizes to achieve profitability.

### 4. Which areas provide a good balance between demand and cost?
*Result*: **Ameerpet** and **Secunderabad** offer excellent metro connectivity and high footfall at moderate rental rates (₹85,000–₹105,000/month).

### 5. How does changing business priorities affect the ranking?
*Result*: If a user sets **Rent Affordability Importance to 100%**, lower-cost areas like **Uppal**, **Charminar**, and **Koti** jump to the top of the leaderboard immediately.

---

## 🚀 How to Run the Project

### 1. Prerequisites & Environment Setup
Ensure you have **Python 3.10+** installed. Clone the repository and navigate into the folder:

```bash
git clone https://github.com/your-username/cafe-location-intelligence.git
cd cafe-location-intelligence
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Run Automated Tests
Verify that all data cleaning, scoring, classification, and database functions pass:
```bash
python -m pytest tests/ -v
```

### 4. Launch the Streamlit Interactive Application
```bash
streamlit run app.py
```
The application will open automatically in your browser at `http://localhost:8501`.

---

## ⚠️ Limitations & Real-World Considerations

While this model provides high-level macro-location intelligence, real-world retail decisions require additional micro-level evaluation:
1. **Property Micro-Location**: Exact corner visibility, street frontage, line of sight, and foot traffic flow on specific sides of a street.
2. **Lease Terms & Capex**: Security deposits, lock-in periods, maintenance charges, and HVAC/exhaust infrastructure feasibility.
3. **Target Demographic Fit**: Specific income brackets, coffee consumption habits, and willingness-to-pay.
4. **Competitor Quality**: Presence of major anchor chains (e.g., Starbucks, Third Wave Coffee, Blue Tokai) vs. unorganized local tea/coffee stalls.

---

## 🔮 Future Improvements

- **Real-Time OSM Integration**: Fetch live POI counts (cafes, bus stops, metro stations) via OpenStreetMap / Overpass API.
- **Isochrone Mobility Analysis**: Drive-time and walk-time radius mapping using Mapbox / Routing APIs.
- **Predictive Revenue Model**: Machine Learning regression model predicting expected monthly revenue based on footfall and seating capacity.

---

## 📜 License
This project is licensed under the [MIT License](LICENSE).
