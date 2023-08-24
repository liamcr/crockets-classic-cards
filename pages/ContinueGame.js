import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
} from "react-native";
import theme from "../styles/theme.style";
import ContinueGameRow from "../components/ContinueGameRow";
import { getLocalData, cleanLocalStorage } from "../utils/firebaseFunctions";

const ContinueGame = ({ navigation }) => {
  const [localGames, setLocalGames] = useState(null);

  useEffect(() => {
    cleanLocalStorage().then(() => {
      getLocalData().then((data) => {
        setLocalGames(data);
      });
    });
  }, []);

  return (
    <View style={styles.pageContainer}>
      <Text style={styles.title}>Continue Game</Text>
      <View style={styles.gameListContainer}>
        {localGames === null ? (
          <ActivityIndicator color={theme.PRIMARY_COLOUR} />
        ) : Object.keys(localGames).length === 0 ? (
          <Text style={styles.noGamesText}>You have no ongoing games</Text>
        ) : (
          <FlatList
            data={Object.keys(localGames)}
            renderItem={({ item }) => (
              <ContinueGameRow
                gameId={item}
                playerName={localGames[item]}
                navigation={navigation}
              />
            )}
            keyExtractor={(item, index) => index.toString()}
          />
        )}
      </View>
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
  title: {
    fontSize: 32,
  },
  noGamesText: {
    fontSize: 20,
    color: "#888888",
    textAlign: "center",
  },
  gameListContainer: {
    height: "50%",
    width: "70%",
    display: "flex",
    justifyContent: "center",
  },
});

export default ContinueGame;
