pipeline {
    agent {
        docker {
            image 'node:22'
            label 'docker-agent'
            args '-u root:root'
            reuseNode true
        }
    }

    options {
        skipDefaultCheckout(true)
    }

    stages {
        stage('Checkout') {
            steps {
                sh '''
                    set -eu
                    mkdir -p ~/.ssh
                    chmod 700 ~/.ssh
                    ssh-keyscan -t ed25519 github.com >> ~/.ssh/known_hosts
                    chmod 644 ~/.ssh/known_hosts
                '''
                checkout scm
                stash name: 'src', includes: '**/*', excludes: '**/node_modules/**, **/coverage/**'
            }
        }

        stage('Install') {
            steps {
                deleteDir()
                unstash 'src'
                sh 'npm ci'
            }
        }

        stage('Lint & Format Check') {
            steps {
                deleteDir()
                unstash 'src'
                sh 'npm ci'
                sh 'npm run lint'
                script {
                    def rc = sh(returnStatus: true, script: 'npm run format:check')
                    if (rc != 0) {
                        echo '⚠️ Prettier found formatting issues. Consider running: npm run format'
                    }
                }
            }
        }

        stage('Unit Tests') {
            steps {
                deleteDir()
                unstash 'src'
                sh 'npm ci'
                sh 'npm test -- --coverage'
            }
            post {
                always {
                    publishHTML(target: [
                        allowMissing: true,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'coverage',
                        reportFiles: 'lcov-report/index.html',
                        reportName: 'Code Coverage'
                    ])
                }
            }
        }

        stage('Build') {
            steps {
                deleteDir()
                unstash 'src'
                sh 'npm ci'
                sh 'npm run build'
            }
        }

        stage('E2E Tests') {
            steps {
                deleteDir()
                unstash 'src'
                sh 'npm ci'
                sh 'npm run test:e2e'
            }
        }

        stage('Security Scan') {
            steps {
                deleteDir()
                unstash 'src'
                sh 'npm ci --omit=dev'
                sh 'npm audit --production'
            }
        }

        stage('Manual Approval') {
            when {
                branch 'main'
            }
            steps {
                input 'Deploy to Production?'
            }
        }

        stage('Backup Database') {
            steps {
                echo '📦 Backing up the database...'
            }
        }

        stage('Deploy') {
            steps {
                echo '🚀 Deploying...'
            }
        }

        stage('Migrate Database') {
            steps {
                echo '📂 Running database migrations...'
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
        aborted {
            echo '⚠️ Build aborted.'
        }
    }
}
