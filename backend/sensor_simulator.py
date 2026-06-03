"""
Sensor Simulator - Posts random sensor data to the API
Run this to simulate a sensor device sending data
"""
import requests
import time
import random
import argparse

API_URL = "http://localhost:8001/api/v1/sensors"

def generate_sensor_data():
    """Generate realistic sensor readings"""
    return {
        "temperature": round(random.uniform(18.0, 35.0), 2),
        "humidity": round(random.uniform(30.0, 80.0), 2)
    }

def post_sensor_data(data):
    """Post sensor data to the API"""
    try:
        response = requests.post(API_URL, json=data, timeout=5)
        if response.status_code == 200:
            result = response.json()
            print(f"[OK] Posted: Temp={data['temperature']}°C, Humidity={data['humidity']}% -> ID={result['id']}")
            return True
        else:
            print(f"[ERROR] Status {response.status_code}: {response.text}")
            return False
    except requests.exceptions.ConnectionError:
        print("[ERROR] Cannot connect to API. Is the backend running?")
        return False
    except Exception as e:
        print(f"[ERROR] {e}")
        return False

def main():
    parser = argparse.ArgumentParser(description="Sensor Data Simulator")
    parser.add_argument("--interval", type=float, default=3.0, help="Seconds between readings (default: 3)")
    parser.add_argument("--count", type=int, default=0, help="Number of readings (0=infinite)")
    args = parser.parse_args()

    print(f"Sensor Simulator Started")
    print(f"Posting to: {API_URL}")
    print(f"Interval: {args.interval}s")
    print(f"Count: {'Infinite' if args.count == 0 else args.count}")
    print("-" * 40)

    readings = 0
    try:
        while args.count == 0 or readings < args.count:
            data = generate_sensor_data()
            post_sensor_data(data)
            readings += 1
            if args.count == 0 or readings < args.count:
                time.sleep(args.interval)
    except KeyboardInterrupt:
        print(f"\nStopped. Total readings sent: {readings}")

if __name__ == "__main__":
    main()
