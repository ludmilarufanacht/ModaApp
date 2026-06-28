import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";

type Props = {
  navigation: any;
}; 

export default function HomeScreen({ navigation }: Props) {
  return (
    <ScrollView style={styles.container}>
      
      <Text style={styles.greeting}>Hola, Ludmi 👋</Text>
      <Text style={styles.subGreeting}>Gestioná tu emprendimiento</Text>

      <Text style={styles.sectionTitle}>Acciones rápidas</Text>

      <View style={styles.grid}>
        
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate("AgregarProducto")}
        >
          <Text style={styles.cardText}>➕ Agregar producto</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate("Ventas")}
        >
          <Text style={styles.cardText}>💸 Registrar venta</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate("Catálogo")}
        >
          <Text style={styles.cardText}>📦 Catálogo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate("Estadísticas")}
        >
          <Text style={styles.cardText}>📊 Ver Estadísticas</Text>
        </TouchableOpacity>

      </View>

      <Text style={styles.sectionTitle}>Alertas</Text>

      <View style={styles.alertBox}>
        <Text>⚠️ 3 productos con stock bajo</Text>
        <Text>❌ 1 producto sin stock</Text>
      </View>

      <Text style={styles.sectionTitle}>Actividad reciente</Text>

      <View style={styles.activityBox}>
        <Text>🛍️ Vendiste 2 remeras negras</Text>
        <Text>➕ Agregaste jean wide leg</Text>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f6f6f6",
    padding: 15,
  },

  greeting: {
    fontSize: 26,
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
    marginTop: 20,
    marginBottom: 10,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  card: {
    backgroundColor: "#fff",
    width: "48%",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 3,
  },

  cardText: {
    fontSize: 14,
    fontWeight: "500",
  },

  alertBox: {
    backgroundColor: "#fff3cd",
    padding: 15,
    borderRadius: 12,
  },

  activityBox: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    elevation: 2,
  },
});