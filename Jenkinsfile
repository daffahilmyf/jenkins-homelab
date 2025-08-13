pipeline {
    agent {
        label 'python-agent'
    }
    stages {
        stage('Check Python') {
            steps {
                sh 'python --version'
                sh 'pip --version'
            }
        }
        stage('Install and Run') {
            steps {
                sh '''
                    pip install requests
                    python -c "import requests; print(requests.__version__)"
                '''
            }
        }
    }
}
