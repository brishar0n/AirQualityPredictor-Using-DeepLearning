import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import './index.css';

function App() {
  const [location, setLocation] = useState('Jogja');
  const [selectedPollutant, setSelectedPollutant] = useState('');
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('');
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLocationChange = (event) => {
    setLocation(event.target.value);
  };

  const handlePollutantChange = (event) => {
    const value = event.target.value;
    setSelectedPollutant(event.target.value);

    if (value !== 'PM2.5' && selectedAlgorithm === 'sarima') {
      setSelectedAlgorithm('');
    }
  };

  const handleAlgorithmChange = (event) => {
    const value = event.target.value;
    setSelectedAlgorithm(event.target.value);

    if (value === 'sarima' && selectedPollutant !== 'PM2.5') {
      setSelectedPollutant('PM2.5');
    }
  };

  const handleGenerateClick = async () => {
    try {
      setLoading(true);
      setError(null);
  
      // Prepare the request URL with the selected values from the dropdowns
      const response = await fetch(
        `http://127.0.0.1:5000/api/predict?location=${location}&pollutant=${selectedPollutant}&algorithm=${selectedAlgorithm}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            location: location,
            pollutant: selectedPollutant,
            algorithm: selectedAlgorithm,
          }),
        }
      );
  
      if (!response.ok) throw new Error('Failed to fetch data from the backend.');
  
      const data = await response.json();
  
      const predictionData = {
        labels: data.predictions[selectedAlgorithm].map((_, index) => `Time ${index + 1}`),
        datasets: [
          {
            label: `${selectedAlgorithm} Prediction`,
            data: data.predictions[selectedAlgorithm].map((point) => point.value),
            borderColor: getColorForModel(selectedAlgorithm),
            fill: false,
            tension: 0.3,
          },
        ],
      };
  
      setChartData(predictionData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  

  const getColorForModel = (model) => {
    const modelColors = {
      cnn: 'rgb(75, 192, 192)',
      cnn_attention: 'rgb(54, 162, 235)',
      rnn: 'rgb(255, 99, 132)',
      rnn_attention: 'rgb(255, 159, 64)',
      lstm: 'rgb(153, 102, 255)',
      lstm_attention: 'rgb(201, 203, 207)',
      gru: 'rgb(255, 205, 86)',
      gru_attention: 'rgb(105, 120, 220)',
      sarima: 'rgb(120, 190, 170)',
      resnet: 'rgb(80, 190, 100)',
      resnet_attention: 'rgb(200, 120, 70)',
      rexnet: 'rgb(100, 100, 220)',
      rexnet_attention: 'rgb(220, 100, 150)',
    };
    return modelColors[model] || 'rgb(0, 0, 0)';
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Air Quality Predictor 🌏</h1>
        <p>Predict air quality for your selected location in Indonesia and pollutant using deep learning (AI) models.

        <br/>

        Analyze predictions through our generated graphs and optimized weighted ensembles.</p>
      </header>

      <div className="form-container">
        <div className="form-group">
          <label htmlFor="location">Location</label>
          <select id="location" value={location} onChange={handleLocationChange}>
            <option value="Jogja">Jogja</option>
            <option value="Tangsel">Tangsel</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="pollutant">Pollutant</label>
          <select id="pollutant" value={selectedPollutant} onChange={handlePollutantChange}>
            <option value="">Select Pollutant</option>
            <option value="PM2.5">PM2.5</option>
            <option value="PM10">PM10</option>
            <option value="SO2">SO2</option>
            <option value="CO">CO</option>
            <option value="O3">O3</option>
            <option value="NO2">NO2</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="algorithm">Algorithm</label>
          <select id="algorithm" value={selectedAlgorithm} onChange={handleAlgorithmChange}>
            <option value="">Select Algorithm</option>
            <option value="cnn">CNN</option>
            <option value="cnn_attention">CNN with Attention</option>
            <option value="lstm">LSTM</option>
            <option value="lstm_attention">LSTM with Attention</option>
            <option value="rnn">RNN</option>
            <option value="rnn_attention">RNN with Attention</option>
            <option value="gru">GRU</option>
            <option value="gru_attention">GRU with Attention</option>
            <option value="sarima">SARIMA (only for PM2.5)</option>
            <option value="resnet">ResNet</option>
            <option value="resnet_attention">ResNet with Attention</option>
            <option value="rexnet">RexNet</option>
            <option value="rexnet_attention">RexNet with Attention</option>
          </select>
        </div>

        <button className="generate-button" onClick={handleGenerateClick} disabled={loading || !selectedAlgorithm}>
          {loading ? 'Loading...' : 'Generate Predictions'}
        </button>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      {chartData && (
        <div className="chart-container">
          <Line
            data={chartData}
            options={{
              responsive: true,
              plugins: {
                tooltip: {
                  callbacks: {
                    label: (tooltipItem) => `(${tooltipItem.label}, ${tooltipItem.raw})`,
                  },
                },
                legend: {
                  labels: {
                    font: {
                      size: 14,
                    },
                  },
                },
              },
              scales: {
                x: {
                  title: {
                    display: true,
                    text: 'Time',
                    font: {
                      size: 16,
                    },
                  },
                },
                y: {
                  title: {
                    display: true,
                    text: 'Prediction Value',
                    font: {
                      size: 16,
                    },
                  },
                },
              },
            }}
          />
        </div>
      )}
    </div>
  );
}

export default App;