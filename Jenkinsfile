pipeline {
  agent any

  environment {
    NODE_ENV = "development"
    NODE_OPTIONS = "--max-old-space-size=2048" // 💡 untuk mencegah Bridge timeout
  }

  tools {
    nodejs "NodeJS 20.19.0" // ✅ pastikan sudah tersedia di Jenkins Tools
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
        sh 'yarn --version'
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

    stage('Test') {
      steps {
        sh 'yarn test --coverage' // ✅ pastikan coverage dijalankan
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
