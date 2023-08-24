import React from "react";
import {
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
  StatusBar,
} from "react-native";

// Overlays the screen with an activity indicator.
const AskOverlay = ({ isAsking }) => {
  return (
    isAsking && (
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "black",
          opacity: 0.6,
          display: "flex",
          elevation: 6,
          height: useWindowDimensions().height - StatusBar.currentHeight - 144,
        }}
      >
        <Text style={styles.overlayText}>
          Select the card you want to ask for below
        </Text>
      </View>
    )
  );
};

const styles = StyleSheet.create({
  overlayText: {
    color: "white",
    width: "50%",
    textAlign: "center",
    fontSize: 24,
    opacity: 1,
  },
});

export default AskOverlay;
