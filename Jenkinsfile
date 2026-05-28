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

    stage('Lint') {
      steps {
        sh 'python -m py_compile app/app.py'
      }
    }

    stage('Build Docker Image') {
      steps {
        script {
          env.IMAGE_TAG = env.GIT_COMMIT ?: env.BUILD_NUMBER
        }
        sh 'docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:latest -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .'
      }
    }

    stage('Login to ECR') {
      steps {
        withCredentials([
          [$class: 'AmazonWebServicesCredentialsBinding', credentialsId: 'aws-credentials']
        ]) {
          sh 'aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_REGISTRY'
        }
      }
    }

    stage('Push Image') {
      steps {
        sh 'docker push $ECR_REGISTRY/$ECR_REPOSITORY:latest'
        sh 'docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG'
      }
    }
  }

  post {
    success {
      echo 'Jenkins build completed and image pushed to ECR.'
    }
  }
}
