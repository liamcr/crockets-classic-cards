import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ToastAndroid,
} from "react-native";
import PresidentHand from "../components/PresidentHand";
import firestore from "@react-native-firebase/firestore";
import LoadingOverlay from "../components/LoadingOverlay";
import PresidentPlayedCard from "../components/PresidentPlayedCard";
import OpponentStateContainer from "../components/OpponentStateContainer";
import PresidentPrompt from "../components/PresidentPrompt";
import { endGamePres, hasPlayedPres } from "../utils/firebaseFunctions";
import theme from "../styles/theme.style";
import InfoIcon from "../assets/infoIcon.png";
import { playCardPres, swapCards } from "../utils/firebaseFunctions";
import { isValidPlay } from "../utils/helperFunctions";
import GestureRecognizer from "react-native-swipe-gestures";

const PresidentGameplayPage = ({ route, navigation }) => {
  const { gameId, name } = route.params;

  const [gameState, setGameState] = useState(null);
  const [finishedGameModalVisible, setFinishedGameModalVisible] = useState(
    false
  );
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [playerObj, setPlayerObj] = useState(null);

  // waitingForFirebase is a boolean value that is true if there
  // is an asynchronous firebase function currently running. This
  // is used to show the user some loading feedback.
  const [waitingForFirebase, setWaitingForFirebase] = useState(false);

  const [selected, setSelected] = useState([]);
  const [sentCards, setSentCards] = useState(false);

  const rankingToEmoji = {
    "1st": "🥇",
    "2nd": "🥈",
    "3rd": "🥉",
    "4th": "",
    "5th": "",
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

  const onSwipeUp = () => {
    if (gameState.presPassedCards && gameState.vicePassedCards) {
      let errorMessage = isValidPlay(
        playerObj.hand.filter((card, index) => selected[index]),
        gameState.currentCard
      );
      if (errorMessage !== null) {
        ToastAndroid.show(errorMessage, ToastAndroid.SHORT);
      } else {
        setWaitingForFirebase(true);

        setSelected((oldSelected) =>
          oldSelected
            .slice(
              0,
              oldSelected.length -
                oldSelected.filter((isSelected) => isSelected).length
            )
            .map(() => false)
        );

        // Submit cards to firebase
        playCardPres(
          gameId,
          playerObj.name,
          playerObj.hand.filter((card, index) => selected[index])
        )
          .then(() => {
            setWaitingForFirebase(false);
          })
          .catch((error) => {
            console.error(error.message);
          });
      }
    } else if (
      !gameState.presPassedCards &&
      playerObj.rank === "president" &&
      !sentCards
    ) {
      setSentCards(true);

      if (
        selected.reduce((total, current) => total + (current ? 1 : 0)) !== 2
      ) {
        ToastAndroid.show("You have to pass two cards", ToastAndroid.SHORT);
        setSentCards(false);
      } else {
        setWaitingForFirebase(true);
        setSelected((oldSelected) =>
          oldSelected.slice(0, oldSelected.length).map(() => false)
        );

        //Swap card logic
        swapCards(
          gameId,
          playerObj.name,
          playerObj.hand.filter((card, index) => selected[index])
        ).then(() => {
          setWaitingForFirebase(false);
          setSentCards(false);
        });
      }
    } else if (
      !gameState.vicePassedCards &&
      playerObj.rank === "vice-president" &&
      !sentCards
    ) {
      if (
        selected.reduce((total, current) => total + (current ? 1 : 0)) !== 1
      ) {
        ToastAndroid.show("You have to pass one card", ToastAndroid.SHORT);
        setSentCards(false);
      } else {
        setWaitingForFirebase(true);
        setSelected((oldSelected) =>
          oldSelected.slice(0, oldSelected.length).map(() => false)
        );

        //Swap card logic
        swapCards(
          gameId,
          playerObj.name,
          playerObj.hand.filter((card, index) => selected[index])
        ).then(() => {
          setWaitingForFirebase(false);
          setSentCards(false);
        });
      }
    }
  };

  const onPress = (index) => {
    if (gameState.presPassedCards && gameState.vicePassedCards) {
      const indOfFirstSelected = selected.findIndex((isSelected) => isSelected);

      if (
        indOfFirstSelected === -1 ||
        playerObj.hand[index].rank === playerObj.hand[indOfFirstSelected].rank
      ) {
        let selectedCopy = [...selected];

        selectedCopy[index] = !selectedCopy[index];

        setSelected(selectedCopy);
      } else {
        ToastAndroid.show(
          "You can only select multiple cards of the same rank",
          ToastAndroid.SHORT
        );
      }
    } else {
      if (playerObj.rank === "president") {
        if (
          selected[index] ||
          selected.reduce((total, current) => total + (current ? 1 : 0)) < 2
        ) {
          let selectedCopy = [...selected];

          selectedCopy[index] = !selectedCopy[index];

          setSelected(selectedCopy);
        } else {
          ToastAndroid.show(
            "You can only select two cards to send over",
            ToastAndroid.SHORT
          );
        }
      }
      if (playerObj.rank === "vice-president") {
        if (
          selected[index] ||
          selected.reduce((total, current) => total + (current ? 1 : 0)) < 1
        ) {
          let selectedCopy = [...selected];

          selectedCopy[index] = !selectedCopy[index];

          setSelected(selectedCopy);
        } else {
          ToastAndroid.show(
            "You can only select one card to send over",
            ToastAndroid.SHORT
          );
        }
      }
    }
  };

  useEffect(() => {
    hasPlayedPres().then((hasPlayed) => {
      if (!hasPlayed) {
        setInfoModalVisible(true);
      }
    });

    const unsubscribe = firestore()
      .collection("liveGames")
      .doc(gameId)
      .onSnapshot((doc) => {
        if (doc.exists) {
          const newGameState = doc.data();

          setGameState(newGameState);
          setSelected(
            newGameState.players
              .find((player) => player.name === name)
              .hand.map(() => false)
          );
          setPlayerObj(
            newGameState.players.find((player) => player.name === name)
          );

          if (newGameState.finished) {
            // Navigate to game end screen
            navigation.replace("GameEnd President", {
              gameId: gameId,
              name: name,
            });
          } else if (
            newGameState.players.filter((player) => player.hand.length > 0)
              .length === 1 &&
            !newGameState.burning
          ) {
            endGamePres(gameId);
          } else if (
            newGameState.mostRecentMove.length > 0 &&
            newGameState.mostRecentMove[0] === name &&
            newGameState.mostRecentMove[1] === "playCard" &&
            newGameState.players.find((player) => player.name === name).hand
              .length === 0 &&
            newGameState.playerRankings.length <=
              newGameState.players.length - 2
          ) {
            setFinishedGameModalVisible(true);
          }
        }
      });

    return () => unsubscribe();
  }, []);

  if (gameState === null) {
    return (
      <View style={styles.gameplayContainer}>
        <LoadingOverlay isLoading />
      </View>
    );
  } else {
    return (
      <GestureRecognizer
        onSwipeUp={onSwipeUp}
        style={{ backgroundColor: "hsla(0, 0%, 0%, 0)" }}
      >
        <View style={styles.gameplayContainer}>
          <View style={styles.opponentContainer}>
            <PresidentPlayedCard
              playedCard={gameState.currentCard}
              mostRecentMove={gameState.mostRecentMove}
              players={gameState.players}
              name={name}
              gameId={gameId}
            />
            <OpponentStateContainer
              userIndex={gameState.players.findIndex(
                (player) => player.name === name
              )}
              playerArr={gameState.players}
              gameState={gameState}
            />
          </View>
          <View style={styles.userContainer}>
            <PresidentPrompt
              gameState={gameState}
              name={name}
              gameId={gameId}
            />
            <PresidentHand
              playerObj={gameState.players.find(
                (player) => player.name === name
              )}
              gameState={gameState}
              selected={selected}
              onSwipeUp={onSwipeUp}
              onPress={onPress}
            />
          </View>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate("PresidentRules");
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
          <Modal
            visible={infoModalVisible}
            animationType="slide"
            transparent={true}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalView}>
                <Text style={styles.modalTitle}>Hey, Newbie!</Text>
                <Text style={styles.modalBody}>
                  Looks like this is your first time playing president on the
                  app. Make sure you hit the info icon in the top-right corner
                  to understand the controls and how to play.
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setInfoModalVisible(false);
                  }}
                >
                  <Text style={styles.modalClose}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>
      </GestureRecognizer>
    );
  }
};

const styles = StyleSheet.create({
  gameplayContainer: {
    display: "flex",
    justifyContent: "space-between",
    height: "100%",
  },
  userContainer: {
    display: "flex",
    justifyContent: "space-between",
  },
  opponentContainer: {
    height: "50%",
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
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
  modalClose: {
    fontSize: 24,
    marginTop: 8,
    color: theme.PRIMARY_COLOUR,
    textAlign: "center",
  },
});

export default PresidentGameplayPage;
