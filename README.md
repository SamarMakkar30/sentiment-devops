# sentiment-devops

Flask sentiment analysis API with Docker, GitHub Actions CI/CD, Amazon ECR, and EC2 deployment.

## Architecture

- Flask API in `app/app.py`
- Training script in `model/train.py`
- Docker image builds app and model artifacts
- GitHub Actions builds/pushes image to ECR on `main`
- EC2 pulls latest ECR image and runs container

## API Endpoints

- `GET /` - HTML UI
- `GET /health` - service health
- `POST /predict` - sentiment prediction

Request body (`/predict`):

```json
{
  "text": "I love this"
}
```

Response example:

```json
{
  "text": "I love this",
  "sentiment": "positive",
  "confidence": 56.3
}
```

## Run Locally

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python model/train.py
python app/app.py
```

## Docker Commands

```bash
docker build -t sentiment-app .
docker run -d --name sentiment-app -p 5000:5000 sentiment-app
```

## Deployment Steps (ECR + EC2)

1. Push code to `main` and let GitHub Actions push image to ECR.
2. SSH into EC2.
3. Login to ECR and pull latest image.
4. Restart container with latest image.

```bash
ACCOUNT_ID=<your-account-id>
REGION=ap-south-1
REPO=sentiment-app

aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com
docker pull $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$REPO:latest
docker rm -f sentiment-app || true
docker run -d --name sentiment-app -p 5000:5000 --restart always $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$REPO:latest
```

## Live URL

http://35.154.11.164:5000

## Quick Verify

```bash
curl http://35.154.11.164:5000/health
curl -X POST http://35.154.11.164:5000/predict -H "Content-Type: application/json" -d '{"text":"I love this"}'
```
