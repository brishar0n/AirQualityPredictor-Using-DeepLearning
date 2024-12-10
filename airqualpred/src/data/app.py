from flask import Flask, request, jsonify
from flask_cors import CORS  
import tensorflow as tf
import pickle
import numpy as np

app = Flask(__name__)

CORS(app, origins="http://localhost:5173", allow_headers=["Content-Type", "Authorization"], methods=["GET", "POST", "OPTIONS"])

cnn_attention_model = tf.keras.models.load_model('models/cnn_attention_model.h5')
cnn_model = tf.keras.models.load_model('models/cnn_model.h5')
gru_attention_model = tf.keras.models.load_model('models/gru_attention_model.h5')
gru_model = tf.keras.models.load_model('models/gru_model.h5')
lstm_attention_model = tf.keras.models.load_model('models/lstm_attention_model.h5')
lstm_model = tf.keras.models.load_model('models/lstm_model.h5')
resnet_attention_model = tf.keras.models.load_model('models/resnet_attention_model.h5')
resnet_model = tf.keras.models.load_model('models/resnet_model.h5')
rexnet_model = tf.keras.models.load_model('models/rexnet_model.h5')
rexnet_attention_model = tf.keras.models.load_model('models/rexnet_attention_model.h5')
rnn_attention_model = tf.keras.models.load_model('models/rnn_attention_model.h5')
rnn_model = tf.keras.models.load_model('models/rnn_model.h5')

with open('models/sarima_model_pm25.pkl', 'rb') as f:
    sarima_model_pm25 = pickle.load(f)

def get_model(algorithm):
    models = {
        'cnn': cnn_model,
        'cnn_attention': cnn_attention_model,
        'gru': gru_model,
        'gru_attention': gru_attention_model,
        'lstm': lstm_model,
        'lstm_attention': lstm_attention_model,
        'resnet': resnet_model,
        'resnet_attention': resnet_attention_model,
        'rexnet': rexnet_model,
        'rexnet_attention': rexnet_attention_model,
        'rnn': rnn_model,
        'rnn_attention': rnn_attention_model,
        'sarima': sarima_model_pm25
    }
    return models.get(algorithm)

@app.route('/api/predict', methods=['POST', 'OPTIONS'])
def predict():
    if request.method == 'OPTIONS':
        # Handle preflight request
        return jsonify({'message': 'CORS preflight successful'}), 200

    try:
        # Get JSON data from the request
        data = request.get_json()
        inputs = np.array(data['inputs'])  # Inputs as a numpy array
        algorithm = data['algorithm']  # Algorithm choice

        # Get the appropriate model based on the algorithm
        model = get_model(algorithm)

        if model is None:
            return jsonify({'error': 'Invalid algorithm'}), 400

        # Handle SARIMA differently (scikit-learn model)
        if algorithm == 'sarima':
            # SARIMA typically expects a time series format
            if len(inputs.shape) == 1:
                inputs = inputs.reshape(-1, 1)
            predictions = model.predict(inputs)
        else:
            # For deep learning models
            inputs = np.expand_dims(inputs, axis=0)  # Adjust shape if necessary
            predictions = model.predict(inputs)

        return jsonify({'predictions': predictions.tolist()})

    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True)