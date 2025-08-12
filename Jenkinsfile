pipeline {
  agent { label 'nodejs' }

  stages {
    stage('Check Node Version') {
      steps {
        sh 'node -v'
        sh 'npm -v'
      }
    }

    stage('Install Dependencies') {
      steps {
        sh 'npm install'
      }
    }

    stage('Lint') {
      steps {
        sh 'npm run lint || true'
      }
    }

    stage('Test') {
      steps {
        sh 'npm test || true'
      }
    }
  }
}
