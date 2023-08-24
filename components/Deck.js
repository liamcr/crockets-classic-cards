import React, { useState, useEffect } from "react";
import {
  Animated,
  View,
  TouchableWithoutFeedback,
  Text,
  StyleSheet,
  useWindowDimensions,
} from "react-native";

const Deck = ({ onPress, enabled, showCount, gameState, name, numPlayers }) => {
  // Initialize some variables related to animating the cards
  const [yOffset] = useState(new Animated.Value(-2));
  const [xOffset] = useState(new Animated.Value(-2));
  const [opacity] = useState(new Animated.Value(1));
  const [scale] = useState(new Animated.Value(1));
  const screenHeight = useWindowDimensions().height;
  const screenWidth = useWindowDimensions().width;

  // Below are maps containing data related to the number of pixels a
  // card has to be translated to be shown above an opponent's name on the screen.

  // There are 4 maps - yOffsets for both crazy eights and go fish, as well as the
  // xOffsets for both games. Each map has 4 values.

  // For the yOffset maps, there are entries for opponents whose names appear
  // at the top, center, or bottom of the screen. There are also entries for "self",
  // which is there for the case that the current user is the one drawing a card
  // from the deck.

  // For the xOffset maps, there are entries for opponents whose names appear on the
  // left, center, or right sides of the screen. There is also a "self" entry for
  // the xOffsets as well.

  const yOffsetsCE = {
    top: 107 - 0.5 * screenHeight,
    center: 156 - 0.5 * screenHeight,
    bottom: 260 - 0.5 * screenHeight,
    self: screenHeight,
  };

  const yOffsetsGoFish = {
    top: 147 - 0.5 * screenHeight,
    center: 196 - 0.5 * screenHeight,
    bottom: 300 - 0.5 * screenHeight,
    self: screenHeight,
  };

  const xOffsetsCE = {
    center: (1 / 15) * screenWidth + 26,
    left: (-17 / 60) * screenWidth + 26,
    right: (31 / 60) * screenWidth + 26,
    self: 0,
  };

  const xOffsetsGoFish = {
    center: (-1 / 10) * screenWidth + 25.2,
    left: (-9 / 20) * screenWidth + 25.2,
    right: (7 / 20) * screenWidth + 25.2,
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
    // Run an animation whenever a user picks up a card.
    if (
      gameState.mostRecentMove.length > 0 &&
      !gameState.choosingSuit &&
      gameState.mostRecentMove[1] === "pickUp"
    ) {
      let opponentIndex = gameState.players.findIndex(
        (player) => player.name === gameState.mostRecentMove[0]
      );
      let playerIndex = gameState.players.findIndex(
        (player) => player.name === name
      );

      let xOffsets;
      let yOffsets;

      // Set the x and y offsets depending on which game is being
      // played.
      if (gameState.game === "crazyEights") {
        xOffsets = xOffsetsCE;
        yOffsets = yOffsetsCE;
      } else if (gameState.game === "goFish") {
        xOffsets = xOffsetsGoFish;
        yOffsets = yOffsetsGoFish;
      }

      if (playerIndex !== -1 && opponentIndex !== -1) {
        let numTurnsAway = turnsAway(playerIndex, opponentIndex);

        // There are 6 cases in the below if-statement. One representing each
        // possible placement of an opponent on the screen, plus one representing the
        // user's placement on the screen. Whichever condition returns true in this
        // if-statement determines which user the card is animated to, making it look
        // like that user has just picked up a card.
        if (playerIndex === opponentIndex) {
          Animated.parallel([
            Animated.timing(yOffset, {
              toValue: yOffsets.self,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(xOffset, {
              toValue: xOffsets.self,
              duration: 300,
              useNativeDriver: true,
            }),
          ]).start(() => {
            yOffset.setValue(-2);
            xOffset.setValue(-2);
          });
        }
        if (numPlayers === 2 * numTurnsAway) {
          Animated.parallel([
            Animated.timing(yOffset, {
              toValue: yOffsets.top,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(scale, {
              toValue: 0.2,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(xOffset, {
              toValue: xOffsets.center,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
          ]).start(() => {
            yOffset.setValue(-2);
            scale.setValue(1);
            xOffset.setValue(-2);
            opacity.setValue(1);
          });
        } else if (numTurnsAway === 1 && numPlayers >= 4) {
          Animated.parallel([
            Animated.timing(yOffset, {
              toValue: yOffsets.bottom,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(scale, {
              toValue: 0.2,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(xOffset, {
              toValue: xOffsets.left,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
          ]).start(() => {
            scale.setValue(1);
            yOffset.setValue(-2);
            opacity.setValue(1);
            xOffset.setValue(-2);
          });
        } else if (numTurnsAway === numPlayers - 1 && numPlayers >= 4) {
          Animated.parallel([
            Animated.timing(yOffset, {
              toValue: yOffsets.bottom,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(scale, {
              toValue: 0.2,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(xOffset, {
              toValue: xOffsets.right,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
          ]).start(() => {
            scale.setValue(1);
            yOffset.setValue(-2);
            opacity.setValue(1);
            xOffset.setValue(-2);
          });
        } else if (
          (numPlayers === 3 && numTurnsAway === 1) ||
          ((numPlayers === 5 || numPlayers === 6) && numTurnsAway === 2)
        ) {
          Animated.parallel([
            Animated.timing(yOffset, {
              toValue: yOffsets.center,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(scale, {
              toValue: 0.2,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(xOffset, {
              toValue: xOffsets.left,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
          ]).start(() => {
            scale.setValue(1);
            yOffset.setValue(-2);
            opacity.setValue(1);
            xOffset.setValue(-2);
          });
        } else if (
          (numPlayers === 3 && numTurnsAway === 2) ||
          ((numPlayers === 5 || numPlayers === 6) &&
            numTurnsAway === numPlayers - 2)
        ) {
          Animated.parallel([
            Animated.timing(yOffset, {
              toValue: yOffsets.center,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(scale, {
              toValue: 0.2,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(xOffset, {
              toValue: xOffsets.right,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
          ]).start(() => {
            scale.setValue(1);
            yOffset.setValue(-2);
            opacity.setValue(1);
            xOffset.setValue(-2);
          });
        }
      }
    }
  }, [gameState]);

  return (
    <View style={styles.deckContainer}>
      <View style={{ ...styles.cardBackLarge, elevation: 5 }}>
        <TouchableWithoutFeedback
          onPress={() => {
            if (enabled) {
              onPress();
            }
          }}
          disabled={gameState.pond.length === 0}
        >
          <Animated.View
            style={{
              ...styles.cardBackLarge,
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
              opacity: opacity,
            }}
          />
        </TouchableWithoutFeedback>
      </View>

      {showCount && (
        <Text style={styles.deckCount}>{gameState.pond.length}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  deckContainer: {
    display: "flex",
    alignItems: "center",
  },
  cardBackLarge: {
    height: 128,
    width: 80,
    borderWidth: 2,
    borderRadius: 4,
    backgroundColor: "red",
    borderColor: "white",
  },
  deckCount: {
    fontSize: 32,
    marginTop: 8,
  },
});

export default Deck;
