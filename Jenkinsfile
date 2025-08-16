pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                // githubNotify(...) // disabled
            }
        }

        stage('Build and Test') {
            matrix {
                axes {
                    axis {
                        name 'NODE_VERSION'
                        values '20', '22', 'lts'
                    }
                }
                stages {
                    stage('Install') {
                        steps {
                            sh "nvm use ${NODE_VERSION} && npm install"
                        }
                    }
                    stage('Lint and Format Check') {
                        steps {
                            sh "nvm use ${NODE_VERSION} && npm run lint"
                            sh "nvm use ${NODE_VERSION} && npm run format:check"
                        }
                    }
                    stage('Unit Tests') {
                        steps {
                            sh "nvm use ${NODE_VERSION} && npm test -- --coverage"
                        }
                        post {
                            always {
                                publishHTML(target: [
                                    allowMissing: false,
                                    alwaysLinkToLastBuild: true,
                                    keepAll: true,
                                    reportDir: 'coverage',
                                    reportFiles: 'lcov-report/index.html',
                                    reportName: "Code Coverage - Node ${NODE_VERSION}"
                                ])
                            }
                        }
                    }
                }
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

        stage('Security Scan') {
            steps {
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
                echo 'Backing up the database...'
            }
        }

        stage('Deploy') {
            steps {
                echo 'Deploying...'
            }
        }

        stage('Migrate Database') {
            steps {
                echo 'Running database migrations...'
            }
        }
    }

    post {
        always {
            echo 'Pipeline finished.'
            cleanWs()
        }
        success {
            echo "Build succeeded."
            // githubNotify(...) // disabled
            // discordNotifier(...) // disabled
        }
        failure {
            echo "Build failed."
            // githubNotify(...) // disabled
            // discordNotifier(...) // disabled
        }
        aborted {
            echo "Build aborted."
            // discordNotifier(...) // disabled
        }
    }
}
