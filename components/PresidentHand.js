import React from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Card from "./Card";
import CardOverlay from "./CardOverlay";

const PresidentHand = ({ playerObj, gameState, selected, onPress }) => {
  return (
    <View>
      <Text style={styles.headerText}>Your hand:</Text>
      <View style={styles.userHandContainer}>
        <FlatList
          horizontal
          data={playerObj.hand}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              disabled={
                !gameState.presPassedCards || !gameState.vicePassedCards
                  ? (gameState.presPassedCards ||
                      playerObj.rank !== "president") &&
                    (gameState.vicePassedCards ||
                      playerObj.rank !== "vice-president")
                  : gameState.players[gameState.turn].name !== playerObj.name ||
                    gameState.burning
              }
              onPress={() => onPress(index)}
            >
              <Card rank={item.rank} suit={item.suit} />
              <CardOverlay selected={selected[index]} />
            </TouchableOpacity>
          )}
          keyExtractor={(item, index) => index.toString()}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerText: { fontSize: 20, marginLeft: 8 },
  userHandContainer: {
    height: 144,
  },
});

export default PresidentHand;
