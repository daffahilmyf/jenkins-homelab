pipeline {
    agent none  // we'll define agents per-stage (Docker)

    stages {
        stage('Checkout') {
            agent any
            steps {
                checkout scm
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
                agent {
                    docker {
                        image "node:${NODE_VERSION}"
                        // run as root to avoid file permission issues; remove if you prefer default user
                        args '-u root:root'
                    }
                }
                stages {
                    stage('Install') {
                        steps {
                            sh 'npm ci'
                        }
                    }
                    stage('Lint and Format Check') {
                        steps {
                            sh 'npm run lint'
                            sh 'npm run format:check'
                        }
                    }
                    stage('Unit Tests') {
                        steps {
                            sh 'npm test -- --coverage'
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
            agent {
                docker {
                    image 'node:lts'
                    args '-u root:root'
                }
            }
            steps {
                sh 'npm ci'
                sh 'npm run build'
            }
        }

        stage('E2E Tests') {
            agent {
                docker {
                    image 'node:lts'
                    args '-u root:root'
                }
            }
            steps {
                // Adjust if your E2E needs the app started, services, or extra tooling
                sh 'npm ci'
                sh 'npm run test:e2e'
            }
        }

        stage('Security Scan') {
            agent {
                docker {
                    image 'node:lts'
                    args '-u root:root'
                }
            }
            steps {
                sh 'npm ci --omit=dev'   // keep prod tree accurate for audit
                sh 'npm audit --production'
            }
        }

        stage('Manual Approval') {
            when {
                branch 'main'
            }
            agent any
            steps {
                input 'Deploy to Production?'
            }
        }

        stage('Backup Database') {
            agent any
            steps {
                echo 'Backing up the database...'
            }
        }

        stage('Deploy') {
            agent any
            steps {
                echo 'Deploying...'
            }
        }

        stage('Migrate Database') {
            agent any
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
