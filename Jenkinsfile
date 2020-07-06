def testPassed = true

pipeline {
    agent any

stages {
    stage('build icu project') {
      steps {
        script{

          try {

            sh 'docker build -t israelfrank/learn_docker:root .'
          } catch (Exception e) {

             testPassed = false
          }
           
        }
            sh 'docker login -u israelfrank -p 0533346872'
            sh 'docker push israelfrank/learn_docker:root'

      }   
    
    post {
       always {
        stash includes: 'docker-compose.production.yml',name: 'builtSources'//,onlyIfSuccessful: true
      }
    }
    
  }     
    stage('build icu automation') {
      steps {
           // if(testPassed){
            git branch: 'master',
            credentialsId: '13b4c3e0-c0fb-4d8c-9fae-53e8bcd9161e',
            url: 'https://gitlab.com/israelfrank/tryjenkins.git'
           
            sh 'mvn clean compile test-compile'           
        }
      }
    post {
      always {
        stash includes: '**/*.*', name: 'appConfig'//,onlyIfSuccessful: true
      }
      
      }
  
    }
     
    stage('deploy icu project') {
      steps{
     
       unstash 'builtSources'

          sh 'docker-compose -f docker-compose.production.yml up -d'
          sh 'sleep 15 '
      }
      // ([$class: 'CopyArtifact',
      //     projectName: 'build icu project',
      //     filter: '*.docker-compose.production.yml']) {

    }
   stage(' running automaton test') {
      steps{
          unstash 'appConfig'

          sh 'mvn test'
     }
    }
  }
 
}


