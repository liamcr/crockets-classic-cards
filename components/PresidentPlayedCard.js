import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  useWindowDimensions,
} from "react-native";
import Card from "./Card";
import { burnCard } from "../utils/firebaseFunctions";

const PresidentPlayedCard = ({
  playedCard,
  mostRecentMove,
  players,
  name,
  gameId,
}) => {
  const [previousCard, setPreviousCard] = useState(null);
  const [currentCard, setCurrentCard] = useState(null);

  // Initialize some variables related to animating the cards
  const [yOffset] = useState(new Animated.Value(0));
  const [xOffset] = useState(new Animated.Value(0));
  const [scale] = useState(new Animated.Value(0.2));
  const [opacity] = useState(new Animated.Value(0));
  const [prevOpacity] = useState(new Animated.Value(1));

  const numPlayers = players.length;
  const screenHeight = useWindowDimensions().height;
  const screenWidth = useWindowDimensions().width;

  // Below are maps containing data related to the number of pixels a
  // card has to be translated to be shown above an opponent's name on the screen.

  // There are 2 maps - xOffsets and yOffsets

  // For the yOffset map, there are entries for opponents whose names appear
  // at the top, center, or bottom of the screen. There is also an entry for "self",
  // which is there for the case that the current user is the one playing a card.

  // For the xOffset map, there are entries for opponents whose names appear on the
  // left, center, or right sides of the screen. There is also a "self" entry for
  // the xOffset as well.

  const yOffsets = {
    top: 107 - 0.5 * screenHeight,
    center: 156 - 0.5 * screenHeight,
    bottom: 260 - 0.5 * screenHeight,
    self: screenHeight,
  };

  const xOffsets = {
    center: (-1 / 10) * screenWidth + 9.4,
    left: (-9 / 20) * screenWidth + 9.4,
    right: (7 / 20) * screenWidth + 9.4,
    self: 0,
  };

  // Determines how many turns a way an opponent is from the user.
  // This is useful because an opponent's placement on the screen
  // is determined by how many turns away from the user they are.
  const turnsAway = (currentPlayerIndex, opponentIndex) => {
    if (opponentIndex < currentPlayerIndex) {
      return numPlayers - currentPlayerIndex + opponentIndex;
    } else {
      return opponentIndex - currentPlayerIndex;
    }
  };

  useEffect(() => {
    // Run an animation whenever a user plays a card.
    if (mostRecentMove.length > 0 && mostRecentMove[1] === "playCard") {
      setCurrentCard(playedCard);

      let opponentIndex = players.findIndex(
        (player) => player.name === mostRecentMove[0]
      );
      let playerIndex = players.findIndex((player) => player.name === name);

      if (playerIndex !== -1 && opponentIndex !== -1) {
        let numTurnsAway = turnsAway(playerIndex, opponentIndex);

        // There are 6 cases in the below if-statement. One representing each
        // possible placement of an opponent on the screen, plus one representing the
        // user's placement on the screen. Whichever condition returns true in this
        // if-statement determines which user the card is animated from, making it look
        // like that user has just played a card.
        if (playerIndex === opponentIndex) {
          yOffset.setValue(yOffsets.self);
          xOffset.setValue(xOffsets.self);
          scale.setValue(1);

          Animated.parallel([
            Animated.timing(yOffset, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(xOffset, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(scale, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
          ]).start(() => {
            setPreviousCard(playedCard);
            opacity.setValue(0);
            scale.setValue(0.2);

            burnCard(gameId);
          });
        } else if (numPlayers === 2 * numTurnsAway) {
          yOffset.setValue(yOffsets.top);
          xOffset.setValue(xOffsets.center);

          Animated.parallel([
            Animated.timing(yOffset, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(xOffset, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(scale, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
          ]).start(() => {
            setPreviousCard(playedCard);
            opacity.setValue(0);
            scale.setValue(0.2);
          });
        } else if (numTurnsAway === 1 && numPlayers >= 4) {
          yOffset.setValue(yOffsets.bottom);
          xOffset.setValue(xOffsets.left);

          Animated.parallel([
            Animated.timing(yOffset, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(scale, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(xOffset, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
          ]).start(() => {
            setPreviousCard(playedCard);
            opacity.setValue(0);
            scale.setValue(0.2);
          });
        } else if (numTurnsAway === numPlayers - 1 && numPlayers >= 4) {
          yOffset.setValue(yOffsets.bottom);
          xOffset.setValue(xOffsets.right);

          Animated.parallel([
            Animated.timing(yOffset, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(scale, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(xOffset, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
          ]).start(() => {
            setPreviousCard(playedCard);
            opacity.setValue(0);
            scale.setValue(0.2);
          });
        } else if (
          (numPlayers === 3 && numTurnsAway === 1) ||
          ((numPlayers === 5 || numPlayers === 6) && numTurnsAway === 2)
        ) {
          yOffset.setValue(yOffsets.center);
          xOffset.setValue(xOffsets.left);

          Animated.parallel([
            Animated.timing(yOffset, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(scale, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(xOffset, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
          ]).start(() => {
            setPreviousCard(playedCard);
            opacity.setValue(0);
            scale.setValue(0.2);
          });
        } else if (
          (numPlayers === 3 && numTurnsAway === 2) ||
          ((numPlayers === 5 || numPlayers === 6) &&
            numTurnsAway === numPlayers - 2)
        ) {
          yOffset.setValue(yOffsets.center);
          xOffset.setValue(xOffsets.right);

          Animated.parallel([
            Animated.timing(yOffset, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(scale, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(xOffset, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
          ]).start(() => {
            setPreviousCard(playedCard);
            opacity.setValue(0);
            scale.setValue(0.2);
          });
        } else {
          setPreviousCard(playedCard);
        }
      }
    } else if (mostRecentMove.length > 0 && mostRecentMove[1] === "burnCard") {
      setCurrentCard(null);

      Animated.timing(prevOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setPreviousCard(null);
        prevOpacity.setValue(1);
      });
    }
  }, [playedCard, mostRecentMove, players, name]);

  return (
    <View>
      <View style={styles.noCard}>
        <Text style={styles.noCardText}>No Card Played</Text>
      </View>
      {previousCard !== null && (
        <Animated.View style={{ ...styles.previousCard, opacity: prevOpacity }}>
          {previousCard.map((card, index) => (
            <View
              key={index}
              style={{
                position: "absolute",
                transform: [{ translateX: index * 20 }],
              }}
            >
              <Card rank={card.rank} suit={card.suit} />
            </View>
          ))}
        </Animated.View>
      )}
      {currentCard !== null && (
        <Animated.View
          style={{
            ...styles.previousCard,
            opacity: opacity,
            transform: [
              {
                translateY: yOffset,
              },
              {
                translateX: xOffset,
              },
              {
                scaleX: scale,
              },
              {
                scaleY: scale,
              },
            ],
          }}
        >
          {currentCard.map((card, index) => (
            <View
              key={index}
              style={{
                position: "absolute",
                transform: [{ translateX: index * 20 }],
              }}
            >
              <Card rank={card.rank} suit={card.suit} />
            </View>
          ))}
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  noCard: {
    backgroundColor: "white",
    height: 128,
    width: 92,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#BABABA",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  noCardText: {
    color: "#BABABA",
    textAlign: "center",
  },
  previousCard: {
    position: "absolute",
    marginLeft: -8,
    marginTop: -8,
  },
});

export default PresidentPlayedCard;
