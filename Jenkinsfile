pipeline {
    agent any

  stages {
      stage('get_commit_msg') {
        steps {
          script {
              env.GIT_COMMIT_MSG = sh (script: 'git log -1 --pretty=%B ${GIT_COMMIT}', returnStdout: true).trim()
              env.GIT_SHORT_COMMIT = sh(returnStdout: true, script: "git log -n 1 --pretty=format:'%h'").trim()
              env.GIT_COMMITTER_EMAIL = sh (script: "git --no-pager show -s --format='%ae'", returnStdout: true  ).trim()
        }
      }
    }
    stage('build icu project') {
     
      environment {
       ORIGINAL = "learn_docker:icu-${currentBuild.previousBuild.number}"
   }
      steps {
          sh "echo ${ORIGINAL}"
            sh 'docker build -t israelfrank/learn_docker:icu-${BUILD_NUMBER} .'
            sh 'docker login -u $LOGIN_DOCKER_HUB -p $PASSWORD_DOCKER_HUB'
            sh 'docker push israelfrank/learn_docker:icu-${BUILD_NUMBER}'
            sh 'sed -i "s/${ORIGINAL}/learn_docker:icu-${BUILD_NUMBER}/g" docker-compose.production.yml'
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
          sh "echo $r"
          return r == 0
         }
      }
     }   
          sh 'docker login -u $LOGIN_DOCKER_HUB -p $PASSWORD_DOCKER_HUB'
          sh 'docker run -v /var/lib/jenkins/workspace/icu/results:/app/reports/  israelfrank/learn_docker:latest'

          sh 'docker-compose down'
      }
      post {
        always {
          archiveArtifacts artifacts: 'results/**/*.*'
          discordSend description:'**Build**:' + " " + env.BUILD_NUMBER + '\n **Branch**:' + " " + env.GIT_BRANCH + '\n **Status**:' + " " +  currentBuild.result + '\n**Link To Logs**:' + " " + env.BUILD_URL+'console' +'\n \n \n **Commit ID**:'+ " " + env.GIT_SHORT_COMMIT + '\n **commit massage**:' + " " + env.GIT_COMMIT_MSG + '\n **commit email**:' + " " + env.GIT_COMMITTER_EMAIL, footer: '', image: '', link: 'http://127.0.0.1:8080/job/automation_ci_cd/lastSuccessfulBuild/artifact/results/extent.html', result: currentBuild.result, thumbnail: '', title: ' link to result', webhookURL: 'https://discord.com/api/webhooks/735056754051645451/jYad6fXNkPMnD7mopiCJx2qLNoXZnvNUaYj5tYztcAIWQCoVl6m2tE2kmdhrFwoAASbv'   
      }
      //  failure {
      //     discordSend description:'**Build**:' + " " + env.BUILD_NUMBER + '\n **Branch**:' + " " + env.GIT_BRANCH + '\n **Status**:' + " " +  currentBuild.result + '\n**Link To Logs**:' + " " + env.BUILD_URL+'console' +'\n \n \n **Commit ID**:'+ " " + env.GIT_SHORT_COMMIT + '\n **commit massage**:' + " " + env.GIT_COMMIT_MSG + '\n **commit email**:' + " " + env.GIT_COMMITTER_EMAIL ,result: currentBuild.result, title: 'link to result', link: 'http://127.0.0.1:8080/job/automation_ci_cd/lastSuccessfulBuild/artifact/results/extent.html', webhookURL:'https://discord.com/api/webhooks/735056754051645451/jYad6fXNkPMnD7mopiCJx2qLNoXZnvNUaYj5tYztcAIWQCoVl6m2tE2kmdhrFwoAASbv'             
      // }
    }  
  }
 }
}


