import { useState, FormEvent } from 'react';
import { SensorDataCreate } from '../api';

interface SensorFormProps {
  onSubmit: (data: SensorDataCreate) => Promise<void>;
}

function SensorForm({ onSubmit }: SensorFormProps) {
  const [temperature, setTemperature] = useState('');
  const [humidity, setHumidity] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!temperature || !humidity) return;

    setSubmitting(true);
    try {
      await onSubmit({
        temperature: parseFloat(temperature),
        humidity: parseFloat(humidity),
      });
      setTemperature('');
      setHumidity('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="temperature">Temperature (°C)</label>
        <input
          type="number"
          id="temperature"
          step="0.1"
          value={temperature}
          onChange={(e) => setTemperature(e.target.value)}
          placeholder="Enter temperature"
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="humidity">Humidity (%)</label>
        <input
          type="number"
          id="humidity"
          step="0.1"
          min="0"
          max="100"
          value={humidity}
          onChange={(e) => setHumidity(e.target.value)}
          placeholder="Enter humidity"
          required
        />
      </div>
      <button type="submit" disabled={submitting}>
        {submitting ? 'Adding...' : 'Add Reading'}
      </button>
    </form>
  );
}

export default SensorForm;
