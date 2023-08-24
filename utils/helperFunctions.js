import PresCardValues from "./presidentCardValues.json";

/**
 * Shuffles an array's values and returns the modified array
 *
 * @param {Array} arr The array to shuffle
 * @returns {Array} The shuffled array
 */
export function shuffle(arr) {
  let currentIndex = arr.length;
  let tempVal, randomIndex;

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    tempVal = arr[currentIndex];
    arr[currentIndex] = arr[randomIndex];
    arr[randomIndex] = tempVal;
  }

  return arr;
}

/**
 * Returns the index of the player who should play next
 * in crazy eights. Takes into account players no longer in the game
 * and skipping turns with Jacks.
 *
 * @param {object} gameState The state of the game in Firebase
 * @param {boolean} skipTurn True if a turn should be skipped (i.e. A jack is played in Crazy Eights)
 * @returns {number} The index of the next player that should play
 */
export function getNextPlayerCE(gameState, skipTurn) {
  let playerIndex = (gameState.turn + 1) % gameState.players.length,
    playersSkipped = 0;

  while (
    gameState.players[playerIndex].hand.length === 0 ||
    (skipTurn ? playersSkipped !== 1 : playersSkipped !== 0)
  ) {
    if (gameState.players[playerIndex].hand.length > 0) {
      playersSkipped++;
    }

    playerIndex = (playerIndex + 1) % gameState.players.length;
  }

  return playerIndex;
}

/**
 * Returns the index of the player who should play next
 * in go fish. Takes into account players no longer in the game
 *
 * @param {object} gameState The state of the game in Firebase
 */
export function getNextPlayerGoFish(gameState) {
  let playerIndex = (gameState.turn + 1) % gameState.players.length;

  while (
    gameState.players[playerIndex].hand.length === 0 &&
    gameState.pond.length === 0
  ) {
    playerIndex = (playerIndex + 1) % gameState.players.length;
  }

  return playerIndex;
}

/**
 * Comparison function used for sorting cards in president
 *
 * @param {object} cardOne The first card in the comparison
 * @param {object} cardTwo The second card in the comparison
 */
export function cardComparison(cardOne, cardTwo) {
  return PresCardValues[cardOne.rank] - PresCardValues[cardTwo.rank];
}

/**
 * Function that returns a null if a play is valid in President, and
 * an error message if a play is invalid.
 *
 * @param {Array} cards Cards the user wants to play
 * @param {Array} currentCard The cards currently played
 * @returns {string|null} An error message if the move is invalid, null if not
 */
export function isValidPlay(cards, currentCard) {
  let errorMessage = null;

  if (cards.length === 0) {
    errorMessage = "You must select some cards to play";
  } else if (currentCard !== null) {
    if (cards[0].rank === "2") {
      if (currentCard.length === 1 && cards.length > 1) {
        errorMessage = "You only need to play 1 two to burn this card";
      } else if (
        currentCard.length > 1 &&
        cards.length !== currentCard.length - 1
      ) {
        errorMessage = `You need ${currentCard.length - 1} two${
          currentCard.length - 1 > 1 ? "s" : ""
        } to burn these cards`;
      }
    } else {
      if (currentCard.length !== cards.length) {
        errorMessage = `You have to play ${currentCard.length} card${
          currentCard.length > 1 ? "s" : ""
        }`;
      } else if (
        PresCardValues[currentCard[0].rank] > PresCardValues[cards[0].rank]
      ) {
        errorMessage = `You have to play a card of equal or greater value than a ${
          currentCard[0].rank
        }`;
      }
    }
  }

  return errorMessage;
}

/**
 * Helper function to determine whether or not the cards are going to be burned
 * based on the ongoing play.
 *
 * @param {Array} playedCard Array of cards to be played
 * @param {Array} currentCard Array of cards currently played
 * @returns {boolean} True if the cards will be burned, false if not
 */
export function isCardBurned(playedCard, currentCard) {
  if (currentCard === null) {
    if (playedCard[0].rank === "2") {
      return true;
    } else {
      return false;
    }
  } else if (playedCard[0].rank === "2") {
    if (currentCard.length === 1 && playedCard.length === 1) {
      return true;
    } else if (currentCard.length === playedCard.length + 1) {
      return true;
    } else {
      return false;
    }
  } else {
    if (
      playedCard.length === currentCard.length &&
      playedCard[0].rank === currentCard[0].rank
    ) {
      return true;
    } else {
      return false;
    }
  }
}

/**
 * Determines whether or not everyone in the game has passed on a played
 * card
 *
 * @param {number} oldTurn The turn of the last player who passed
 * @param {number} newTurn The turn of the next player
 * @param {number} lastPlayerToPlay The turn number of the last player to make a move
 * @returns {boolean} True if everyone has passed, false if not
 */
export function hasEveryonePassed(oldTurn, newTurn, lastPlayerToPlay) {
  if (newTurn > oldTurn) {
    return oldTurn < lastPlayerToPlay && newTurn >= lastPlayerToPlay;
  } else {
    return oldTurn < lastPlayerToPlay || newTurn >= lastPlayerToPlay;
  }
}

/**
 * Gives the rank of the player based on the leaderboard from last game.
 * Results include: "president", "vice-president", "neutral", "vice-bum", and "bum"
 *
 * @param {string} name The name of the player we want to get the rank of
 * @param {Array} playerRankings The leaderboard of the players from the last game
 * @returns {string} The rank of the player for the next round
 */
export function getPlayerRankPres(name, playerRankings) {
  const numPlayers = playerRankings.length;
  const playerIndex = playerRankings.findIndex(
    (playerName) => playerName === name
  );

  if (playerIndex === 0) {
    return "president";
  } else if (playerIndex === numPlayers - 1) {
    return "bum";
  } else if (numPlayers >= 4 && playerIndex === 1) {
    return "vice-president";
  } else if (numPlayers >= 4 && playerIndex === numPlayers - 2) {
    return "vice-bum";
  } else {
    return "neutral";
  }
}
