import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
import joblib
import os
import glob

def train_fire_model():
    print("Loading historical fire data...")
    dataset_path = os.path.join(os.path.dirname(__file__), '..', 'datasets')
    fire_files = glob.glob(os.path.join(dataset_path, 'fire_archive_*.csv'))
    
    if not fire_files:
        print("No fire archive files found. Using synthetic data for prototype.")
        # Create synthetic data if no files exist
        data = pd.DataFrame({
            'latitude': np.random.uniform(10, 30, 1000),
            'longitude': np.random.uniform(70, 95, 1000),
            'brightness': np.random.uniform(300, 500, 1000),
            'confidence': np.random.uniform(0, 100, 1000),
            'ndvi': np.random.uniform(0, 1, 1000),
            'humidity': np.random.uniform(10, 90, 1000),
            'wind_speed': np.random.uniform(0, 50, 1000),
            'temp': np.random.uniform(20, 45, 1000)
        })
    else:
        # Load first file for demo
        df = pd.read_csv(fire_files[0])
        print(f"Loaded {fire_files[0]}")
        
        # Select relevant columns and simulate physical features
        data = df[['latitude', 'longitude', 'brightness', 'confidence']].copy()
        
        # Add simulated physical features (normally these would come from satellite/weather data)
        # We simulate them to show the model can handle them
        data['ndvi'] = np.random.uniform(0.1, 0.8, len(data))
        data['humidity'] = np.random.uniform(20, 80, len(data))
        data['wind_speed'] = np.random.uniform(5, 30, len(data))
        data['temp'] = np.random.uniform(25, 42, len(data))
        
    # Define features and target (risk score based on brightness and confidence)
    # Target: Risk Score (0-100)
    data['risk_score'] = (data['brightness'] - data['brightness'].min()) / (data['brightness'].max() - data['brightness'].min()) * 100
    
    X = data[['latitude', 'longitude', 'ndvi', 'humidity', 'wind_speed', 'temp']]
    y = data['risk_score']
    
    print("Training Random Forest model...")
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X, y)
    
    model_path = os.path.join(os.path.dirname(__file__), 'fire_risk_model.pkl')
    joblib.dump(model, model_path)
    print(f"Model saved to {model_path}")
    return model

if __name__ == "__main__":
    train_fire_model()
