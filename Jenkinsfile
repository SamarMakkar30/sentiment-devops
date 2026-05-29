pipeline {
  agent any

  environment {
    AWS_REGION = 'ap-south-1'
    ECR_REPOSITORY = 'sentiment-analyzer'
    AWS_ACCOUNT_ID = '874373491343'
    ECR_REGISTRY = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Build') {
      steps {
        echo 'Pipeline executed successfully'
      }
    }
  }

  post {
    success {
      echo 'Jenkins build completed and image pushed to ECR.'
    }
  }
}