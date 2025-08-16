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
        stage('Restore Cache') {
            steps {
                script {
                    // This will restore node_modules if previously cached
                    try {
                        unstash 'node_modules_cache'
                        echo '✅ Restored node_modules from cache'
                    } catch (err) {
                        echo '⚠️ No cache found, fresh install will proceed'
                    }
                }
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
                sh 'npx playwright install --with-deps'
            }
        }

        stage('Save Cache') {
            steps {
                script {
                    // Stash node_modules for later stages or reuse
                    stash includes: 'node_modules/**', name: 'node_modules_cache'
                    echo '📦 Cached node_modules'
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
