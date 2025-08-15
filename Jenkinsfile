pipeline {
    agent any

    environment {
        // Use the credential IDs you created in Jenkins
        DISCORD_WEBHOOK = credentials('discord-webhook-url')
        GITHUB_TOKEN = credentials('github-personal-access-token')
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                // Set the initial PR status to pending
                githubNotify(
                    context: 'Jenkins CI',
                    description: 'Build is running...',
                    status: 'PENDING',
                    token: env.GITHUB_TOKEN
                )
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
                    stage('Run Quality Checks') {
                        steps {
                            sh "nvm use ${NODE_VERSION} && npm install"
                            parallel(
                                "Lint and Format Check": {
                                    sh 'npm run lint'
                                    sh 'npm run format:check'
                                },
                                "Unit Tests": {
                                    sh 'npm test -- --coverage'
                                }
                            )
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
            discordNotifier(
                webhookUrl: env.DISCORD_WEBHOOK,
                message: "✅ SUCCESS: ${env.JOB_NAME} - Build #${env.BUILD_NUMBER}",
                status: "SUCCESS",
                color: 2293546
            )
            githubNotify(
                context: 'Jenkins CI',
                description: 'Build finished successfully',
                status: 'SUCCESS',
                token: env.GITHUB_TOKEN
            )
        }
        failure {
            discordNotifier(
                webhookUrl: env.DISCORD_WEBHOOK,
                message: "❌ FAILURE: ${env.JOB_NAME} - Build #${env.BUILD_NUMBER}",
                status: "FAILURE",
                color: 15728640
            )
            githubNotify(
                context: 'Jenkins CI',
                description: 'Build failed',
                status: 'FAILURE',
                token: env.GITHUB_TOKEN
            )
        }
        aborted {
            discordNotifier(
                webhookUrl: env.DISCORD_WEBHOOK,
                message: "ABORTED: ${env.JOB_NAME} - Build #${env.BUILD_NUMBER}",
                status: "ABORTED",
                color: 10066329
            )
        }
    }
}
