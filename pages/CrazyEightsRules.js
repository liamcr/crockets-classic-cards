import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import Card from "../components/Card";

const CrazyEightsRules = () => {
  const [suitIndex, setSuitIndex] = useState(0);
  const suits = ["diamonds", "hearts", "spades", "clubs"];

  const changeSuit = () => {
    setSuitIndex((suitIndex) => (suitIndex + 1) % 4);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      changeSuit();
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  return (
    <ScrollView>
      <View style={styles.pageContainer}>
        <Text style={styles.header}>How to Play</Text>
        <Text style={styles.heading}>Object of the Game</Text>
        <Text style={styles.body}>
          The goal is to be the first player to get rid of all the cards in your
          hand.
        </Text>
        <Text style={styles.heading}>The Play</Text>
        <Text style={styles.body}>
          The play begins with a randomly selected player, and continues in the
          order of when each player joined the game.
        </Text>
        <Text style={styles.body}>
          When it is your turn, you will be asked to play a card of either the
          same suit or rank as the last card played. The only exception is that
          eights are wild, and can be played whenever. When an 8 is played, the
          user chooses a suit, and play is passed to the next player.
        </Text>
        <Text style={styles.body}>
          The current player has the option to draw a card from the face-down
          deck in the middle of the screen, regardless of whether or not there
          is a playable card in their hand. A player's turn ends once they play
          a card, or if they have no playable cards in their hand after drawing
          a card from the deck.
        </Text>
        <Text style={styles.body}>
          If the current player does not have a playable card in their hand,
          they will be prompted to take a card from the deck. If the card they
          draw is playable, they may play it.
        </Text>
        <Text style={styles.body}>
          The game ends when all but one player has exhausted their hand. The
          players are ranked in the order in which they emptied their hands.
        </Text>
        <Text style={styles.heading}>Special Cards</Text>
        <View style={styles.specialCardContainer}>
          <View style={styles.specialCardContent}>
            <Text style={styles.heading}>Twos</Text>
            <Text style={styles.body}>
              When a player plays a two, they force the next player to pick up 2
              cards from the deck. However, if the next player has a two in
              their hand, they can play it and force the next player to pick up
              4 cards, and so on.
            </Text>
            <Text style={styles.body}>
              For example, if three players in a row play a two, and a fourth
              player does not have a two in their hand, the fourth player will
              be forced to pick up 6 cards.
            </Text>
          </View>
          <Card rank="2" suit={suits[suitIndex]} />
        </View>
        <View style={styles.specialCardContainer}>
          <View style={styles.specialCardContent}>
            <Text style={styles.heading}>Jacks</Text>
            <Text style={styles.body}>
              When a Jack is played, it simply skips the next available player's
              turn.
            </Text>
          </View>
          <Card rank="J" suit={suits[suitIndex]} />
        </View>
        <View style={styles.specialCardContainer}>
          <View style={styles.specialCardContent}>
            <Text style={styles.heading}>Queen of Spades</Text>
            <Text style={styles.body}>
              When a player plays the queen of spades, it forces the next player
              to pick up 5 cards.
            </Text>
            <Text style={styles.body}>
              This behaviour does not "stack" with a two (i.e. if a player puts
              down the queen of spades, and the next player has a two in their
              hand, they are not able to play their two and force the next
              player to pick up 5 + 2 = 7 cards).
            </Text>
          </View>
          <Card rank="Q" suit="spades" />
        </View>
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
  specialCardContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  specialCardContent: {
    flex: 1,
  },
});

export default CrazyEightsRules;
