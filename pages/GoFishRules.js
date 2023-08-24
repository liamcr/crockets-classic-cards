import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";

const GoFishRules = () => {
  return (
    <ScrollView>
      <View style={styles.pageContainer}>
        <Text style={styles.header}>How to Play</Text>
        <Text style={styles.heading}>Object of the Game</Text>
        <Text style={styles.body}>
          The goal is to win the most "pairs" of cards. A pair is any two of a
          kind, such as two kings, two aces, and so on.
        </Text>
        <Text style={styles.heading}>The Play</Text>
        <Text style={styles.body}>
          The play begins with the player who created the game, and continues in
          the order of when each player joined the game.
        </Text>
        <Text style={styles.body}>
          When it is a player's turn, the player will be prompted to select the
          name of an opponent from which they would like to attempt to take a
          card from. The player will also be asked to select a card to ask for,
          with the only options being the cards currently in their hand. If the
          selected opponent has the requested rank of card, they will give it to
          the player, and the player's turn continues.
        </Text>
        <Text style={styles.body}>
          If the opponent does not have the requested rank of card, the player
          will have to "Go Fish." The player will pick a card from the deck of
          cards in the middle of the screen. If the player draws a card with the
          same rank that they had just previously asked for, they made a
          "catch," and their turn continues. If the player does not make a
          catch, the player's turn ends, and the next player's turn begins.
        </Text>
        <Text style={styles.body}>
          During the game, if a player is left without cards, they may (when
          it's their turn to play), draw from the deck in the middle of the
          screen and then ask for cards of that rank. If there are no cards left
          in the deck, they are out of the game.
        </Text>
        <Text style={styles.body}>
          The game ends when all 26 pairs have been won. The player with the
          most pairs is deemed the winner.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  pageContainer: {
    margin: 24,
  },
  header: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 12,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    marginTop: 8,
  },
});

export default GoFishRules;
