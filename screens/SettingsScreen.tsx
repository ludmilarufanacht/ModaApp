import React, { useContext, useState } from "react";
import {View, Text, StyleSheet, Switch, TouchableOpacity, Platform, Alert} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { ArrowLeft, RotateCcw } from "lucide-react-native";
import { ThemeContext } from "../context/ThemeContext";
import { saveData } from "../services/storage";
import { productosIniciales } from "../data/productos";

export default function SettingsScreen() {
  const { darkMode, toggleTheme, showCategories, toggleCategories } = useContext(ThemeContext);
  const navigation = useNavigation<any>();
  const [reseteando, setReseteando] = useState(false);

  // Restablece los datos al estado inicial: recarga los productos
  // predeterminados y borra ventas y categorías creadas a mano.
  const restablecerDatos = async () => {
    setReseteando(true);
    try {
      await saveData("productos", productosIniciales);
      await saveData("ventas", []);
      await saveData("categorias", []);
      const msg = "Datos restablecidos. Se cargaron los productos predeterminados.";
      Platform.OS === "web" ? window.alert(msg) : Alert.alert("Listo", msg);
    } catch (err) {
      console.warn("Error al restablecer datos:", err);
      const msg = "No se pudieron restablecer los datos.";
      Platform.OS === "web" ? window.alert(msg) : Alert.alert("Error", msg);
    } finally {
      setReseteando(false);
    }
  };

  const confirmarReset = () => {
    const pregunta =
      "¿Restablecer los datos? Se cargarán los productos predeterminados y se borrarán las ventas y categorías creadas.";
    if (Platform.OS === "web") {
      if (window.confirm(pregunta)) restablecerDatos();
    } else {
      Alert.alert("Restablecer datos", pregunta, [
        { text: "Cancelar", style: "cancel" },
        { text: "Restablecer", style: "destructive", onPress: restablecerDatos },
      ]);
    }
  };

  return (
    <SafeAreaView style={[styles.container, darkMode && { backgroundColor: "#121212" }]} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backButton, darkMode && { backgroundColor: "#1e1e1e" }]}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Volver"
        >
          <ArrowLeft color={darkMode ? "#fff" : "#333"} size={24} />
        </TouchableOpacity>
        <Text style={[styles.title, darkMode && { color: "#fff" }]}>⚙️ Configuración</Text>
      </View>

      <View style={[styles.section, darkMode && { backgroundColor: "#1e1e1e" }]}>
        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={[styles.rowTitle, darkMode && { color: "#fff" }]}>Modo Oscuro</Text>
            <Text style={styles.rowDesc}>Cambiar el tema visual de la aplicación</Text>
          </View>
          <Switch
            value={darkMode}
            onValueChange={toggleTheme}
            trackColor={{ false: "#d1d5db", true: "#b388ff" }}
            thumbColor={darkMode ? "#7B2CBF" : "#f3f4f6"}
          />
        </View>

        <View style={[styles.divider, darkMode && { backgroundColor: "#333" }]} />

        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={[styles.rowTitle, darkMode && { color: "#fff" }]}>Pills de Categorías</Text>
            <Text style={styles.rowDesc}>Mostrar barra de filtro de categorías en Catálogo</Text>
          </View>
          <Switch
            value={showCategories}
            onValueChange={toggleCategories}
            trackColor={{ false: "#d1d5db", true: "#b388ff" }}
            thumbColor={showCategories ? "#7B2CBF" : "#f3f4f6"}
          />
        </View>
      </View>

      <View style={[styles.section, { marginTop: 20 }, darkMode && { backgroundColor: "#1e1e1e" }]}>
        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={[styles.rowTitle, darkMode && { color: "#fff" }]}>Restablecer datos</Text>
            <Text style={styles.rowDesc}>
              Recarga los productos predeterminados y borra ventas y categorías creadas
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.resetButton, reseteando && { opacity: 0.6 }]}
            onPress={confirmarReset}
            disabled={reseteando}
            accessibilityLabel="Restablecer datos"
          >
            <RotateCcw color="#fff" size={16} />
            <Text style={styles.resetButtonText}>{reseteando ? "..." : "Restablecer"}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f6f6f6",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  rowDesc: {
    fontSize: 13,
    color: "#888",
  },
  divider: {
    height: 1,
    backgroundColor: "#eaeaea",
    width: "100%",
  },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#d62828",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  resetButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
    marginLeft: 6,
  },
});