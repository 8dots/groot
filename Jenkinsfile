pipeline {
    agent any

stages {
    stage('build icu project') {
      steps {
          script {
        def r = sh script: "wget -q http://localhost:3000/ -O /dev/null", returnStatus: true
          sh "echo $r"
        }
            sh 'docker build -t israelfrank/learn_docker:${BUILD_TAG} .'
            sh 'docker login -u $LOGIN_DOCKER_HUB -p $PASSWORD_DOCKER_HUB'
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
    //check if up
    stage('deploy icu project') {
      steps{
     
       unstash 'composeFile'

          sh 'docker-compose -f docker-compose.production.yml up -d'
          timeout(time: 15 , unit: 'SECONDS') {
       waitUntil {
         script {
          def r = sh script: "wget -q http://localhost:3000/ -O /dev/null", returnStatus: true
         // def r = sh 'curl -Is http://localhost:3000/ |head -n 1', returnStatus:true
          sh 'echo r'
         return r == 0
         }
      }
     }
          sh 'docker login -u $LOGIN_DOCKER_HUB -p $PASSWORD_DOCKER_HUB'
          sh 'docker run  israelfrank/learn_docker:latest'
          sh 'docker-compose down'
      }
    }
  
  }
 
}


