pipeline {
    agent {
        docker {
            image 'node:22'  // Use official Node.js 22 image
            args '-u root'   // Run as root for permissions
        }
    }

    environment {
        CI = 'true'
        DATABASE_URL = "file:./dev.db"  // SQLite used for Prisma
        NEXT_PUBLIC_API_URL = "http://localhost:3000/api"
    }

    stages {
        stage('Install Dependencies') {
            steps {
                sh 'npm install'
                sh 'npx playwright install --with-deps'  // Install Playwright browsers
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
                sh 'npm run db:migrate:deploy'
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build'  // Required for E2E tests
            }
        }

        stage('Run E2E Tests') {
            steps {
                sh 'npm run test:e2e'
            }
        }
    }

    post {
        always {
            // Reset DB after all tests (clean environment)
            sh 'npm run db:reset'
        }
    }
}
