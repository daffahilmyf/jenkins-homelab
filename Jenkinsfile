pipeline {
    agent none
    options {
        skipDefaultCheckout(true)
    }

    stages {
        stage('Checkout') {
            agent { label 'docker-agent' }
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

        stage('Install (Node 22)') {
            agent {
                docker {
                    image 'node:22'
                    args '-u root:root'
                    reuseNode true
                }
            }
            steps {
                deleteDir()
                unstash 'src'
                sh 'npm ci'
            }
        }

        stage('Lint & Format Check (Node 22)') {
            agent {
                docker {
                    image 'node:22'
                    args '-u root:root'
                    reuseNode true
                }
            }
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

        stage('Unit Tests (Node 22)') {
            agent {
                docker {
                    image 'node:22'
                    args '-u root:root'
                    reuseNode true
                }
            }
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
                        reportName: 'Code Coverage - Node 22'
                    ])
                }
            }
        }

        stage('Build (Node 22)') {
            agent {
                docker {
                    image 'node:22'
                    args '-u root:root'
                    reuseNode true
                }
            }
            steps {
                deleteDir()
                unstash 'src'
                sh 'npm ci'
                sh 'npm run build'
            }
        }

        stage('E2E Tests (Node 22)') {
            agent {
                docker {
                    image 'node:22'
                    args '-u root:root'
                    reuseNode true
                }
            }
            steps {
                deleteDir()
                unstash 'src'
                sh 'npm ci'
                sh 'npm run test:e2e'
            }
        }

        stage('Security Scan (Node 22)') {
            agent {
                docker {
                    image 'node:22'
                    args '-u root:root'
                    reuseNode true
                }
            }
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
            agent { label 'docker-agent' }
            steps {
                echo '📦 Backing up the database...'
            }
        }

        stage('Deploy') {
            agent { label 'docker-agent' }
            steps {
                echo '🚀 Deploying...'
            }
        }

        stage('Migrate Database') {
            agent { label 'docker-agent' }
            steps {
                echo '📂 Running database migrations...'
            }
        }
    }

    post {
        always {
            echo 'Pipeline finished.'
            node {
                cleanWs()
            }
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
