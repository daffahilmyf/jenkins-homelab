pipeline {
    agent {
        docker {
            image 'node:22'
            label 'docker-agent'
            args '-u root:root'
        }
    }

    options {
        skipDefaultCheckout(true)
    }

    stages {
        stage('Setup & Checkout') {
            steps {
                sh '''
                    mkdir -p ~/.ssh
                    chmod 700 ~/.ssh
                    ssh-keyscan -t ed25519 github.com >> ~/.ssh/known_hosts
                    chmod 644 ~/.ssh/known_hosts
                '''
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Lint & Format') {
            steps {
                sh 'npm run lint'
                sh 'npm run format:check || echo "⚠️ Code not formatted properly"'
            }
        }

        stage('Unit Tests') {
            steps {
                sh 'npm test -- --coverage'
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }

        stage('E2E Tests') {
            steps {
                sh 'npm run test:e2e'
            }
        }
    }

    post {
        always {
            echo 'Pipeline finished.'
            cleanWs()
        }
        success {
            echo '✅ Build succeeded.'
        }
        failure {
            echo '❌ Build failed.'
        }
    }
}
