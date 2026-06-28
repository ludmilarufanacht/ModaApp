import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from "react-native";

import { getData, saveData } from "../services/storage";
import { productosIniciales } from "../data/productos";
import ProductCard from "../components/ProductCard";
import ProductForm from "../components/ProductForm";

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

export default function CatalogScreen() {
  const [productos, setProductos] = useState<Producto[]>([]);
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
    saveData("productos", productos);
  }, [productos]);
  const [productoEditando, setProductoEditando] =
  useState<Producto | null>(null);
  const cargarProductos = async () => {
    const datos = await getData("productos");

    if (datos && datos.length > 0) {
      setProductos(datos);
      return;
    }

    setProductos(productosIniciales);
    await saveData("productos", productosIniciales);
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
      <TextInput
  style={styles.search}
  placeholder="🔍 Buscar producto..."
  value={busqueda}
  onChangeText={setBusqueda}
/>
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
   <TouchableOpacity
  style={styles.buttonCategories}
  onPress={() => setShowCategories(!showCategories)}
>
  {showCategories && (
  <View style={styles.categoriesList}>
    {["Todas", "Remeras", "Pantalones", "Vestidos", "Camperas"].map((cat) => (
      <TouchableOpacity
        key={cat}
        style={[
          styles.categoryItem,
          selectedCategory === cat && styles.categorySelected,
        ]}
        onPress={() => {
          setSelectedCategory(cat);
          setShowCategories(false); // se cierra al seleccionar
        }}
      >
        <Text
          style={{
            color:selectedCategory === cat ? "white" : "black",
            fontWeight: "bold",
          }}
        >
          {cat}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
)}
  <Text style={{ color: "white", fontWeight: "bold" }}>
    {showCategories ? "Cerrar categorías" : "Categorías"}
  </Text>
</TouchableOpacity>

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
  search: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
  },
  categories: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  categoryButton: {
    backgroundColor: "#eee",
    padding: 10,
    borderRadius: 10,
  },
  buttonCategories: {
  backgroundColor: "#333",
  padding: 15,
  borderRadius: 10,
  marginBottom: 10,
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
});