pipeline {
    agent { label 'agent' }

    tools {
        nodejs 'node:22'
    }

    environment {
        CI = 'true'
        DATABASE_URL = "file:./dev.db"
        NEXT_PUBLIC_API_URL = "http://localhost:3000/api"
    }

    options {
        cache(maxCacheSize: 2, caches: [
            cache(path: 'node_modules', key: 'node-modules-cache', restoreKeys: ['node-modules-cache'])
        ])
    }

    stages {
        stage('Install Dependencies') {
            steps {
                echo '📦 Installing dependencies'
                sh 'npm install'
                sh 'npx playwright install --with-deps'
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
                sh 'npm run build'
            }
        }
    }

    post {
        always {
            echo '🧹 Cleaning up...'
            sh 'npm run db:reset'
        }
    }
}
