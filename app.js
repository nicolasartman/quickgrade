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
  var assignments = [{
    "assignmentName": "Lab 1",
    "questions": [
      {
        "question": "What would you say if someone asked you a generic placeholder question?"
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
            "answer": "Retro blog cliche, direct trade fingerstache keffiyeh twee. Bicycle rights blog mustache, williamsburg scenester flexitarian cred twee pour-over letterpress pork belly. Beard williamsburg authentic fanny pack bespoke helvetica. Narwhal portland DIY single-origin coffee pour-over, beard semiotics gastropub brooklyn PBR banh mi. Williamsburg thundercats ethnic, flexitarian odd future wes anderson biodiesel wayfarers sartorial craft beer dreamcatcher. Marfa cred ethnic tumblr. Forage ethical retro, four loko raw denim synth lo-fi polaroid 3 wolf moon beard quinoa fanny pack."
          }
        ]
      },
      {
        "studentName": "Bobby Tables",
        "answers": [
          {
            "answer": "Retro brooklyn flexitarian street art bespoke wolf. Trust fund carles butcher pickled chillwave. Banksy 3 wolf moon seitan kale chips, cosby sweater butcher vice small batch raw denim post-ironic beard. Mcsweeney's thundercats brooklyn, flexitarian chambray occupy 8-bit four loko. Brooklyn beard vice, lo-fi post-ironic mcsweeney's fingerstache butcher skateboard selvage pour-over twee locavore wes anderson. Keytar fap pork belly, small batch american apparel lo-fi ethnic marfa pickled tofu banksy authentic whatever twee pop-up. 3 wolf moon tattooed tofu kale chips, jean shorts skateboard pop-up retro post-ironic aesthetic."
          }
        ]
      },
      {
        "studentName": "Jimbo",
        "answers": [
          {
            "answer": "Biodiesel fingerstache whatever freegan, occupy small batch keffiyeh gentrify selvage sustainable ethical dreamcatcher 3 wolf moon. Mlkshk marfa lomo dreamcatcher, umami organic wayfarers fanny pack wolf mixtape irony aesthetic occupy fingerstache cosby sweater. DIY tattooed four loko portland butcher, letterpress swag tumblr sriracha banksy quinoa fanny pack sustainable chillwave. Scenester etsy narwhal, before they sold out typewriter chambray gentrify thundercats. Gentrify swag fanny pack hoodie pitchfork etsy. Pour-over irony helvetica polaroid stumptown mlkshk. Synth scenester locavore, sartorial squid cray helvetica bespoke sustainable odd future ethical farm-to-table VHS selvage brunch."
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


QuickGrade.controller('menuBarController', function ($scope, data, settings) {
  $scope.settings = settings;
  
  $scope.alert = function (message) {
    window.alert(message);
  };

  window.URL = window.webkitURL || window.URL;
  window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder;

  var builder = new window.BlobBuilder();
  // builder.append(JSON.stringify(data.getAssignment(0)));
  builder.append("cheese");
  console.log(builder.getBlob('text/plain'));
  console.log(window.URL.createObjectURL(builder.getBlob('text/plain')) === undefined);

  $scope.dataBlobURL = window.URL.createObjectURL(builder.getBlob('text/plain'));
});


// TODO: migrate state to service
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