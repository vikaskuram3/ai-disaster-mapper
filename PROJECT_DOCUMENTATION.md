# AI Disaster Mapper: AI-Powered Disaster Intelligence & Emergency Management Platform
## Comprehensive Project Report & Technical Submission Dossier

---

### Document Information
- **Project Title:** AI Disaster Mapper - Disaster Intelligence & Emergency Management Platform
- **Domain:** Artificial Intelligence, Geospatial Information Systems (GIS), Disaster Management, Data Analytics
- **Technologies:** Python 3, Streamlit, Folium, Plotly, SQLite3, Machine Learning (NumPy L2-Regularized Engine), REST APIs (USGS, NASA EONET, Open-Meteo)
- **Author / Submitter:** Vikas Kuram
- **Date:** November 2026

---

## 1. Executive Summary & Abstract
Natural disasters such as floods, earthquakes, cyclones, landslides, forest fires, and droughts inflict catastrophic human displacement, infrastructural devastation, and agricultural losses annually. Timely, data-driven response is often hindered by fragmented data sources and the lack of automated risk prediction tools.

**AI Disaster Mapper** resolves this challenge by providing a centralized situational intelligence platform. The system:
1. Ingests live real-time hazard data from global telemetry networks (**USGS**, **NASA EONET**, **Open-Meteo**) with resilient offline fallback.
2. Visualizes hazard perimeters, intensity heatmaps, and impact buffer circles on interactive **Folium/Leaflet** maps.
3. Estimates multi-hazard risk scores ($0-100$), vulnerability classifications, and footprint radii using an **AI Machine Learning model**.
4. Quantifies human displacement, casualties, home destruction, and crop acreage inundated/parched.
5. Employs the **Haversine geodesic formula** to locate the closest hospitals and relief centers, while calculating SPHERE emergency relief supplies (water, food, tents).
6. Executes advanced **SQL window functions** (`RANK() OVER`, `PARTITION BY`) for historical trend analytics.
7. Produces standardized **Disaster Situation Reports (SITREP)** for NDMA/FEMA authorities.

---

## 2. Problem Statement & Objectives

### Problem Statement
Disaster response authorities lack an integrated platform that connects real-time telemetry feeds with automated machine learning risk models and emergency infrastructure routing in a single, accessible interface.

### Project Objectives
- **Monitor:** Real-time tracking of 6 hazard types (Floods, Earthquakes, Cyclones, Landslides, Forest Fires, Droughts).
- **Map:** Interactive geospatial mapping with clustered markers, intensity heatmaps, and concentric impact buffer rings.
- **Predict:** AI risk prediction engine estimating disaster severity from physical environmental indicators.
- **Assess:** Multi-sector damage assessment modeling affected population, structural damage, and agricultural economic loss.
- **Route:** Emergency assistance routing to nearest trauma centers, relief shelters, and response command posts.
- **Analyze:** SQL database layer featuring window function rankings and trend analytics.

---

## 3. System Architecture & Methodology

```
+------------------------------------------------------------------------+
|                          DATA INGESTION LAYER                          |
|  - USGS Earthquake GeoJSON API (M2.5+ Real-Time Seismic Feed)          |
|  - NASA EONET v3 API (Wildfires, Storms, Severe Cyclones)              |
|  - Open-Meteo Weather API (Rainfall, Wind Speed, Temperature)          |
|  - SQLite Database (Multi-Year Historical Disaster Catalog)            |
+-----------------------------------+------------------------------------+
                                    |
                                    v
+------------------------------------------------------------------------+
|                      ANALYTICAL & AI INFERENCE LAYER                   |
|  - Data Processor: Coordinate validation & feature normalization       |
|  - AI Risk Predictor: L2-Regularized Multi-Hazard Regression & Softmax |
|  - Damage Engine: Human casualty, structural & crop loss algorithms    |
|  - Routing Engine: Haversine geodesic distance & SPHERE logistics     |
|  - SQL Analytics Engine: Window functions (RANK, DENSE_RANK, OVER)     |
+-----------------------------------+------------------------------------+
                                    |
                                    v
+------------------------------------------------------------------------+
|                       PRESENTATION & UI LAYER (Streamlit)              |
|  - Tab 1: Interactive Folium GIS Map, Heatmaps & Incident Inspector    |
|  - Tab 2: What-If AI Risk Simulation & Feature Importance Drivers     |
|  - Tab 3: Sectoral Damage & Agricultural Devastation Analytics         |
|  - Tab 4: Nearest Emergency Facility Routing & Relief Calculator       |
|  - Tab 5: Multi-Hazard SQL Analytics & Historical Trends               |
|  - Tab 6: Formal Disaster Situation Report (SITREP) Exporter           |
+------------------------------------------------------------------------+
```

---

## 4. Mathematical & Algorithmic Formulations

### A. Geodesic Distance (Haversine Formula)
To locate nearest emergency facilities from any disaster incident coordinates $(\phi_1, \lambda_1)$ to facility coordinates $(\phi_2, \lambda_2)$:
$$\Delta\phi = \phi_2 - \phi_1, \quad \Delta\lambda = \lambda_2 - \lambda_1$$
$$a = \sin^2\left(\frac{\Delta\phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta\lambda}{2}\right)$$
$$c = 2 \cdot \text{atan2}\left(\sqrt{a}, \sqrt{1-a}\right)$$
$$d = R \cdot c \quad (R = 6371.0\text{ km})$$

### B. Machine Learning Multi-Hazard Risk Scoring
Our model uses regularized L2 Ridge Regression with feature normalization:
$$\mathbf{w}^* = (\mathbf{X}^T \mathbf{X} + \lambda \mathbf{I})^{-1} \mathbf{X}^T \mathbf{y}$$
Where $\mathbf{X}$ combines one-hot encoded disaster types with normalized physical parameters (rainfall, wind speed, temperature, slope, seismic PGA, soil moisture, vegetation dryness, population density, and infrastructure resilience).

Feature importance explainability is derived via normalized weight magnitudes:
$$\text{Importance}_j = \frac{|w_j|}{\sum_{k} |w_k|}$$

### C. Damage & Agricultural Loss Modeling
- **Footprint Area:** $A = \pi \cdot r^2$
- **Exposed Population:** $P_{\text{exposed}} = A \cdot \rho_{\text{density}}$
- **Displaced Citizens:** $P_{\text{displaced}} = P_{\text{exposed}} \cdot \alpha_{\text{hazard}} \cdot \left(\frac{S}{100}\right)^{1.8} \cdot (1.2 - R_{\text{infra}})$
- **Cropland Lost:** $\text{Crop}_{\text{ha}} = A \cdot \rho_{\text{agri}} \cdot \beta_{\text{hazard}} \cdot \left(\frac{S}{100}\right)^{1.8}$
- **Economic Loss:** $\text{Loss}_{\text{USD}} = P_{\text{exposed}} \cdot C_{\text{per\_capita}} \cdot \left(\frac{S}{100}\right)^{1.8} \cdot (1.2 - R_{\text{infra}})$

---

## 5. Database Schema & SQL Analytics

The system utilizes an optimized SQLite database (`disaster_database.db`):
- `disaster_events`: Records coordinates, hazard types, severity scores, impact radii, and status.
- `emergency_facilities`: Stores hospitals, relief shelters, response hubs, capacities, and contact numbers.
- `regional_vulnerability`: Tracks population density, Social Vulnerability Index (SVI), and infrastructure resilience.
- `damage_records`: Logs historical casualties, destroyed structures, crop hectares, and financial losses.

### Sample Advanced SQL Analytical Query
```sql
SELECT 
    event_id,
    title,
    disaster_type,
    location_name,
    severity_score,
    RANK() OVER (
        PARTITION BY disaster_type 
        ORDER BY severity_score DESC
    ) as rank_in_type
FROM disaster_events
ORDER BY disaster_type, rank_in_type;
```

---

## 6. Verification & Test Results

The platform was subjected to automated unit and integration testing via `pytest`. All 8 test suites passed with 100% success rate:

```
tests/test_disaster_mapper.py::test_database_tables_and_seed PASSED      [ 12%]
tests/test_disaster_mapper.py::test_sql_window_functions PASSED          [ 25%]
tests/test_disaster_mapper.py::test_api_client_and_fallback PASSED       [ 37%]
tests/test_disaster_mapper.py::test_ml_risk_predictor_inference PASSED   [ 50%]
tests/test_disaster_mapper.py::test_damage_assessment_engine PASSED      [ 62%]
tests/test_disaster_mapper.py::test_haversine_distance_and_routing PASSED [ 75%]
tests/test_disaster_mapper.py::test_relief_supply_calculator PASSED      [ 87%]
tests/test_disaster_mapper.py::test_visualizations PASSED                [100%]
============================== 8 passed in 5.43s ==============================
```

---

## 7. How to Execute & Verify the Project

```powershell
# 1. Navigate to directory
cd C:\Users\vikass\Downloads\project

# 2. Run automated tests
python -m pytest tests/test_disaster_mapper.py -v

# 3. Launch the Web Application
python -m streamlit run app.py
```
Open **`http://localhost:8501`** in any web browser.

---

## 8. Conclusion
The AI Disaster Mapper fulfills all criteria for an advanced disaster intelligence platform. By combining real-time APIs, machine learning prediction, damage estimation algorithms, GIS mapping, and SQL analytics, it equips emergency management authorities with actionable insights for faster decision-making and optimal resource distribution.
