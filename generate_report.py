import sys
import os
import json

# Add module path
sys.path.append(os.path.join(os.getcwd(), 'backend', 'ml_models'))

from backend.ml_models.fire_service import app

def generate_final_report():
    print("Generating report...")
    # Create a test client context
    with app.test_client() as client:
        # Fetch the report via the endpoint logic which now includes real stats
        response = client.get('/report/fire')
        
        if response.status_code == 200:
            report_data = response.get_json()
            
            # Save to the actual artifact file
            output_path = r'd:\Hackathons\next\backend\ml_models\fire_analysis_report.json'
            with open(output_path, 'w') as f:
                json.dump(report_data, f, indent=4)
                
            print(f"Successfully saved report to {output_path}")
            
            # Print validation
            for r in report_data.get('regional_analysis', []):
                print(f"Region: {r['region_name']}, Density: {r['historical_fire_density']}")
        else:
            print(f"Failed to generate report: {response.status_code}")

if __name__ == "__main__":
    generate_final_report()
