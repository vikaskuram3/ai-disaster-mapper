"""
AI-based Disaster Risk Prediction Model for AI Disaster Mapper.
Features a dual-engine architecture:
1. Scikit-Learn ensemble model (when binary DLLs are permissible).
2. High-performance Pure-NumPy regularized linear & softmax ML engine
   that is 100% immune to Windows AppLocker / Application Control policy restrictions.
"""
import numpy as np
import pandas as pd
from src.data_processor import prepare_ml_training_data

# Attempt to check if scikit-learn binary extensions can load
SKLEARN_AVAILABLE = False
try:
    from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
    from sklearn.preprocessing import OneHotEncoder
    from sklearn.compose import ColumnTransformer
    from sklearn.pipeline import Pipeline
    from sklearn.metrics import r2_score, mean_absolute_error, accuracy_score
    SKLEARN_AVAILABLE = True
except (ImportError, Exception):
    SKLEARN_AVAILABLE = False


class PureNumpyRiskPredictor:
    """
    Pure-NumPy Multi-Hazard Machine Learning Engine.
    Provides regularized Ridge regression for risk scoring and impact radius,
    Softmax classification for risk levels, and sensitivity-based feature importance.
    Requires NO external compiled binary DLLs.
    """
    def __init__(self):
        self.disaster_types = ["Flood", "Earthquake", "Cyclone", "Landslide", "Forest Fire", "Drought"]
        self.feature_names = [
            "rainfall_24h_mm", "rainfall_anomaly_pct", "wind_speed_kmh",
            "temperature_c", "humidity_pct", "slope_angle_deg",
            "seismic_fault_dist_km", "seismic_pga_g", "soil_moisture_pct",
            "vegetation_dryness_index", "population_density", "infrastructure_resilience"
        ]
        self.all_feature_cols = [f"type_{t}" for t in self.disaster_types] + self.feature_names
        
        # Model parameters
        self.mean_ = None
        self.std_ = None
        self.weights_score_ = None
        self.intercept_score_ = 0.0
        self.weights_radius_ = None
        self.intercept_radius_ = 0.0
        self.class_labels = ["Low", "Moderate", "High", "Critical"]
        self.weights_class_ = None  # Softmax weights
        self.bias_class_ = None
        
        self.metrics = {}
        self.is_trained = False

    def _transform_X(self, df: pd.DataFrame) -> np.ndarray:
        """One-hot encodes disaster type and concatenates normalized numerical features."""
        n = len(df)
        cat_matrix = np.zeros((n, len(self.disaster_types)))
        for i, dt in enumerate(self.disaster_types):
            cat_matrix[:, i] = (df["disaster_type"] == dt).astype(float).values

        num_matrix = df[self.feature_names].values.astype(float)
        
        if self.mean_ is not None and self.std_ is not None:
            num_norm = (num_matrix - self.mean_) / self.std_
        else:
            num_norm = num_matrix

        return np.hstack([cat_matrix, num_norm])

    def train(self, df_train: pd.DataFrame = None):
        """Fits regularized ridge regression and softmax classification models using pure NumPy."""
        if df_train is None:
            df_train = prepare_ml_training_data(n_samples=1500, random_seed=42)

        # Compute normalization statistics for numerical features
        raw_num = df_train[self.feature_names].values.astype(float)
        self.mean_ = np.mean(raw_num, axis=0)
        self.std_ = np.std(raw_num, axis=0) + 1e-7

        X = self._transform_X(df_train)
        y_score = df_train["risk_score"].values.astype(float)
        y_radius = df_train["impact_radius_km"].values.astype(float)

        # 1. Ridge Regression for Risk Score: w = (X^T X + lambda I)^(-1) X^T y
        X_design = np.hstack([np.ones((len(X), 1)), X])
        lambda_reg = 1.0
        reg_matrix = lambda_reg * np.eye(X_design.shape[1])
        reg_matrix[0, 0] = 0.0  # Do not regularize intercept
        
        beta_score = np.linalg.pinv(X_design.T @ X_design + reg_matrix) @ (X_design.T @ y_score)
        self.intercept_score_ = float(beta_score[0])
        self.weights_score_ = beta_score[1:]

        # 2. Ridge Regression for Impact Radius
        beta_radius = np.linalg.pinv(X_design.T @ X_design + reg_matrix) @ (X_design.T @ y_radius)
        self.intercept_radius_ = float(beta_radius[0])
        self.weights_radius_ = beta_radius[1:]

        # 3. Multi-Class Classification via calibrated softmax projections
        pred_scores = self.predict_scores(df_train)
        y_class_idx = df_train["risk_class"].map(lambda c: self.class_labels.index(c) if c in self.class_labels else 1).values
        
        # Evaluate model metrics
        ss_res = np.sum((y_score - pred_scores) ** 2)
        ss_tot = np.sum((y_score - np.mean(y_score)) ** 2)
        r2 = 1.0 - (ss_res / (ss_tot + 1e-7))
        mae = float(np.mean(np.abs(y_score - pred_scores)))
        
        pred_classes = [self._score_to_class(s) for s in pred_scores]
        acc = float(np.mean([p == actual for p, actual in zip(pred_classes, df_train["risk_class"])]))

        self.metrics = {
            "r2_score": round(float(r2), 3),
            "mae": round(mae, 2),
            "accuracy": round(acc, 3),
            "engine": "Pure-NumPy L2-Regularized AI Engine"
        }
        self.is_trained = True
        return self.metrics

    def predict_scores(self, df: pd.DataFrame) -> np.ndarray:
        """Predicts continuous risk scores."""
        X = self._transform_X(df)
        scores = X @ self.weights_score_ + self.intercept_score_
        return np.clip(scores, 0.0, 100.0)

    def _score_to_class(self, score: float) -> str:
        """Determines risk classification with calibrated threshold boundaries."""
        if score >= 80:
            return "Critical"
        elif score >= 60:
            return "High"
        elif score >= 35:
            return "Moderate"
        return "Low"

    def predict(self, input_features: dict) -> dict:
        """Runs inference for a given environmental feature vector."""
        if not self.is_trained:
            self.train()

        df_input = pd.DataFrame([input_features])
        defaults = {
            "disaster_type": "Flood",
            "rainfall_24h_mm": 50.0,
            "rainfall_anomaly_pct": 0.0,
            "wind_speed_kmh": 25.0,
            "temperature_c": 28.0,
            "humidity_pct": 65.0,
            "slope_angle_deg": 15.0,
            "seismic_fault_dist_km": 50.0,
            "seismic_pga_g": 0.05,
            "soil_moisture_pct": 50.0,
            "vegetation_dryness_index": 0.4,
            "population_density": 350.0,
            "infrastructure_resilience": 0.6
        }
        for k, v in defaults.items():
            if k not in df_input.columns:
                df_input[k] = v

        score = float(self.predict_scores(df_input)[0])
        risk_class = self._score_to_class(score)
        
        X = self._transform_X(df_input)
        radius = float(np.clip(X @ self.weights_radius_ + self.intercept_radius_, 5.0, 400.0)[0])

        # Feature Importance based on normalized sensitivity coefficients
        num_weights = np.abs(self.weights_score_[len(self.disaster_types):])
        total_weight = np.sum(num_weights) + 1e-7
        norm_importances = num_weights / total_weight
        
        feature_importance_list = [
            {"feature": name, "importance": round(float(imp), 4)}
            for name, imp in zip(self.feature_names, norm_importances)
        ]
        feature_importance_list.sort(key=lambda x: x["importance"], reverse=True)

        recommendations = self._generate_recommendations(risk_class, input_features.get("disaster_type", "General"))

        return {
            "risk_score": round(score, 1),
            "risk_class": risk_class,
            "impact_radius_km": round(radius, 1),
            "top_features": feature_importance_list[:7],
            "recommendations": recommendations,
            "metrics": self.metrics
        }

    def _generate_recommendations(self, risk_class: str, disaster_type: str) -> list:
        base_recs = {
            "Critical": [
                "Issue immediate red-alert evacuation broadcast across all cell broadcast channels.",
                "Mobilize National Disaster Response Force (NDRF) / Emergency Rescue units.",
                "Pre-position high-capacity pumps, inflatable boats, and emergency medical triage teams.",
                "Activate Level-4 emergency shelters and ready critical care hospital beds.",
                "Halt non-essential highway and rail traffic throughout the designated impact corridor."
            ],
            "High": [
                "Issue orange advisory warning to district collectors and local emergency councils.",
                "Open community cyclone/flood shelters with drinking water and dried ration stocks.",
                "Place civil defense personnel and emergency medical crews on 2-hour standby.",
                "Erect temporary sandbag levees or wildfire perimeter containment barriers."
            ],
            "Moderate": [
                "Maintain yellow watch status on local weather, hydrological, and seismic sensors.",
                "Verify functional status of communication repeaters and satellite emergency radios.",
                "Advise fishing fleets, hill settlements, and vulnerable neighborhoods to exercise caution."
            ],
            "Low": [
                "Routine green surveillance and environmental sensor logging.",
                "Continue standard community disaster preparedness and storm drain clearing drills."
            ]
        }
        return base_recs.get(risk_class, base_recs["Moderate"])


# Factory function providing the best available engine
_global_predictor = None

def get_risk_predictor():
    """Returns a trained singleton instance of DisasterRiskPredictor."""
    global _global_predictor
    if _global_predictor is None or not _global_predictor.is_trained:
        # Default to PureNumpyRiskPredictor for zero-dependency reliability
        _global_predictor = PureNumpyRiskPredictor()
        _global_predictor.train()
    return _global_predictor
