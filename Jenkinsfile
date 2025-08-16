pipeline {
    agent { label 'docker-agent' }

    options {
        skipDefaultCheckout(true)
    }

    stages {
        stage('Checkout') {
            steps {
                script {
                    docker.image('node:22').inside('-u root:root') {
                        sh '''
                            mkdir -p ~/.ssh
                            chmod 700 ~/.ssh
                            ssh-keyscan -t ed25519 github.com >> ~/.ssh/known_hosts
                            chmod 644 ~/.ssh/known_hosts
                        '''
                        checkout scm
                        stash name: 'src', includes: '**/*', excludes: '**/node_modules/**, **/coverage/**'
                    }
                }
            }
        }

        stage('Install') {
            steps {
                script {
                    docker.image('node:22').inside('-u root:root') {
                        deleteDir()
                        unstash 'src'
                        sh 'npm ci'
                    }
                }
            }
        }

        stage('Lint & Format') {
            steps {
                script {
                    docker.image('node:22').inside('-u root:root') {
                        deleteDir()
                        unstash 'src'
                        sh 'npm ci'
                        sh 'npm run lint'
                        def rc = sh(returnStatus: true, script: 'npm run format:check')
                        if (rc != 0) {
                            echo '⚠️ Prettier found formatting issues. Consider running: npm run format'
                        }
                    }
                }
            }
        }

        stage('Unit Tests') {
            steps {
                script {
                    docker.image('node:22').inside('-u root:root') {
                        deleteDir()
                        unstash 'src'
                        sh 'npm ci'
                        sh 'npm test -- --coverage'
                    }
                }
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
                script {
                    docker.image('node:22').inside('-u root:root') {
                        deleteDir()
                        unstash 'src'
                        sh 'npm ci'
                        sh 'npm run build'
                    }
                }
            }
        }

        stage('E2E Tests') {
            steps {
                script {
                    docker.image('node:22').inside('-u root:root') {
                        deleteDir()
                        unstash 'src'
                        sh 'npm ci'
                        sh 'npm run test:e2e'
                    }
                }
            }
        }

        stage('Security Scan') {
            steps {
                script {
                    docker.image('node:22').inside('-u root:root') {
                        deleteDir()
                        unstash 'src'
                        sh 'npm ci --omit=dev'
                        sh 'npm audit --production'
                    }
                }
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
