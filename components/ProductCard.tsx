import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";

type Producto = {
  id: string;
  nombre: string;
  categoria: string;
  talle: string;
  color: string;
  precio: number;
  cantidad: number;
  foto?: string | number; // Puede ser una URL (string) o un recurso local (number)
};

const imagenes = {
  "remerablanca": require("../assets/imagenes/remerablanca.png"),
  "remeranegra": require("../assets/imagenes/remeranegra.png"),
  "jeanazul": require("../assets/imagenes/jeanazul.png"),
  "vestidofloral": require("../assets/imagenes/vestidofloral.png"),
  "vestidonegro": require("../assets/imagenes/vestidonegro.png"),
  "camperadenim": require("../assets/imagenes/camperadenim.png"),
};

type Props = {
  producto: Producto;
  onDelete: (id: string) => void;
  onEdit?: (producto: Producto) => void;
};

export default function ProductCard({
  producto,
  onDelete,
  onEdit
}: Props) {
  return (
    
    <View style={styles.card}>
      {producto.foto ? (
       <Image
  source={imagenes[producto.foto as keyof typeof imagenes]}
  style={styles.image}
  resizeMode="contain"
/>
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>👗</Text>
          
        </View>
      )}

      <Text style={styles.nombre}>
        {producto.nombre}
      </Text>

      <Text>{producto.categoria}</Text>

      <Text>Talle: {producto.talle}</Text>

      <Text>Color: {producto.color}</Text>

      <Text style={styles.precio}>
        ${producto.precio}
      </Text>

      <Text>
        Stock: {producto.cantidad}
      </Text>
      <TouchableOpacity
  style={styles.edit}
  onPress={() => onEdit && onEdit(producto)}
>
  <Text style={{ color: "white" }}>
    ✏️ Editar
  </Text>
</TouchableOpacity>
      <TouchableOpacity
        style={styles.delete}
        onPress={() => onDelete(producto.id)}
      >
        <Text style={{ color: "white" }}>
          Eliminar
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
  width: "48%",
  backgroundColor: "#fff",
  borderRadius: 15,
  padding: 12,
  elevation: 4,
},

  image: {
    width: "100%",
    height: 180,
    borderRadius: 10,
    marginBottom: 10,
    resizeMode: "contain",
    backgroundColor: "#ffffff",
  },

  placeholder: {
    width: "100%",
    height: 180,
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    marginBottom: 10,
  },

  placeholderText: {
    fontSize: 60,
  },

 nombre: {
  fontSize: 16,
  fontWeight: "bold",
  marginBottom: 5,
},

  precio: {
    fontSize: 18,
    color: "#7B2CBF",
    fontWeight: "bold",
    marginVertical: 5,
  },

  delete: {
    marginTop: 10,
    backgroundColor: "#d62828",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  edit: {
    marginTop: 10,
    backgroundColor: "#3A86FF",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
});