pipeline {
    agent {
        docker {
            image 'python:3.11'
        }
    }

    stages {
        stage('Run Python') {
            steps {
                sh 'python --version'
                sh 'pip install requests'
                sh 'python -c "import requests; print(requests.__version__)"'
            }
        }
    }
}
