pipeline {
    agent {
        docker {
            image 'node:22'  // Use official Node.js 22 image
            args '-u root'   // Run as root for permissions
        }
    }

    environment {
        CI = 'true'
        DATABASE_URL = "file:./dev.db"  // SQLite used for Prisma
        NEXT_PUBLIC_API_URL = "http://localhost:3000/api"
    }

    options {
        // Cache node_modules to speed up subsequent builds
        cache(path: 'node_modules', key: "npm-${hashFiles('package-lock.json')}")
    }

    stages {
        stage('Install Dependencies') {
            steps {
                sh 'npm install'
                sh 'npx playwright install --with-deps'
            }
        }

        stage('Checks') {
            failFast true
            parallel {
                stage('Lint and Format Check') {
                    steps {
                        sh 'npm run lint'
                        sh 'npm run format:check'
                    }
                }
                stage('Type Check') {
                    steps {
                        sh 'npm run typecheck'
                    }
                }
                stage('Run Unit and Integration Tests') {
                    steps {
                        sh 'npm run test'
                    }
                    post {
                        always {
                            junit 'reports/junit.xml'
                        }
                    }
                }
            }
        }

        stage('Database Migration') {
            steps {
                // This step ensures the migrations are valid.
                sh 'npm run db:migrate:deploy'
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build'  // Required for E2E tests
            }
        }
    }

    post {
        always {
            // Reset DB after all tests (clean environment)
            // This command will drop the database and re-run all migrations.
            sh 'npm run db:reset'
        }
    }
}
