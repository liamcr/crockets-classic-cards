import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import ProfileIcon from "../assets/profileIcon.png";
import firestore from "@react-native-firebase/firestore";
import GoIcon from "../assets/go.png";

const ContinueGameRow = ({ gameId, playerName, navigation }) => {
  const [gameData, setGameData] = useState(null);

  const gameTypeMapping = {
    goFish: "Go Fish",
    crazyEights: "Crazy Eights",
    president: "President",
  };

  const gameplayScreenMapping = {
    goFish: "Go Fish Gameplay",
    crazyEights: "Crazy Eights Gameplay",
    president: "President Gameplay",
  };

  const finishedGameScreenMapping = {
    goFish: "GameEnd Go Fish",
    crazyEights: "GameEnd Crazy Eights",
    president: "GameEnd President",
  };

  const getGameStatus = () => {
    if (gameData.finished) {
      return "Finished";
    } else if (gameData.started) {
      return "Playing";
    } else {
      return "Waiting";
    }
  };

  const goToGame = () => {
    if (gameData !== null) {
      if (!gameData.started) {
        navigation.navigate("Waiting Room", {
          gameId: gameId,
          name: playerName,
          isCreator: gameData.players[0].name === playerName,
        });
      } else if (!gameData.finished) {
        navigation.navigate(gameplayScreenMapping[gameData.game], {
          gameId: gameId,
          name: playerName,
          shouldEnablePond:
            gameData.players[gameData.turn].name === playerName &&
            gameData.turnState !== "choosingCard",
        });
      } else {
        navigation.navigate(finishedGameScreenMapping[gameData.game], {
          gameId: gameId,
          name: playerName,
        });
      }
    }
  };

  useEffect(() => {
    const unsubscribe = firestore()
      .collection("liveGames")
      .doc(gameId)
      .onSnapshot((doc) => {
        if (doc.exists) {
          setGameData(doc.data());
        }
      });

    return () => unsubscribe();
  }, []);

  return (
    <TouchableOpacity style={styles.rowContainer} onPress={goToGame}>
      <View>
        <View style={styles.idAndNameContainer}>
          <Text style={styles.gameId}>{gameId}</Text>
          <Text style={styles.playerName}>{playerName}</Text>
        </View>
        <View style={styles.gameAndStatusContainer}>
          {gameData === null ? (
            <View style={styles.gameStatusPlaceholder} />
          ) : (
            <Text>{`${
              gameTypeMapping[gameData.game]
            } • ${getGameStatus()}`}</Text>
          )}
        </View>
        <View style={styles.numPlayersContainer}>
          <Image source={ProfileIcon} style={{ height: 16, width: 16 }} />
          {gameData === null ? (
            <View style={styles.numPlayersPlaceholder} />
          ) : (
            <Text style={styles.numPlayersText}>{`${
              gameData.players.length
            } / 6`}</Text>
          )}
        </View>
      </View>
      <Image source={GoIcon} style={{ height: 32, width: 32 }} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  rowContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
    padding: 8,
    borderWidth: 1,
    borderRadius: 4,
    margin: 4,
    elevation: 5,
    borderColor: "#BABABA",
  },
  idAndNameContainer: {
    display: "flex",
    flexDirection: "row",
  },
  gameId: {
    fontSize: 16,
  },
  playerName: {
    fontSize: 16,
    color: "#888888",
    marginLeft: 8,
  },
  gameAndStatusContainer: {
    marginTop: 4,
  },
  numPlayersContainer: {
    marginTop: 4,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  gameStatusPlaceholder: {
    height: 16,
    width: 96,
    backgroundColor: "#DDDDDD",
  },
  numPlayersPlaceholder: {
    height: 16,
    width: 32,
    backgroundColor: "#DDDDDD",
    marginLeft: 4,
  },
  numPlayersText: {
    marginLeft: 4,
  },
});

export default ContinueGameRow;
