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
  // temp dummy data
  var assignments = dummyData.assignments;

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
    
    // Default settings
    self.showPaperStack = false;
    self.showJustGradedStack = true;
    
    self.boolToVisibilityVerb = function (bool) {
      console.log("blarp");
      return bool ? "Show" : "Hide";
    }
    
    self.menuItems = [
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


QuickGrade.controller('menuBarController', function ($scope, data, settings) {
  $scope.settings = settings;
  
  $scope.alert = function (message) {
    window.alert(message);
  };

  window.URL = window.webkitURL || window.URL;
  window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder;

  var builder = new window.BlobBuilder();
  builder.append(JSON.stringify(data.getAssignment(0), null, 2));

  // TODO: revoke url when this changes -- use a $watch perhaps
  $scope.dataBlobURL = window.URL.createObjectURL(builder.getBlob('text/plain'));
});


// TODO: migrate state to service
QuickGrade.controller('assignmentController', function ($scope, data, settings) {
  var currentAssignment = 0;
  var currentAnswer = 0;
  var currentQuestionNumber = 0;

  var currentAnswersToGrade = _.shuffle(data.getAnswersForQuestion(currentAssignment, currentQuestionNumber));

  $scope.settings = settings;

  $scope.dump = function () {
    data.dump();
  };
  
  $scope.setProposedGrade = null;
  $scope.setProposedGrade = function (grade) {
    $scope.proposedGrade = grade;
  }

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