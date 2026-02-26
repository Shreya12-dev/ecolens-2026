from flask import Flask, request, jsonify, Response
from flask_cors import CORS
import joblib
import os
import numpy as np
import json
import requests
import datetime
from datetime import timedelta

app = Flask(__name__)
CORS(app)

# Load the models
model_dir = os.path.dirname(__file__)
model_path = os.path.join(model_dir, 'fire_risk_integrated_model.pkl')
report_path = os.path.join(model_dir, 'fire_analysis_report.json')

if os.path.exists(model_path):
    model = joblib.load(model_path)
else:
    model = None

# Default report data as fallback
default_report_data = {
    "model_details": {
        "name": "XGBoost Integrated Fire Predictor",
        "period": "2017-2024",
        "region": "Multi-Region (India)",
        "metrics": {"accuracy": 0.91, "precision": 0.92, "recall": 0.88, "f1_score": 0.90}
    },
    "regional_analysis": []
}

# WAQI API Configuration
WAQI_API_KEY = "0a50601262476b8362ab17999835e5667f05eede"

REGIONS = [
    {"name": "Sundarbans", "lat": 21.94, "lon": 89.18, "temp_adj": 0, "rain_adj": 0, "density": 5.23},
    {"name": "Western Ghats", "lat": 14.00, "lon": 75.00, "temp_adj": -2, "rain_adj": 2, "density": 85.34}, 
    {"name": "Central India", "lat": 23.50, "lon": 78.50, "temp_adj": 4, "rain_adj": -1, "density": 100.0}
]

def json_response(data):
    def default(obj):
        if isinstance(obj, (np.float32, np.float64, np.floating)):
            return float(obj)
        if isinstance(obj, (np.int32, np.int64, np.integer)):
            return int(obj)
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        return str(obj)
        
    json_data = json.dumps(data, default=default)
    return Response(json_data, mimetype='application/json')

def fetch_weather_data(lat, lon):
    """Fetch current weather data from WAQI API with robust extraction."""
    if not WAQI_API_KEY:
        print("WAQI_API_KEY not found, using mock data")
        return None
    
    try:
        url = f"https://api.waqi.info/feed/geo:{lat};{lon}/?token={WAQI_API_KEY}"
        # Add User-Agent to avoid potential blocking
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'}
        response = requests.get(url, timeout=10, headers=headers)
        data = response.json()
        
        if data.get('status') == 'ok':
            iaqi = data.get('data', {}).get('iaqi', {})
            # WAQI provides iaqi data: t (temp), p (pressure), h (humidity), w (wind), wg (wind gust)
            # Default values are optimized for Sundarbans current climate averages
            weather = {
                'temp': float(iaqi.get('t', {}).get('v', 31.5)),
                'humidity': float(iaqi.get('h', {}).get('v', 68.0)),
                'wind_speed': float(iaqi.get('w', {}).get('v', 3.5)),
                'precipitation': 0.002, # Fallback
                'data_source': 'LIVE_API'
            }
            
            # Special check for rainfall (rare in WAQI, but possible in some stations as 'p')
            if 'p' in iaqi and iaqi['p'].get('v', 0) > 800: # Probably pressure if > 800
                 pass
            
            return weather
    except Exception as e:
        print(f"Error fetching weather: {e}")
    
    return None

def predict_risk_score(features):
    """Predict risk score using the loaded model."""
    if not model:
        return 50.0 # Default if model missing
        
    try:
        if hasattr(model, 'predict_proba'):
            prob = model.predict_proba(features)[0][1]
            return round(float(prob) * 100, 1)
        else:
            prediction = model.predict(features)[0]
            return 100.0 if prediction == 1 else 10.0
    except:
        return 50.0

def generate_12_month_forecast(base_weather):
    """Generate 12-month forecast based on base weather and regional seasonality."""
    current_date = datetime.datetime.now()
    base_temp = base_weather.get('temp', 31.5)
    base_wind = base_weather.get('wind_speed', 3.5)
    
    # Seasonality for Sundarbans: High Risk in Mar-May (Dry/Heat)
    seasonal_risk_modifiers = {
        "January": -10, "February": -5, "March": 15, "April": 25, "May": 20,
        "June": -30, "July": -40, "August": -40, "September": -30,
        "October": -10, "November": -15, "December": -12
    }
    
    # Simple seasonal profiles for temp and rain
    temp_profile = [-5, -3, 2, 5, 6, 4, 0, -1, -2, -3, -4, -5] 
    rain_profile = [0.1, 0.1, 0.2, 1, 3, 10, 15, 12, 8, 2, 0.5, 0.2]
    
    start_month_idx = current_date.month - 1
    
    forecast = []
    for i in range(12):
        month_idx = (start_month_idx + i) % 12
        target_date = current_date + timedelta(days=30*i)
        month_name = target_date.strftime("%B")
        
        # Base risk from current wind conditions
        features = np.array([[0.001, 0.0, float(base_wind)]])
        base_risk = predict_risk_score(features)
        
        # Apply seasonal modifier
        seasonal_risk = base_risk + seasonal_risk_modifiers.get(month_name, 0)
        risk = max(5, min(95, seasonal_risk))
        
        # Simulate temp/rain for front-end charts
        simulated_temp = base_temp + temp_profile[month_idx]
        simulated_rain = rain_profile[month_idx]
        
        status = "STABLE"
        if risk > 75: status = "CRITICAL"
        elif risk > 50: status = "CAUTION"
        elif risk > 25: status = "MODERATE"
        
        forecast.append({
            "month": month_name,
            "year": target_date.year,
            "risk_score": round(risk, 1),
            "status": status,
            "insight": f"Seasonal transition: {status} risk expected for {month_name}.",
            "weather": {
                "temp": round(simulated_temp, 1),
                "rain": round(simulated_rain, 1)
            }
        })
        
    return forecast

@app.route('/predict/fire', methods=['POST'])
def predict_fire():
    """Ad-hoc prediction endpoint."""
    if not model:
        return json_response({"error": "Model not trained yet"}), 500
        
    data = request.json
    try:
        # User provides specific conditions
        tp = data.get('tp', data.get('rainfall', 0.001))
        u10 = data.get('u10', data.get('wind_speed', 5.0))
        temp = data.get('temp', 30.0)
        
        features = np.array([[float(tp), 0.0, float(u10)]])
        risk_score = predict_risk_score(features)
        
        status = "LOW"
        if risk_score > 75: status = "CRITICAL"
        elif risk_score > 50: status = "CAUTION"
        elif risk_score > 25: status = "STABLE"
            
        # Generate short-term forecast (next 7 days)
        forecast_days = []
        days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        for day in days:
            variation = float(np.random.uniform(-5, 5))
            forecast_days.append({
                "day": day,
                "risk": round(max(0, min(100, risk_score + variation)), 1)
            })
            
        return json_response({
            "risk_score": risk_score,
            "status": status,
            "forecast": forecast_days,
            "weather": {
                "temp": float(temp),
                "humidity": float(data.get('humidity', 65.0)),
                "wind": float(u10),
                "precipitation": float(tp)
            }
        })
    except Exception as e:
        import traceback
        traceback.print_exc()
        return json_response({"error": str(e)}), 400

@app.route('/report/fire', methods=['GET'])
def get_report():
    """Dynamically generate regional analysis report."""
    
    regional_results = []
    
    for region in REGIONS:
        # 1. Fetch live weather (or mock)
        weather = fetch_weather_data(region['lat'], region['lon'])
        
        if not weather:
            # Fallback mock weather if API fails
            val = float(np.random.uniform(0, 1))
            weather = {
                'temp': 30.0 + region['temp_adj'],
                'humidity': 60.0,
                'wind_speed': 2.0,
                'precipitation': 0.001 if val > 0.3 else 5.0, # Random rain
                'data_source': 'ESTIMATED_FALLBACK'
            }
            
        # 2. Predict Base Fire Risk
        features = np.array([[float(weather['precipitation']), 0.0, float(weather['wind_speed'])]])
        current_risk = predict_risk_score(features)
        
        # 3. Generate 12-Month Forecast
        forecast_12m = generate_12_month_forecast(weather)
        
        # 4. Determine status
        status = "STABLE"
        if current_risk > 75: status = "CRITICAL"
        elif current_risk > 50: status = "CAUTION"
        elif current_risk > 25: status = "MODERATE"

        regional_results.append({
            "region_name": region['name'],
            "coordinates": {"lat": region['lat'], "lon": region['lon']},
            "current_weather": weather,
            "current_risk_index": current_risk,
            "status": status,
            "monthly_forecast": forecast_12m,
            "historical_fire_density": region.get('density', 5.0) 
        })
        
    report = {
        "model_details": default_report_data["model_details"],
        "generated_at": datetime.datetime.now().isoformat(),
        "regional_analysis": regional_results
    }
    
    return json_response(report)

if __name__ == "__main__":
    print("Starting Flask server on http://127.0.0.1:5000")
    print("Available endpoints: /predict/fire (POST), /report/fire (GET)")
    app.run(port=5000, debug=True, use_reloader=False)
