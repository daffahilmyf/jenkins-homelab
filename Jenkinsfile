pipeline {
    agent {
        docker {
            image 'python:3.11'
            label 'docker-agent'
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
