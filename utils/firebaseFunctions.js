import firebase from '@react-native-firebase/app';
import firestore from '@react-native-firebase/firestore';
import pondTemplate from '../utils/pondTemplate.json';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaxPlayers from './gameMaxPlayers.json';
import PresCardValues from './presidentCardValues.json';
import {
  shuffle,
  getNextPlayerCE,
  getNextPlayerGoFish,
  cardComparison,
  isCardBurned,
  hasEveryonePassed,
  getPlayerRankPres,
} from './helperFunctions';

/**********************************
 * Async Storage
 **********************************/

/**
 * Saves game locally, so that the app can remember that the user
 * is a part of this game. This prevents users from joining a game
 * twice from the same phone.
 *
 * @param {string} gameId The ID of the game in Firebase
 * @param {string} name The user's name in the game
 */
export async function setLocalData(gameId, name) {
  await AsyncStorage.getItem('cardGamesActive', (err, result) => {
    if (err) {
      console.error(err.message);
    } else {
      let data;

      if (result === null) {
        data = {};
        data[gameId] = name;
      } else {
        data = JSON.parse(result);
        data[gameId] = name;
      }

      AsyncStorage.setItem('cardGamesActive', JSON.stringify(data))
        .then(() => {
          console.log('Game added locally');
        })
        .catch(error => {
          console.error(error.message);
        });
    }
  });
}

/**
 * Retrieves the games saved locally, and returns them in proper
 * JSON format.
 *
 * @returns {object} JSON representation of the locally saved games
 */
export async function getLocalData() {
  let localData;

  await AsyncStorage.getItem('cardGamesActive', (err, res) => {
    if (err) {
      console.error(err.message);
    }

    localData = res === null ? '{}' : res;
  });

  return JSON.parse(localData);
}

/**
 * Checks to see if the user has already joined the specified game.
 *
 * @param {string} gameId The ID of the game in Firebase
 * @returns {boolean} True if user is in game, false if not
 */
export async function isInGame(gameId) {
  let inGame = false;
  await AsyncStorage.getItem('cardGamesActive', (err, result) => {
    if (err) {
      console.error(err.message);
    } else {
      const data = result === null ? {} : JSON.parse(result);
      if (gameId in data) {
        inGame = true;
      }
    }
  }).catch(reason => {
    console.error(reason);
  });

  return inGame;
}

/**
 * Removes games from local storage that have been removed from firebase
 */
export async function cleanLocalStorage() {
  let cleanedStorageString = await AsyncStorage.getItem(
    'cardGamesActive',
  ).catch(error => {
    cleanedStorageString = null;
  });

  let jsonStorage =
    cleanedStorageString !== null ? JSON.parse(cleanedStorageString) : {};
  let newStorage = {};

  if (Object.keys(jsonStorage).length > 0) {
    await firestore()
      .collection('liveGames')
      .where(
        firebase.firestore.FieldPath.documentId(),
        'in',
        Object.keys(jsonStorage).slice(0, 10),
      )
      .get()
      .then(data => {
        data.forEach((val, ind) => {
          newStorage[val.id] = jsonStorage[val.id];
        });
      })
      .catch(error => {
        console.log(error.message);
      });
  }

  console.log('Cleaned local storage');
  await AsyncStorage.setItem('cardGamesActive', JSON.stringify(newStorage));
}

/**
 * Removes a game from local storage object
 *
 * @param {string} gameId The ID of the game in Firebase
 */
export async function removeGameLocally(gameId) {
  let localGames = await AsyncStorage.getItem('cardGamesActive');

  let localGamesJSON = localGames ? JSON.parse(localGames) : {};

  if (gameId in localGamesJSON) {
    delete localGamesJSON[gameId];
  } else {
    throw new Error('Game already removed');
  }

  await AsyncStorage.setItem('cardGamesActive', JSON.stringify(localGamesJSON));
}

/**
 * Determines whether or not the user has played a game of president on the app.
 * If they haven't, the user's local storage is updated to reflect that they now
 * have.
 *
 * @returns {boolean} True if the user has previously played president, false if not.
 */
export async function hasPlayedPres() {
  let localStoreVal = null;

  await AsyncStorage.getItem('playedPres', (err, res) => {
    if (err) {
      console.error(err.message);
    }

    localStoreVal = res;
  });

  if (localStoreVal !== null) {
    return true;
  } else {
    await AsyncStorage.setItem('playedPres', 'y')
      .then(() => {
        console.log('First time playing president!');
      })
      .catch(error => {
        console.error(error.message);
      });

    return false;
  }
}

/**********************************
 * General Firebase
 **********************************/

/**
 * Cancel game (i.e. Remove the game from Firebase)
 *
 * @param {string} gameId Cancel game (i.e. Remove the game from Firebase)
 */
export async function cancelGame(gameId) {
  await firestore().collection('liveGames').doc(gameId).delete();
}

/**
 * Reverts a completed game back to its original state so that the game can
 * be played again
 *
 * @param {string} gameId The ID of the game in Firebase
 */
export async function resetGame(gameId) {
  const document = firestore().collection('liveGames').doc(gameId);

  await document.get().then(doc => {
    const data = doc.data();

    if (data.game === 'goFish') {
      const resetPlayers = data.players.map(player => {
        return {name: player.name, hand: [], numPairs: 0, pairedCards: []};
      });

      document.update({
        finished: false,
        started: false,
        players: resetPlayers,
        pond: pondTemplate,
        gameUpdate: 'Game Starting...',
        turn: 0,
      });
    } else if (data.game === 'crazyEights') {
      const resetPlayers = data.players.map(player => {
        return {name: player.name, hand: []};
      });

      document.update({
        finished: false,
        started: false,
        players: resetPlayers,
        pond: pondTemplate,
        cardsPlayed: [],
        gameUpdate: 'Game Starting...',
        turn: 0,
        currentCard: null,
        playerRankings: [],
        toPickUp: 0,
        mostRecentMove: [],
      });
    } else if (data.game === 'president') {
      const resetPlayers = data.players.map(player => {
        return {
          name: player.name,
          hand: [],
          rank: player.rank,
        };
      });

      document.update({
        finished: false,
        started: false,
        players: resetPlayers,
        pond: pondTemplate,
        gameUpdate: 'Game Starting...',
        turn: 0,
        currentCard: null,
        playerRankings: [],
        mostRecentMove: [],
        burning: false,
        presPassedCards: false,
        vicePassedCards: resetPlayers.length > 3 ? false : true,
      });
    }
  });
}

/**
 * Remove the user from the players array in Firebase
 *
 * @param {string} name Name of the player that should be removed
 * @param {string} gameId The ID of the game in Firebase
 */
export async function leaveGame(name, gameId) {
  let document = firestore().collection('liveGames').doc(gameId);

  document.get().then(data => {
    if (data.exists) {
      let players = data.data().players;
      let newPlayers = [];

      players.forEach(player => {
        if (player.name !== name) {
          newPlayers.push(player);
        }
      });

      document.update({players: newPlayers});
    }
  });
}

/**
 * Logic for taking a card from the pond. It takes whatever card is at the bottom
 * of the deck, but because the deck is shuffled, it's essentially a random
 * card
 *
 * @param {string} gameId The ID of the game in Firebase
 * @param {string} name The name of the player that is taking from the pond
 * @returns {object} The card that the user drew from the pond
 */
export async function takeFromPond(gameId, name) {
  const document = firestore().collection('liveGames').doc(gameId);

  let cardDrawn;

  await document.get().then(async doc => {
    if (doc.exists) {
      let data = doc.data();
      let updatedGame = data;
      let playerOneIndex;

      // Finds the position of the user in the game's players array
      for (let i = 0; i < data.players.length; i++) {
        let playerName = data.players[i].name;
        if (playerName === name) {
          playerOneIndex = i;
          break;
        }
      }

      cardDrawn = updatedGame.pond.pop();

      if (updatedGame.game === 'crazyEights' && updatedGame.pond.length === 0) {
        updatedGame.pond = shuffle([...updatedGame.cardsPlayed]);
        updatedGame.cardsPlayed = [];
      }

      updatedGame.players[playerOneIndex].hand.push(cardDrawn);

      if (
        updatedGame.game === 'crazyEights' &&
        updatedGame.currentCard !== null &&
        cardDrawn.rank !== updatedGame.currentCard.rank &&
        cardDrawn.suit !== updatedGame.currentCard.suit &&
        cardDrawn.rank !== '8' &&
        updatedGame.players[updatedGame.turn].hand.filter(
          card =>
            updatedGame.currentCard.rank === card.rank ||
            updatedGame.currentCard.suit === card.suit ||
            card.rank === '8',
        ).length === 0
      ) {
        await document.update({
          players: updatedGame.players,
          pond: updatedGame.pond,
          turn: getNextPlayerCE(updatedGame, false),
          gameUpdate: `It's ${
            updatedGame.players[getNextPlayerCE(updatedGame, false)].name
          }'s turn`,
          cardsPlayed: updatedGame.cardsPlayed,
          mostRecentMove: [name, 'pickUp'],
        });
      } else {
        if (updatedGame.game === 'goFish') {
          await document.update({
            players: updatedGame.players,
            pond: updatedGame.pond,
            mostRecentMove: [name, 'pickUp'],
          });
        } else if (updatedGame.game === 'crazyEights') {
          await document.update({
            players: updatedGame.players,
            pond: updatedGame.pond,
            cardsPlayed: updatedGame.cardsPlayed,
            mostRecentMove: [name, 'pickUp'],
          });
        }
      }
    }
  });

  return cardDrawn;
}

/**
 * Makes a room code that is unique across the whole database.
 * After 10 failed attempts to make a unique code, it times out and
 * throws an error.
 *
 * @returns {string} A unique room code
 */
export async function generateRoomCode() {
  let numTries = 0;
  let exists = true;
  let gameId;
  const collection = firestore().collection('liveGames');

  while (numTries < 10 && exists) {
    gameId = Math.floor(Math.random() * 10000).toString();

    await collection
      .doc(gameId)
      .get()
      .then(doc => {
        if (doc.exists) {
          exists = true;
        } else {
          exists = false;
        }
      });

    numTries++;
  }

  if (numTries === 10) {
    throw new Error('Too many games ongoing. Try again later.');
  } else {
    return gameId.padStart(4, '0');
  }
}

/**
 * Creates game object in Firebase
 *
 * @param {string} creatorName The name of the user that created the game
 * @param {string} gameType The type of game to play (Currently one of "goFish", "crazyEights", or "president")
 * @returns {string} The ID of the game in Firebase
 */
export async function createGame(creatorName, gameType) {
  // Define create game logic here

  console.log('Creating game...');

  let gameObject;

  let gameId;

  await generateRoomCode()
    .then(id => {
      gameId = id;
    })
    .catch(error => {
      throw error;
    });

  if (gameType === 'goFish') {
    gameObject = {
      game: gameType,
      turn: 0,
      started: false,
      finished: false,
      players: [
        {
          name: creatorName,
          numPairs: 0,
          hand: [],
          pairedCards: [],
        },
      ],
      pond: pondTemplate,
      gameUpdate: 'Game Starting...',
      turnState: 'choosingCard',
      mostRecentMove: [],
    };
  } else if (gameType === 'crazyEights') {
    gameObject = {
      game: gameType,
      turn: 0,
      started: false,
      finished: false,
      players: [
        {
          name: creatorName,
          hand: [],
        },
      ],
      currentCard: null,
      pond: pondTemplate,
      cardsPlayed: [],
      gameUpdate: 'Game Starting...',
      toPickUp: 0,
      playerRankings: [],
      choosingSuit: false,
      mostRecentMove: [],
    };
  } else if (gameType === 'president') {
    gameObject = {
      game: gameType,
      turn: 0,
      started: false,
      finished: false,
      players: [
        {
          name: creatorName,
          hand: [],
          rank: 'neutral',
        },
      ],
      currentCard: null,
      pond: pondTemplate,
      gameUpdate: 'Game Starting...',
      playerRankings: [],
      mostRecentMove: [],
      burning: false,
      lastPlayer: 0,
      presPassedCards: true,
      vicePassedCards: true,
    };
  }

  await firestore()
    .collection('liveGames')
    .doc(gameId)
    .set(gameObject)
    .then(() => {
      console.log('Game created!');

      setLocalData(gameId, creatorName).catch(error => {
        throw new Error(error);
      });
    })
    .catch(error => {
      throw new Error(error);
    });

  return gameId;
}

/**
 * Adds a player to a game. Throws error when:
 * 1. User is already in the game
 * 2. The game has already started
 * 3. The game doesn't yet exist
 *
 * @param {string} name The name of the user that wants to join the game
 * @param {string} gameId The ID of the game in Firebase
 */
export async function joinGame(name, gameId) {
  // Define join game logic here
  console.log('Joining game...');

  const document = firestore().collection('liveGames').doc(gameId);

  let errorMessage = null;

  await document.get().then(async doc => {
    let userInGame = false;
    if (doc.exists) {
      let data = doc.data();

      if (
        !data.started &&
        data.game in MaxPlayers &&
        data.players.length < MaxPlayers[data.game] &&
        data.players.filter(player => player.name === name).length === 0
      ) {
        await isInGame(gameId).then(async inGame => {
          if (!inGame) {
            let currentPlayers = data.players;

            if (data.game === 'goFish') {
              currentPlayers.push({
                name: name,
                numPairs: 0,
                hand: [],
                pairedCards: [],
              });
            } else if (data.game === 'crazyEights') {
              currentPlayers.push({
                name: name,
                hand: [],
              });
            } else if (data.game === 'president') {
              currentPlayers.push({
                name: name,
                hand: [],
                rank: 'neutral',
              });
            }

            await document
              .update({players: currentPlayers})
              .then(() => {
                console.log('Player added!');
                setLocalData(gameId, name).catch(error => {
                  errorMessage = error.message;
                });
              })
              .catch(error => {
                errorMessage = error.message;
              });
          } else {
            userInGame = true;
          }
        });

        if (userInGame) {
          errorMessage = "You're already in this game!";
        }
      } else {
        if (data.started) {
          errorMessage = 'Game in progress';
        } else if (!(data.game in MaxPlayers)) {
          errorMessage = 'Unrecognized Game';
        } else if (data.players.length >= MaxPlayers[data.game]) {
          errorMessage = 'This game is full';
        } else if (
          data.players.filter(player => player.name === name).length >= 0
        ) {
          errorMessage = `There is already someone named ${name}`;
        }
      }
    } else {
      errorMessage = 'Game does not exist';
    }
  });

  if (errorMessage !== null) {
    throw new Error(errorMessage);
  }
}

/**
 * Initializes a game in firebase to a state valid to start a game in.
 *
 * @param {string} gameId The ID of the game in Firebase
 */
export async function startGame(gameId) {
  const document = firestore().collection('liveGames').doc(gameId);

  await document.get().then(doc => {
    const data = doc.data();

    // Shuffle deck
    let shuffledPond = shuffle([...data.pond]);

    let players = [...data.players];

    let numCardsToDeal;
    let startingCard;

    if (data.game === 'goFish') {
      numCardsToDeal = players.length <= 3 ? 7 : 5;
    } else if (data.game === 'crazyEights') {
      startingCard = shuffledPond.splice(
        shuffledPond.findIndex(card => card.rank !== '8'),
        1,
      )[0];
      numCardsToDeal = 8;
    } else if (data.game === 'president') {
      switch (players.length) {
        case 2:
          numCardsToDeal = [26, 26];
          break;
        case 3:
          numCardsToDeal = [17, 17, 18];
          break;
        case 4:
          numCardsToDeal = [13, 13, 13, 13];
        case 5:
          numCardsToDeal = [10, 10, 10, 11, 11];
        case 6:
          numCardsToDeal = [8, 8, 9, 9, 9, 9];
      }
    }

    let toPickUpInit = 0;

    if (data.game === 'crazyEights') {
      if (startingCard.rank === '2') {
        toPickUpInit = 2;
      } else if (startingCard.rank === 'Q' && startingCard.suit === 'spades') {
        toPickUpInit = 5;
      }
    }

    let startingPlayer = Math.floor(Math.random() * players.length);

    for (let i = 0; i < players.length; i++) {
      players[i].hand = shuffledPond.splice(
        0,
        data.game === 'president'
          ? numCardsToDeal[(i + startingPlayer) % players.length]
          : numCardsToDeal,
      );
    }

    if (data.game === 'president') {
      if (!data.presPassedCards) {
        startingPlayer = players.findIndex(player => player.rank === 'bum');
      } else {
        startingPlayer = players.findIndex(
          player =>
            player.hand.filter(
              card => card.rank === '3' && card.suit === 'diamonds',
            ).length > 0,
        );
      }

      for (let i = 0; i < players.length; i++) {
        players[i].hand = players[i].hand.sort(cardComparison);
      }
    }

    if (data.game === 'goFish') {
      document
        .update({
          pond: shuffledPond,
          players: players,
          started: true,
          turn: startingPlayer,
          gameUpdate: `It's ${players[startingPlayer].name}'s turn`,
        })
        .then(() => {
          console.log('started');
        });
    } else if (data.game === 'crazyEights') {
      document
        .update({
          pond: shuffledPond,
          players: players,
          started: true,
          turn: startingPlayer,
          gameUpdate: `It's ${players[startingPlayer].name}'s turn`,
          currentCard: startingCard,
          toPickUp: toPickUpInit,
        })
        .then(() => {
          console.log('started');
        });
    } else if (data.game === 'president') {
      document
        .update({
          pond: shuffledPond,
          players: players,
          started: true,
          turn: startingPlayer,
          gameUpdate: `It's ${players[startingPlayer].name}'s turn`,
          currentCard: null,
          lastPlayer: startingPlayer,
        })
        .then(() => {
          console.log('started');
        });
    }
  });
}

/**
 * Sets the game in firebase to finished
 *
 * @param {string} gameId The ID of the game in Firebase
 */
export async function endGame(gameId) {
  await firestore()
    .collection('liveGames')
    .doc(gameId)
    .update({finished: true, mostRecentMove: []});
}

/**
 * Returns game data based on a given game ID. Will return null if
 * game ID does not exist.
 *
 * @param {string} gameId The ID of the game in Firebase
 * @returns {object} The game data of the requested game.
 */
export async function getGame(gameId) {
  let gameData;

  const document = firestore().collection('liveGames').doc(gameId);

  await document
    .get()
    .then(doc => {
      if (doc.exists) {
        gameData = doc.data();
      } else {
        console.warn('Document does not exist!');
        gameData = null;
      }
    })
    .catch(error => {
      console.error('Error:', error);
      throw new Error(error);
    });

  return gameData;
}

/**********************************
 * Go Fish
 **********************************/

/**
 * Takes card from opponent if possible. Returns a boolean representing
 * whether or not the opponent had the card the user was asking for
 *
 * @param {string} gameId The ID of the game in Firebase
 * @param {string} playerOneName The name of the player taking the card
 * @param {string} playerTwoName The name of the player that is having the card taken from them
 * @param {string} rank The rank of the card to take
 * @returns {boolean} True if the opponent had the card, false if not.
 */
export async function takeCard(gameId, playerOneName, playerTwoName, rank) {
  const document = firestore().collection('liveGames').doc(gameId);

  let opponentHasCard;

  await document.get().then(async doc => {
    if (doc.exists) {
      let data = doc.data();
      let updatedPlayers = data.players;
      let playerOneIndex, playerTwoIndex;
      let playerTwoCardIndex = -1;

      // Finds the position of both the user and the opponent
      // in the game's players array
      for (let i = 0; i < data.players.length; i++) {
        let playerName = data.players[i].name;
        if (playerName === playerOneName) {
          playerOneIndex = i;
        } else if (playerName === playerTwoName) {
          playerTwoIndex = i;
        }
      }

      // Finds the index of the card in question in player 2's hand.
      // If the requested card is not in player 2's hand, playerTwoCardIndex
      // remains at -1
      for (let i = 0; i < data.players[playerTwoIndex].hand.length; i++) {
        let cardRank = data.players[playerTwoIndex].hand[i].rank;

        if (cardRank === rank) {
          playerTwoCardIndex = i;
          break;
        }
      }

      if (playerTwoCardIndex !== -1) {
        updatedPlayers[playerOneIndex].hand.push(
          updatedPlayers[playerTwoIndex].hand[playerTwoCardIndex],
        );
        updatedPlayers[playerTwoIndex].hand.splice(playerTwoCardIndex, 1);

        await document.update({
          players: updatedPlayers,
          gameUpdate: `${playerOneName} took a ${rank} from ${playerTwoName}!`,
          mostRecentMove: [],
        });

        opponentHasCard = true;
      } else {
        await document.update({
          gameUpdate: `${playerOneName} asked ${playerTwoName} for a ${rank}`,
          turnState: 'fishing',
          mostRecentMove: [],
        });

        opponentHasCard = false;
      }
    }
  });

  return opponentHasCard;
}

/**
 * Sets the turn state of a go fish game. Valid values are
 * "fishingToStart", "fishing", and "choosingCard"
 *
 * @param {string} gameId The ID of the game in Firebase
 * @param {string} turnState One of: "fishingToStart", "fishing", "choosingCard"
 */
export async function setTurnState(gameId, turnState) {
  await firestore().collection('liveGames').doc(gameId).update({
    turnState: turnState,
    mostRecentMove: [],
  });
}

/**
 * Logic for finishing a turn in go fish. Sets the turn to the next player
 * and sets the turn state accordingly
 *
 * @param {string} gameId The ID of the game in Firebase
 * @param {object} gameState The overall state of the game
 */
export async function finishTurn(gameId, gameState) {
  const nextTurn = getNextPlayerGoFish(gameState);

  let nextTurnStartingState =
    gameState.players[nextTurn].hand.length === 0
      ? 'fishingToStart'
      : 'choosingCard';

  await firestore()
    .collection('liveGames')
    .doc(gameId)
    .update({
      turn: nextTurn,
      gameUpdate: `It's ${gameState.players[nextTurn].name}'s turn`,
      turnState: nextTurnStartingState,
      mostRecentMove: [],
    });
}

/**
 * Logic for pairing up a hand in go fish. Removes any duplicate-ranked
 * cards and adds them to the player's pairedCards array. Returns the number
 * of pairs found.
 *
 * @param {string} gameId The ID of the game in Firebase
 * @param {string} playerName Name of the user whose hand is being paired up
 * @returns {number} The number of pairs found in the hand
 */
export async function pairUpHand(gameId, playerName) {
  const document = firestore().collection('liveGames').doc(gameId);

  let pairsFound = 0;

  await document.get().then(async doc => {
    if (doc.exists) {
      let data = doc.data();

      let playerIndex = data.players.findIndex(
        player => player.name === playerName,
      );

      let pairedCardsArr = data.players[playerIndex].pairedCards;
      let numPairs = 0;
      let arr = data.players[playerIndex].hand;
      let sortedArr = [...arr];

      sortedArr.sort((a, b) => {
        return a.rank.localeCompare(b.rank);
      });

      for (let i = 1; i < sortedArr.length; i++) {
        if (sortedArr[i].rank === sortedArr[i - 1].rank) {
          numPairs++;
          pairedCardsArr.push(sortedArr[i - 1], sortedArr[i]);

          arr.splice(arr.indexOf(sortedArr[i]), 1);
          arr.splice(arr.indexOf(sortedArr[i - 1]), 1);

          i++;
        }
      }

      data.players[playerIndex].numPairs += numPairs;
      pairsFound = numPairs;

      if (numPairs > 0) {
        await document.update({players: data.players, mostRecentMove: []});
      }
    }
  });

  return pairsFound;
}

/**********************************
 * Crazy Eights
 **********************************/

/**
 * Logic for picking up multiple cards from the deck in crazy eights.
 * If the deck becomes empty after the user picks up their cards,
 * the cards that have been played previously are shuffled
 * and put back into the deck.
 *
 * @param {string} gameId The ID of the game in Firebase
 * @param {string} name The name of the user picking up cards
 * @param {number} numToPickUp The number of cards the user has to pick up
 */
export async function pickUpCE(gameId, name, numToPickUp) {
  const document = firestore().collection('liveGames').doc(gameId);

  await document.get().then(async doc => {
    let data = doc.data();

    if (numToPickUp + 1 > data.pond.length) {
      data.pond = [...shuffle([...data.cardsPlayed]), ...data.pond];
      data.cardsPlayed = [];
    }

    data.players
      .find(player => player.name === name)
      .hand.push(...data.pond.splice(0, numToPickUp));

    await document.update({
      pond: data.pond,
      cardsPlayed: data.cardsPlayed,
      players: data.players,
      toPickUp: 0,
      mostRecentMove: [name, 'pickUp'],
    });
  });
}

/**
 * Logic for finishing a turn in crazy eights. Finds the next available player
 * and sets it to be their turn.
 *
 * @param {string} gameId The ID of the game in Firebase
 * @param {object} gameState The overall state of the game
 */
export async function finishTurnCE(gameId, gameState) {
  const nextTurn = getNextPlayerCE(gameState, false);

  await firestore()
    .collection('liveGames')
    .doc(gameId)
    .update({
      turn: nextTurn,
      gameUpdate: `It's ${gameState.players[nextTurn].name}'s turn`,
      mostRecentMove: [],
    });
}

/**
 * Logic for playing a card in crazy eights. Logic for special cards (2, J, QSpades)
 * is included in this function.
 *
 * @param {string} gameId The ID of the game in Firebase
 * @param {string} playerName The name of the user playing the card
 * @param {string} rank The rank of the card the user is playing
 * @param {string} suit The suit of the card the user is playing
 */
export async function playCardCE(gameId, playerName, rank, suit) {
  const document = firestore().collection('liveGames').doc(gameId);

  await document.get().then(async doc => {
    const docData = doc.data();

    let toPickUp = docData.toPickUp;

    if (rank === '2') {
      toPickUp += 2;
    } else if (rank === 'Q' && suit === 'spades') {
      toPickUp += 5;
    }

    const nextTurn = getNextPlayerCE(docData, rank === 'J');

    const playerIndex = docData.players.findIndex(
      player => player.name === playerName,
    );

    const playersCopy = [...docData.players];
    let playerRankingsCopy = [...docData.playerRankings];

    if (
      docData.cardsPlayed === null ||
      docData.cardsPlayed.length === 0 ||
      !docData.choosingSuit
    ) {
      playersCopy[playerIndex].hand = playersCopy[playerIndex].hand.filter(
        card => card.rank !== rank || card.suit !== suit,
      );
    }

    if (playersCopy[playerIndex].hand.length === 0) {
      playerRankingsCopy.push(playerName);

      if (playersCopy.filter(player => player.hand.length > 0).length === 1) {
        playerRankingsCopy.push(
          playersCopy.find(player => player.hand.length > 0).name,
        );
      }
    }

    await document.update({
      turn: nextTurn,
      players: playersCopy,
      gameUpdate: `It's ${docData.players[nextTurn].name}'s turn`,
      currentCard: {rank: rank, suit: suit},
      playerRankings: playerRankingsCopy,
      cardsPlayed:
        docData.currentCard !== null && docData.currentCard.rank !== '8'
          ? [...docData.cardsPlayed, docData.currentCard]
          : docData.currentCard === null
          ? []
          : docData.cardsPlayed,
      toPickUp: toPickUp,
      choosingSuit: false,
      mostRecentMove: [playerName, 'playCard'],
    });
  });
}

/**
 * Logic for removing a card from a user's hand without actually playing it.
 * Only used for choosing a suit after playing an 8.
 *
 * @param {string} gameId The ID of the game in Firebase
 * @param {string} name The name of the user that is having the card taken from them
 * @param {string} rank The rank of the card the user is playing
 * @param {string} suit The suit of the card the user is playing
 */
export async function takeCardFromHandCE(gameId, name, rank, suit) {
  const document = firestore().collection('liveGames').doc(gameId);

  await document.get().then(async doc => {
    const docData = doc.data();

    const playerIndex = docData.players.findIndex(
      player => player.name === name,
    );

    const playersCopy = [...docData.players];

    playersCopy[playerIndex].hand = playersCopy[playerIndex].hand.filter(
      card => card.rank !== rank || card.suit !== suit,
    );

    await document.update({
      players: playersCopy,
      cardsPlayed: [...docData.cardsPlayed, {rank: rank, suit: suit}],
      choosingSuit: true,
    });
  });
}

/**********************************
 * President
 **********************************/

/**
 * Logic for playing a card in President. There is an assumption that
 * helper function isValidPlay() is being called before this function.
 *
 * @param {string} gameId The ID of the game in Firebase
 * @param {string} name Name of the user playing
 * @param {Array} cards Cards the user wants to play
 */
export async function playCardPres(gameId, name, cards) {
  const document = firestore().collection('liveGames').doc(gameId);

  let errorMessage = null;

  await document.get().then(async doc => {
    const docData = doc.data();

    let players = [...docData.players];
    const playerInd = players.findIndex(player => player.name === name);
    let cardIndicies = [];
    const burned = isCardBurned(cards, docData.currentCard);
    let nextTurn =
      burned && players[playerInd].hand.length - cards.length !== 0
        ? docData.turn
        : getNextPlayerCE(docData, false);

    for (let i = 0; i < cards.length; i++) {
      cardIndicies.push(
        players[playerInd].hand.findIndex(
          card => card.rank === cards[i].rank && card.suit === cards[i].suit,
        ),
      );
    }

    for (let i = cards.length - 1; i >= 0; i--) {
      players[playerInd].hand.splice(cardIndicies[i], 1);
    }

    let playerRankingsCopy = [...docData.playerRankings];

    if (players[playerInd].hand.length === 0) {
      playerRankingsCopy.push(name);

      if (players.filter(player => player.hand.length > 0).length === 1) {
        playerRankingsCopy.push(
          players.find(player => player.hand.length > 0).name,
        );
      }
    }

    await document.update({
      currentCard: cards,
      mostRecentMove: [name, 'playCard'],
      players: players,
      turn: nextTurn,
      gameUpdate: `It's ${docData.players[nextTurn].name}'s turn`,
      burning: burned,
      lastPlayer: docData.turn,
      playerRankings: playerRankingsCopy,
    });
  });

  if (errorMessage) {
    throw new Error(errorMessage);
  }
}

/**
 * Burns played card if card should be burned.
 *
 * @param {string} gameId The ID of the game in Firebase
 */
export async function burnCard(gameId) {
  const document = firestore().collection('liveGames').doc(gameId);

  await document.get().then(async doc => {
    let docData = doc.data();

    if (docData.burning) {
      await document.update({
        currentCard: null,
        burning: false,
        mostRecentMove: ['', 'burnCard'],
      });
    }
  });
}

/**
 * Passes the current turn to the next available player.
 *
 * @param {string} gameId The ID of the game in Firebase
 */
export async function passTurn(gameId) {
  const document = firestore().collection('liveGames').doc(gameId);

  await document.get().then(async doc => {
    let docData = doc.data();

    let nextTurn = getNextPlayerCE(docData, false);

    let everyonePassed = hasEveryonePassed(
      docData.turn,
      nextTurn,
      docData.lastPlayer,
    );

    await document.update({
      turn: nextTurn,
      gameUpdate: `It's ${docData.players[nextTurn].name}'s turn`,
      mostRecentMove: everyonePassed ? ['', 'burnCard'] : [],
      currentCard: everyonePassed ? null : docData.currentCard,
      lastPlayer: everyonePassed ? nextTurn : docData.lastPlayer,
    });
  });
}

/**
 * Sets the game to finished in firebase, and assigns ranks to all players
 *
 * @param {string} gameId The ID of the game in Firebase
 */
export async function endGamePres(gameId) {
  const document = firestore().collection('liveGames').doc(gameId);

  await document.get().then(async doc => {
    const docData = doc.data();

    let playersWithRankings = docData.players.map(player => {
      return {
        name: player.name,
        hand: [],
        rank: getPlayerRankPres(player.name, docData.playerRankings),
      };
    });

    await document.update({
      players: playersWithRankings,
      finished: true,
      mostRecentMove: [],
    });
  });
}

export async function swapCards(gameId, name, cards) {
  const document = firestore().collection('liveGames').doc(gameId);

  await document.get().then(async doc => {
    const docData = doc.data();

    let playersCopy = [...docData.players];

    let indOfBum;

    if (cards.length === 2) {
      indOfBum = playersCopy.findIndex(player => player.rank === 'bum');
    } else {
      indOfBum = playersCopy.findIndex(player => player.rank === 'vice-bum');
    }

    let bumsBestCards = playersCopy[indOfBum].hand.splice(
      playersCopy[indOfBum].hand.length - cards.length,
    );

    let indOfPres = playersCopy.findIndex(player => player.name === name);

    playersCopy[indOfPres].hand.push(...bumsBestCards);

    playersCopy[indOfBum].hand.push(...cards);

    let cardIndicies = [];

    for (let i = 0; i < cards.length; i++) {
      cardIndicies.push(
        playersCopy[indOfPres].hand.findIndex(
          card => card.rank === cards[i].rank && card.suit === cards[i].suit,
        ),
      );
    }

    for (let i = cards.length - 1; i >= 0; i--) {
      playersCopy[indOfPres].hand.splice(cardIndicies[i], 1);
    }

    playersCopy[indOfBum].hand =
      playersCopy[indOfBum].hand.sort(cardComparison);

    playersCopy[indOfPres].hand =
      playersCopy[indOfPres].hand.sort(cardComparison);

    document.update({
      players: playersCopy,
      presPassedCards: docData.presPassedCards || cards.length === 2,
      vicePassedCards: docData.vicePassedCards || cards.length === 1,
    });
  });
}
