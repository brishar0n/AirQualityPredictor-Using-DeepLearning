import React, { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
    const [formData, setFormData] = useState({
        year: "",
        month: "",
        day: "",
    });

    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post("http://127.0.0.1:8000/predict", formData);
            setResult(response.data);
        } catch (error) {
            setError("Error predicting air quality. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="App">
            <div className="layout">
                <div className="description">
                    <h2>About This Project</h2>
                    <p>
                        Our Urban Air Quality Predictor is a project based on deep learning
                        (AI) model, GRU, that predicts the quality of the air based on 3 parameters:
                        year, month, and day. The model was trained using existing pollutant and weather data
                        from South Tangerang. It's overall average accuracy is 97.745% on training data.
                        With this project, users are able to predict the AQI and its state based on its pollutant factors.
                    </p>
                </div>

                {/* Right Section: Form */}
                <div className="container">
                    <h1>Air Quality Prediction</h1>
                    <form className="form" onSubmit={handleSubmit}>
                        <input
                            name="year"
                            type="number"
                            placeholder="Year"
                            value={formData.year}
                            onChange={handleChange}
                            required
                            className="input"
                        />
                        <input
                            name="month"
                            type="number"
                            placeholder="Month"
                            value={formData.month}
                            onChange={handleChange}
                            required
                            className="input"
                        />
                        <input
                            name="day"
                            type="number"
                            placeholder="Day"
                            value={formData.day}
                            onChange={handleChange}
                            required
                            className="input"
                        />
                        <button type="submit" className="submit-button">
                            {loading ? "Loading..." : "Predict"}
                        </button>
                    </form>

                    {error && <p className="error-message">{error}</p>}

                    {result && !loading && (
                        <div className="result">
                            <h2>Prediction Result</h2>
                            <p>Average Prediction: {result.average_prediction ? result.average_prediction.toFixed(2) : "N/A"}</p>
                            <p>Air Quality: {result.air_quality}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default App;
