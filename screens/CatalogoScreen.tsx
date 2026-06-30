import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { getData, saveData } from "../services/storage";
import { productosIniciales } from "../data/productos";
import ProductCard from "../components/ProductCard";
import ProductForm from "../components/ProductForm";

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
  foto?: string | number;
};

export default function CatalogScreen() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [datosCargados, setDatosCargados] =
    useState(false);
  const [mostrarFormulario, setMostrarFormulario] =
    useState(false);
  const [busqueda, setBusqueda] = useState("");
  useEffect(() => {
    cargarProductos();
  }, []);
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [showCategories, setShowCategories] = useState(false);
  const productosFiltrados = productos.filter((producto) => {
    const coincideBusqueda = producto.nombre
      .toLowerCase()
      .includes(busqueda.toLowerCase());

    const coincideCategoria =
      selectedCategory === "Todas" ||
      producto.categoria === selectedCategory;

    return coincideBusqueda && coincideCategoria;
  });
  useEffect(() => {
    if (!datosCargados) return;

    saveData("productos", productos);
  }, [datosCargados, productos]);
  const [productoEditando, setProductoEditando] =
  useState<Producto | null>(null);
  const cargarProductos = async () => {
    const productosGuardados =
      await getData("productos");

    if (productosGuardados.length > 0) {
      setProductos(productosGuardados);
    } else {
      setProductos(productosIniciales);
      await saveData("productos", productosIniciales);
    }

    setDatosCargados(true);
  };

  const agregarProducto = (producto: Producto) => {
    setProductos([...productos, producto]);
    setMostrarFormulario(false);
  };

  const eliminarProducto = (id: string) => {
    setProductos(
      productos.filter((p) => p.id !== id)
    );
  };

  return (
    <View style={styles.container}>

      <Text style={styles.title}>
        Catálogo
      </Text>

      <View style={styles.filtersRow}>
        <TextInput
          style={styles.search}
          placeholder="Buscar producto..."
          value={busqueda}
          onChangeText={setBusqueda}
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

      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          setMostrarFormulario(!mostrarFormulario)
        }
      >
        <Text style={styles.buttonText}>
          {mostrarFormulario
            ? "Cerrar"
            : "Agregar producto"}
        </Text>
      </TouchableOpacity>

      {mostrarFormulario && (
        <ProductForm
          onAgregar={agregarProducto}
        />
      )}

      <FlatList
  data={productosFiltrados}
  keyExtractor={(item) => item.id}
  numColumns={2}
  columnWrapperStyle={{
    justifyContent: "space-between",
    marginBottom: 15,
  }}
  renderItem={({ item }) => (
    <ProductCard
      producto={item}
      onDelete={eliminarProducto}
      onEdit={(producto) => {
        setProductoEditando(producto);
        setMostrarFormulario(true);
      }}
    />
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
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 20,
  },

  button: {
    backgroundColor: "#7B2CBF",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },

  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },

  filtersRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
  },

  search: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
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
    marginBottom: 15,
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
});
