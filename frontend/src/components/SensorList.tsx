import { SensorData } from '../api';

interface SensorListProps {
  sensors: SensorData[];
  loading: boolean;
  onDelete: (id: number) => Promise<void>;
  onRefresh: () => Promise<void>;
  newIds?: Set<number>;
}

function SensorList({ sensors, loading, onDelete, onRefresh, newIds = new Set() }: SensorListProps) {
  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getTimeAgo = (timestamp: string) => {
    const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  if (loading) {
    return <div className="loading">Loading sensor data...</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: '15px', textAlign: 'right' }}>
        <button onClick={onRefresh}>Refresh</button>
      </div>
      
      {sensors.length === 0 ? (
        <div className="empty-state">
          <p>No sensor data yet. Add your first reading above!</p>
        </div>
      ) : (
        <ul className="sensor-list">
          {sensors.map((sensor) => (
            <li 
              key={sensor.id} 
              className={`sensor-item ${newIds.has(sensor.id) ? 'new-item' : ''}`}
            >
              <div>
                <div className="sensor-info">
                  <span className="sensor-value temp-value">
                    <strong>Temp:</strong> {sensor.temperature}°C
                  </span>
                  <span className="sensor-value humidity-value">
                    <strong>Humidity:</strong> {sensor.humidity}%
                  </span>
                </div>
                <div className="timestamp">
                  {formatDate(sensor.timestamp)}
                  <span className="time-ago">{getTimeAgo(sensor.timestamp)}</span>
                </div>
              </div>
              <button 
                className="btn-danger" 
                onClick={() => onDelete(sensor.id)}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SensorList;
