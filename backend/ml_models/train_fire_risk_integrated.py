import pandas as pd
import numpy as np
import xarray as xr
import glob
import os
import json
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
import xgboost as xgb

def train_integrated_model():
    print("Step 1: Loading Datasets...")
    dataset_dir = r"d:\Hackathons\next\backend\datasets"
    
    # 1. Load Fire Archive Data
    fire_files = glob.glob(os.path.join(dataset_dir, "fire_archive_*.csv"))
    fire_df_list = []
    for f in fire_files:
        temp_df = pd.read_csv(f)
        fire_df_list.append(temp_df)
    
    fire_df = pd.concat(fire_df_list, ignore_index=True)
    fire_df.columns = fire_df.columns.str.lower()
    fire_df['acq_date'] = pd.to_datetime(fire_df['acq_date']).dt.tz_localize(None) # Match NC naive time
    print(f"Loaded {len(fire_df)} fire records.")

    # 2. Load Environmental Data (NetCDF)
    nc_ad_path = os.path.join(dataset_dir, "data_stream-moda_stepType-avgad.nc")
    nc_ua_path = os.path.join(dataset_dir, "data_stream-moda_stepType-avgua.nc")
    
    ds_ad = xr.open_dataset(nc_ad_path)
    ds_ua = xr.open_dataset(nc_ua_path)

    print("Step 2: Processing and Alignment...")
    # Strict Sundarbans Filter based on NC file extent: Lat (21.5-22.5), Lon (88-89)
    fire_df = fire_df[(fire_df['latitude'] >= 21.5) & (fire_df['latitude'] <= 22.5) & 
                     (fire_df['longitude'] >= 88.0) & (fire_df['longitude'] <= 89.0)]
    print(f"Filtered to {len(fire_df)} records in Sundarbans region.")

    def get_env_val(lat, lon, date, ds, var_name):
        try:
            coord_map = {}
            if 'latitude' in ds.coords: coord_map['latitude'] = lat
            elif 'lat' in ds.coords: coord_map['lat'] = lat
            
            if 'longitude' in ds.coords: coord_map['longitude'] = lon
            elif 'lon' in ds.coords: coord_map['lon'] = lon

            time_dim = None
            for td in ['valid_time', 'time']:
                if td in ds.coords:
                    time_dim = td
                    break
            
            if time_dim:
                # Align dates by removing time component to daily resolution if needed
                coord_map[time_dim] = np.datetime64(date.strftime('%Y-%m-%d'))

            subset = ds[var_name]
            if 'expver' in subset.dims:
                subset = subset.isel(expver=0)
            
            val = subset.sel(**coord_map, method='nearest').values
            return float(val)
        except Exception as e:
            return np.nan

    # Sampling for positive cases (fire exists)
    print("Sampling environmental data for fire locations...")
    env_features = []
    
    # Map variables (guessing based on previous inspection)
    # DS1 likely had 'tp' (AD)
    # DS2 might have 'u10' or 'v10' or 'swvl1' (UA)
    ds1_vars = list(ds_ad.data_vars)
    ds2_vars = list(ds_ua.data_vars)
    print(f"Found DS1 Vars: {ds1_vars}, DS2 Vars: {ds2_vars}")

    for idx, row in fire_df.sample(min(500, len(fire_df))).iterrows():
        try:
            # Dynamically use what is available
            veg = get_env_val(row['latitude'], row['longitude'], row['acq_date'], ds_ad, ds1_vars[0])
            temp = get_env_val(row['latitude'], row['longitude'], row['acq_date'], ds_ad, ds1_vars[1]) if len(ds1_vars) > 1 else 0
            ua = get_env_val(row['latitude'], row['longitude'], row['acq_date'], ds_ua, ds2_vars[0])
            
            if not np.isnan(veg) and not np.isnan(ua):
                env_features.append({
                    'latitude': row['latitude'],
                    'longitude': row['longitude'],
                    'v1': veg,
                    'v2': temp,
                    'v3': ua,
                    'fire': 1
                })
        except:
            continue

    # Sampling for negative cases (pseudo-absence)
    print("Generating non-fire samples...")
    # Randomly pick times and locations from NC
    # We use ds_ad as the master grid
    times = ds_ad.valid_time.values
    lats = ds_ad.latitude.values
    lons = ds_ad.longitude.values
    
    attempts = 0
    while len(env_features) < 1000 and attempts < 1500:
        attempts += 1
        rlat = np.random.choice(lats)
        rlon = np.random.choice(lons)
        rtime = pd.to_datetime(np.random.choice(times))
        
        veg = get_env_val(rlat, rlon, rtime, ds_ad, ds1_vars[0])
        temp = get_env_val(rlat, rlon, rtime, ds_ad, ds1_vars[1]) if len(ds1_vars) > 1 else 0
        ua = get_env_val(rlat, rlon, rtime, ds_ua, ds2_vars[0])
        
        if not np.isnan(veg) and not np.isnan(ua):
            env_features.append({
                'latitude': rlat,
                'longitude': rlon,
                'v1': veg,
                'v2': temp,
                'v3': ua,
                'fire': 0
            })

    dataset = pd.DataFrame(env_features)
    print(f"Dataset columns: {dataset.columns}")
    if dataset.empty:
        print("CRITICAL ERROR: No valid samples found! Check coordinate alignment.")
        return

    dataset = dataset.dropna()
    print(f"Sample count after dropna: {len(dataset)}")
    
    if len(dataset) < 10:
        print("CRITICAL ERROR: Insufficient samples for training.")
        return

    try:
        X = dataset[['v1', 'v2', 'v3']] # Standardized generic names
        y = dataset['fire']
    except KeyError as e:
        print(f"CRITICAL ERROR: {e}")
        print("Available columns:", dataset.columns)
        return

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    print("Step 3: Training Model...")
    model = xgb.XGBClassifier(use_label_encoder=False, eval_metric='logloss')
    model.fit(X_train, y_train)

    # Evaluation
    preds = model.predict(X_test)
    accuracy = accuracy_score(y_test, preds)
    precision = precision_score(y_test, preds)
    recall = recall_score(y_test, preds)
    f1 = f1_score(y_test, preds)

    print(f"Accuracy: {accuracy:.4f}")

    # Step 4: Export details
    # Map back to human names for report
    feature_names = {
        "v1": ds1_vars[0],
        "v2": ds1_vars[1] if len(ds1_vars) > 1 else "None",
        "v3": ds2_vars[0]
    }
    
    importances = model.feature_importances_.astype(float)
    feature_importance = {}
    for i, col in enumerate(X.columns):
        feature_importance[feature_names[col]] = importances[i]
    
    output = {
        "model_details": {
            "name": "XGBoost Integrated Fire Predictor",
            "period": "2017-2024",
            "region": "Sundarbans, India",
            "metrics": {
                "accuracy": round(float(accuracy), 4),
                "precision": round(float(precision), 4),
                "recall": round(float(recall), 4),
                "f1_score": round(float(f1), 4)
            }
        },
        "feature_importance": feature_importance,
        "inference_data": {
            "avg_v1_at_fire": float(dataset[dataset['fire']==1]['v1'].mean()),
            "avg_v2_at_fire": float(dataset[dataset['fire']==1]['v2'].mean()),
            "risk_prediction": "HIGH" if accuracy > 0.7 else "MODERATE",
            "variables_used": feature_names
        }
    }

    # Step 5: Regional Analysis (3 zones)
    regions_meta = [
        {"name": "West Sundarbans", "lon_range": (88.0, 88.33)},
        {"name": "Central Sundarbans", "lon_range": (88.33, 88.66)},
        {"name": "East Sundarbans", "lon_range": (88.66, 89.0)},
    ]
    
    regional_report = []
    
    for reg in regions_meta:
        # Get historical fires in this region
        reg_fires = fire_df[(fire_df['longitude'] >= reg['lon_range'][0]) & 
                           (fire_df['longitude'] < reg['lon_range'][1])]
        
        # Sample typical environmental conditions
        try:
            # Latitude is decreasing [22.5, ..., 21.5]
            # Longitude is increasing [88.0, ..., 89.0]
            subset_ad = ds_ad[ds1_vars[0]].sel(
                longitude=slice(reg['lon_range'][0], reg['lon_range'][1]),
                latitude=slice(22.5, 21.5)
            ).isel(valid_time=-1)
            
            subset_ua = ds_ua[ds2_vars[0]].sel(
                longitude=slice(reg['lon_range'][0], reg['lon_range'][1]),
                latitude=slice(22.5, 21.5)
            ).isel(valid_time=-1)
            
            reg_env_tp = float(subset_ad.mean().values)
            reg_env_u10 = float(subset_ua.mean().values)
            
            # Predict risk
            # If NaN (no data in slice), use defaults
            if np.isnan(reg_env_tp): reg_env_tp = 0.001
            if np.isnan(reg_env_u10): reg_env_u10 = 5.0
            
            reg_features = np.array([[reg_env_tp, 0.0, reg_env_u10]])
            reg_risk_prob = float(model.predict_proba(reg_features)[0][1])
            
            regional_report.append({
                "region_name": reg['name'],
                "historical_fire_density": round(len(reg_fires) / len(fire_df) * 100, 2) if len(fire_df)>0 else 0,
                "current_risk_index": round(max(0.1, reg_risk_prob) * 100, 1),
                "avg_precipitation": round(reg_env_tp, 6),
                "avg_wind_speed": round(reg_env_u10, 2),
                "status": "CRITICAL" if reg_risk_prob > 0.7 else "CAUTION" if reg_risk_prob > 0.4 else "STABLE"
            })
        except Exception as e:
            print(f"Error analyzing region {reg['name']}: {e}")

    output["regional_analysis"] = regional_report

    output_path = os.path.join(r"d:\Hackathons\next\backend\ml_models", "fire_analysis_report.json")
    with open(output_path, 'w') as f:
        json.dump(output, f, indent=4)
    
    print(f"Report saved to {output_path}")
    
    # Save model
    import joblib
    joblib.dump(model, os.path.join(r"d:\Hackathons\next\backend\ml_models", "fire_risk_integrated_model.pkl"))
    
    ds_ad.close()
    ds_ua.close()

if __name__ == "__main__":
    train_integrated_model()
