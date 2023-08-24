import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  StyleSheet,
  Button,
  ActivityIndicator,
  FlatList,
  Alert,
} from "react-native";
import { getGame, cancelGame, resetGame } from "../utils/firebaseFunctions";
import firestore from "@react-native-firebase/firestore";
import theme from "../styles/theme.style";
import RoundedButton from "../components/RoundedButton";

const GameEnd = ({ route, navigation }) => {
  const { gameId, name } = route.params;

  const [gameState, setGameState] = useState(null);

  const placementIcons = ["🥇", "🥈", "🥉", "4", "5", "6"];

  const onPlayAgain = () => {
    // Play Again logic

    resetGame(gameId);
  };

  const onExitGame = () => {
    // Exit game logic

    Alert.alert(
      "Are You Sure?",
      "You are about to finish this game for everyone.",
      [
        {
          text: "Cancel",
          onPress: () => {
            console.log("Didn't cancel game!");
          },
        },
        {
          text: "OK",
          onPress: () => {
            cancelGame(gameId);
          },
        },
      ],
      { cancelable: false }
    );
  };

  useEffect(() => {
    const unsubscribe = firestore()
      .collection("liveGames")
      .doc(gameId)
      .onSnapshot((doc) => {
        if (doc.exists) {
          let data = doc.data();
          setGameState(data);

          if (!data.finished && !data.started) {
            navigation.replace("Waiting Room", {
              isCreator:
                data.players.findIndex((player) => player.name === name) === 0,
              gameId: gameId,
              name: name,
            });
          }
        }
        // If game was deleted - i.e. game creator pressed "Finish Game"
        else {
          navigation.navigate("Home");
        }
      });

    return () => unsubscribe();
  }, []);

  return (
    <View style={styles.pageContainer}>
      <Text style={styles.header}>Leaderboard</Text>
      <View style={styles.leaderboardContainer}>
        {gameState === null ? (
          <ActivityIndicator color={theme.PRIMARY_COLOUR} />
        ) : (
          <FlatList
            data={[...gameState.players].sort((a, b) => {
              return b.numPairs - a.numPairs;
            })}
            renderItem={({ item, index }) => {
              return (
                <View style={styles.leaderboardRow}>
                  <View style={styles.nameContainer}>
                    <Text style={styles.playerRank}>{`${
                      placementIcons[index]
                    }`}</Text>
                    <Text style={styles.playerName}>{item.name}</Text>
                  </View>
                  <Text style={styles.playerScore}>{item.numPairs}</Text>
                </View>
              );
            }}
            keyExtractor={(item, index) => index.toString()}
          />
        )}
      </View>
      {gameState !== null &&
        gameState.players.findIndex((player) => player.name === name) === 0 && (
          <View style={styles.buttonContainer}>
            <RoundedButton title="Play Again" onPress={onPlayAgain} />
            <RoundedButton title="Finish Game" onPress={onExitGame} />
          </View>
        )}
    </View>
  );
};

const styles = StyleSheet.create({
  pageContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-around",
    height: "100%",
  },
  header: { fontSize: 28 },
  leaderboardContainer: {
    height: "50%",
    width: "60%",
  },
  leaderboardRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "white",
    padding: 4,
    borderColor: "#BABABA",
    borderWidth: 1,
    borderRadius: 4,
    margin: 4,
    elevation: 5,
  },
  nameContainer: {
    display: "flex",
    flexDirection: "row",
  },
  playerRank: {
    fontSize: 20,
    marginRight: 8,
    color: "#888888",
    width: 25,
    textAlign: "center",
  },
  playerName: {
    fontSize: 20,
  },
  playerScore: {
    fontSize: 20,
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "space-between",
    height: "15%",
  },
});

export default GameEnd;
