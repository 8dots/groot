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
            checkout resolveScm(source: git('git@gitlab.com:israelfrank/tryjenkins.git'), targets: [BRANCH_NAME, 'master'])
        }
            sh 'mvn test'           
      }
    }
  }
}
