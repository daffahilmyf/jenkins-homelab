pipeline {
    agent any

    stages {
        stage('Build') {
            steps {
                script {
                    sh 'python app.py'
                }
            }
        }
        stage('Test') {
            steps {
                echo 'Testing..'
            }
        }
        stage('Deploy') {
            steps {
                echo 'Deploying..'
            }
        }
    }
}
