import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";

import { saveData, getData } from "../services/storage";

type Producto = {
  id: string;
  nombre: string;
  categoria: string;
  talle: string;
  color: string;
  precio: number;
  cantidad: number;
  foto?: string;
};

type Venta = {
  id: string;
  productoId: string;
  productoNombre: string;
  cantidad: number;
  total: number;
  fecha: string;
};

export default function SalesScreen() {
  const [productos, setProductos] =
    useState<Producto[]>([]);

  const [ventas, setVentas] =
    useState<Venta[]>([]);

  const [productoSeleccionado,
    setProductoSeleccionado] =
    useState<Producto | null>(null);

  const [cantidad, setCantidad] =
    useState("");

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    const productosGuardados =
      await getData("productos");

    const ventasGuardadas =
      await getData("ventas");

    if (productosGuardados)
      setProductos(productosGuardados);

    if (ventasGuardadas)
      setVentas(ventasGuardadas);
  };

  const registrarVenta = async () => {
    if (!productoSeleccionado) return;

    const cant = Number(cantidad);

    if (cant <= 0) return;

    if (cant > productoSeleccionado.cantidad) {
      alert("No hay stock suficiente");
      return;
    }

    const venta: Venta = {
      id: Date.now().toString(),
      productoId: productoSeleccionado.id,
      productoNombre: productoSeleccionado.nombre,
      cantidad: cant,
      total: cant * productoSeleccionado.precio,
      fecha: new Date().toLocaleDateString(),
    };

    const nuevasVentas = [...ventas, venta];

    setVentas(nuevasVentas);

    await saveData("ventas", nuevasVentas);

    const nuevosProductos =
      productos.map((p) =>
        p.id === productoSeleccionado.id
          ? {
              ...p,
              cantidad: p.cantidad - cant,
            }
          : p
      );

    setProductos(nuevosProductos);

    await saveData(
      "productos",
      nuevosProductos
    );

    setCantidad("");
  };

  return (
    <View style={styles.container}>

      <Text style={styles.title}>
        Registro de Ventas
      </Text>

      {productos.map((producto) => (
        <TouchableOpacity
          key={producto.id}
          style={styles.producto}
          onPress={() =>
            setProductoSeleccionado(producto)
          }
        >
          <Text>
            {producto.nombre}
            {" - "}
            Stock: {producto.cantidad}
          </Text>
        </TouchableOpacity>
      ))}

      <TextInput
        placeholder="Cantidad"
        value={cantidad}
        onChangeText={setCantidad}
        keyboardType="numeric"
        style={styles.input}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={registrarVenta}
      >
        <Text style={styles.buttonText}>
          Registrar Venta
        </Text>
      </TouchableOpacity>

      <FlatList
        data={ventas}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text>
              {item.productoNombre}
            </Text>

            <Text>
              Cantidad: {item.cantidad}
            </Text>

            <Text>
              Total: ${item.total}
            </Text>

            <Text>
              {item.fecha}
            </Text>
          </View>
        )}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },

  producto: {
    backgroundColor: "#eee",
    padding: 12,
    marginBottom: 10,
    borderRadius: 10,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    marginBottom: 10,
    borderRadius: 10,
  },

  button: {
    backgroundColor: "#7B2CBF",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },

  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },

  card: {
    backgroundColor: "#eee",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
});