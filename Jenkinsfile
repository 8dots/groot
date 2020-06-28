pipeline {
    agent any

stages {
    stage('Build') {
      steps {
		        sh 'docker build -t israelfrank/learn_docker:root .'
            sh 'docker login -u israelfrank -p 0533346872'
            sh 'docker push israelfrank/learn_docker:root'
        }  
      } 
    }
}
