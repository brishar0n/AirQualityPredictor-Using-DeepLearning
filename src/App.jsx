import React, { useState } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
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

    const handleReset = () => {
        setFormData({
            year: "",
            month: "",
            day: "",
        });
        setResult(null);
        setError(null);
    };

    return (
        <div className="App">
            <a
                href="https://github.com/brishar0n/AirQualityPredictor-using-DeepLearning"
                target="_blank"
                rel="noopener noreferrer"
                className="github-icon"
            >
                <FontAwesomeIcon icon={faGithub} size="2x" />
            </a>
            <div className="layout">
                <div className="description">
                    <h2>About This Project</h2>
                    <p>
                        Our Urban Air Quality Predictor is a project based on a deep learning
                        (AI) model, GRU, that predicts air quality based on user inputs:
                        year, month, and day. The model was trained using pollutant and weather data
                        from South Tangerang. With this tool, users can estimate the AQI state and its
                        contributing factors.
                    </p>
                </div>

                <div className="container">
                    <h1>Air Quality Predictor 🌏</h1>
                    <form className="form" onSubmit={handleSubmit}>
                        <input
                            name="year"
                            type="number"
                            placeholder="Year"
                            value={formData.year}
                            onChange={handleChange}
                            required
                            className="input"
                            min="2024"
                        />
                        <input
                            name="month"
                            type="number"
                            placeholder="Month"
                            value={formData.month}
                            onChange={handleChange}
                            required
                            className="input"
                            min="1"
                            max="12"
                        />
                        <input
                            name="day"
                            type="number"
                            placeholder="Day"
                            value={formData.day}
                            onChange={handleChange}
                            required
                            className="input"
                            min="1"
                            max="31"
                        />
                        <button type="submit" className="submit-button">
                            {loading ? "Loading..." : "Predict"}
                        </button>
                    </form>

                    {error && <p className="error-message">{error}</p>}

                    {result && !loading && (
                        <>
                            <div className="result">
                                <h2>Prediction Result</h2>
                                <p>Target Date: {result.target_date}</p>
                                <p>Air Quality State: {result.aqi_state}</p>
                                <p>Dominant Pollutant: {result.dominant_pollutant}</p>
                            </div>

                            <div className="detailed-result">
                                <h3>Predicted Pollutant Levels</h3>
                                {Object.entries(result.predicted_pollutant_levels).map(([pollutant, level]) => (
                                    <p key={pollutant}>
                                        {pollutant} Level: {level.toFixed(2)}
                                    </p>
                                ))}
                            </div>

                            <button onClick={handleReset} className="reset-button">
                                Reset
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default App;
