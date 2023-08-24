import React, { Component } from "react";
import { Text, View, StyleSheet } from "react-native";

const Card = ({ rank, suit }) => {
  const suitSymbols = {
    diamonds: "♦",
    spades: "♠",
    hearts: "♥",
    clubs: "♣",
  };

  const textColor = suit === "diamonds" || suit === "hearts" ? "red" : "black";

  return (
    <View style={styles.card}>
      <Text style={{ ...styles.topLeftRank, color: textColor }}>{rank}</Text>
      <Text style={styles.suit}>{suitSymbols[suit]}</Text>
      <Text style={{ ...styles.bottomRightRank, color: textColor }}>
        {rank}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderColor: "black",
    backgroundColor: "white",
    height: 128,
    width: 92,
    borderWidth: 1,
    borderRadius: 4,
    margin: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  suit: {
    fontSize: 20,
  },
  topLeftRank: {
    position: "absolute",
    top: 5,
    left: 5,
    fontSize: 20,
  },
  bottomRightRank: {
    position: "absolute",
    bottom: 5,
    right: 5,
    fontSize: 20,
  },
});

export default Card;
