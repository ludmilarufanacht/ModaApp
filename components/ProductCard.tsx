import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";
import { Pencil, Trash2 } from "lucide-react-native";

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

// La foto puede ser: una clave del set de imágenes semilla, un recurso local
// (number de require) o una URI de cámara/galería/web. Resolvemos las tres.
const resolverImagen = (foto?: string | number) => {
  if (!foto) return null;
  if (typeof foto === "number") return foto;
  if (foto in imagenes) return imagenes[foto as keyof typeof imagenes];
  return { uri: foto };
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
      <View style={styles.imageContainer}>
        {resolverImagen(producto.foto) ? (
          <Image
            source={resolverImagen(producto.foto)!}
            style={styles.image}
            resizeMode="contain"
          />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>👗</Text>
          </View>
        )}
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryBadgeText}>{producto.categoria}</Text>
        </View>
      </View>

      <Text style={styles.nombre} numberOfLines={2}>
        {producto.nombre}
      </Text>

      <Text>Talle: {producto.talle}</Text>

      <Text>Color: {producto.color}</Text>

      <Text style={styles.precio}>
        ${producto.precio}
      </Text>

      <Text style={{ marginBottom: 5 }}>
        Stock: {producto.cantidad}
      </Text>
      
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.editBtnSmall}
          onPress={() => onEdit && onEdit(producto)}
        >
          <Pencil color="white" size={16} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteBtnSmall}
          onPress={() => onDelete(producto.id)}
        >
          <Trash2 color="white" size={16} />
        </TouchableOpacity>
      </View>
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

  imageContainer: {
    position: "relative",
    width: "100%",
    height: 180,
    borderRadius: 10,
    marginBottom: 10,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
    backgroundColor: "#ffffff",
  },
  placeholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 60,
  },
  categoryBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "rgba(123, 44, 191, 0.9)",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  categoryBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  nombre: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    height: 40,
  },
  precio: {
    fontSize: 18,
    color: "#7B2CBF",
    fontWeight: "bold",
    marginVertical: 5,
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  editBtnSmall: {
    flex: 1,
    backgroundColor: "#3A86FF",
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
  },
  deleteBtnSmall: {
    flex: 1,
    backgroundColor: "#d62828",
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
});