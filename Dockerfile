FROM python:3.11-slim

WORKDIR /app

# Copy requirements first (for faster rebuilds)
COPY app/requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy all project files
COPY . .

# Train the model during build so the image includes model.pkl
RUN python model/train.py

# Tell Docker which port the app uses
EXPOSE 5000

# Command to run when container starts
CMD ["python", "app/app.py"]
