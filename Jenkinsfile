pipeline {
    agent {
        docker {
            image 'node:22'
            args '-u root'
        }
    }

    environment {
        CI = 'true'
        DATABASE_URL = "file:./dev.db"
        NEXT_PUBLIC_API_URL = "http://localhost:3000/api"
        CACHE_DIR = '.npm_cache'
    }

    options {
        skipDefaultCheckout(false)
    }

    stages {
        stage('Prepare Cache') {
            steps {
                sh '''
                    mkdir -p $CACHE_DIR
                    npm config set cache $CACHE_DIR --global
                '''
            }
        }

        stage('Install Dependencies') {
            steps {
                cache(path: '.npm', key: 'npm-cache-${HASH}', restoreKeys: ['npm-cache-']) {
                    sh '''
                        if [ ! -d "node_modules" ]; then
                          echo "Installing npm dependencies..."
                          npm ci
                        else
                          echo "Dependencies already installed."
                        fi
                    '''
                }

                // Install Playwright only if browsers are not installed
                sh '''
                    if [ ! -d "playwright-browsers" ]; then
                      echo "Installing Playwright browsers..."
                      npx playwright install --with-deps
                    else
                      echo "Playwright browsers already installed."
                    fi
                '''
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

        stage('Run E2E Tests') {
            steps {
                sh 'npm run test:e2e'
            }
        }
    }

    post {
        always {
            echo 'Resetting database...'
            sh 'npm run db:reset || echo "Database reset failed or unnecessary"'
        }
    }
}
