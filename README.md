# Sentiment Analyzer - ML Model Deployment with DevOps Pipeline

A production-ready ML web service that classifies text as positive or negative sentiment.
Deployed end-to-end using Docker, GitHub Actions CI/CD, and AWS EC2.

## Live Demo
http://YOUR_EC2_PUBLIC_IP:5000

## Architecture
```
Code Push -> GitHub -> GitHub Actions -> Docker Build -> AWS ECR -> AWS EC2
-> Flask API (port 5000) serving the ML model
```

## Tools Used
| Tool | Purpose |
|------|---------|
| Python + scikit-learn | Train the ML sentiment model |
| Flask | Serve the model as a REST API |
| React + Vite + Tailwind CSS | Cinematic frontend UI |
| Docker | Package app into a container |
| GitHub Actions | CI/CD auto build and push on every commit |
| AWS ECR | Store Docker images in the cloud |
| AWS EC2 | Host the running container |

## API Usage

**Predict sentiment:**
```
POST /predict
Content-Type: application/json
{"text": "I love this product!"}
```

**Response:**
```json
{
  "text": "I love this product!",
  "sentiment": "positive",
  "confidence": 97.3
}
```

Health check:
```
GET /health
-> {"status": "ok"}
```

Metrics (Prometheus format):
```
GET /metrics
```

## Run Locally
```bash
# Install dependencies
python -m pip install -r app/requirements.txt

# Build the frontend (served by Flask)
cd frontend
npm install
npm run build
cd ..

# Train the model
python model/train.py

# Start the server
python app/app.py

# Visit http://localhost:5000
```

Flask serves the React build from `frontend/dist` when it exists.

## Run with Docker
```bash
# Build image (trains the model inside the image)
docker build -t sentiment-app .
docker run -p 5000:5000 sentiment-app
```

## Frontend Dev Mode
```bash
cd frontend
npm install
npm run dev
```

The React dev server runs at http://localhost:5173 and calls the Flask API.

## Monitoring (Prometheus + Grafana)
```bash
docker compose -f docker-compose.monitoring.yml up --build
```

Open:
- App: http://localhost:5000
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3000 (admin / admin)

## Project Structure
```
sentiment-devops/
├── model/train.py          # Train and save ML model
├── app/app.py              # Flask REST API
├── app/templates/          # HTML frontend
├── frontend/                # React + Vite + Tailwind UI
├── Dockerfile              # Container definition
├── Jenkinsfile              # Jenkins pipeline (ECR push)
├── docker-compose.monitoring.yml  # Prometheus + Grafana stack
└── .github/workflows/      # CI/CD pipeline
```

## Jenkins Pipeline (Optional)
If you use Jenkins instead of GitHub Actions:
1. Install Docker + AWS CLI on the Jenkins agent.
2. Add Jenkins credentials with ID `aws-credentials` (AWS access key + secret).
3. Update `AWS_ACCOUNT_ID` in `Jenkinsfile`.
4. Run the pipeline to build and push images to ECR.

## Update Running EC2 Container
```bash
docker pull YOUR_ACCOUNT_ID.dkr.ecr.ap-south-1.amazonaws.com/sentiment-analyzer:latest
docker stop sentiment-app
docker rm sentiment-app
docker run -d -p 5000:5000 --name sentiment-app --restart always YOUR_ACCOUNT_ID.dkr.ecr.ap-south-1.amazonaws.com/sentiment-analyzer:latest
```

## Troubleshooting
| Error | Fix |
|------|-----|
| docker: command not found | Install Docker Desktop and restart the terminal |
| port already in use | Stop the running container or change the port mapping |
| Permission denied (publickey) | Use the correct .pem file and verify EC2 security group |
| no such file model.pkl | Run python model/train.py first |
| EC2 connection timeout | Open port 5000 in the security group |
| unauthorized: authentication required | Re-run the ECR login command |
