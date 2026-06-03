import { SensorData } from '../api';

interface SensorChartProps {
  sensors: SensorData[];
}

function SensorChart({ sensors }: SensorChartProps) {
  // Take last 20 readings in chronological order
  const chartData = [...sensors].reverse().slice(-20);
  
  if (chartData.length < 2) {
    return null;
  }

  const maxTemp = Math.max(...chartData.map(s => s.temperature));
  const minTemp = Math.min(...chartData.map(s => s.temperature));
  const maxHumidity = Math.max(...chartData.map(s => s.humidity));
  const minHumidity = Math.min(...chartData.map(s => s.humidity));

  const tempRange = maxTemp - minTemp || 1;
  const humidityRange = maxHumidity - minHumidity || 1;

  const chartHeight = 150;

  const getTempY = (temp: number) => {
    return chartHeight - ((temp - minTemp) / tempRange) * (chartHeight - 20) - 10;
  };

  const getHumidityY = (humidity: number) => {
    return chartHeight - ((humidity - minHumidity) / humidityRange) * (chartHeight - 20) - 10;
  };

  const tempPoints = chartData.map((s, i) => {
    const x = (i / (chartData.length - 1)) * 100;
    const y = getTempY(s.temperature);
    return `${x},${y}`;
  }).join(' ');

  const humidityPoints = chartData.map((s, i) => {
    const x = (i / (chartData.length - 1)) * 100;
    const y = getHumidityY(s.humidity);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="card chart-card">
      <h2>Live Sensor Data</h2>
      <div className="chart-legend">
        <span className="legend-item temp">● Temperature (°C)</span>
        <span className="legend-item humidity">● Humidity (%)</span>
      </div>
      <div className="chart-container">
        <svg 
          viewBox={`0 0 100 ${chartHeight}`} 
          preserveAspectRatio="none"
          className="chart-svg"
        >
          {/* Grid lines */}
          <line x1="0" y1={chartHeight/4} x2="100" y2={chartHeight/4} className="grid-line" />
          <line x1="0" y1={chartHeight/2} x2="100" y2={chartHeight/2} className="grid-line" />
          <line x1="0" y1={chartHeight*3/4} x2="100" y2={chartHeight*3/4} className="grid-line" />
          
          {/* Temperature line */}
          <polyline
            fill="none"
            stroke="#e74c3c"
            strokeWidth="0.8"
            points={tempPoints}
            className="chart-line temp-line"
          />
          
          {/* Humidity line */}
          <polyline
            fill="none"
            stroke="#3498db"
            strokeWidth="0.8"
            points={humidityPoints}
            className="chart-line humidity-line"
          />

          {/* Latest point indicators */}
          {chartData.length > 0 && (
            <>
              <circle 
                cx="100" 
                cy={getTempY(chartData[chartData.length - 1].temperature)} 
                r="1.5" 
                fill="#e74c3c"
                className="pulse-dot"
              />
              <circle 
                cx="100" 
                cy={getHumidityY(chartData[chartData.length - 1].humidity)} 
                r="1.5" 
                fill="#3498db"
                className="pulse-dot"
              />
            </>
          )}
        </svg>
        <div className="chart-labels">
          <span className="chart-label-left">
            <span className="temp-label">{minTemp.toFixed(0)}°C</span>
            <span className="humidity-label">{minHumidity.toFixed(0)}%</span>
          </span>
          <span className="chart-label-right">
            <span className="temp-label">{maxTemp.toFixed(0)}°C</span>
            <span className="humidity-label">{maxHumidity.toFixed(0)}%</span>
          </span>
        </div>
      </div>
      <div className="chart-time-label">Last {chartData.length} readings →</div>
    </div>
  );
}

export default SensorChart;
