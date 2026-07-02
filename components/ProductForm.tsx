import React, { useState, useEffect, useContext } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Image,
  StyleSheet,
  Modal,
  Alert,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { ThemeContext } from "../context/ThemeContext";
import { getData, saveData } from "../services/storage";

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

type Props = {
  onAgregar: (producto: Producto) => void;
  productoEditando?: Producto | null;
  onEditar?: (producto: Producto) => void;
};

// Feedback simple multiplataforma para permisos denegados.
const avisar = (msg: string) => {
  if (Platform.OS === "web") {
    window.alert(msg);
  } else {
    Alert.alert("Atención", msg);
  }
};

export default function ProductForm({ onAgregar, productoEditando, onEditar }: Props) {
  const { darkMode } = useContext(ThemeContext);

  const [nombre, setNombre] = useState("");
  const [categoria, setCategoria] = useState("");
  const [talle, setTalle] = useState("");
  const [color, setColor] = useState("");
  const [precio, setPrecio] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [foto, setFoto] = useState("");
  const [listaCategorias, setListaCategorias] = useState<string[]>([]);
  const [nuevaCategoria, setNuevaCategoria] = useState("");
  const [mostrandoCreadorCat, setMostrandoCreadorCat] = useState(false);

  // Selector de origen de imagen (cámara / galería)
  const [showImageSource, setShowImageSource] = useState(false);

  // Errores de validación por campo
  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  // Carga las categorías reales: las guardadas por el usuario ("categorias")
  // + las que ya usan productos existentes. Sin listas hardcodeadas.
  useEffect(() => {
    const loadCategories = async () => {
      const guardadas = await getData("categorias");
      const prods = await getData("productos");
      const desdeProductos = Array.isArray(prods)
        ? prods.map((p: any) => p.categoria).filter(Boolean)
        : [];
      const combined = Array.from(
        new Set([...(Array.isArray(guardadas) ? guardadas : []), ...desdeProductos])
      );
      setListaCategorias(combined);
    };
    loadCategories();
  }, [productoEditando]);

  const crearCategoria = async () => {
    const cleanCat = nuevaCategoria.trim();
    if (!cleanCat) return;
    if (!listaCategorias.includes(cleanCat)) {
      const next = [...listaCategorias, cleanCat];
      setListaCategorias(next);
      // Persistimos la categoría para que aparezca también en el filtro del catálogo.
      const guardadas = await getData("categorias");
      const nuevas = Array.from(new Set([...(Array.isArray(guardadas) ? guardadas : []), cleanCat]));
      await saveData("categorias", nuevas);
    }
    setCategoria(cleanCat);
    setNuevaCategoria("");
    setMostrandoCreadorCat(false);
  };

  useEffect(() => {
    if (productoEditando) {
      setNombre(productoEditando.nombre);
      setCategoria(productoEditando.categoria);
      setTalle(productoEditando.talle);
      setColor(productoEditando.color);
      setPrecio(productoEditando.precio.toString());
      setCantidad(productoEditando.cantidad.toString());
      setFoto(typeof productoEditando.foto === "string" ? productoEditando.foto : "");
    } else {
      setNombre("");
      setCategoria("");
      setTalle("");
      setColor("");
      setPrecio("");
      setCantidad("");
      setFoto("");
    }
    setErrors({});
  }, [productoEditando]);

  // --- Selección de imagen: cámara o galería según elija el usuario ---
  const tomarDesdeCamara = async () => {
    setShowImageSource(false);
    const permiso = await ImagePicker.requestCameraPermissionsAsync();
    if (!permiso.granted) {
      avisar("Debes permitir el acceso a la cámara.");
      return;
    }
    const resultado = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      quality: 0.7,
    });
    if (!resultado.canceled) {
      setFoto(resultado.assets[0].uri);
    }
  };

  const elegirDesdeGaleria = async () => {
    setShowImageSource(false);
    const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permiso.granted) {
      avisar("Debes permitir el acceso a la galería.");
      return;
    }
    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.7,
    });
    if (!resultado.canceled) {
      setFoto(resultado.assets[0].uri);
    }
  };

  // --- Validaciones con feedback por campo ---
  const validar = () => {
    const e: { [k: string]: string } = {};
    const soloLetras = /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]+$/;      // color: letras/espacios
    const talleMixto = /^[a-zA-Z0-9ñÑ\s\/\.\-]+$/;         // talle: alfanumérico mixto

    if (!nombre.trim()) e.nombre = "El nombre es obligatorio.";
    if (!categoria) e.categoria = "Seleccioná una categoría.";

    if (!talle.trim()) {
      e.talle = "El talle es obligatorio.";
    } else if (!talleMixto.test(talle.trim())) {
      e.talle = "Talle inválido (solo letras y números).";
    }

    if (!color.trim()) {
      e.color = "El color es obligatorio.";
    } else if (!soloLetras.test(color.trim())) {
      e.color = "El color no puede tener números ni símbolos.";
    }

    const precioNum = Number(precio);
    if (!precio.trim()) {
      e.precio = "El precio es obligatorio.";
    } else if (isNaN(precioNum) || precioNum <= 0) {
      e.precio = "El precio debe ser un número mayor a 0.";
    }

    if (!cantidad.trim()) {
      e.cantidad = "La cantidad es obligatoria.";
    } else if (!/^\d+$/.test(cantidad.trim())) {
      e.cantidad = "La cantidad debe ser un número entero.";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const agregar = () => {
    if (!validar()) return;

    const prod = {
      id: productoEditando ? productoEditando.id : Date.now().toString(),
      nombre: nombre.trim(),
      categoria,
      talle: talle.trim(),
      color: color.trim(),
      precio: Number(precio),
      cantidad: Number(cantidad),
      foto,
    };

    if (productoEditando && onEditar) {
      onEditar(prod);
    } else {
      onAgregar(prod);
    }

    setNombre("");
    setCategoria("");
    setTalle("");
    setColor("");
    setPrecio("");
    setCantidad("");
    setFoto("");
    setErrors({});
  };

  return (
    <View style={[styles.container, darkMode && { backgroundColor: "#1e1e1e" }]}>
      <Text style={[styles.label, darkMode && { color: "#fff" }]}>Categoría</Text>

      <View style={styles.categoriaContainer}>
        {listaCategorias.length === 0 && (
          <Text style={{ color: "#888", fontStyle: "italic", marginBottom: 8 }}>
            Todavía no hay categorías. Creá una con “➕ Nueva”.
          </Text>
        )}
        {listaCategorias.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.categoriaButton,
              categoria === cat && styles.categoriaButtonActive,
              darkMode && { backgroundColor: "#2c2c2c" },
              categoria === cat && { backgroundColor: "#7B2CBF" },
            ]}
            onPress={() => setCategoria(cat)}
          >
            <Text
              style={{
                color: categoria === cat ? "white" : (darkMode ? "#ccc" : "black"),
                fontWeight: "bold",
              }}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={[styles.categoriaButton, { backgroundColor: "#e8dbff" }]}
          onPress={() => setMostrandoCreadorCat(!mostrandoCreadorCat)}
        >
          <Text style={{ color: "#7B2CBF", fontWeight: "bold" }}>➕ Nueva</Text>
        </TouchableOpacity>
      </View>
      {errors.categoria ? <Text style={styles.errorText}>{errors.categoria}</Text> : null}

      {mostrandoCreadorCat && (
        <View style={styles.crearCatContainer}>
          <TextInput
            placeholder="Nueva categoría..."
            placeholderTextColor={darkMode ? "#777" : "#aaa"}
            value={nuevaCategoria}
            onChangeText={setNuevaCategoria}
            style={[
              styles.crearCatInput,
              darkMode && { backgroundColor: "#222", borderColor: "#444", color: "#fff" },
            ]}
          />
          <TouchableOpacity style={styles.crearCatConfirmBtn} onPress={crearCategoria}>
            <Text style={styles.crearCatConfirmText}>Confirmar</Text>
          </TouchableOpacity>
        </View>
      )}

      <TextInput
        placeholder="Nombre"
        placeholderTextColor={darkMode ? "#777" : "#aaa"}
        value={nombre}
        onChangeText={setNombre}
        style={[
          styles.input,
          darkMode && { backgroundColor: "#222", borderColor: "#444", color: "#fff" },
          errors.nombre && styles.inputError,
        ]}
      />
      {errors.nombre ? <Text style={styles.errorText}>{errors.nombre}</Text> : null}

      <View style={styles.rowInputs}>
        <View style={{ flex: 1, marginRight: 10 }}>
          <TextInput
            placeholder="Talle (ej. M, 42, XL)"
            placeholderTextColor={darkMode ? "#777" : "#aaa"}
            value={talle}
            onChangeText={setTalle}
            style={[
              styles.input,
              { width: "100%" },
              darkMode && { backgroundColor: "#222", borderColor: "#444", color: "#fff" },
              errors.talle && styles.inputError,
            ]}
          />
          {errors.talle ? <Text style={styles.errorText}>{errors.talle}</Text> : null}
        </View>
        <View style={{ flex: 1 }}>
          <TextInput
            placeholder="Color"
            placeholderTextColor={darkMode ? "#777" : "#aaa"}
            value={color}
            onChangeText={setColor}
            style={[
              styles.input,
              { width: "100%" },
              darkMode && { backgroundColor: "#222", borderColor: "#444", color: "#fff" },
              errors.color && styles.inputError,
            ]}
          />
          {errors.color ? <Text style={styles.errorText}>{errors.color}</Text> : null}
        </View>
      </View>

      <View style={styles.rowInputs}>
        <View style={{ flex: 1, marginRight: 10 }}>
          <TextInput
            placeholder="Cantidad"
            placeholderTextColor={darkMode ? "#777" : "#aaa"}
            value={cantidad}
            onChangeText={setCantidad}
            keyboardType="numeric"
            style={[
              styles.input,
              { width: "100%" },
              darkMode && { backgroundColor: "#222", borderColor: "#444", color: "#fff" },
              errors.cantidad && styles.inputError,
            ]}
          />
          {errors.cantidad ? <Text style={styles.errorText}>{errors.cantidad}</Text> : null}
        </View>
        <View style={{ flex: 1 }}>
          <TextInput
            placeholder="Precio"
            placeholderTextColor={darkMode ? "#777" : "#aaa"}
            value={precio}
            onChangeText={setPrecio}
            keyboardType="numeric"
            style={[
              styles.input,
              { width: "100%" },
              darkMode && { backgroundColor: "#222", borderColor: "#444", color: "#fff" },
              errors.precio && styles.inputError,
            ]}
          />
          {errors.precio ? <Text style={styles.errorText}>{errors.precio}</Text> : null}
        </View>
      </View>

      <TouchableOpacity style={styles.button} onPress={() => setShowImageSource(true)}>
        <Text style={styles.buttonText}>📷 Agregar imágenes</Text>
      </TouchableOpacity>

      <View style={styles.imageGrid}>
        {foto ? (
          <View style={styles.imageBox}>
            <Image source={{ uri: foto }} style={styles.imagePreview} />
            <TouchableOpacity style={styles.removeImageBtn} onPress={() => setFoto("")}>
              <Text style={styles.removeImageText}>×</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.emptyImageBox, darkMode && { backgroundColor: "#2c2c2c", borderColor: "#444" }]}
            onPress={() => setShowImageSource(true)}
          >
            <Text style={styles.plusIcon}>+</Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity
        style={[styles.saveBtn, darkMode && { backgroundColor: "#9d4edf" }]}
        onPress={agregar}
      >
        <Text style={styles.buttonText}>
          {productoEditando ? "Guardar cambios" : "Guardar producto"}
        </Text>
      </TouchableOpacity>

      {/* Selector de origen de imagen */}
      <Modal
        visible={showImageSource}
        transparent
        animationType="fade"
        onRequestClose={() => setShowImageSource(false)}
      >
        <View style={styles.sourceOverlay}>
          <View style={[styles.sourceBox, darkMode && { backgroundColor: "#1e1e1e" }]}>
            <Text style={[styles.sourceTitle, darkMode && { color: "#fff" }]}>Agregar imagen</Text>
            <Text style={[styles.sourceSubtitle, darkMode && { color: "#aaa" }]}>
              ¿De dónde querés tomar la imagen?
            </Text>

            <TouchableOpacity style={[styles.sourceBtn, { backgroundColor: "#7B2CBF" }]} onPress={tomarDesdeCamara}>
              <Text style={styles.sourceBtnText}>📷 Cámara</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.sourceBtn, { backgroundColor: "#3A86FF", marginTop: 10 }]} onPress={elegirDesdeGaleria}>
              <Text style={styles.sourceBtnText}>🖼️ Galería</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.sourceBtn, { backgroundColor: "#888", marginTop: 15 }]} onPress={() => setShowImageSource(false)}>
              <Text style={styles.sourceBtnText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignSelf: "stretch",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    fontSize: 15,
    backgroundColor: "#fff",
  },
  inputError: {
    borderColor: "#d62828",
    borderWidth: 1.5,
  },
  errorText: {
    color: "#d62828",
    fontSize: 12,
    fontWeight: "600",
    marginTop: -4,
    marginBottom: 8,
  },
  button: {
    backgroundColor: "#7B2CBF",
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
  },
  saveBtn: {
    backgroundColor: "#7B2CBF",
    padding: 14,
    borderRadius: 10,
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
  label: {
    fontWeight: "bold",
    fontSize: 15,
    marginBottom: 8,
    color: "#333",
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
  rowInputs: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  imageGrid: {
    flexDirection: "row",
    marginTop: 10,
    marginBottom: 15,
    width: "100%",
  },
  imageBox: {
    width: "30%",
    height: 80,
    borderRadius: 10,
    position: "relative",
    overflow: "hidden",
  },
  imagePreview: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  removeImageBtn: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "rgba(0,0,0,0.6)",
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  removeImageText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  emptyImageBox: {
    width: "30%",
    height: 80,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#ccc",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fcfcfc",
  },
  plusIcon: {
    fontSize: 24,
    color: "#aaa",
  },
  crearCatContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    width: "100%",
  },
  crearCatInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    backgroundColor: "#fff",
    marginRight: 10,
  },
  crearCatConfirmBtn: {
    backgroundColor: "#7B2CBF",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  crearCatConfirmText: {
    color: "#fff",
    fontWeight: "bold",
  },
  sourceOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  sourceBox: {
    backgroundColor: "#fff",
    width: "90%",
    maxWidth: 360,
    borderRadius: 16,
    padding: 24,
  },
  sourceTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 6,
  },
  sourceSubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 18,
  },
  sourceBtn: {
    width: "100%",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  sourceBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
});
