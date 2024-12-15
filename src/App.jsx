import React, { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
    const [formData, setFormData] = useState({
        year: "",
        month: "",
        day: "",
        model: "",
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

        const formattedDate = `${formData.year}-${formData.month.padStart(2, "0")}-${formData.day.padStart(2, "0")}`;

        if (!formData.model) {
            setError("Please select a model.");
            setLoading(false);
            return;
        }

        const requestData = {
            model: formData.model,
            date: formattedDate,
        };

        try {
            const response = await axios.post("air-quality-predictor-backend-git-main-brishar0ns-projects.vercel.app/get_prediction", requestData, {
                headers: {
                    "Content-Type": "application/json",
                },
            });

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
            model: "",
        });
        setResult(null);
        setError(null);
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
                            min="2023"
                            max="2026"
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
                        <select
                            name="model"
                            value={formData.model}
                            onChange={handleChange}
                            required
                            className="input"
                        >
                            <option value="">Select Model</option>
                            <option value="CNN">CNN</option>
                            <option value="CNN_Attention">CNN_Attention</option>
                            <option value="RNN">RNN</option>
                            <option value="RNN_Attention">RNN_Attention</option>
                            <option value="GRU">GRU</option>
                            <option value="GRU_Attention">GRU_Attention</option>
                            <option value="LSTM">LSTM</option>
                            <option value="LSTM_Attention">LSTM_Attention</option>
                            <option value="ResNet">ResNet</option>
                            <option value="ResNet_Attention">ResNet_Attention</option>
                            <option value="ReXNet">ReXNet</option>
                            <option value="ReXNet_Attention">ReXNet_Attention</option>
                        </select>

                        <button type="submit" className="submit-button">
                            {loading ? "Loading..." : "Predict"}
                        </button>
                    </form>

                    {error && <p className="error-message">{error}</p>}

                    {result && !loading && (
                        <>
                            <div className="result">
                                <h2>Prediction Result</h2>
                                {Object.keys(result).map((model) => (
                                    <div key={model}>
                                        <h3>{model}</h3>
                                        {result[model].error ? (
                                            <p>{result[model].error}</p>
                                        ) : (
                                            <>
                                                <p>Prediction Date: {result[model].date}</p>
                                                <p>PM2.5: {result[model].prediction.PM25}</p>
                                                <p>PM10: {result[model].prediction.PM10}</p>
                                                <p>SO2: {result[model].prediction.SO2}</p>
                                                <p>CO: {result[model].prediction.CO}</p>
                                                <p>O3: {result[model].prediction.O3}</p>
                                                <p>NO2: {result[model].prediction.NO2}</p>
                                            </>
                                        )}
                                    </div>
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
