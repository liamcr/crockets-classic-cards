import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Animated,
  useWindowDimensions,
} from "react-native";
import LoadingOverlay from "../components/LoadingOverlay";
import {
  takeCard,
  takeFromPond,
  pairUpHand,
  endGame,
  finishTurn,
  setTurnState,
} from "../utils/firebaseFunctions";
import firestore from "@react-native-firebase/firestore";
import AskOverlay from "../components/AskOverlay";
import UserHand from "../components/UserHand";
import Deck from "../components/Deck";
import OpponentStateContainer from "../components/OpponentStateContainer";
import UserPrompt from "../components/UserPrompt";
import theme from "../styles/theme.style";
import InfoIcon from "../assets/infoIcon.png";
import AnimatedCard from "../components/AnimatedCard";
import CatchImg from "../assets/catch.png";
import GoFishImg from "../assets/goFish.png";

const GoFishGameplayPage = ({ route, navigation }) => {
  const { gameId, name, shouldEnablePond } = route.params;
  const screenWidth = useWindowDimensions().width;
  const [gameState, setGameState] = useState(null);

  // isAsking is a boolean value that is true if the user
  // has selected who they want to ask from, and is currently
  // choosing which card they want to ask for
  const [isAsking, setIsAsking] = useState(false);

  // toAsk is an integer representing the index of the player
  // the user is asking for. So a value of 2 means the user wants
  // to ask player 3 for a card
  const [toAsk, setToAsk] = useState(0);

  // enablePond is a boolean value that determines whether the user can
  // take a card from the pond. This is a state variable rather than a
  // firebase attribute so there is no delay when setting this value.
  // In other words, it prevents the user from drawing more than one card
  // at a time.
  const [enablePond, setEnablePond] = useState(
    shouldEnablePond ? shouldEnablePond : false
  );

  // lastCardAskedFor keeps track of the last card the user has asked an opponent
  // for. This is to handle the rule "If the card you draw matches the card
  // number you asked your opponent for, show the card to your opponents, put it
  // in your hand, and continue playing your turn."
  const [lastCardAskedFor, setLastCardAskedFor] = useState("");

  // waitingForFirebase is a boolean value that is true if there
  // is an asynchronous firebase function currently running. This
  // is used to show the user some loading feedback.
  const [waitingForFirebase, setWaitingForFirebase] = useState(false);

  // xOffset is the animated value of the x-offset of the
  // "Go Fish!" or "Catch!" overlay images
  const [xOffset] = useState(new Animated.Value(screenWidth));

  // overlayURI is the relative path to either the "Go Fish!" image
  // or the "Catch!" image.
  const [overlayURI, setOverlayURI] = useState(GoFishImg);

  // Slides the "Go Fish" or "Catch!" overlay
  // across the screen
  const animateOverlayMessage = () => {
    Animated.timing(xOffset, {
      toValue: -1 * screenWidth,
      duration: 1500,
      useNativeDriver: true,
    }).start(() => {
      xOffset.setValue(screenWidth);
    });
  };

  // Runs when a user requests a card from an opponent
  const askForCard = (rank, playerIndex) => {
    setIsAsking(false);

    let opponent = gameState.players.filter((player) => player.name !== name)[
      playerIndex
    ];

    setWaitingForFirebase(true);
    takeCard(gameId, name, opponent.name, rank).then((opponentHadCard) => {
      if (!opponentHadCard) {
        if (gameState.pond.length === 0) {
          finishTurn(gameId, gameState).then(() => {
            setWaitingForFirebase(false);
          });
        } else {
          setOverlayURI(GoFishImg);
          animateOverlayMessage();
          setLastCardAskedFor(rank);
          setEnablePond(true);
          setWaitingForFirebase(false);
        }
      } else {
        setOverlayURI(CatchImg);
        animateOverlayMessage();
        setWaitingForFirebase(false);
      }
    });
  };

  useEffect(() => {
    const unsubscribe = firestore()
      .collection("liveGames")
      .doc(gameId)
      .onSnapshot((doc) => {
        if (doc.exists) {
          let updatedGameState = doc.data();

          if (updatedGameState.finished) {
            navigation.replace("GameEnd Go Fish", {
              gameId: gameId,
              name: name,
            });
          } else {
            pairUpHand(gameId, name).then((pairsFound) => {
              if (pairsFound === 0) {
                setGameState(updatedGameState);

                // If everyone's hand AND the pond is empty, end
                // the game
                if (
                  updatedGameState.pond.length === 0 &&
                  updatedGameState.players.filter(
                    (player) => player.hand.length > 0
                  ).length === 0
                ) {
                  endGame(gameId);
                } else if (
                  updatedGameState.players[updatedGameState.turn].name ===
                    name &&
                  updatedGameState.players[updatedGameState.turn].hand
                    .length === 0 &&
                  updatedGameState.pond.length > 0
                ) {
                  setEnablePond(true);
                  setTurnState(gameId, "fishingToStart");
                } else if (
                  updatedGameState.players[updatedGameState.turn].name ===
                    name &&
                  updatedGameState.players[updatedGameState.turn].hand
                    .length === 0 &&
                  updatedGameState.pond.length === 0
                ) {
                  finishTurn(gameId, updatedGameState);
                }
              }
            });
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
      <View style={styles.gameplayContainer}>
        <View style={styles.opponentContainer}>
          <Deck
            enabled={enablePond}
            gameState={gameState}
            name={name}
            numPlayers={gameState.players.length}
            showCount
            onPress={() => {
              setEnablePond(false);
              setWaitingForFirebase(true);
              takeFromPond(gameId, name).then((cardDrawn) => {
                if (gameState.turnState === "fishing") {
                  if (cardDrawn.rank === lastCardAskedFor) {
                    setOverlayURI(CatchImg);
                    animateOverlayMessage();
                    setWaitingForFirebase(false);
                    setTurnState(gameId, "choosingCard");
                  } else {
                    setLastCardAskedFor("");
                    finishTurn(gameId, gameState).then(() => {
                      setWaitingForFirebase(false);
                    });
                  }
                } else {
                  setTurnState(gameId, "choosingCard");
                  setWaitingForFirebase(false);
                }
              });
            }}
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
          <UserPrompt
            gameState={gameState}
            name={name}
            toAsk={toAsk}
            onValChange={(val, ind) => {
              setToAsk(ind);
            }}
            onAsk={() => {
              setIsAsking(true);
            }}
          />
          <UserHand
            player={gameState.players.find((player) => player.name === name)}
            renderCard={({ item }) => (
              <TouchableOpacity
                onPress={() => {
                  if (isAsking) {
                    askForCard(item.rank, toAsk);
                  }
                }}
              >
                <AnimatedCard card={item} />
              </TouchableOpacity>
            )}
            navigation={navigation}
            showPairs
          />
        </View>

        <TouchableOpacity
          onPress={() => {
            navigation.navigate("GoFishRules");
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
        <AskOverlay isAsking={isAsking} />
        <Animated.View
          style={{
            position: "absolute",
            height: "100%",
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            elevation: 6,
            transform: [
              {
                translateX: xOffset,
              },
            ],
          }}
        >
          <Image style={{ height: "30%", width: "100%" }} source={overlayURI} />
        </Animated.View>
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
});

export default GoFishGameplayPage;
