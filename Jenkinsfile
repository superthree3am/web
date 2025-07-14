pipeline {
  agent any

  environment {
    NODE_ENV = "development"
  }

  tools {
    nodejs "NodeJS 20.19.0" // Pastikan diatur di Jenkins > Global Tool Configuration
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Install Dependencies') {
      steps {
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

    stage('SonarQube Analysis') {
      steps {
        withSonarQubeEnv('SonarQubeLocal') {
          sh 'npx sonar-scanner'
        }
      }
    }
  }

  post {
    success {
      echo '✅ Build, Lint, dan SonarQube analysis sukses!'
    }
    failure {
      echo '❌ Build atau SonarQube analysis gagal.'
    }
  }
}
