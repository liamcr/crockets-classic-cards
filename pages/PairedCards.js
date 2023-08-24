import React from "react";
import { View, StyleSheet, Text, FlatList } from "react-native";
import Card from "../components/Card";

const PairedCards = ({ route, navigation }) => {
  const { cards } = route.params;
  return (
    <View style={styles.pageContainer}>
      <Text style={styles.header}>Paired Cards</Text>
      <View style={styles.gridContainer}>
        {cards.length === 0 ? (
          <Text style={styles.subheader}>You have no pairs! 😢</Text>
        ) : (
          <FlatList
            numColumns={3}
            data={cards}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <Card rank={item.rank} suit={item.suit} />
            )}
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
  },
  gridContainer: {
    maxHeight: "90%",
  },
  header: {
    fontSize: 24,
    margin: 8,
  },
  subheader: {
    fontSize: 20,
    margin: 8,
  },
});

export default PairedCards;
