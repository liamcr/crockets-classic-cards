import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  useWindowDimensions,
} from "react-native";
import SelectedCardsPic from "../assets/selectedCardsPres.png";

const PresidentRules = () => {
  const pictureWidth = useWindowDimensions().width - 48;
  const pictureHeight = pictureWidth * 0.54;

  return (
    <ScrollView>
      <View style={styles.pageContainer}>
        <Text style={styles.header}>How to Play</Text>
        <Text style={styles.heading}>Object of the Game</Text>
        <Text style={styles.body}>
          The goal is to be the first player to get rid of all the cards in your
          hand.
        </Text>
        <Text style={styles.heading}>The Controls</Text>
        <Text style={styles.body}>
          To play a card (or set of cards) in this game, tap the card(s) to
          select them. Once you are satisfied with the cards you would like to
          play (denoted with a check mark), swipe up to play them.
        </Text>
        <Image
          source={SelectedCardsPic}
          style={{
            width: pictureWidth,
            height: pictureHeight,
            marginTop: 16,
            marginBottom: 16,
          }}
          resizeMethod="scale"
        />
        <Text style={styles.body}>
          To pass your turn, press the "Pass" button located above your hand.
        </Text>
        <Text style={styles.heading}>The Play</Text>
        <Text style={styles.body}>
          The player who finished in last in the previous game (or in the case
          of this being the first game, the player with the three of diamonds)
          starts by leading any single card or any set of cards of equal rank
          (for example three fives). Each player in turn must then either pass
          (i.e. not play any cards), or play a card or set of cards, which beats
          the previous play.
        </Text>
        <Text style={styles.body}>
          Any higher single card beats a single card. A set of cards can only be
          beaten by a higher set containing the same number of cards. So for
          example if the previous player played two sixes you can beat this with
          two kings, or two sevens, but not with a single king, and not with
          three sevens (though you could play two of them and hang onto the
          third).
        </Text>
        <Text style={styles.body}>
          It is not necessary to beat the previous play just because you can -
          passing is always allowed.
        </Text>
        <Text style={styles.body}>
          If you play a single card or set of cards with the same rank as the
          cards previously played, the cards are "burned" and you get to play
          again.
        </Text>
        <Text style={styles.body}>
          One thing to note about this game is that twos are the highest valued
          card in the game. The order of cards from lowest to highest value
          goes: 3 to 10, J, Q, K, A, 2.
        </Text>
        <Text style={styles.body}>
          When a two is played on a single card, the play is automatically
          burned. If a set of n cards are played, they can be automatically
          burned by playing a set of n-1 twos. For example, if three fives are
          played, they can be burned with two twos.
        </Text>
        <Text style={styles.heading}>Playing Again</Text>
        <Text style={styles.body}>
          When you choose to play again in president, the players are assigned
          roles based on how they placed in the last game. The player who placed
          first is the president, and the player who placed last is the bum. If
          the previous game had more than 3 players, the player who placed
          second is the vice-president, and the player who placed second-last is
          the vice-bum.
        </Text>
        <Text style={styles.body}>
          At the beginning of the next game, the president will send two cards
          of their choice to the bum, while the bum will send the president
          their two highest-valued cards. If applicable, the vice-president and
          vice-bum will have the same exchange, but with only one card each,
          instead of two.
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

export default PresidentRules;
