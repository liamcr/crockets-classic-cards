import React from "react";
import { View, Text, StyleSheet } from "react-native";
import theme from "../styles/theme.style";

const OpponentState = ({ opponent, styleName, gameState }) => {
  return (
    <View style={styles[styleName]}>
      <Text
        style={{
          ...styles.opponentName,
          color:
            gameState.players[gameState.turn].name === opponent.name
              ? theme.PRIMARY_COLOUR
              : "black",
        }}
      >
        {opponent.name}
      </Text>
      <View style={styles.cardCountContainer}>
        <View style={styles.cardBack} />
        <Text style={styles.cardCount}>{opponent.hand.length}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  opponentContainerC: {
    alignSelf: "flex-start",
    position: "absolute",
    left: "40%",
    top: 0,
  },
  opponentContainerNW: {
    alignSelf: "flex-start",
    position: "absolute",
    left: "5%",
    top: 48,
  },
  opponentContainerNE: {
    alignSelf: "flex-start",
    position: "absolute",
    right: "5%",
    top: 48,
  },
  opponentContainerW: {
    alignSelf: "flex-start",
    position: "absolute",
    left: "5%",
    top: 152,
  },
  opponentContainerE: {
    alignSelf: "flex-start",
    position: "absolute",
    right: "5%",
    top: 152,
  },
  opponentName: {
    fontSize: 20,
  },
  cardCountContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  cardBack: {
    height: 32,
    width: 20,
    backgroundColor: "red",
    borderWidth: 2,
    borderColor: "white",
    borderRadius: 4,
    elevation: 5,
  },
  cardCount: {
    fontSize: 20,
    marginLeft: 8,
  },
});

export default OpponentState;
