var NUM_PLAYERS = 2;

// The root of your game data.
var GAME_LOCATION = 'https://rock-paper-scissors-e426e.firebaseio.com/';

// A location under GAME_LOCATION that will store the list of 
// players who have joined the game (up to MAX_PLAYERS).
var PLAYERS_LOCATION = 'player_list';

// A location under GAME_LOCATION that you will use to store data 
// for each player (their game state, etc.)
var PLAYER_DATA_LOCATION = 'player_data';


function go() {
  var userId = prompt('Username?', 'Guest');
  // Consider adding '/<unique id>' if you have multiple games. 
  assignPlayerNumberAndPlayGame(userId);
};

function playGame(myPlayerNumber, userId, justJoinedGame, gameRef) {
  var playerDataRef = gameRef.ref(PLAYER_DATA_LOCATION + '/' + myPlayerNumber);
  alert('You are player number ' + myPlayerNumber + 
      '.  Your data will be located at ' + playerDataRef.toString());

  if (justJoinedGame) {
    alert('Doing first-time initialization of data.');
    playerDataRef.set({userId: userId, state: 'game state'});
  }
}


function assignPlayerNumberAndPlayGame(userId) {
  var playerListRef = database.ref('/player_list');
  var myPlayerNumber, alreadyInGame = false;

  playerListRef.transaction(function(playerList) {
    // Attempt to (re)join the given game. Notes:
    //
    // 1. Upon very first call, playerList will likely appear null (even if the
    // list isn't empty), since Firebase runs the update function optimistically
    // before it receives any data.
    // 2. The list is assumed not to have any gaps (once a player joins, they 
    // don't leave).
    // 3. Our update function sets some external variables but doesn't act on
    // them until the completion callback, since the update function may be
    // called multiple times with different data.
    if (playerList === null) {
      playerList = [];
    }

    for (var i = 0; i < playerList.length; i++) {
      if (playerList[i] === userId) {
        // Already seated so abort transaction to not unnecessarily update playerList.
        alreadyInGame = true;
        myPlayerNumber = i; // Tell completion callback which seat we have.
        return;
      }
    }

    if (i < NUM_PLAYERS) {
      // Empty seat is available so grab it and attempt to commit modified playerList.
      playerList[i] = userId;  // Reserve our seat.
      myPlayerNumber = i; // Tell completion callback which seat we reserved.
      return playerList;
    }

    // Abort transaction and tell completion callback we failed to join.
    myPlayerNumber = null;
  }, function (error, committed) {
    // Transaction has completed.  Check if it succeeded or we were already in
    // the game and so it was aborted.
    if (committed || alreadyInGame) {
      playGame(myPlayerNumber, userId, !alreadyInGame, gameRef);
    } else {
      alert('Game is full.  Can\'t join. :-(');
    }
  });
}



var rps = {
    wins: 0,
    ties: 0,
    losses: 0,
    currentUserGuess: "",
    currentComputerGuess: "",
    makeComputerGuess: function () {
        var computerChoices = ["r", "p", "s"];
        rps.currentComputerGuess = computerChoices[Math.floor(Math.random() * computerChoices.length)];
    },
    handleUserGuess: function () {
        $(document).keydown(event);
        console.log(event);
        var key = event.key;

        if (key === "r" || key == "p" || key == "s") {
            rps.currentUserGuess = event.key;
            rps.makeComputerGuess();
            rps.playGame();
            rps.printResults();
        }
    },
    printResults: function () {
        var html = "";
        html += "<div>Your Guess: " + rps.currentUserGuess + "</div>";
        html += "<div>Computer's Guess: " + rps.currentComputerGuess + "</div>";
        html += "<div>Wins: " + rps.wins + "</div>";
        html += "<div>Losses: " + rps.losses + "</div>";
        html += "<div>Ties: " + rps.ties + "</div>";
        $("#results").html(html);
    },
    playGame: function () {
        if (rps.currentComputerGuess == rps.currentUserGuess) {
            rps.ties++;
        }

        if ((rps.currentUserGuess === "r") && (rps.currentComputerGuess === "s")) {
            rps.wins++;
        }

        if ((rps.currentUserGuess === "r") && (rps.currentComputerGuess === "p")) {
            rps.losses++;
        }

        if ((rps.currentUserGuess === "s") && (rps.currentComputerGuess === "r")) {
            rps.losses++;
        }

        if ((rps.currentUserGuess === "s") && (rps.currentComputerGuess === "p")) {
            rps.wins++;
        }

        if ((rps.currentUserGuess === "p") && (rps.currentComputerGuess === "r")) {
            rps.wins++;
        }

        if ((rps.currentUserGuess === "p") && (rps.currentComputerGuess === "s")) {
            rps.losses++;
        }

    }
};


document.onkeyup = rps.handleUserGuess;