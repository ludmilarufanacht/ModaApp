import React, { useEffect, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { saveData, getData } from "../services/storage";

const categoriasPrendas = [
  "Todas",
  "Remeras",
  "Pantalones",
  "Vestidos",
  "Camperas",
];

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

  const [nuevoStock, setNuevoStock] =
    useState("");

  const [busqueda, setBusqueda] =
    useState("");

  const [selectedCategory, setSelectedCategory] =
    useState("Todas");

  const [showCategories, setShowCategories] =
    useState(false);

  const productosFiltrados = productos.filter(
    (producto) => {
      const textoBusqueda = busqueda.toLowerCase();

      const coincideBusqueda =
        producto.nombre
          .toLowerCase()
          .includes(textoBusqueda) ||
        producto.categoria
          .toLowerCase()
          .includes(textoBusqueda) ||
        producto.talle
          .toLowerCase()
          .includes(textoBusqueda) ||
        producto.color
          .toLowerCase()
          .includes(textoBusqueda);

      const coincideCategoria =
        selectedCategory === "Todas" ||
        producto.categoria === selectedCategory;

      return coincideBusqueda && coincideCategoria;
    }
  );

  useEffect(() => {
    cargarDatos();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      cargarDatos();
    }, [])
  );

  useEffect(() => {
    if (!productoSeleccionado) return;

    const productoActualizado =
      productos.find(
        (p) => p.id === productoSeleccionado.id
      ) || null;

    if (!productoActualizado) {
      setProductoSeleccionado(null);
      setNuevoStock("");
      return;
    }

    if (
      productoActualizado.cantidad !==
      productoSeleccionado.cantidad
    ) {
      setProductoSeleccionado(productoActualizado);
      setNuevoStock(
        productoActualizado.cantidad.toString()
      );
    }
  }, [productos]);

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

  const seleccionarProducto = (producto: Producto) => {
    setProductoSeleccionado(producto);
    setNuevoStock(producto.cantidad.toString());
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

    const productoActualizado =
      nuevosProductos.find(
        (p) => p.id === productoSeleccionado.id
      ) || null;

    setProductoSeleccionado(productoActualizado);
    setNuevoStock(
      productoActualizado
        ? productoActualizado.cantidad.toString()
        : ""
    );

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

      <View style={styles.filtersRow}>
        <TextInput
          placeholder="Buscar producto..."
          value={busqueda}
          onChangeText={setBusqueda}
          style={styles.search}
        />

        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedCategory !== "Todas" &&
              styles.filterButtonActive,
          ]}
          onPress={() =>
            setShowCategories(!showCategories)
          }
          accessibilityLabel="Filtrar por tipo de prenda"
        >
          <Ionicons
            name="filter"
            size={22}
            color="white"
          />
        </TouchableOpacity>
      </View>

      {showCategories && (
        <View style={styles.categoriesList}>
          {categoriasPrendas.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryItem,
                selectedCategory === cat &&
                  styles.categorySelected,
              ]}
              onPress={() => {
                setSelectedCategory(cat);
                setShowCategories(false);
              }}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === cat &&
                    styles.categoryTextSelected,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {productosFiltrados.length === 0 ? (
        <Text style={styles.emptyText}>
          No se encontraron productos.
        </Text>
      ) : (
        productosFiltrados.map((producto) => (
        <TouchableOpacity
          key={producto.id}
          style={[
            styles.producto,
            productoSeleccionado?.id === producto.id &&
              styles.productoSeleccionado,
          ]}
          onPress={() =>
            seleccionarProducto(producto)
          }
        >
          <Text>
            {producto.nombre}
            {" - "}
            Stock: {producto.cantidad}
          </Text>
        </TouchableOpacity>
        ))
      )}

      {productoSeleccionado && (
        <View style={styles.stockBox}>
          <Text style={styles.stockTitle}>
            {productoSeleccionado.nombre}
          </Text>
          <View style={styles.stockRow}>
            <TextInput
              placeholder="Nuevo stock"
              value={nuevoStock}
              onChangeText={setNuevoStock}
              keyboardType="numeric"
              style={styles.stockInput}
            />

            <TouchableOpacity
              style={styles.stockButton}
            >
              <Text style={styles.buttonText}>
                Guardar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

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

  productoSeleccionado: {
    borderWidth: 2,
    borderColor: "#7B2CBF",
  },

  filtersRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },

  search: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 10,
  },

  filterButton: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#333",
    borderRadius: 10,
  },

  filterButtonActive: {
    backgroundColor: "#7B2CBF",
  },

  categoriesList: {
    backgroundColor: "#f2f2f2",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },

  categoryItem: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: "#ddd",
  },

  categorySelected: {
    backgroundColor: "#7B2CBF",
  },

  categoryText: {
    color: "black",
    fontWeight: "bold",
  },

  categoryTextSelected: {
    color: "white",
  },

  emptyText: {
    color: "#777",
    marginBottom: 10,
  },

  stockBox: {
    backgroundColor: "#f2f2f2",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },

  stockTitle: {
    fontWeight: "bold",
    marginBottom: 4,
  },

  stockText: {
    color: "#555",
    marginBottom: 10,
  },

  stockRow: {
    flexDirection: "row",
    gap: 10,
  },

  stockInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#fff",
  },

  stockButton: {
    backgroundColor: "#7B2CBF",
    paddingHorizontal: 14,
    justifyContent: "center",
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
