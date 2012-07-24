/*global 
 jquery:true,
 _: true,
 $:true,
 angular: true
*/

/**
 * quickGrade Module
 */
var QuickGrade = angular.module('quickGrade', []);

function Data () {
  var assignments = [{
    "assignmentName": "Lab 1",
    "submissions": [
      {
        "studentName": "A Student",
        "answers": [
          {
            "answer": "ipsum lorem dolor sit amet"
          }
        ]
      },
      {        
        "studentName": "Bobby Tables",
        "answers": [
          {
            "answer": "don't drop them!"
          }
        ]
      },
      {        
        "studentName": "Jimbo",
        "answers": [
          {
            "answer": "have some jello pudding!"
          }
        ]
      }
    ]
  }];
  
  this.dump = function () {
    console.log(assignments);
  }
  
  this.getAssignment = function (assignmentNumber) {
    return assignments[assignmentNumber];
  };
  
  this.getAnswersForQuestion = function (assignmentNumber, questionNumber) {
    return _.map(assignments[assignmentNumber].submissions, function (submission, index) {
      return submission.answers[questionNumber];
    });
  };
  
  // TODO: make a submit answer function instead of mutating
}

QuickGrade.factory('data', function () {
  return new Data();
});

QuickGrade.controller('assignmentController', function ($scope, data) {
  var currentAssignment = 0;
  var currentAnswer = 0;
  var currentQuestion = 0;
  
  var currentAnswersToGrade = _.shuffle(data.getAnswersForQuestion(currentAssignment, currentQuestion));
    
  $scope.dump = function () {
    data.dump();
  };

  $scope.getCurrentAnswer = function () {
    return currentAnswersToGrade[currentAnswer].answer || "No Answer Provided";
  };
  
  $scope.getCurrentAnswerNumber = function () {
    return currentAnswer;
  }

  $scope.getPreviousAnswer = function () {
    if (currentAnswer > 0) {
      return currentAnswersToGrade[currentAnswer - 1].answer || "No Answer Provided";      
    } else {
      return "No Previous Answer";
    }
  };
  
  $scope.getNumberOfSubmissions = function () {
    return currentAnswersToGrade.length
  };
  
  $scope.nextAnswer = function () {
    currentAnswersToGrade[currentAnswer].grade = 7;
    currentAnswer = currentAnswer + 1;
  };
  
  $scope.assignGrade = function () {}
  
  $scope.nextRound = function () {
    currentAnswer = 0;
  };
  
  $scope.onLastAnswer = function () {
    return currentAnswer === $scope.getNumberOfSubmissions() - 1;
  };
});