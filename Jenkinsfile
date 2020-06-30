pipeline {
    agent any

stages {
    stage('build icu project') {
      steps {
		        sh 'docker build -t israelfrank/learn_docker:root .'
            sh 'docker login -u israelfrank -p 0533346872'
            sh 'docker push israelfrank/learn_docker:root'

           
          }  
    post {
       always {
          archiveArtifacts artifacts: 'docker-compose.production.yml', onlyIfSuccessful: true
      }
    }
    
    }     
    stage('build icu automation') {
      steps {
           
             git branch: 'master',
            credentialsId: '13b4c3e0-c0fb-4d8c-9fae-53e8bcd9161e',
            url: 'https://gitlab.com/israelfrank/tryjenkins.git'
           
            sh 'mvn clean compile test-compile'           
        }
    post {
      always {
        archiveArtifacts artifacts: '**/*.*', onlyIfSuccessful: true
      }
    }
    
    }

    stage('copy artifact and compose') {
      stepsstep([$class: 'CopyArtifact', filter: 'docker-compose.production.yml', fingerprintArtifacts: true, flatten: true, projectName: 'echo-develop-js-pipeline', selector: [$class: 'SpecificBuildSelector', buildNumber: '${BUILD_NUMBER}'], target: './client/public/vendor/echo/'])
    }
  }
} 

