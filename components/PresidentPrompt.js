import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import theme from "../styles/theme.style";
import { TouchableOpacity } from "react-native-gesture-handler";
import { passTurn } from "../utils/firebaseFunctions";
import RoundedButton from "./RoundedButton";

const PresidentPrompt = ({ gameState, name, gameId }) => {
  const [passPressed, setPassPressed] = useState(false);

  const onPressPass = () => {
    setPassPressed(true);
    passTurn(gameId).then(() => {
      setPassPressed(false);
    });
  };

  if (!gameState.presPassedCards || !gameState.vicePassedCards) {
    let playerObj = gameState.players.find((player) => player.name === name);
    if (playerObj.rank === "president") {
      if (!gameState.presPassedCards) {
        return (
          <View style={styles.promptContainer}>
            <Text style={styles.gameUpdateText}>
              {`Choose two cards to give to the bum (${
                gameState.players.find((player) => player.rank === "bum").name
              }).`}
            </Text>
          </View>
        );
      } else {
        return (
          <View style={styles.promptContainer}>
            <Text style={styles.gameUpdateText}>
              Sit tight! The game will begin after the vice-president swaps a
              card with the vice-bum!
            </Text>
          </View>
        );
      }
    } else if (playerObj.rank === "vice-president") {
      if (!gameState.vicePassedCards) {
        return (
          <View style={styles.promptContainer}>
            <Text style={styles.gameUpdateText}>
              {`Choose one card to give to the vice-bum (${
                gameState.players.find((player) => player.rank === "vice-bum")
                  .name
              }).`}
            </Text>
          </View>
        );
      } else {
        return (
          <View style={styles.promptContainer}>
            <Text style={styles.gameUpdateText}>
              Sit tight! We're waiting on the President.
            </Text>
          </View>
        );
      }
    } else if (playerObj.rank === "vice-bum") {
      if (!gameState.vicePassedCards) {
        return (
          <View style={styles.promptContainer}>
            <Text style={styles.gameUpdateText}>
              Sit tight! The VP is sending their cards.
            </Text>
          </View>
        );
      } else {
        return (
          <View style={styles.promptContainer}>
            <Text style={styles.gameUpdateText}>
              Sit tight! We're waiting on the President
            </Text>
          </View>
        );
      }
    } else if (playerObj.rank === "bum") {
      if (!gameState.presPassedCards) {
        return (
          <View style={styles.promptContainer}>
            <Text style={styles.gameUpdateText}>
              Sit tight! The President is sending their cards.
            </Text>
          </View>
        );
      } else {
        return (
          <View style={styles.promptContainer}>
            <Text style={styles.gameUpdateText}>
              Sit tight! We're waiting on the President.
            </Text>
          </View>
        );
      }
    } else {
      return (
        <View style={styles.promptContainer}>
          <Text style={styles.gameUpdateText}>
            Sit tight! We're waiting for cards to be passed.
          </Text>
        </View>
      );
    }
  } else if (
    gameState.players.findIndex((player) => player.name === name) !==
    gameState.turn
  ) {
    return (
      <View style={styles.promptContainer}>
        <Text style={styles.gameUpdateText}>{gameState.gameUpdate}</Text>
      </View>
    );
  } else {
    return (
      <View style={styles.promptContainer}>
        <Text style={styles.gameUpdateText}>
          It's your turn! Choose some cards to play!
        </Text>
        <RoundedButton
          title="Pass"
          onPress={onPressPass}
          disabled={passPressed || gameState.currentCard === null}
        />
      </View>
    );
  }
};

const styles = StyleSheet.create({
  gameUpdateText: {
    textAlign: "center",
    fontSize: 16,
    width: "60%",
  },
  promptContainer: {
    display: "flex",
    justifyContent: "space-evenly",
    alignItems: "center",
    flexDirection: "row",
  },
  passButton: {
    paddingTop: 8,
    paddingBottom: 8,
    paddingLeft: 16,
    paddingRight: 16,
    borderRadius: 100,
  },
  passButtonText: {
    color: "white",
    fontSize: 20,
  },
});

export default PresidentPrompt;
