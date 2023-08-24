import React from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import theme from "../styles/theme.style";

// Overlays the screen with an activity indicator.
const LoadingOverlay = ({ isLoading }) => {
  return (
    isLoading && (
      <View style={styles.loadingOverlay}>
        <ActivityIndicator size="large" color={theme.PRIMARY_COLOUR} />
      </View>
    )
  );
};

const styles = StyleSheet.create({
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "black",
    opacity: 0.25,
  },
});

export default LoadingOverlay;
