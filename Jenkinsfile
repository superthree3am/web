pipeline {
    agent any

    tools {
        nodejs 'Node 20.19.0'
        'hudson.plugins.sonar.SonarRunnerInstallation' 'SonarScanner'
    }

    environment {
        PROJECT_ID             = 'am-finalproject'
        REGION                 = 'asia-southeast2'
        CLUSTER_NAME           = 'finalproject-cluster'
        IMAGE_NAME             = 'fe-app'
        IMAGE_TAG              = 'latest'
        REPO_NAME              = 'fathya-frontend-repo'
        ARTIFACT_REGISTRY_URL  = 'asia-southeast2-docker.pkg.dev'
        FULL_IMAGE_NAME        = "${ARTIFACT_REGISTRY_URL}/${PROJECT_ID}/${REPO_NAME}/${IMAGE_NAME}:${IMAGE_TAG}"
        SONAR_QUBE_SERVER_URL  = 'https://sonar3am.42n.fun'
        SONAR_QUBE_PROJECT_KEY = 'fe-app-sq-gke'
        SONAR_QUBE_PROJECT_NAME = 'Project SonarQube Frontend GKE'
    }

    stages {
        stage('Checkout') {
            steps {
                deleteDir()
                dir('frontend') {
                    git branch: 'main', url: 'https://github.com/superthree3am/web.git'
                }
            }
        }

        stage('Unit Test & SAST') {
            steps {
                dir('frontend') {
                    withCredentials([
                        file(credentialsId: 'env-frontend-gke', variable: 'ENV_FILE'),
                        string(credentialsId: 'sonarqube-token', variable: 'SONAR_TOKEN')
                    ]) {
                        script {
                            def scannerHome = tool 'SonarScanner'
                            withSonarQubeEnv('SonarQube') {
                                sh '''
                                    cp "$ENV_FILE" .env
                                    npm install
                                    npm test
                                    rm .env
                                '''

                                sh """
                                    ${scannerHome}/bin/sonar-scanner \
                                    -Dsonar.projectKey=${SONAR_QUBE_PROJECT_KEY} \
                                    -Dsonar.projectName="${SONAR_QUBE_PROJECT_NAME}" \
                                    -Dsonar.host.url=${SONAR_QUBE_SERVER_URL} \
                                    -Dsonar.token=${SONAR_TOKEN}
                                """
                            }
                        }
                    }
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                dir('frontend') {
                    withCredentials([file(credentialsId: 'env-frontend-gke', variable: 'ENV_FILE')]) {
                        sh '''
                            cp "$ENV_FILE" .env
                            export $(grep -v '^#' .env | xargs)

                            docker build --no-cache \
                                --build-arg VUE_APP_SERVICE_API=$VUE_APP_SERVICE_API \
                                --build-arg VUE_APP_FIREBASE_API_KEY=$VUE_APP_FIREBASE_API_KEY \
                                --build-arg VUE_APP_FIREBASE_AUTH_DOMAIN=$VUE_APP_FIREBASE_AUTH_DOMAIN \
                                --build-arg VUE_APP_FIREBASE_PROJECT_ID=$VUE_APP_FIREBASE_PROJECT_ID \
                                --build-arg VUE_APP_FIREBASE_STORAGE_BUCKET=$VUE_APP_FIREBASE_STORAGE_BUCKET \
                                --build-arg VUE_APP_FIREBASE_MESSAGING_SENDER_ID=$VUE_APP_FIREBASE_MESSAGING_SENDER_ID \
                                --build-arg VUE_APP_FIREBASE_APP_ID=$VUE_APP_FIREBASE_APP_ID \
                                --build-arg VUE_APP_FIREBASE_MEASUREMENT_ID=$VUE_APP_FIREBASE_MEASUREMENT_ID \
                                -t $FULL_IMAGE_NAME .
                            rm .env
                        '''
                    }
                }
            }
        }

        stage('Push to Artifact Registry') {
            steps {
                withCredentials([file(credentialsId: 'gcp-service-account-key', variable: 'GOOGLE_APPLICATION_CREDENTIALS')]) {
                    sh '''
                        gcloud auth activate-service-account --key-file=$GOOGLE_APPLICATION_CREDENTIALS
                        gcloud auth configure-docker ${ARTIFACT_REGISTRY_URL} --quiet
                        docker push $FULL_IMAGE_NAME
                    '''
                }
            }
        }

        stage('Deploy to GKE') {
            steps {
                withCredentials([file(credentialsId: 'gcp-service-account-key', variable: 'GOOGLE_APPLICATION_CREDENTIALS')]) {
                    sh '''
                        gcloud auth activate-service-account --key-file=$GOOGLE_APPLICATION_CREDENTIALS
                        gcloud config set project $PROJECT_ID
                        gcloud container clusters get-credentials $CLUSTER_NAME --region $REGION

                        kubectl apply -f frontend/k8s/frontend.yml
                        kubectl rollout restart deployment/frontend-app
                    '''
                }
            }
        }
    }

    post {
        success {
            echo '✅ Pipeline finished successfully!'
        }
        failure {
            echo '❌ Pipeline failed. Please check the logs.'
        }
    }
}
