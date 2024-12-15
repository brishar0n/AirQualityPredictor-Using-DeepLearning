from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from tensorflow.keras.models import load_model
import numpy as np
import datetime

app = FastAPI()

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"], 
)

model = load_model("data/gru_model.h5")

pollutant_labels = ["PM2.5", "PM10", "SO2", "CO", "O3", "NO2"]
aqi_breakpoints = {
    "PM2.5": [
        (0.0, 0.12, "Good"),
        (0.13, 0.35, "Moderate"),
        (0.36, 0.55, "Unhealthy for Sensitive Groups"),
        (0.56, 1.50, "Unhealthy"),
        (1.51, 2.50, "Very Unhealthy"),
    ],
    "PM10": [
        (0.0, 0.54, "Good"),
        (0.55, 1.54, "Moderate"),
        (1.55, 2.54, "Unhealthy for Sensitive Groups"),
        (2.55, 3.54, "Unhealthy"),
        (3.55, 4.24, "Very Unhealthy"),
    ],
    "SO2": [
        (0.0, 0.35, "Good"),
        (0.36, 0.75, "Moderate"),
        (0.76, 1.85, "Unhealthy for Sensitive Groups"),
        (1.86, 3.04, "Unhealthy"),
        (3.05, 6.04, "Very Unhealthy"),
    ],
    "CO": [
        (0.0, 0.044, "Good"),
        (0.045, 0.094, "Moderate"),
        (0.095, 0.124, "Unhealthy for Sensitive Groups"),
        (0.125, 0.154, "Unhealthy"),
        (0.155, 0.304, "Very Unhealthy"),
    ],
    "O3": [
        (0.0, 0.54, "Good"),
        (0.55, 1.04, "Moderate"),
        (1.05, 1.64, "Unhealthy for Sensitive Groups"),
        (1.65, 2.04, "Unhealthy"),
        (2.05, 4.04, "Very Unhealthy"),
    ],
    "NO2": [
        (0.0, 0.53, "Good"),
        (0.54, 1.00, "Moderate"),
        (1.01, 3.60, "Unhealthy for Sensitive Groups"),
        (3.61, 6.49, "Unhealthy"),
        (6.50, 12.49, "Very Unhealthy"),
    ],
}

def calculate_aqi_state(predicted_levels):
    aqi_states = []
    for i, label in enumerate(pollutant_labels):
        value = predicted_levels[i]
        for lower, upper, state in aqi_breakpoints[label]:
            if lower <= value <= upper:
                aqi_states.append((label, value, state))
                break
    dominant_pollutant = max(aqi_states, key=lambda x: x[1])
    return dominant_pollutant

class PredictionRequest(BaseModel):
    year: int
    month: int
    day: int

@app.post("/predict")
async def predict_aqi(request: PredictionRequest):
    try:
        target_date = datetime.date(request.year, request.month, request.day)
        current_date = datetime.date.today()
        days_to_predict = (target_date - current_date).days
        
        if days_to_predict < 0:
            raise HTTPException(status_code=400, detail="Target date must be in the future.")
        
        # Generate dummy historical data (replace with real data if available)
        # For example, use the last 5 days of historical data
        historical_data = np.random.rand(5, len(pollutant_labels))  # Replace with real data
        
        for _ in range(days_to_predict):
            input_data = historical_data[-5:].reshape(1, 5, len(pollutant_labels))
            next_day_prediction = model.predict(input_data)[0]
            historical_data = np.vstack([historical_data, next_day_prediction])
        
        final_prediction = historical_data[-1]
        
        dominant_pollutant = calculate_aqi_state(final_prediction)
        aqi_state = dominant_pollutant[2]
        
        response = {
            "target_date": target_date.isoformat(),
            "predicted_pollutant_levels": dict(zip(pollutant_labels, final_prediction.tolist())),
            "dominant_pollutant": dominant_pollutant[0],
            "aqi_state": aqi_state
        }
        return response
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))