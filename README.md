# sentiment-devops

Simple Flask app for sentiment prediction using a trained model.

## Run locally

1. Create and activate a virtual environment.
2. Install dependencies:

   pip install -r requirements.txt

3. Start the app:

   python app/app.py

The app listens on http://localhost:5000.

## Docker

Build and run:

   docker build -t sentiment-devops .
   docker run -p 5000:5000 sentiment-devops
