import { SensorData } from '../api';

interface LiveStatsProps {
  sensors: SensorData[];
}

function LiveStats({ sensors }: LiveStatsProps) {
  if (sensors.length === 0) {
    return null;
  }

  const latest = sensors[0];
  const avgTemp = sensors.reduce((sum, s) => sum + s.temperature, 0) / sensors.length;
  const avgHumidity = sensors.reduce((sum, s) => sum + s.humidity, 0) / sensors.length;
  const maxTemp = Math.max(...sensors.map(s => s.temperature));
  const minTemp = Math.min(...sensors.map(s => s.temperature));

  return (
    <div className="stats-grid">
      <div className="stat-card current">
        <div className="stat-label">Current Temperature</div>
        <div className="stat-value temp">{latest.temperature.toFixed(1)}°C</div>
        <div className="stat-sublabel">Latest reading</div>
      </div>
      
      <div className="stat-card current">
        <div className="stat-label">Current Humidity</div>
        <div className="stat-value humidity">{latest.humidity.toFixed(1)}%</div>
        <div className="stat-sublabel">Latest reading</div>
      </div>

      <div className="stat-card average">
        <div className="stat-label">Average Temperature</div>
        <div className="stat-value">{avgTemp.toFixed(1)}°C</div>
        <div className="stat-sublabel">From {sensors.length} readings</div>
      </div>

      <div className="stat-card average">
        <div className="stat-label">Average Humidity</div>
        <div className="stat-value">{avgHumidity.toFixed(1)}%</div>
        <div className="stat-sublabel">From {sensors.length} readings</div>
      </div>

      <div className="stat-card range">
        <div className="stat-label">Temperature Range</div>
        <div className="stat-value range-value">
          <span className="min">{minTemp.toFixed(1)}°C</span>
          <span className="separator">→</span>
          <span className="max">{maxTemp.toFixed(1)}°C</span>
        </div>
        <div className="stat-sublabel">Min to Max</div>
      </div>

      <div className="stat-card total">
        <div className="stat-label">Total Readings</div>
        <div className="stat-value">{sensors.length}</div>
        <div className="stat-sublabel">All time</div>
      </div>
    </div>
  );
}

export default LiveStats;
