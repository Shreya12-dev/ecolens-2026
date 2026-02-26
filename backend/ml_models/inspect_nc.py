import xarray as xr
import os

def inspect_nc(file_path):
    print(f"\n{'='*20}\nInspecting: {file_path}")
    if not os.path.exists(file_path):
        print("File not found!")
        return
    
    try:
        ds = xr.open_dataset(file_path)
        print("\nVARIABLES:")
        for var in ds.data_vars:
            print(f" - {var}: {ds[var].attrs.get('long_name', 'No long name')}")
            print(f"   Units: {ds[var].attrs.get('units', 'No units')}")
            print(f"   Shape: {ds[var].shape}")
        
        print("\nCOORDINATES:")
        for coord in ds.coords:
            print(f" - {coord}: {ds[coord].attrs.get('long_name', '')}")
            if ds[coord].size > 0:
                print(f"   Range: {ds[coord].values.min()} to {ds[coord].values.max()}")
        
        print("\nDimensions:", dict(ds.dims))
        ds.close()
    except Exception as e:
        print(f"Error: {e}")

dataset_dir = r"d:\Hackathons\next\backend\datasets"
inspect_nc(os.path.join(dataset_dir, "data_stream-moda_stepType-avgad.nc"))
inspect_nc(os.path.join(dataset_dir, "data_stream-moda_stepType-avgua.nc"))
