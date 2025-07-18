pipeline {
  agent any

  environment {
    NODE_ENV = "development"
    NODE_OPTIONS = "--max-old-space-size=2048"
  }

  tools {
    nodejs "NodeJS 20.19.0"
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Install Yarn & Dependencies') {
      steps {
        sh 'npm install -g yarn'
        sh 'yarn install'
      }
    }

    stage('Lint') {
      steps {
        sh 'yarn lint'
      }
    }

    stage('Build') {
      steps {
        sh 'yarn build'
      }
    }

    stage('Test & Coverage') {
      steps {
        sh 'yarn vitest run --coverage'
        sh 'ls -lh coverage/lcov.info || echo "❌ lcov.info missing!"'
      }
    }

    stage('SonarQube Analysis') {
      steps {
        withSonarQubeEnv('SonarQube') {
          sh 'npx sonar-scanner'
        }
      }
    }
  }

  post {
    success {
      echo '✅ Build, Lint, Test, dan SonarQube analysis sukses!'
    }
    failure {
      echo '❌ Build, Test, atau SonarQube analysis gagal.'
    }
  }
}