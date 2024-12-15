from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import json
import os
from fastapi.middleware.cors import CORSMiddleware

# Initialize the FastAPI application
app = FastAPI()

# Define allowed origins
origins = [
    "http://localhost:5173",  # React frontend URL
    "http://127.0.0.1:5173",  # If React is running on this URL
]

# Add CORS middleware to allow cross-origin requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Allows these origins to access your API
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)

# Pydantic model to validate input
class PredictionRequest(BaseModel):
    model: str
    date: str

# Function to read model prediction data from JSON
def get_predictions_for_model(model_name: str, date: str) -> dict:
    # Path to where model predictions are stored
    file_path = f"output/{model_name}.json"
    
    # Check if file exists
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail=f"Model {model_name} not found.")
    
    # Open and read the file
    with open(file_path, 'r') as file:
        data = json.load(file)
    
    # Look for the prediction on the specific date
    predictions = data.get(model_name, {}).get('predictions', [])
    
    for prediction in predictions:
        if prediction['date'] == date:
            return prediction

    # If no prediction is found for the date
    raise HTTPException(status_code=404, detail=f"No predictions found for {date}.")

# Define the API endpoint
@app.post("/get_prediction/")
async def get_prediction(request: PredictionRequest):
    try:
        # Get predictions based on the model and date
        prediction = get_predictions_for_model(request.model, request.date)
        return {request.model: prediction}
    except HTTPException as e:
        raise e
