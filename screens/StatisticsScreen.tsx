import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
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

  const [productos, setProductos] = useState<Producto[]>([]);
  const [ventas, setVentas] = useState<Venta[]>([]);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    const p = await getData("productos");
    const v = await getData("ventas");

    if (p) setProductos(p);
    if (v) setVentas(v);
  };

  const totalProductos = productos.length;

  const stockTotal = productos.reduce(
    (total, p) => total + p.cantidad,
    0
  );

  const totalVentas = ventas.length;

  const dineroTotal = ventas.reduce(
    (total, v) => total + v.total,
    0
  );

  const productosBajoStock = productos.filter(
    (p) => p.cantidad <= 3
  );

  const vendidos: Record<string, number> = {};

  ventas.forEach((v) => {
    vendidos[v.productoNombre] =
      (vendidos[v.productoNombre] || 0) + v.cantidad;
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
    <ScrollView style={styles.container}>

      <Text style={styles.title}>
        📊 Estadísticas
      </Text>

      <View style={styles.card}>
        <Text>Total de productos:</Text>
        <Text style={styles.valor}>{totalProductos}</Text>
      </View>

      <View style={styles.card}>
        <Text>Stock total:</Text>
        <Text style={styles.valor}>{stockTotal}</Text>
      </View>

      <View style={styles.card}>
        <Text>Ventas realizadas:</Text>
        <Text style={styles.valor}>{totalVentas}</Text>
      </View>

      <View style={styles.card}>
        <Text>Ingresos:</Text>
        <Text style={styles.valor}>
          ${dineroTotal}
        </Text>
      </View>

      <View style={styles.card}>
        <Text>Producto más vendido:</Text>
        <Text style={styles.valor}>
          {masVendido}
        </Text>
      </View>

      <View style={styles.card}>
        <Text>Stock bajo:</Text>

        {productosBajoStock.length === 0 ? (
          <Text>No hay productos con poco stock.</Text>
        ) : (
          productosBajoStock.map((p) => (
            <Text key={p.id}>
              • {p.nombre} ({p.cantidad})
            </Text>
          ))
        )}
      </View>

    </ScrollView>
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
    textAlign: "center",
  },

  card: {
    backgroundColor: "#f5f5f5",
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    elevation: 2,
  },

  valor: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 10,
    color: "#7B2CBF",
  },
});