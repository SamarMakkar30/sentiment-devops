FROM node:20-alpine AS frontend-build

WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend ./
RUN npm run build

FROM python:3.11-slim

WORKDIR /app

# Copy requirements first (for faster rebuilds)
COPY app/requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy all project files
COPY . .

# Copy the built frontend assets
COPY --from=frontend-build /frontend/dist ./frontend/dist

# Train the model during build so the image includes model.pkl
RUN python model/train.py

# Tell Docker which port the app uses
EXPOSE 5000

# Command to run when container starts
CMD ["python", "app/app.py"]
