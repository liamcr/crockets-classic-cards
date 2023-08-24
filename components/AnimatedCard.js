import React, { useState, useEffect } from "react";
import { Animated } from "react-native";
import Card from "./Card";

const AnimatedCard = ({ card }) => {
  const [yOffset] = useState(new Animated.Value(140));

  useEffect(() => {
    Animated.timing(yOffset, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={{
        transform: [
          {
            translateY: yOffset,
          },
        ],
      }}
    >
      <Card rank={card.rank} suit={card.suit} />
    </Animated.View>
  );
};

export default AnimatedCard;
