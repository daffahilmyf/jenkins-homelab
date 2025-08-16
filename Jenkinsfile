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

    stages {
        stage("Install & Cache Dependencies") {
            steps {
                cache(maxCacheSize: 512, defaultBranch: 'main', caches: [
                    arbitraryFileCache(
                        path: "node_modules",
                        cacheValidityDecidingFile: "package-lock.json"
                    ),
                    arbitraryFileCache(
                        path: ".next/cache",
                        cacheValidityDecidingFile: "package-lock.json"
                    )
                ]) {
                    sh "npm install"
                    sh "npx playwright install --with-deps"
                }
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
            echo 'Cleaning up...'
            sh 'npm run db:reset'
        }
    }
}
