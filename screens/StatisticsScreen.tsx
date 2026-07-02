import React, { useEffect, useState, useContext, useRef } from "react";
import { View, Text, StyleSheet, ScrollView, Animated, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useIsFocused } from "@react-navigation/native";
import { ThemeContext } from "../context/ThemeContext";
import { getData } from "../services/storage";

type Producto = {
  id: string;
  nombre: string;
  cantidad: number;
};

type Venta = {
  id: string;
  productoNombre: string;
  cantidad: number;
  total: number;
  fecha: string;
};

export default function StatisticsScreen() {
  const isFocused = useIsFocused();
  const { darkMode } = useContext(ThemeContext);

  const [productos, setProductos] = useState<Producto[]>([]);
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [loading, setLoading] = useState(true);

  // Transition Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  // Pulse animation for skeleton
  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.7,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    if (isFocused) {
      cargarDatos();
    }
  }, [isFocused]);

  const cargarDatos = async () => {
    setLoading(true);
    const p = await getData("productos");
    const v = await getData("ventas");
    if (p) setProductos(p);
    if (v) setVentas(v);
    setTimeout(() => {
      setLoading(false);
    }, 600);
  };

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

  const totalProductos = productos.length;
  const stockTotal = productos.reduce((total, p) => total + p.cantidad, 0);
  const totalVentas = ventas.length;
  const dineroTotal = ventas.reduce((total, v) => total + v.total, 0);
  const productosBajoStock = productos.filter((p) => p.cantidad <= 3);

  const vendidos: Record<string, number> = {};
  ventas.forEach((v) => {
    vendidos[v.productoNombre] = (vendidos[v.productoNombre] || 0) + v.cantidad;
  });

  let masVendido = "Sin ventas";
  let cantidadVendida = 0;
  Object.entries(vendidos).forEach(([nombre, cantidad]) => {
    if (cantidad > cantidadVendida) {
      cantidadVendida = cantidad;
      masVendido = nombre;
    }
  });

  return (
    <SafeAreaView style={[styles.container, darkMode && { backgroundColor: "#121212" }]} edges={["top", "bottom"]}>
      {loading ? (
        <View style={styles.centeredLoader}>
          <ActivityIndicator size="large" color="#7B2CBF" />
          <Text style={[styles.loaderText, { marginTop: 12 }, darkMode && { color: "#aaa" }]}>
            Cargando estadísticas...
          </Text>
        </View>
      ) : (
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], flex: 1 }}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Text style={[styles.title, darkMode && { color: "#fff" }]}>
              📊 Estadísticas
            </Text>

            <View>
              <View style={[styles.card, darkMode && { backgroundColor: "#1e1e1e", borderColor: "#333" }]}>
                <Text style={darkMode ? { color: "#aaa" } : { color: "#555" }}>Total de productos:</Text>
                <Text style={styles.valor}>{totalProductos}</Text>
              </View>

              <View style={[styles.card, darkMode && { backgroundColor: "#1e1e1e", borderColor: "#333" }]}>
                <Text style={darkMode ? { color: "#aaa" } : { color: "#555" }}>Stock total:</Text>
                <Text style={styles.valor}>{stockTotal}</Text>
              </View>

              <View style={[styles.card, darkMode && { backgroundColor: "#1e1e1e", borderColor: "#333" }]}>
                <Text style={darkMode ? { color: "#aaa" } : { color: "#555" }}>Ventas realizadas:</Text>
                <Text style={styles.valor}>{totalVentas}</Text>
              </View>

              <View style={[styles.card, darkMode && { backgroundColor: "#1e1e1e", borderColor: "#333" }]}>
                <Text style={darkMode ? { color: "#aaa" } : { color: "#555" }}>Ingresos:</Text>
                <Text style={styles.valor}>
                  ${dineroTotal}
                </Text>
              </View>

              <View style={[styles.card, darkMode && { backgroundColor: "#1e1e1e", borderColor: "#333" }]}>
                <Text style={darkMode ? { color: "#aaa" } : { color: "#555" }}>Producto más vendido:</Text>
                <Text style={styles.valor}>
                  {masVendido}
                </Text>
              </View>

              <View style={[styles.card, darkMode && { backgroundColor: "#1e1e1e", borderColor: "#333" }]}>
                <Text style={[darkMode ? { color: "#aaa" } : { color: "#555" }, { fontWeight: "bold", marginBottom: 5 }]}>Stock bajo:</Text>

                {productosBajoStock.length === 0 ? (
                  <Text style={darkMode ? { color: "#777" } : { color: "#888" }}>No hay productos con poco stock.</Text>
                ) : (
                  productosBajoStock.map((p) => (
                    <Text key={p.id} style={darkMode ? { color: "#aaa" } : { color: "#555" }}>
                      • {p.nombre} ({p.cantidad})
                    </Text>
                  ))
                )}
              </View>
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
    padding: 20,
    backgroundColor: "#f6f6f6",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#eee",
  },
  valor: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 10,
    color: "#7B2CBF",
  },
  scrollContent: {
    paddingBottom: 40,
  },
  skeletonCard: {
    padding: 20,
    height: 95,
    borderRadius: 15,
    marginBottom: 15,
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
  centeredLoader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
});