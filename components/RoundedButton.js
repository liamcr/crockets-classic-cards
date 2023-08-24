import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import theme from "../styles/theme.style";

const RoundedButton = ({ title, onPress, disabled }) => {
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled}>
      <View
        style={{
          ...styles.button,
          backgroundColor: disabled
            ? theme.DISABLED_COLOUR
            : theme.PRIMARY_COLOUR,
        }}
      >
        <Text
          style={{
            ...styles.buttonText,
            color: disabled ? theme.DISABLED_TEXT_COLOUR : "white",
          }}
        >
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingTop: 8,
    paddingBottom: 8,
    paddingLeft: 16,
    paddingRight: 16,
    borderRadius: 100,
  },
  buttonText: {
    fontSize: 20,
    textAlign: "center",
  },
});

export default RoundedButton;
