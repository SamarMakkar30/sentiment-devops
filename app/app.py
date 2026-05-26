# app/app.py

from flask import Flask, request, jsonify, render_template
import joblib
import os

app = Flask(__name__)

# Load the trained model
model_path = os.path.join(os.path.dirname(__file__), '..', 'model', 'model.pkl')
model = joblib.load(model_path)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()

    if not data or 'text' not in data:
        return jsonify({'error': 'Please send JSON with a "text" field'}), 400

    text = data['text']
    prediction = model.predict([text])[0]
    confidence = model.predict_proba([text])[0].max()

    result = 'positive' if prediction == 1 else 'negative'

    return jsonify({
        'text': text,
        'sentiment': result,
        'confidence': round(float(confidence) * 100, 1)
    })

@app.route('/health')
def health():
    return jsonify({'status': 'ok-v2'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)