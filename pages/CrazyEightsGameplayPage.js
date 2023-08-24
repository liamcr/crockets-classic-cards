import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Modal,
  ToastAndroid,
  Image,
  ActivityIndicator,
} from "react-native";
import LoadingOverlay from "../components/LoadingOverlay";
import firestore from "@react-native-firebase/firestore";
import Deck from "../components/Deck";
import UserHand from "../components/UserHand";
import AnimatedCard from "../components/AnimatedCard";
import UserPrompt from "../components/UserPrompt";
import {
  playCardCE,
  takeFromPond,
  endGame,
  takeCardFromHandCE,
  pickUpCE,
} from "../utils/firebaseFunctions";
import theme from "../styles/theme.style";
import OpponentStateContainer from "../components/OpponentStateContainer";
import PlayedCard from "../components/PlayedCard";
import InfoIcon from "../assets/infoIcon.png";

const CrazyEightsGameplayPage = ({ route, navigation }) => {
  const { gameId, name } = route.params;

  const [gameState, setGameState] = useState(null);

  // enableDeck is a boolean value that determines whether the user can
  // take a card from the deck. This is a state variable rather than a
  // firebase attribute so there is no delay when setting this value.
  // In other words, it prevents the user from drawing more than one card
  // at a time.
  const [enableDeck, setEnableDeck] = useState(false);

  // The following state variables determine whether or not
  // particular modals are visible to the user.
  const [drawCardModalVisible, setDrawCardModalVisible] = useState(false);
  const [chooseSuitModalVisible, setChooseSuitModalVisible] = useState(false);
  const [pickUpModalVisible, setPickUpModalVisible] = useState(false);
  const [finishedGameModalVisible, setFinishedGameModalVisible] = useState(
    false
  );

  // mustPickUp is a boolean determining whether or not the user is required
  // to pick up a card (i.e. they have no playable card in their hand). This
  // is used to display the "pick up a card" prompt to the user.
  const [mustPickUp, setMustPickUp] = useState(false);

  // hasPlayedCard is a boolean determining whether or not the user
  // has played a card. This is used to prevent users from double-tapping
  // a card which, without this state variable, would result in a card being
  // played twice in a row.
  const [hasPlayedCard, setHasPlayedCard] = useState(false);

  // waitingForFirebase is a boolean value that is true if there
  // is an asynchronous firebase function currently running. This
  // is used to show the user some loading feedback.
  const [waitingForFirebase, setWaitingForFirebase] = useState(false);

  const rankingToEmoji = {
    "1st": "🥇",
    "2nd": "🥈",
    "3rd": "🥉",
    "4th": "",
    "5th": "",
  };

  useEffect(() => {
    const unsubscribe = firestore()
      .collection("liveGames")
      .doc(gameId)
      .onSnapshot((doc) => {
        if (doc.exists) {
          const newGameState = doc.data();
          setGameState(newGameState);

          if (newGameState.finished) {
            navigation.replace("GameEnd Crazy Eights", {
              gameId: gameId,
              name: name,
            });
          } else {
            // If there is only one player left in the game, and no one is in the
            // middle of choosing a suit (in the case that an 8 is the last card
            // played), end the game.
            if (
              newGameState.players.filter((player) => player.hand.length > 0)
                .length === 1 &&
              !newGameState.choosingSuit
            ) {
              endGame(gameId);
            } else if (newGameState.players[newGameState.turn].name === name) {
              if (newGameState.toPickUp === 5) {
                setPickUpModalVisible(true);
              } else if (
                newGameState.toPickUp > 0 &&
                newGameState.players[newGameState.turn].hand.findIndex(
                  (card) => card.rank === "2"
                ) === -1
              ) {
                setPickUpModalVisible(true);
              } else if (
                newGameState.currentCard !== null &&
                newGameState.players[newGameState.turn].hand.filter(
                  (card) =>
                    newGameState.currentCard.rank === card.rank ||
                    newGameState.currentCard.suit === card.suit ||
                    card.rank === "8"
                ).length === 0 &&
                !newGameState.choosingSuit
              ) {
                setDrawCardModalVisible(true);
                setMustPickUp(true);
              } else if (newGameState.choosingSuit) {
                setChooseSuitModalVisible(true);
              }

              // Enable deck at the beginning of the user's turn
              if (
                newGameState.mostRecentMove.length === 0 ||
                (newGameState.mostRecentMove[0] !== name ||
                  newGameState.mostRecentMove[1] === "playCard")
              ) {
                setEnableDeck(true);
              }
            }

            // If the user just played their last card and there is more than 1 player
            // left, show a modal acknowledging that they are finished.
            if (
              newGameState.mostRecentMove.length > 0 &&
              newGameState.mostRecentMove[0] === name &&
              newGameState.mostRecentMove[1] === "playCard" &&
              newGameState.players.find((player) => player.name === name).hand
                .length === 0 &&
              newGameState.playerRankings.length <=
                newGameState.players.length - 2 &&
              !newGameState.choosingSuit
            ) {
              setFinishedGameModalVisible(true);
            }
          }
        }
      });

    return () => unsubscribe();
  }, []);

  // Runs when a user chooses a suit to play after playing an 8
  const onChooseSuit = (suit) => {
    setChooseSuitModalVisible(false);
    setEnableDeck(false);
    setWaitingForFirebase(true);
    playCardCE(gameId, name, "8", suit).then(() => {
      setWaitingForFirebase(false);
      setHasPlayedCard(false);
    });
  };

  // Runs when a user is forced to pick up 2 or more cards
  const onPickUp = (toPickUp) => {
    setPickUpModalVisible(false);
    setWaitingForFirebase(true);
    pickUpCE(gameId, name, toPickUp).then(() => {
      setWaitingForFirebase(false);
    });
  };

  // Converts the user's index in the rankings array to a readable string.
  // For example, if the user is at index 1 of the rankings array, the function
  // returns '2nd'
  const getPlacementText = () => {
    const ranking = gameState.playerRankings.findIndex(
      (player) => player === name
    );

    const rankingText = ["1st", "2nd", "3rd", "4th", "5th"];

    if (ranking === -1) {
      return "";
    } else {
      return rankingText[ranking];
    }
  };

  // Runs when the user taps a card with the intent to play it
  const onPressCard = (rank, suit) => {
    if (gameState.players[gameState.turn].name === name && !hasPlayedCard) {
      // If the user has to pick up 2, 4, or 6 cards, they must play a two
      // if they have one in their hand.
      if (
        gameState.currentCard !== null &&
        gameState.toPickUp > 0 &&
        gameState.currentCard.rank === "2"
      ) {
        setEnableDeck(false);
        if (rank === "2") {
          setHasPlayedCard(true);
          setWaitingForFirebase(true);
          playCardCE(gameId, name, rank, suit).then(() => {
            setHasPlayedCard(false);
            setWaitingForFirebase(false);
          });
        } else {
          ToastAndroid.show("You have to play your 2", ToastAndroid.SHORT);
        }
      } else {
        if (
          (gameState.currentCard === null ||
            gameState.currentCard.rank === rank ||
            gameState.currentCard.suit === suit) &&
          rank !== "8"
        ) {
          setHasPlayedCard(true);
          setEnableDeck(false);
          setWaitingForFirebase(true);
          playCardCE(gameId, name, rank, suit).then(() => {
            setHasPlayedCard(false);
            setWaitingForFirebase(false);
          });
        } else if (rank === "8") {
          setHasPlayedCard(true);
          setEnableDeck(false);
          setWaitingForFirebase(true);
          takeCardFromHandCE(gameId, name, rank, suit).then(() => {
            setWaitingForFirebase(false);
          });
        } else {
          ToastAndroid.show("You can't play that card!", ToastAndroid.SHORT);
        }
      }
    }
  };

  if (gameState === null) {
    return (
      <View style={styles.gameplayContainer}>
        <LoadingOverlay isLoading />
      </View>
    );
  } else {
    return (
      <View style={styles.gameplayContainer}>
        <View style={styles.opponentContainer}>
          <View style={styles.cardsContainer}>
            <Deck
              enabled={enableDeck}
              gameState={gameState}
              name={name}
              numPlayers={gameState.players.length}
              onPress={() => {
                setEnableDeck(false);
                setWaitingForFirebase(true);
                takeFromPond(gameId, name).then(() => {
                  setWaitingForFirebase(false);
                  setMustPickUp(false);
                });
              }}
              showCount={false}
            />
            <PlayedCard
              gameState={gameState}
              name={name}
              numPlayers={gameState.players.length}
            />
          </View>

          <OpponentStateContainer
            userIndex={gameState.players.findIndex(
              (player) => player.name === name
            )}
            playerArr={gameState.players}
            gameState={gameState}
          />
        </View>
        <View style={styles.userContainer}>
          <UserPrompt
            gameState={gameState}
            name={name}
            mustPickUp={mustPickUp}
          />
          <UserHand
            player={gameState.players.find((player) => player.name === name)}
            renderCard={({ item }) => (
              <TouchableOpacity
                onPress={() => onPressCard(item.rank, item.suit)}
              >
                <AnimatedCard card={item} />
              </TouchableOpacity>
            )}
            navigation={navigation}
            showPairs={false}
          />
        </View>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate("CrazyEightsRules");
          }}
          style={{ position: "absolute", margin: 5, right: 0 }}
        >
          <Image source={InfoIcon} style={{ height: 32, width: 32 }} />
        </TouchableOpacity>
        <ActivityIndicator
          style={{ position: "absolute", margin: 5 }}
          color={theme.PRIMARY_COLOUR}
          animating={waitingForFirebase}
        />
        <Modal
          visible={drawCardModalVisible}
          animationType="slide"
          transparent={true}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalView}>
              <Text style={styles.modalTitle}>Uh Oh</Text>
              <Text style={styles.modalBody}>
                Looks like you don't have a card to play! Pick one up from the
                deck!
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setDrawCardModalVisible(false);
                }}
              >
                <Text style={styles.modalClose}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        <Modal
          visible={pickUpModalVisible}
          animationType="slide"
          transparent={true}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalView}>
              <Text style={styles.modalTitle}>Yikes</Text>
              <Text style={styles.modalBody}>{`Looks like you have to pick up ${
                gameState.toPickUp
              } cards 😢`}</Text>
              <TouchableOpacity
                onPress={() => {
                  onPickUp(gameState.toPickUp);
                }}
              >
                <Text style={styles.modalClose}>Pick up cards</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        <Modal
          visible={chooseSuitModalVisible}
          animationType="slide"
          transparent={true}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalView}>
              <Text style={styles.modalTitle}>Choose a suit:</Text>
              <View style={styles.suitsContainer}>
                <TouchableOpacity onPress={() => onChooseSuit("diamonds")}>
                  <Text style={{ ...styles.modalSuit, marginRight: 16 }}>
                    ♦
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onChooseSuit("hearts")}>
                  <Text style={{ ...styles.modalSuit, marginRight: 16 }}>
                    ♥
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onChooseSuit("spades")}>
                  <Text style={{ ...styles.modalSuit, marginRight: 16 }}>
                    ♠
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onChooseSuit("clubs")}>
                  <Text style={styles.modalSuit}>♣</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
        <Modal
          visible={finishedGameModalVisible}
          animationType="slide"
          transparent={true}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalView}>
              <Text style={styles.modalTitle}>{`Congrats! ${
                rankingToEmoji[getPlacementText()]
              }`}</Text>
              <Text
                style={styles.modalBody}
              >{`You finished ${getPlacementText()}! Sit tight and wait for the others to finish up!`}</Text>
              <TouchableOpacity
                onPress={() => {
                  setFinishedGameModalVisible(false);
                }}
              >
                <Text style={styles.modalClose}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  gameplayContainer: {
    display: "flex",
    justifyContent: "space-between",
    height: "100%",
  },
  opponentContainer: {
    height: "50%",
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  cardsContainer: {
    display: "flex",
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-evenly",
  },
  userContainer: {
    display: "flex",
    justifyContent: "space-between",
  },
  playedCard: {
    position: "absolute",
    marginTop: -8,
    marginLeft: -8,
  },
  modalContainer: {
    alignItems: "center",
    flex: 1,
    display: "flex",
    justifyContent: "center",
  },
  modalView: {
    backgroundColor: "white",
    maxWidth: "60%",
    padding: 10,
    borderRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 4,
  },
  modalBody: {
    fontSize: 16,
  },
  modalSuit: {
    fontSize: 36,
  },
  modalClose: {
    fontSize: 24,
    marginTop: 8,
    color: theme.PRIMARY_COLOUR,
    textAlign: "center",
  },
  suitsContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
});

export default CrazyEightsGameplayPage;
