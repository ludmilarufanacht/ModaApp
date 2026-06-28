import React, { useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { ThemeContext } from "../context/ThemeContext";

export default function SettingsScreen() {
  const { darkMode, toggleTheme } = useContext(ThemeContext);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>⚙️ Configuración</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={toggleTheme}
      >
        <Text>
          {darkMode
            ? "Desactivar modo oscuro"
            : "Activar modo oscuro"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#eee",
    padding: 20,
    borderRadius: 12,
  },
});