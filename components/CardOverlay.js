import React, { useEffect, useState } from "react";
import { StyleSheet, View, Image } from "react-native";
import themeStyle from "../styles/theme.style";
import Checkmark from "../assets/checkmark.png";

const CardOverlay = ({ selected }) => {
  const [opacity, setOpacity] = useState(0);
  const [circleScale, setCircleScale] = useState(0);
  const [imageScale, setImageScale] = useState(0);

  useEffect(() => {
    if (selected) {
      setOpacity(1);
      setCircleScale(1);
      setImageScale(1);
    } else {
      setOpacity(0);
      setCircleScale(0);
      setImageScale(0);
    }
  }, [selected]);

  return (
    <View style={{ ...styles.cardSelectedOverlay, opacity: opacity }}>
      <View
        style={{
          ...styles.checkMarkContainer,
          transform: [{ scaleX: circleScale }, { scaleY: circleScale }],
        }}
      >
        <Image
          source={Checkmark}
          style={{
            height: 24,
            width: 24,
            transform: [{ scaleX: imageScale }, { scaleY: imageScale }],
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardSelectedOverlay: {
    backgroundColor: "hsla(0, 0%, 0%, 0.5)",
    height: 128,
    width: 92,
    borderRadius: 4,
    position: "absolute",
    margin: 8,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  checkMarkContainer: {
    height: 48,
    width: 48,
    backgroundColor: themeStyle.PRIMARY_COLOUR,
    borderRadius: 24,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default CardOverlay;
