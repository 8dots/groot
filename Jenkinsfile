pipeline {
    agent any

stages {
    stage('build icu project') {
      steps {
            sh 'docker build -t israelfrank/learn_docker:${BUILD_TAG} .'
            sh 'docker login -u israelfrank -p 0533346872'
            sh 'docker push israelfrank/learn_docker:${BUILD_TAG}'
            sh 'sed -i "s/learn_docker:root/learn_docker:${BUILD_TAG}/g" docker-compose.production.yml'
      }
    
    post {
       always {
            archiveArtifacts artifacts: 'docker-compose.production.yml', onlyIfSuccessful: true 
            stash includes: 'docker-compose.production.yml', name: 'composeFile'
      } 
    }
  }
    // stage('build icu automation') {
    //   steps {
        
    //         git branch: 'master',
    //         credentialsId: '13b4c3e0-c0fb-4d8c-9fae-53e8bcd9161e',
    //         url: 'https://gitlab.com/israelfrank/tryjenkins.git'
           
    //         sh 'mvn clean compile test-compile'           
    //     }
      
    // post {
    //   always {
    //     stash includes: '**/*.*', name: 'appConfig'//,onlyIfSuccessful: true
    //   }
      
    //   }
  
    // }
    
    //check if up
    stage('deploy icu project') {
      steps{
     
       unstash 'composeFile'

          sh 'docker-compose -f docker-compose.production.yml up -d'
          sh 'sleep 15 '
          sh 'docker login -u israelfrank -p 0533346872'
          sh 'docker run jenkins-automation_ci_cd-7'
          sh 'docker-compose down'
      }
    }
    // stage(' running automaton test') {
    //   steps{
    //       unstash 'appConfig'

    //       sh 'mvn test'
    //  }
    // }
  }
 
}


