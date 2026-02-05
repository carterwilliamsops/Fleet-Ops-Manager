import pandas as pd
import random
from datetime import datetime, timedelta

# MOCK DATA GENERATOR
# This script simulates the analytics engine for FleetOps.
# It generates dummy repair data to test the "Most Common Repairs" logic.

def generate_fleet_data(num_records=100):
    repair_types = ['Brake Caliper', 'HV Battery Isolation', 'Coolant Pump', 'Tire Wear', 'DC-DC Converter']
    fleet_data = []

    for _ in range(num_records):
        ticket = {
            'vehicle_id': f'TRUCK-{random.randint(100, 150)}',
            'date_submitted': datetime.now() - timedelta(days=random.randint(0, 30)),
            'repair_category': random.choice(repair_types),
            'labor_hours': round(random.uniform(0.5, 5.0), 1),
            'parts_cost': random.randint(50, 2000)
        }
        fleet_data.append(ticket)
    
    return pd.DataFrame(fleet_data)

# ANALYTICS FUNCTION
def calculate_common_failures(df):
    print("--- 📊 MOST COMMON FAILURES (Last 30 Days) ---")
    summary = df['repair_category'].value_counts().head(3)
    print(summary)
    return summary

def calculate_avg_repair_cost(df):
    print("\n--- 💰 AVERAGE COST PER REPAIR TYPE ---")
    avg_cost = df.groupby('repair_category')['parts_cost'].mean().sort_values(ascending=False)
    print(avg_cost)

if __name__ == "__main__":
    # Simulate data load
    print("Loading simulated fleet data...")
    df = generate_fleet_data(200)
    
    # Run Reports
    calculate_common_failures(df)
    calculate_avg_repair_cost(df)