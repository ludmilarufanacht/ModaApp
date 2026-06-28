import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Image,
  StyleSheet,
} from "react-native";
import * as ImagePicker from "expo-image-picker";

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

type Props = {
  onAgregar: (producto: Producto) => void;
};

export default function ProductForm({ onAgregar }: Props) {
  const [nombre, setNombre] = useState("");
  const [categoria, setCategoria] = useState("");
  const [talle, setTalle] = useState("");
  const [color, setColor] = useState("");
  const [precio, setPrecio] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [foto, setFoto] = useState("");
 const categorias = ["Remeras", "Pantalones", "Vestidos", "Camperas"];
  const tomarFoto = async () => {
    const permiso =
      await ImagePicker.requestCameraPermissionsAsync();

    if (!permiso.granted) {
      alert("Debes permitir acceso a la cámara");
      return;
    }

    const resultado =
      await ImagePicker.launchCameraAsync({
        quality: 0.7,
      });

    if (!resultado.canceled) {
      setFoto(resultado.assets[0].uri);
    }
  };

  const agregar = () => {
    if (!nombre || !precio || !categoria) return;

    onAgregar({
      id: Date.now().toString(),
      nombre,
      categoria,
      talle,
      color,
      precio: Number(precio),
      cantidad: Number(cantidad),
      foto,
    });

    setNombre("");
    setCategoria("");
    setTalle("");
    setColor("");
    setPrecio("");
    setCantidad("");
    setFoto("");
  };

  return (
    <View style={styles.container}>
  

      <Text style={styles.label}>Categoría</Text>

<View style={styles.categoriaContainer}>
  {categorias.map((cat) => (
    <TouchableOpacity
      key={cat}
      style={[
        styles.categoriaButton,
        categoria === cat && styles.categoriaButtonActive,
      ]}
      onPress={() => setCategoria(cat)}
    >
      <Text
        style={{
          color: categoria === cat ? "white" : "black",
          fontWeight: "bold",
        }}
      >
        {cat}
      </Text>
      
    </TouchableOpacity>
   
  ))}
</View>
      <TextInput
        placeholder="Nombre"
        value={nombre}
        onChangeText={setNombre}
        style={styles.input}
      />
      <TextInput
        placeholder="Talle"
        value={talle}
        onChangeText={setTalle}
        style={styles.input}
      />

      <TextInput
        placeholder="Color"
        value={color}
        onChangeText={setColor}
        style={styles.input}
      />

      <TextInput
        placeholder="Cantidad"
        value={cantidad}
        onChangeText={setCantidad}
        keyboardType="numeric"
        style={styles.input}
      />

      <TextInput
        placeholder="Precio"
        value={precio}
        onChangeText={setPrecio}
        keyboardType="numeric"
        style={styles.input}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={tomarFoto}
      >
        <Text style={styles.buttonText}>
          📷 Tomar foto
        </Text>
      </TouchableOpacity>

      {foto ? (
        <Image
          source={{ uri: foto }}
          style={styles.image}
        />
      ) : null}

      <TouchableOpacity
        style={styles.button}
        onPress={agregar}
      >
        <Text style={styles.buttonText}>
          Guardar producto
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },

  button: {
    backgroundColor: "#7B2CBF",
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
  },

  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },

  image: {
    width: 150,
    height: 150,
    borderRadius: 10,
    alignSelf: "center",
    marginBottom: 10,
  },
  label: {
  fontWeight: "bold",
  marginBottom: 5,
},

categoriaContainer: {
  flexDirection: "row",
  flexWrap: "wrap",
  marginBottom: 10,
},

categoriaButton: {
  backgroundColor: "#eee",
  paddingVertical: 8,
  paddingHorizontal: 12,
  borderRadius: 20,
  marginRight: 8,
  marginBottom: 8,
},

categoriaButtonActive: {
  backgroundColor: "#7B2CBF",
},
});