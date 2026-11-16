"""
Visualizations and Geospatial Mapping Module for AI Disaster Mapper.
Generates Folium interactive maps with heatmaps, clustered markers, impact buffer circles,
and Plotly analytics dashboards (gauges, time-series, bar charts, donut charts).
"""
import folium
from folium.plugins import MarkerCluster, HeatMap
import plotly.express as px
import plotly.graph_objects as go
import pandas as pd
import config

def build_disaster_map(
    events_df: pd.DataFrame,
    facilities_df: pd.DataFrame = None,
    show_heatmap: bool = True,
    show_impact_circles: bool = True,
    show_facilities: bool = True,
    center: list = None,
    zoom: int = None
) -> folium.Map:
    """
    Constructs a multi-layered Folium interactive geographical map
    with clustered markers, heatmaps, impact radius rings, and emergency facilities.
    """
    map_center = center if center else config.DEFAULT_MAP_CENTER
    map_zoom = zoom if zoom else config.DEFAULT_MAP_ZOOM

    m = folium.Map(
        location=map_center,
        zoom_start=map_zoom,
        tiles="OpenStreetMap",
        control_scale=True
    )

    # 1. HeatMap Layer for spatial disaster density
    if show_heatmap and not events_df.empty:
        heat_data = [
            [row["latitude"], row["longitude"], float(row.get("severity_score", 50.0)) / 100.0]
            for _, row in events_df.iterrows()
            if pd.notnull(row["latitude"]) and pd.notnull(row["longitude"])
        ]
        if heat_data:
            HeatMap(
                heat_data,
                name="Disaster Intensity Heatmap",
                min_opacity=0.35,
                radius=25,
                blur=18,
                max_zoom=10
            ).add_to(m)

    # 2. Clustered Disaster Event Markers
    marker_cluster = MarkerCluster(name="Disaster Events (Clustered)").add_to(m)

    for _, row in events_df.iterrows():
        d_type = row.get("disaster_type", "Flood")
        cat_info = config.DISASTER_CATEGORIES.get(d_type, config.DISASTER_CATEGORIES["Flood"])
        sev_level = row.get("severity_level", "Moderate")
        sev_score = row.get("severity_score", 50.0)
        radius_km = row.get("impact_radius_km", 30.0)

        # HTML popup
        popup_html = f"""
        <div style="font-family: Arial, sans-serif; width: 230px;">
            <h4 style="margin: 0 0 6px 0; color: #1E3A8A; font-size: 14px;">{cat_info['emoji']} {row.get('title', 'Disaster Event')}</h4>
            <hr style="margin: 4px 0; border: 0; border-top: 1px solid #E5E7EB;">
            <p style="margin: 2px 0; font-size: 12px;"><b>Category:</b> {d_type}</p>
            <p style="margin: 2px 0; font-size: 12px;"><b>Severity:</b> <span style="color: {config.SEVERITY_LEVELS.get(sev_level, {}).get('color', '#333')}; font-weight: bold;">{sev_level} ({sev_score:.1f}/100)</span></p>
            <p style="margin: 2px 0; font-size: 12px;"><b>Location:</b> {row.get('location_name', 'N/A')}</p>
            <p style="margin: 2px 0; font-size: 12px;"><b>Impact Radius:</b> {radius_km:.1f} km</p>
            <p style="margin: 2px 0; font-size: 12px;"><b>Status:</b> {row.get('status', 'Active')}</p>
            <p style="margin: 2px 0; font-size: 11px; color: #6B7280;"><b>Reported:</b> {row.get('event_date', 'N/A')}</p>
        </div>
        """

        folium.Marker(
            location=[row["latitude"], row["longitude"]],
            popup=folium.Popup(popup_html, max_width=260),
            tooltip=f"{cat_info['emoji']} {row.get('title', 'Event')}",
            icon=folium.Icon(color=cat_info["marker_color"], icon=cat_info["icon"], prefix="fa")
        ).add_to(marker_cluster)

        # 3. Concentric Impact Buffer Zone
        if show_impact_circles and radius_km > 0:
            folium.Circle(
                location=[row["latitude"], row["longitude"]],
                radius=radius_km * 1000.0,  # convert km to meters
                color=cat_info["color"],
                fill=True,
                fill_color=cat_info["color"],
                fill_opacity=0.15,
                weight=1.5,
                tooltip=f"Impact Footprint: {radius_km:.0f} km"
            ).add_to(m)

    # 4. Emergency Facilities Overlay
    if show_facilities and facilities_df is not None and not facilities_df.empty:
        fac_group = folium.FeatureGroup(name="Emergency Assistance Hubs", show=True).add_to(m)
        fac_icons = {
            "Hospital": {"color": "darkred", "icon": "plus"},
            "Relief Camp": {"color": "green", "icon": "home"},
            "Rescue Shelter": {"color": "blue", "icon": "shield"},
            "Fire & Disaster Response Hub": {"color": "orange", "icon": "wrench"}
        }

        for _, f_row in facilities_df.iterrows():
            f_type = f_row.get("facility_type", "Hospital")
            f_meta = fac_icons.get(f_type, {"color": "gray", "icon": "info-sign"})
            
            f_popup = f"""
            <div style="font-family: Arial, sans-serif; width: 220px;">
                <h4 style="margin: 0 0 5px 0; color: #B91C1C; font-size: 13px;">🏥 {f_row.get('name', 'Facility')}</h4>
                <p style="margin: 2px 0; font-size: 12px;"><b>Type:</b> {f_type}</p>
                <p style="margin: 2px 0; font-size: 12px;"><b>Total Capacity:</b> {f_row.get('total_capacity', 'N/A')}</p>
                <p style="margin: 2px 0; font-size: 12px;"><b>Available Beds/Slots:</b> {f_row.get('available_capacity', 'N/A')}</p>
                <p style="margin: 2px 0; font-size: 12px;"><b>Contact:</b> {f_row.get('contact_number', 'N/A')}</p>
                <p style="margin: 2px 0; font-size: 11px; color: #4B5563;"><b>Location:</b> {f_row.get('location_name', 'N/A')}</p>
            </div>
            """
            folium.Marker(
                location=[f_row["latitude"], f_row["longitude"]],
                popup=folium.Popup(f_popup, max_width=250),
                tooltip=f"{f_type}: {f_row.get('name', 'Facility')}",
                icon=folium.Icon(color=f_meta["color"], icon=f_meta["icon"], prefix="fa")
            ).add_to(fac_group)

    folium.LayerControl(collapsed=False).add_to(m)
    return m

def plot_disaster_type_distribution(df: pd.DataFrame) -> go.Figure:
    """Creates a donut chart displaying proportion of disasters by category."""
    if df.empty:
        return go.Figure()
    counts = df["disaster_type"].value_counts().reset_index()
    counts.columns = ["disaster_type", "count"]
    
    color_map = {k: v["color"] for k, v in config.DISASTER_CATEGORIES.items()}
    
    fig = px.pie(
        counts,
        names="disaster_type",
        values="count",
        hole=0.45,
        color="disaster_type",
        color_discrete_map=color_map,
        title="Disaster Distribution by Hazard Category"
    )
    fig.update_layout(margin=dict(t=40, b=10, l=10, r=10), height=320)
    return fig

def plot_disaster_severity_histogram(df: pd.DataFrame) -> go.Figure:
    """Creates a stacked histogram of disaster severity scores across categories."""
    if df.empty:
        return go.Figure()
    color_map = {k: v["color"] for k, v in config.DISASTER_CATEGORIES.items()}
    fig = px.histogram(
        df,
        x="severity_score",
        color="disaster_type",
        nbins=15,
        color_discrete_map=color_map,
        barmode="stack",
        title="Severity Score Spread (0-100) by Hazard Type"
    )
    fig.update_layout(
        xaxis_title="Severity Score",
        yaxis_title="Incident Count",
        margin=dict(t=40, b=20, l=20, r=20),
        height=320
    )
    return fig

def plot_severity_gauge(score: float, title: str = "AI Estimated Disaster Risk Score") -> go.Figure:
    """Creates an interactive speedometer gauge for risk scores."""
    fig = go.Figure(go.Indicator(
        mode="gauge+number",
        value=score,
        title={"text": title, "font": {"size": 16}},
        gauge={
            "axis": {"range": [0, 100], "tickwidth": 1, "tickcolor": "darkblue"},
            "bar": {"color": "#1E3A8A"},
            "steps": [
                {"range": [0, 35], "color": "#C8E6C9"},
                {"range": [35, 60], "color": "#FFE082"},
                {"range": [60, 80], "color": "#FFCC80"},
                {"range": [80, 100], "color": "#FFCDD2"}
            ],
            "threshold": {
                "line": {"color": "red", "width": 4},
                "thickness": 0.75,
                "value": score
            }
        }
    ))
    fig.update_layout(margin=dict(t=30, b=10, l=20, r=20), height=240)
    return fig

def plot_feature_importance(features_list: list) -> go.Figure:
    """Horizontal bar chart showing AI model feature drivers."""
    if not features_list:
        return go.Figure()
    df_feat = pd.DataFrame(features_list)
    # Format labels cleanly
    df_feat["label"] = df_feat["feature"].str.replace("_", " ").str.title()
    df_feat = df_feat.sort_values(by="importance", ascending=True)

    fig = px.bar(
        df_feat,
        x="importance",
        y="label",
        orientation="h",
        color="importance",
        color_continuous_scale="Blues",
        title="AI Risk Predictor - Feature Importance Drivers"
    )
    fig.update_layout(
        xaxis_title="Relative Weight / Contribution",
        yaxis_title="Environmental Feature",
        coloraxis_showscale=False,
        margin=dict(t=40, b=20, l=120, r=20),
        height=300
    )
    return fig

def plot_vulnerability_matrix(vuln_df: pd.DataFrame) -> go.Figure:
    """Scatter plot matrix comparing Social Vulnerability Index vs Population Density."""
    if vuln_df.empty:
        return go.Figure()
    fig = px.scatter(
        vuln_df,
        x="social_vulnerability_index",
        y="population_density_per_sqkm",
        size="population",
        color="primary_risk_disaster",
        hover_name="region_name",
        text="region_name",
        title="Regional Vulnerability Matrix: Social Vulnerability vs Density",
        labels={
            "social_vulnerability_index": "Social Vulnerability Index (SVI 0-1)",
            "population_density_per_sqkm": "Population Density (per km²)"
        }
    )
    fig.update_traces(textposition="top center")
    fig.update_layout(margin=dict(t=40, b=20, l=20, r=20), height=380)
    return fig
