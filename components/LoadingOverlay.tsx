import React, { useEffect, useRef, useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Modal,
} from "react-native";
import { ThemeContext } from "../context/ThemeContext";

type Props = {
  visible: boolean;
};

const LOADING_PHRASES = [
  "Estamos cargando todo para vos...",
  "Pensando en qué vas a vender hoy...",
  "Preparando tu catálogo de moda...",
  "Ajustando las últimas tendencias...",
  "Organizando tu stock...",
];

export default function LoadingOverlay({ visible }: Props) {
  const { darkMode } = useContext(ThemeContext);
  const spinAnim = useRef(new Animated.Value(0)).current;
  const [phrase, setPhrase] = useState("");

  useEffect(() => {
    if (visible) {
      // Pick random phrase
      const randomIdx = Math.floor(Math.random() * LOADING_PHRASES.length);
      setPhrase(LOADING_PHRASES[randomIdx]);

      // Rotation loop
      spinAnim.setValue(0);
      Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    }
  }, [visible]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <View style={[styles.container, darkMode && styles.containerDark]}>
        <View style={styles.content}>
          <Animated.View
            style={[
              styles.spinner,
              { transform: [{ rotate: spin }] },
            ]}
          />
          <Text style={[styles.text, darkMode && styles.textDark]}>
            {phrase}
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  containerDark: {
    backgroundColor: "rgba(18, 18, 18, 0.95)",
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
  },
  spinner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 6,
    borderColor: "#7B2CBF",
    borderTopColor: "transparent",
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
  textDark: {
    color: "#fff",
  },
});
