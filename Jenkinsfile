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
            //sh 'git config --global user.name "israelfrank'
            //sh  'git config --global user.password 0533346872'
             git branch: 'master',
            credentialsId: '13b4c3e0-c0fb-4d8c-9fae-53e8bcd9161e',
            url: 'https://gitlab.com/israelfrank/tryjenkins.git'
           
            sh 'mvn test'           
      }
    }
  }
 }
}
