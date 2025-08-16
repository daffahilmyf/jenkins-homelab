pipeline {
    agent any

    tools {
        // Make sure to configure a NodeJS installation named 'NodeJS 22' in Jenkins' Global Tool Configuration.
        nodejs 'NodeJS 22'
    }

    environment {
        CI = 'true'
        DATABASE_URL = "file:./dev.db"
        NEXT_PUBLIC_API_URL = "http://localhost:3000/api"
    }

    stages {
        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Lint and Format Check') {
            steps {
                sh 'npm run lint'
                sh 'npm run format:check'
            }
        }

        stage('Run Unit and Integration Tests') {
            steps {
                sh 'npm run test'
            }
        }

        stage('Database Migration') {
            steps {
                sh 'npx prisma migrate deploy'
            }
        }

        stage('Run E2E Tests') {
            steps {
                sh 'npm run test:e2e'
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }
    }

    post {
        always {
            script {
                sh 'npx prisma migrate reset --force'
            }
        }
    }
}
