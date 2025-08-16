pipeline {
    agent any

    options {
        // Prevent Jenkins from doing implicit SCM checkouts on each new node/agent
        skipDefaultCheckout(true)
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                // Stash the workspace so Dockerized stages don't need to git clone
                stash name: 'src', includes: '**/*', excludes: '**/node_modules/**, **/coverage/**'
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
                        args '-u root:root'
                    }
                }
                stages {
                    stage('Restore Sources') {
                        steps {
                            deleteDir() // ensure clean workspace in the container
                            unstash 'src'
                        }
                    }
                    stage('Install') {
                        steps {
                            sh 'npm ci'
                        }
                    }
                    stage('Lint and Format Check') {
                        steps {
                            // Fail on lint errors
                            sh 'npm run lint'

                            // Make format check non-fatal: warn if needed but keep going
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
                deleteDir()
                unstash 'src'
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
                deleteDir()
                unstash 'src'
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
                deleteDir()
                unstash 'src'
                sh 'npm ci --omit=dev'
                sh 'npm audit --production'
            }
        }

        stage('Manual Approval') {
            when { branch 'main' }
            steps {
                input 'Deploy to Production?'
            }
        }

        stage('Backup Database') {
            steps { echo 'Backing up the database...' }
        }

        stage('Deploy') {
            steps { echo 'Deploying...' }
        }

        stage('Migrate Database') {
            steps { echo 'Running database migrations...' }
        }
    }

    post {
        always {
            echo 'Pipeline finished.'
            cleanWs()
        }
        success { echo "Build succeeded." }
        failure { echo "Build failed." }
        aborted { echo "Build aborted." }
    }
}
