import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchSensors, createSensor, deleteSensor, SensorData, SensorDataCreate } from './api';
import SensorForm from './components/SensorForm';
import SensorList from './components/SensorList';
import LiveStats from './components/LiveStats';
import SensorChart from './components/SensorChart';

function App() {
  const [sensors, setSensors] = useState<SensorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(2000);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [newIds, setNewIds] = useState<Set<number>>(new Set());
  const intervalRef = useRef<number | null>(null);
  const prevSensorIds = useRef<Set<number>>(new Set());

  const loadSensors = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);
      const data = await fetchSensors();
      
      // Track new sensor IDs for animation
      const currentIds = new Set(data.map(s => s.id));
      const newOnes = new Set<number>();
      currentIds.forEach(id => {
        if (!prevSensorIds.current.has(id)) {
          newOnes.add(id);
        }
      });
      
      if (newOnes.size > 0) {
        setNewIds(newOnes);
        setTimeout(() => setNewIds(new Set()), 2000); // Clear after animation
      }
      
      prevSensorIds.current = currentIds;
      setSensors(data);
      setLastUpdate(new Date());
    } catch (err) {
      setError('Failed to load sensor data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadSensors(true);
  }, [loadSensors]);

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = window.setInterval(() => {
        loadSensors(false);
      }, refreshInterval);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRefresh, refreshInterval, loadSensors]);

  const handleCreate = async (data: SensorDataCreate) => {
    try {
      setError(null);
      const newSensor = await createSensor(data);
      setSensors(prev => [newSensor, ...prev]);
    } catch (err) {
      setError('Failed to create sensor data');
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setError(null);
      await deleteSensor(id);
      setSensors(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      setError('Failed to delete sensor data');
      console.error(err);
    }
  };

  return (
    <div className="container">
      <h1>Sensor Dashboard</h1>
      
      {error && <div className="error">{error}</div>}

      <div className="card">
        <div className="auto-refresh-controls">
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            Auto-refresh
          </label>
          {autoRefresh && (
            <select 
              value={refreshInterval} 
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              className="interval-select"
            >
              <option value={1000}>1 second</option>
              <option value={2000}>2 seconds</option>
              <option value={5000}>5 seconds</option>
              <option value={10000}>10 seconds</option>
            </select>
          )}
          <span className={`status-indicator ${autoRefresh ? 'live' : 'paused'}`}>
            {autoRefresh ? '● Live' : '○ Paused'}
          </span>
          {lastUpdate && (
            <span className="last-update">
              Last: {lastUpdate.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      <LiveStats sensors={sensors} />

      <SensorChart sensors={sensors} />
      
      <div className="card">
        <h2>Add Sensor Reading</h2>
        <SensorForm onSubmit={handleCreate} />
      </div>

      <div className="card">
        <h2>Sensor Readings ({sensors.length})</h2>
        <SensorList 
          sensors={sensors} 
          loading={loading} 
          onDelete={handleDelete}
          onRefresh={() => loadSensors(true)}
          newIds={newIds}
        />
      </div>
    </div>
  );
}

export default App;
