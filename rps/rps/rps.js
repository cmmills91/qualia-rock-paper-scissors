Players = new Mongo.Collection("players");

const rpsRules = {"Scissors" : "Paper", "Paper" : "Rock", "Rock" : "Scissors"};
const SCISSORS = "Scissors";
const ROCK = "Rock";
const PAPER = "Paper";

if (Meteor.isClient) {

  var getPlayerOne = function() {
    var one = Players.find({player: 1}).fetch()[0];
    return one;
  }
  
  var getPlayerTwo = function() {
    var two = Players.find({player: 2}).fetch()[0];
    return two;
  }

  var recordMove = function(player, event) {
    var playerId = Players.find({player: player}).fetch()[0]._id;
    
    switch(event.target.name) {
      case SCISSORS:
        move = SCISSORS;
        break;
      case ROCK:
        move = ROCK;
        break;
      case PAPER:
        move = PAPER;
        break;
      default:
        move = null;
    }
    console.log(move);
    Players.update(playerId, {$set: {ready: true, move: move}});
  }

  var haveBothPlayersGone = function() {
      var playerOne = Players.find({"player": 1}).fetch()[0];
      var playerTwo = Players.find({"player": 2}).fetch()[0];
      console.log(playerOne.move);
      console.log(playerTwo.move)
      if (playerOne.move != null && playerTwo.move != null) {
        return true;
      } else {
        return false;
      }
  }

  var assessWin = function() {
      var playerOne = Players.find({"player": 1}).fetch()[0];
      var playerTwo = Players.find({"player": 2}).fetch()[0];
      
      var playerOneResult;
      var playerTwoResult;

      if (playerOne.move == playerTwo.move) {
        playerOneResult = false;
        playerTwoResult = false;
      }
      if (rpsRules[playerOne.move] == playerTwo.move) {
        playerOneResult = true;
        playerTwoResult = false;
      }
      if (rpsRules[playerTwo.move] == playerOne.move) {
        playerOneResult = false;
        playerTwoResult = true;
      }

      Players.update(playerOne._id, {$set: {win: playerOneResult}});
      Players.update(playerTwo._id, {$set: {win: playerTwoResult}});

  }

  Template.player1.helpers({
    selectedMove: function() {
      return getPlayerOne().move;
    },
    unlock: function() {
      var p1 = getPlayerOne();
      var disabled;
      if (p1.move == null) {
        return {disabled: false};
      } else {
        return {disabled: true};
      }
    }
  });

  Template.player2.helpers({
    selectedMove: function() {
      return getPlayerTwo().move;
    },
    unlock: function() {
      var p2 = getPlayerTwo();
      var disabled;
      if (p2.move == null) {
        return {disabled: false};
      } else {
        return {disabled: true};
      }
    }
  });

  Template.player1status.helpers({
    status: getPlayerOne,
    self: getPlayerTwo
  });
  
  Template.player2status.helpers({
    status: getPlayerTwo,
    self: getPlayerOne
  });

  Template.instructions.helpers({
    p1: getPlayerOne,
    p2: getPlayerTwo,
  });

  Template.gameMessage.helpers({
    message: function() {
      var p1 = getPlayerOne();
      var p2 = getPlayerTwo();
      if (p1.win == true) {
        return p1.move +" beats " + p2.move + ". Player 1 Wins!";
      }
      if (p2.win == true) {
        return p2.move +" beats " + p1.move + ". Player 2 Wins!";
      }
      if (p1.win == false && p2.win == false) {
        return "Both players played " + p1.move + ". Tie game. Hit New Game to play again.";
      }
      return "New game started!";
    }
  });

  Template.player1.events({
    "click .move": function () {
      recordMove(1, event);
      if (haveBothPlayersGone()) {
        assessWin();
      }
    }
  });

  Template.player2.events({
    "click .move": function () {
      recordMove(2, event);
      if (haveBothPlayersGone()) {
        assessWin();
      }
    }
  });
 
  Template.instructions.events({
    "click .newgame": function() {
      var players = Players.find({}).fetch();
      for (var i=0; i<players.length; i++) {
        Players.update(players[i]._id, {$set: {"move": null, "ready": false, "win": null}});
      }
    },
    "click #howto": function() {
      var img = $("#directions");
      if (img.css('display') == "none") {
        img.show()
      } else {
        img.hide()
      }
      console.log(img.css('display'))
    }
  });

}


Router.route('/');
Router.route('/player1');
Router.route('/player2');
Router.route('/example');