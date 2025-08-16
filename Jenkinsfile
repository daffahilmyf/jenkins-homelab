pipeline {
    agent { label 'agent' }

    tools {
        nodejs 'node:22'
    }

    environment {
        CI = 'true'
        DATABASE_URL = "file:./dev.db"
        NEXT_PUBLIC_API_URL = "http://localhost:3000/api"
    }

    stages {
        stage("Install & Cache Dependencies") {
            steps {
                script {
                    githubChecksPublish name: 'Install & Cache Dependencies', status: 'IN_PROGRESS'
                    try {
                        cache(maxCacheSize: 2048, defaultBranch: 'main', caches: [
                            arbitraryFileCache(
                                path: "node_modules",
                                cacheValidityDecidingFile: "package-lock.json"
                            ),
                            arbitraryFileCache(
                                path: ".next/cache",
                                cacheValidityDecidingFile: "package-lock.json"
                            )
                        ]) {
                            sh "npm install"
                            sh "npx playwright install --with-deps"
                        }
                        githubChecksPublish name: 'Install & Cache Dependencies', conclusion: 'success'
                    } catch (e) {
                        githubChecksPublish name: 'Install & Cache Dependencies', conclusion: 'failure'
                        throw e
                    }
                }
            }
        }

        stage('Lint and Format Check') {
            steps {
                script {
                    githubChecksPublish name: 'Lint and Format Check', status: 'IN_PROGRESS'
                    try {
                        sh 'npm run lint'
                        sh 'npm run format:check'
                        githubChecksPublish name: 'Lint and Format Check', conclusion: 'success'
                    } catch (e) {
                        githubChecksPublish name: 'Lint and Format Check', conclusion: 'failure'
                        throw e
                    }
                }
            }
        }

        stage('Run Unit and Integration Tests') {
            steps {
                script {
                    githubChecksPublish name: 'Unit and Integration Tests', status: 'IN_PROGRESS'
                    try {
                        sh 'npm run test'
                        githubChecksPublish name: 'Unit and Integration Tests', conclusion: 'success'
                    } catch (e) {
                        githubChecksPublish name: 'Unit and Integration Tests', conclusion: 'failure'
                        throw e
                    }
                }
            }
        }

        stage('Database Migration') {
            steps {
                script {
                    githubChecksPublish name: 'Database Migration', status: 'IN_PROGRESS'
                    try {
                        sh 'npm run db:migrate:deploy'
                        githubChecksPublish name: 'Database Migration', conclusion: 'success'
                    } catch (e) {
                        githubChecksPublish name: 'Database Migration', conclusion: 'failure'
                        throw e
                    }
                }
            }
        }

        stage('Build') {
            steps {
                script {
                    githubChecksPublish name: 'Build', status: 'IN_PROGRESS'
                    try {
                        sh 'npm run build'
                        githubChecksPublish name: 'Build', conclusion: 'success'
                    } catch (e) {
                        githubChecksPublish name: 'Build', conclusion: 'failure'
                        throw e
                    }
                }
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
