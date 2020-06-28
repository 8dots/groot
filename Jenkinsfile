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
    stage('Checking out dependencies') {
      steps {
        dir('deps') {
            checkout resolveScm(source: git('https://gitlab.com/israelfrank/tryjenkins.git'), targets: [BRANCH_NAME, 'master'])
        }
            sh 'mvn clean compile test-compile'           
    }
}
