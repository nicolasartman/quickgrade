/*global
 window: true,
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
    "questions": [
      {
        "question": "I am a two line question that spans not only one line, but in fact two!"
      },
      {
        "question": "How much?!"
      }
    ],
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
            "answer": "don't drop them! don't drop them! don't drop them! don't drop them! don't drop them! don't drop them! don't drop them! don't drop them! don't drop them! don't drop them! don't drop them! don't drop them! don't drop them! don't drop them! don't drop them! don't drop them! don't drop them! don't drop them! don't drop them! don't drop them! don't drop them! don't drop them! don't drop them! don't drop them! don't drop them! don't drop them! don't drop them! don't drop them! don't drop them! don't drop them! don't drop them! don't drop them! don't drop them! don't drop them! don't drop them! don't drop them! don't drop them! don't drop them! don't drop them! don't drop them! don't drop them! don't drop them! don't drop them! don't drop them! don't drop them! don't drop them! don't drop them! don't drop them! don't drop them! don't drop them! don't drop them! don't drop them! don't drop them! don't drop them! don't drop them! don't drop them! don't drop them! don't drop them! don't drop them! "
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
  };
  
  this.getQuestion = function (assignmentNumber, questionNumber) {
    return assignments[assignmentNumber].questions[questionNumber].question;
  };

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

QuickGrade.factory('settings', function () {
  return (function () {
    var self = {};
  
    self.menuItems = [
      {
        "name": "Settings",
        "children": [
          // {
          //   "name": "Something"
          // }
        ]
      },
      {
        "name": "Help"
      }
    ];
    
    return self;
  }());
});

QuickGrade.factory('data', function () {
  return new Data();
});


QuickGrade.controller('menuBarController', function ($scope, settings) {
  $scope.settings = settings;
  
  $scope.alert = function (message) {
    window.alert(message);
  };
});


QuickGrade.controller('assignmentController', function ($scope, data, settings) {
  var currentAssignment = 0;
  var currentAnswer = 0;
  var currentQuestionNumber = 0;

  var currentAnswersToGrade = _.shuffle(data.getAnswersForQuestion(currentAssignment, currentQuestionNumber));

  $scope.dump = function () {
    data.dump();
  };

  $scope.enterGrade = function (grade) {
    var curr = currentAnswersToGrade[currentAnswer];

    if (_.isArray(curr.grades)) {
      curr.grades.push(grade);
    } else {
      curr.grades = [grade];
    }

    currentAnswer++;
  };
  
  $scope.getCurrentQuestion = function () {
    return data.getQuestion(currentAssignment, currentQuestionNumber);
  };

  $scope.getCurrentSubmission = function () {
    return currentAnswersToGrade[currentAnswer].answer || "";
  };

  $scope.getCurrentSubmissionNumber = function () {
    return currentAnswer;
  };

  $scope.getPreviousSubmission = function () {
    if (currentAnswer > 0) {
      return currentAnswersToGrade[currentAnswer - 1].answer;
    } else {
      return "";
    }
  };

  $scope.getPreviousSubmissionGrade = function () {
    if (currentAnswer > 0) {
      // most recently entered grade for this question
      return _.last(currentAnswersToGrade[currentAnswer - 1].grades);
    }
  };

  $scope.getNumberOfSubmissions = function () {
    return currentAnswersToGrade.length;
  };

  $scope.nextSubmission = function () {
    currentAnswersToGrade[currentAnswer].grade = 7;
    currentAnswer = currentAnswer + 1;
  };

  $scope.nextRound = function () {
    currentAnswer = 0;
  };

  $scope.roundComplete = function () {
    return currentAnswer >= $scope.getNumberOfSubmissions();
  };
});