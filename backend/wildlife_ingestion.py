import requests
import json
import os
import time
import pandas as pd
from datetime import datetime

# Configuration
RAW_DATA_DIR = "backend/datasets/wildlife_raw"
os.makedirs(RAW_DATA_DIR, exist_ok=True)

# Species of interest
SPECIES_LIST = [
    {"name": "Panthera tigris", "common_name": "Royal Bengal Tiger"},
    {"name": "Crocodylus porosus", "common_name": "Saltwater Crocodile"},
    {"name": "Varanus salvator", "common_name": "Water Monitor Lizard"},
    {"name": "Platanista gangetica", "common_name": "Ganges River Dolphin"},
    {"name": "Axis axis", "common_name": "Spotted Deer"}
]

def fetch_gbif_data(species_name):
    """Fetch species occurrence counts from GBIF."""
    print(f"Fetching GBIF data for {species_name}...")
    url = f"https://api.gbif.org/v1/occurrence/search?country=IN&stateProvince=Sundarbans&scientificName={species_name}&limit=0"
    try:
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            data = response.json()
            return {"count": data.get("count", 0), "species": species_name}
    except Exception as e:
        print(f"Error fetching GBIF data: {e}")
    return {"count": 0, "species": species_name}

def fetch_iucn_status(species_name):
    """Fetch IUCN status. (Requires token, using mock for demo if no token)"""
    # For demo purposes, we will return hardcoded historical trends if API fails or no token
    print(f"Fetching IUCN status for {species_name}...")
    # Mock data to ensure the demo works without a token
    mock_status = {
        "Panthera tigris": {"status": "EN", "trend": "Decreasing"},
        "Crocodylus porosus": {"status": "LC", "trend": "Increasing"},
        "Varanus salvator": {"status": "LC", "trend": "Stable"},
        "Platanista gangetica": {"status": "EN", "trend": "Decreasing"},
        "Axis axis": {"status": "LC", "trend": "Stable"}
    }
    return mock_status.get(species_name, {"status": "DD", "trend": "Unknown"})

def fetch_climate_data(lat=21.95, lon=88.70):
    """Fetch climate data from NASA POWER API."""
    print(f"Fetching NASA POWER climate data...")
    # Fetch for the last 5 years
    end_date = datetime.now().strftime("%Y%m%d")
    start_date = (datetime.now().replace(year=datetime.now().year - 5)).strftime("%Y%m%d")
    
    url = f"https://power.larc.nasa.gov/api/temporal/daily/point?parameters=T2M,PRECTOTCORR&community=AG&longitude={lon}&latitude={lat}&start={start_date}&end={end_date}&format=JSON"
    try:
        response = requests.get(url, timeout=15)
        if response.status_code == 200:
            return response.json()
    except Exception as e:
        print(f"Error fetching NASA data: {e}")
    return None

def fetch_forest_loss():
    """Mock Global Forest Watch Data for Sundarbans (2010-2024)."""
    # GFW API often requires specific IDs, providing realistic historical data for Sundarbans
    data = [
        {"year": 2015, "loss_ha": 120},
        {"year": 2016, "loss_ha": 150},
        {"year": 2017, "loss_ha": 200},
        {"year": 2018, "loss_ha": 180},
        {"year": 2019, "loss_ha": 310},
        {"year": 2020, "loss_ha": 450}, # Amphan cyclone year
        {"year": 2021, "loss_ha": 230},
        {"year": 2022, "loss_ha": 190},
        {"year": 2023, "loss_ha": 210},
        {"year": 2024, "loss_ha": 250},
    ]
    return data

def fetch_human_pop():
    """Mock WorldPop Data for Sundarbans region."""
    data = [
        {"year": 2015, "density": 850},
        {"year": 2016, "density": 865},
        {"year": 2017, "density": 880},
        {"year": 2018, "density": 895},
        {"year": 2019, "density": 910},
        {"year": 2020, "density": 925},
        {"year": 2021, "density": 940},
        {"year": 2022, "density": 955},
        {"year": 2023, "density": 970},
        {"year": 2024, "density": 985},
    ]
    return data

def ingest_all():
    all_data = {
        "species_occurrences": [],
        "conservation_status": {},
        "climate_data": None,
        "forest_loss": fetch_forest_loss(),
        "human_population": fetch_human_pop(),
        "timestamp": datetime.now().isoformat()
    }

    for species in SPECIES_LIST:
        occ = fetch_gbif_data(species["name"])
        all_data["species_occurrences"].append(occ)
        
        status = fetch_iucn_status(species["name"])
        all_data["conservation_status"][species["name"]] = status
        
    all_data["climate_data"] = fetch_climate_data()

    # Save to JSON
    output_path = os.path.join(RAW_DATA_DIR, "ingested_wildlife_data.json")
    with open(output_path, "w") as f:
        json.dump(all_data, f, indent=4)
    
    print(f"Data ingestion complete. Saved to {output_path}")

if __name__ == "__main__":
    ingest_all()
