// Use environment variable for API URL, fallback to relative path for same-origin
const API_BASE = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api/v1`
  : '/api/v1';

export interface SensorData {
  id: number;
  temperature: number;
  humidity: number;
  timestamp: string;
}

export interface SensorDataCreate {
  temperature: number;
  humidity: number;
}

export async function fetchSensors(): Promise<SensorData[]> {
  const response = await fetch(`${API_BASE}/sensors`);
  if (!response.ok) {
    throw new Error('Failed to fetch sensors');
  }
  return response.json();
}

export async function createSensor(data: SensorDataCreate): Promise<SensorData> {
  const response = await fetch(`${API_BASE}/sensors`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to create sensor data');
  }
  return response.json();
}

export async function deleteSensor(id: number): Promise<void> {
  const response = await fetch(`${API_BASE}/sensors/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete sensor data');
  }
}
