import React, { useEffect, useState, useContext, useRef } from "react";
import {View,Text,StyleSheet,ScrollView,TouchableOpacity,Animated,ActivityIndicator} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useIsFocused } from "@react-navigation/native";
import { Settings } from "lucide-react-native";
import { ThemeContext } from "../context/ThemeContext";
import { getData } from "../services/storage";

type Props = {
  navigation: any;
  route: any;
};

export default function HomeScreen({ navigation, route }: Props) {
  const isFocused = useIsFocused();
  const { darkMode } = useContext(ThemeContext);
  const usuario = route?.params?.usuario || "Usuario";

  const [productos, setProductos] = useState<any[]>([]);
  const [ventas, setVentas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    if (isFocused) {
      cargarDatos();
    }
  }, [isFocused]);

  useEffect(() => {
    if (!loading) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 6,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      slideAnim.setValue(20);
    }
  }, [loading]);

  const cargarDatos = async () => {
    setLoading(true);
    const p = await getData("productos");
    const v = await getData("ventas");
    setProductos(p || []);
    setVentas(v || []);
    setTimeout(() => {
      setLoading(false);
    }, 600);
  };

  const stockBajo = productos.filter((p) => p.cantidad <= 3 && p.cantidad > 0);
  const sinStock = productos.filter((p) => p.cantidad === 0);

  return (
    <SafeAreaView style={[styles.container, darkMode && { backgroundColor: "#121212" }]} edges={["top", "bottom"]}>
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#7B2CBF" />
          <Text style={[styles.loaderText, darkMode && { color: "#aaa" }]}>
            Cargando tablero...
          </Text>
        </View>
      ) : (
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], flex: 1 }}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.headerRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.greeting, darkMode && { color: "#fff" }]}>Hola, {usuario} 👋</Text>
                <Text style={styles.subGreeting}>Gestioná tu emprendimiento</Text>
              </View>
              <TouchableOpacity
                style={[styles.settingsButton, darkMode && { backgroundColor: "#1e1e1e" }]}
                onPress={() => navigation.navigate("Configuración")}
                accessibilityLabel="Abrir configuración"
              >
                <Settings color={darkMode ? "#fff" : "#333"} size={24} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.sectionTitle, darkMode && { color: "#fff" }]}>Acciones rápidas</Text>

            <View style={styles.grid}>
              <TouchableOpacity
                style={[styles.card, darkMode && { backgroundColor: "#1e1e1e" }]}
                onPress={() => navigation.navigate("Catálogo", { abrirFormulario: true })}
              >
                <Text style={[styles.cardText, darkMode && { color: "#fff" }]}>➕ Agregar producto</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.card, darkMode && { backgroundColor: "#1e1e1e" }]}
                onPress={() => navigation.navigate("Ventas")}
              >
                <Text style={[styles.cardText, darkMode && { color: "#fff" }]}>💸 Registrar venta</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.card, darkMode && { backgroundColor: "#1e1e1e" }]}
                onPress={() => navigation.navigate("Catálogo")}
              >
                <Text style={[styles.cardText, darkMode && { color: "#fff" }]}>📦 Catálogo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.card, darkMode && { backgroundColor: "#1e1e1e" }]}
                onPress={() => navigation.navigate("Estadísticas")}
              >
                <Text style={[styles.cardText, darkMode && { color: "#fff" }]}>📊 Ver Estadísticas</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.sectionTitle, darkMode && { color: "#fff" }]}>Alertas</Text>

            <View
              style={[
                styles.alertBox,
                stockBajo.length === 0 && sinStock.length === 0 && { backgroundColor: "#d4edda", borderColor: "#c3e6cb" },
              ]}
            >
              {stockBajo.length === 0 && sinStock.length === 0 ? (
                <Text style={{ color: "#155724", fontWeight: "600" }}>✅ ¡Todo en orden! No hay problemas de stock.</Text>
              ) : (
                <View>
                  {stockBajo.length > 0 && (
                    <Text style={{ color: "#856404", fontWeight: "600", marginBottom: 6 }}>
                      ⚠️ {stockBajo.length} producto{stockBajo.length > 1 ? "s" : ""} con stock bajo (3 o menos)
                    </Text>
                  )}
                  {sinStock.length > 0 && (
                    <Text style={{ color: "#721c24", fontWeight: "600" }}>
                      ❌ {sinStock.length} producto{sinStock.length > 1 ? "s" : ""} sin stock disponible
                    </Text>
                  )}
                </View>
              )}
            </View>

            <Text style={[styles.sectionTitle, darkMode && { color: "#fff" }]}>Actividad reciente</Text>

            <View style={[styles.activityBox, darkMode && { backgroundColor: "#1e1e1e", borderColor: "#333" }]}>
              {ventas.length === 0 ? (
                <Text style={{ color: "#888", fontStyle: "italic", textAlign: "center" }}>
                  Aún no hay registros de ventas recientes.
                </Text>
              ) : (
                [...ventas].reverse().slice(0, 3).map((v) => (
                  <Text key={v.id} style={[styles.activityText, darkMode && { color: "#ccc" }]}>
                    🛍️ Vendiste {v.cantidad} unidad{v.cantidad > 1 ? "es" : ""} de: {v.productoNombre}
                  </Text>
                ))
              )}
            </View>
          </ScrollView>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f6f6f6",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  settingsButton: {
    marginTop: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  greeting: {
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 10,
  },
  subGreeting: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 25,
    marginBottom: 12,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    backgroundColor: "#fff",
    width: "48%",
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  cardText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  alertBox: {
    backgroundColor: "#fff3cd",
    borderWidth: 1,
    borderColor: "#ffeeba",
    padding: 16,
    borderRadius: 14,
  },
  activityBox: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#eee",
  },
  activityText: {
    fontSize: 14,
    color: "#444",
    marginBottom: 8,
  },
  loaderContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loaderText: {
    marginTop: 12,
    fontSize: 15,
    color: "#555",
    fontWeight: "500",
  },
});