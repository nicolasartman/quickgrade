/*global
 window: true,
 FileReader: true,
 jquery:true,
 _: true,
 $:true,
 angular: true,
 CSVToArray: true,
 dummyData: true,
 localLib: true,
*/

/**
 * QuickGrade Module
 */
var QuickGrade = angular.module('quickGrade', []);

function Data () {
  // temp dummy data
  var assignments = dummyData.assignments;

  this.dump = function () {
    console.log(assignments);
  };
  
  this.importAssignment = function (assignment) {
    // TODO: prompt the user to ignore certain questions, choose student names, etc
    assignments.push(assignment);
    console.log(assignment);
    alert("Import Successful!");
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
      return bool ? "Show" : "Hide";
    };
    
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

QuickGrade.factory('io', function () {
  return {
    "gDocsSpreadsheetToAssignment": function (fileName, fileContents) {
      // TODO: allow choosing of which column is student names
      var rows = localLib.CSVToArray(fileContents);
      
      return {
        "assignmentName": fileName,
        "questions": _.map(rows[0], function (val) {
          return {
            "question": val
          };
        }),
        "submissions": _.map(_.rest(rows), function (row) {
          return {
            "answers": _.map(row, function (studentResponse) {
              return {
                "answer": studentResponse
              };
            })
          };
        })
      }
    },
    "prompt": function (fields, okButtonCallback) {
      this.showPrompt = true;
    },
    "showPrompt": false
  };
});

QuickGrade.directive('modalPrompt', function (io) {
  return function postLink(scope, element, attributes) {
    // Toggle visibility
    scope.$watch(function () {
      return io.showPrompt;
    }, function (value) {
      console.log("called")
      console.log(value)
      if (value) {
        element.removeClass("hidden"); 
      } else {        
        element.addClass("hidden"); 
      }
    });
  };
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
QuickGrade.controller('assignmentController', function ($scope, data, settings, io) {
  var currentAssignment = 0;
  var currentAnswer = -1;
  var currentQuestionNumber = 0;

  var currentAnswersToGrade = _.shuffle(data.getAnswersForQuestion(currentAssignment, currentQuestionNumber));

  $scope.settings = settings;

  $scope.dump = function () {
    data.dump();
    io.prompt();
  };
  
  $scope.openAssignment = function (assignmentNumber) {
    currentAssignment = assignmentNumber;
    currentAnswer = -1;
  }
  
  $scope.setProposedGrade = null;
  $scope.setProposedGrade = function (grade) {
    $scope.proposedGrade = grade;
  };
  
  $scope.getAssignmentProgressSummary = function () {
    var assignment = data.getAssignment(currentAssignment);
    var summary = {};
    // determine the question with the highest number of grading rounds done so far
    // new Array(...) bit is a hack to make it work with ng-repeat
    summary.maxRounds = new Array(_.max(_.map(assignment.submissions[0].answers, function (answer) {
      return answer.grades ? answer.grades.length : 0;
    })));
    
    summary.questions = _.map(assignment.submissions[0].answers, function (answer) {
      return answer.grades;
    });
    
    return summary;
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
    if (currentAnswersToGrade[currentAnswer] && currentAnswersToGrade[currentAnswer].answer) {
      return currentAnswersToGrade[currentAnswer].answer;
    } else {
      return "";
    }
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
  
  $scope.newRound = function (questionNumber) {
    console.log(questionNumber);
    currentAnswer = 0;
    currentQuestionNumber = questionNumber;
    currentAnswersToGrade = _.shuffle(data.getAnswersForQuestion(currentAssignment, currentQuestionNumber));
  };

  $scope.roundInProgress = function () {
    return currentAnswer >= 0 && currentAnswer < $scope.getNumberOfSubmissions();
  };
});

QuickGrade.directive('fileImporter', function (io, data) {
  return function (scope, element, attrs) {
      function handleFileSelect(event) {
        // Stop bubbling
        event.stopPropagation();
        event.preventDefault();
        
        var file = event.target.files[0];
        
        var reader = new FileReader();
        
        reader.onloadend = function (loadEvent) {
          var newDoc = io.gDocsSpreadsheetToAssignment(file.name, loadEvent.target.result);
          console.log(newDoc);
          data.importAssignment(newDoc);
          io.showPrompt = true;
        };
        reader.onerror = function (errorEvent) {
          console.log("FILE READ ERROR");
          console.log(errorEvent);
        };
        reader.readAsText(file);
        
        console.log(file);
      }

      console.log(element);
      element[0].addEventListener('change', handleFileSelect, false);
    }
});