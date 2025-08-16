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
        CACHE_DIR = "${WORKSPACE}/.cache"
    }

    options {
        timestamps()
        timeout(time: 20, unit: 'MINUTES')
    }

    stages {
        stage('Restore Cache') {
            steps {
                script {
                    if (fileExists("${CACHE_DIR}/node_modules")) {
                        echo 'Restoring node_modules from cache...'
                        sh 'cp -R ${CACHE_DIR}/node_modules ./'
                    } else {
                        echo 'No cache found. node_modules will be installed fresh.'
                    }
                }
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
                sh 'npx playwright install --with-deps'

                script {
                    echo 'Saving node_modules to cache...'
                    sh '''
                        mkdir -p ${CACHE_DIR}
                        cp -R node_modules ${CACHE_DIR}/
                    '''
                }
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
