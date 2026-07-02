import React, { useEffect, useState, useRef, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  Animated,
  Modal,
  ActivityIndicator,
} from "react-native";
import { Filter, Plus, X, Search } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useRoute, useIsFocused } from "@react-navigation/native";
import { ThemeContext } from "../context/ThemeContext";
import { getData, saveData } from "../services/storage";
import { productosIniciales } from "../data/productos";
import ProductCard from "../components/ProductCard";
import ProductForm from "../components/ProductForm";
import CustomDialog from "../components/CustomDialog";

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

const CategoryChip = ({
  cat,
  selected,
  onPress,
  onLongPress,
}: {
  cat: string;
  selected: boolean;
  onPress: () => void;
  onLongPress?: () => void;
}) => {
  const scale = useRef(new Animated.Value(1)).current;
  const { darkMode } = useContext(ThemeContext);

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        activeOpacity={0.8}
        style={[
          styles.categoryChip,
          darkMode && { backgroundColor: "#1e1e1e", borderColor: "#333" },
          selected && styles.categoryChipActive,
        ]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        onLongPress={onLongPress}
      >
        <Text
          style={[
            styles.categoryChipText,
            darkMode && { color: "#aaa" },
            selected && styles.categoryChipTextActive,
          ]}
        >
          {cat}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function CatalogScreen() {
  const isFocused = useIsFocused();
  const [productos, setProductos] = useState<Producto[]>([]);
  const { darkMode, showCategories } = useContext(ThemeContext);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);
  const route = useRoute<any>();

  // Transitions
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  // Custom Dialog
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogMessage, setDialogMessage] = useState("");
  const [dialogConfirmText, setDialogConfirmText] = useState("Aceptar");
  const [dialogCancelText, setDialogCancelText] = useState("Cancelar");
  const [dialogOnConfirm, setDialogOnConfirm] = useState<(() => void) | undefined>(undefined);
  const [dialogOnCancel, setDialogOnCancel] = useState<(() => void) | undefined>(undefined);

  const triggerDialog = ({
    title,
    message,
    confirmText = "Aceptar",
    cancelText = "Cancelar",
    onConfirm,
    onCancel,
  }: {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
  }) => {
    setDialogTitle(title);
    setDialogMessage(message);
    setDialogConfirmText(confirmText);
    setDialogCancelText(cancelText);
    setDialogOnConfirm(() => () => {
      setDialogVisible(false);
      if (onConfirm) onConfirm();
    });
    setDialogOnCancel(onCancel ? () => () => {
      setDialogVisible(false);
      if (onCancel) onCancel();
    } : undefined);
    setDialogVisible(true);
  };

  // Category admin states
  const [selectedCatForAdmin, setSelectedCatForAdmin] = useState<string | null>(null);
  const [adminCatVisible, setAdminCatVisible] = useState(false);
  const [renameCatVisible, setRenameCatVisible] = useState(false);
  const [renameCatText, setRenameCatText] = useState("");

  // Pulse animation for skeleton
  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  // Scale animation for FAB
  const fabScaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Pulse animation loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.7,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    if (isFocused) {
      cargarDatos();
    }
  }, [isFocused]);

  const cargarDatos = async () => {
    setLoading(true);
    await cargarProductos();
    await cargarCategorias();
    setTimeout(() => {
      setLoading(false);
    }, 600);
  };

  useEffect(() => {
    if (!loading) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 6,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      slideAnim.setValue(20);
    }
  }, [loading]);

  const animateFABPress = (toValue: number) => {
    Animated.spring(fabScaleAnim, {
      toValue,
      friction: 4,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    if (route.params?.abrirFormulario) {
      setMostrarFormulario(true);
      setTimeout(() => {
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
      }, 150);
    }
  }, [route.params]);
  useEffect(() => {
    cargarProductos();
  }, []);
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [listaCategorias, setListaCategorias] = useState<string[]>([]);

  const cargarCategorias = async () => {
    const cats = await getData("categorias");
    setListaCategorias(cats || []);
  };

  const getCategoriasDinamicas = () => {
    const uniqueCats = new Set(productos.map((p) => p.categoria).filter(Boolean));
    const combined = Array.from(new Set([...listaCategorias, ...Array.from(uniqueCats)]));
    return ["Todas", ...combined];
  };

  const renameCategory = async (oldCat: string, newCat: string) => {
    const cleanedNewCat = newCat.trim();
    if (!cleanedNewCat || oldCat === cleanedNewCat) return;

    const updatedProds = productos.map((p) =>
      p.categoria === oldCat ? { ...p, categoria: cleanedNewCat } : p
    );
    setProductos(updatedProds);
    await saveData("productos", updatedProds);

    const nuevasCats = listaCategorias.map(c => c === oldCat ? cleanedNewCat : c);
    setListaCategorias(nuevasCats);
    await saveData("categorias", nuevasCats);

    if (selectedCategory === oldCat) {
      setSelectedCategory(cleanedNewCat);
    }
    triggerDialog({
      title: "Categoría Editada",
      message: `La categoría "${oldCat}" ha sido renombrada a "${cleanedNewCat}".`,
    });
  };

  const deleteCategory = async (catToDelete: string) => {
    const updatedProds = productos.map((p) =>
      p.categoria === catToDelete ? { ...p, categoria: "Sin categoría" } : p
    );
    setProductos(updatedProds);
    await saveData("productos", updatedProds);

    const nuevasCats = listaCategorias.filter(c => c !== catToDelete);
    setListaCategorias(nuevasCats);
    await saveData("categorias", nuevasCats);

    if (selectedCategory === catToDelete) {
      setSelectedCategory("Todas");
    }
    triggerDialog({
      title: "Categoría Eliminada",
      message: `La categoría "${catToDelete}" ha sido eliminada y sus productos se marcaron como "Sin categoría".`,
    });
  };
  const productosFiltrados = productos.filter((producto) => {
  const coincideBusqueda = producto.nombre
    .toLowerCase()
    .includes(busqueda.toLowerCase());

  const coincideCategoria =
    selectedCategory === "Todas" ||
    producto.categoria === selectedCategory;

  return coincideBusqueda && coincideCategoria;
});
  const [productoEditando, setProductoEditando] = useState<Producto | null>(null);

  const cargarProductos = async () => {
    const prods = await getData("productos");
    if (Array.isArray(prods) && prods.length > 0) {
      setProductos(prods);
      return;
    }
    // Catálogo vacío: sembramos los productos predeterminados una sola vez.
    setProductos(productosIniciales);
    await saveData("productos", productosIniciales);
  };

  const agregarProducto = async (producto: Producto) => {
    const nuevosProds = [...productos, producto];
    setProductos(nuevosProds);
    await saveData("productos", nuevosProds);
    setMostrarFormulario(false);
    triggerDialog({
      title: "¡Éxito!",
      message: "El producto se ha agregado correctamente al catálogo.",
    });
  };

  const eliminarProducto = async (id: string) => {
    const prod = productos.find((p) => p.id === id);
    if (!prod) return;
    triggerDialog({
      title: "Eliminar Producto",
      message: `¿Estás seguro de que deseas eliminar "${prod.nombre}" del catálogo?`,
      confirmText: "Eliminar",
      cancelText: "Cancelar",
      onConfirm: async () => {
        const nuevosProds = productos.filter((p) => p.id !== id);
        setProductos(nuevosProds);
        await saveData("productos", nuevosProds);
        triggerDialog({
          title: "Producto Eliminado",
          message: "El producto ha sido eliminado con éxito.",
        });
      },
    });
  };

  const editarProducto = async (productoActualizado: Producto) => {
    const nuevosProds = productos.map((p) => (p.id === productoActualizado.id ? productoActualizado : p));
    setProductos(nuevosProds);
    await saveData("productos", nuevosProds);
    setProductoEditando(null);
    setMostrarFormulario(false);
    triggerDialog({
      title: "¡Éxito!",
      message: "El producto se ha actualizado correctamente.",
    });
  };

  return (
    <SafeAreaView style={[styles.container, darkMode && { backgroundColor: "#121212" }]} edges={["top", "bottom"]}>
      <FlatList
        ref={flatListRef}
        data={loading ? [{ id: "s1" }, { id: "s2" }, { id: "s3" }, { id: "s4" }] : productosFiltrados}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{
          justifyContent: "space-between",
          marginBottom: 15,
        }}
        contentContainerStyle={{ paddingBottom: 80 }}
        ListHeaderComponent={
          <View>
            <Text style={[styles.title, darkMode && { color: "#fff" }]}>Catálogo</Text>
            
            <View style={[
              styles.searchContainer,
              darkMode && { backgroundColor: "#1e1e1e", borderColor: "#333" }
            ]}>
              <Search color={darkMode ? "#aaa" : "#666"} size={20} style={{ marginRight: 10 }} />
              <TextInput
                style={[
                  styles.searchInputField,
                  darkMode && { color: "#fff" }
                ]}
                placeholder="Buscar producto..."
                placeholderTextColor={darkMode ? "#777" : "#aaa"}
                value={busqueda}
                onChangeText={setBusqueda}
              />
            </View>

            {showCategories && (
              <View style={styles.filterContainer}>
                <Filter color="#7B2CBF" size={20} style={styles.filterIcon} />
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.categoriesScrollContent}
                >
                  {getCategoriasDinamicas().map((cat) => (
                    <CategoryChip
                      key={cat}
                      cat={cat}
                      selected={selectedCategory === cat}
                      onPress={() => setSelectedCategory(cat)}
                      onLongPress={() => {
                        if (cat !== "Todas") {
                          setSelectedCatForAdmin(cat);
                          setAdminCatVisible(true);
                        }
                      }}
                    />
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, darkMode && { color: "#888" }]}>
                No tenemos nada por acá todavía.
              </Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => {
          if (loading) {
            return (
              <Animated.View style={[
                styles.skeletonCard,
                darkMode ? { backgroundColor: "#1e293b" } : { backgroundColor: "#e2e8f0" },
                { opacity: pulseAnim }
              ]}>
                <View style={[styles.skeletonImage, darkMode ? { backgroundColor: "#334155" } : { backgroundColor: "#cbd5e1" }]} />
                <View style={[styles.skeletonText1, darkMode ? { backgroundColor: "#334155" } : { backgroundColor: "#cbd5e1" }]} />
                <View style={[styles.skeletonText2, darkMode ? { backgroundColor: "#334155" } : { backgroundColor: "#cbd5e1" }]} />
                <View style={[styles.skeletonText3, darkMode ? { backgroundColor: "#334155" } : { backgroundColor: "#cbd5e1" }]} />
              </Animated.View>
            );
          }
          return (
            <ProductCard
              producto={item}
              onDelete={eliminarProducto}
              onEdit={(producto) => {
                setProductoEditando(producto);
                setMostrarFormulario(true);
              }}
            />
          );
        }}
      />

      <Modal
        visible={mostrarFormulario}
        animationType="fade"
        transparent={true}
        onRequestClose={() => {
          setMostrarFormulario(false);
          setProductoEditando(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, darkMode && { backgroundColor: "#1e1e1e" }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, darkMode && { color: "#fff" }]}>
                {productoEditando ? "Editar Producto" : "Nuevo Producto"}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setMostrarFormulario(false);
                  setProductoEditando(null);
                }}
                style={styles.modalCloseButton}
              >
                <X color={darkMode ? "#fff" : "#333"} size={24} />
              </TouchableOpacity>
            </View>
            <ProductForm
              onAgregar={agregarProducto}
              productoEditando={productoEditando}
              onEditar={editarProducto}
            />
          </View>
        </View>
      </Modal>

      <Animated.View style={[styles.fabContainer, { transform: [{ scale: fabScaleAnim }] }]}>
        <TouchableOpacity
          style={styles.fab}
          onPressIn={() => animateFABPress(0.9)}
          onPressOut={() => animateFABPress(1)}
          onPress={() => setMostrarFormulario(!mostrarFormulario)}
        >
          {mostrarFormulario ? (
            <X color="white" size={28} />
          ) : (
            <Plus color="white" size={28} />
          )}
        </TouchableOpacity>
      </Animated.View>

      {/* Modal de Opciones de Categoría */}
      <Modal visible={adminCatVisible} transparent={true} animationType="fade" onRequestClose={() => setAdminCatVisible(false)}>
        <View style={styles.dialogOverlay}>
          <View style={[styles.dialogBox, darkMode && styles.dialogBoxDark]}>
            <Text style={[styles.dialogTitle, darkMode && { color: "#fff" }]}>
              Categoría: {selectedCatForAdmin}
            </Text>
            <Text style={[styles.dialogMessage, darkMode && { color: "#aaa" }]}>
              ¿Qué acción deseas realizar con esta categoría?
            </Text>
            
            <TouchableOpacity
              style={[styles.dialogActionBtn, { backgroundColor: "#7B2CBF" }]}
              onPress={() => {
                setAdminCatVisible(false);
                setRenameCatText(selectedCatForAdmin || "");
                setRenameCatVisible(true);
              }}
            >
              <Text style={styles.dialogActionBtnText}>✏️ Editar nombre</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.dialogActionBtn, { backgroundColor: "#E63946", marginTop: 10 }]}
              onPress={() => {
                setAdminCatVisible(false);
                triggerDialog({
                  title: "Eliminar Categoría",
                  message: `¿Estás seguro de eliminar la categoría "${selectedCatForAdmin}"? Los productos vinculados se marcarán como "Sin categoría".`,
                  confirmText: "Eliminar",
                  cancelText: "Cancelar",
                  onConfirm: () => {
                    if (selectedCatForAdmin) deleteCategory(selectedCatForAdmin);
                  },
                });
              }}
            >
              <Text style={styles.dialogActionBtnText}>🗑️ Eliminar categoría</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.dialogActionBtn, { backgroundColor: "#888", marginTop: 15 }]}
              onPress={() => setAdminCatVisible(false)}
            >
              <Text style={styles.dialogActionBtnText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal para Renombrar Categoría */}
      <Modal visible={renameCatVisible} transparent={true} animationType="fade" onRequestClose={() => setRenameCatVisible(false)}>
        <View style={styles.dialogOverlay}>
          <View style={[styles.dialogBox, darkMode && styles.dialogBoxDark]}>
            <Text style={[styles.dialogTitle, darkMode && { color: "#fff" }]}>
              Renombrar Categoría
            </Text>
            
            <TextInput
              style={[styles.dialogInput, darkMode && { color: "#fff", borderColor: "#555", backgroundColor: "#333" }]}
              placeholder="Nuevo nombre"
              placeholderTextColor="#888"
              value={renameCatText}
              onChangeText={setRenameCatText}
            />

            <View style={{ flexDirection: "row", marginTop: 15 }}>
              <TouchableOpacity
                style={[styles.dialogBtnHalf, { backgroundColor: "#888", marginRight: 8 }]}
                onPress={() => setRenameCatVisible(false)}
              >
                <Text style={styles.dialogActionBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.dialogBtnHalf, { backgroundColor: "#7B2CBF" }]}
                onPress={() => {
                  setRenameCatVisible(false);
                  if (selectedCatForAdmin && renameCatText) {
                    renameCategory(selectedCatForAdmin, renameCatText);
                  }
                }}
              >
                <Text style={styles.dialogActionBtnText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <CustomDialog
        visible={dialogVisible}
        title={dialogTitle}
        message={dialogMessage}
        confirmText={dialogConfirmText}
        cancelText={dialogCancelText}
        onConfirm={dialogOnConfirm}
        onCancel={dialogOnCancel}
      />

      {loading && (
        <View style={styles.centeredLoader}>
          <ActivityIndicator color="#7B2CBF" size="large" />
        </View>
      )}
    </SafeAreaView>
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  searchInputField: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 0,
    outlineWidth: 0,
  },
  filterContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  filterIcon: {
    marginRight: 10,
  },
  categoriesScrollContent: {
    alignItems: "center",
    paddingRight: 20,
  },
  categoryChip: {
    backgroundColor: "#eee",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  categoryChipActive: {
    backgroundColor: "#7B2CBF",
    borderColor: "#7B2CBF",
  },
  categoryChipText: {
    color: "#555",
    fontWeight: "600",
    fontSize: 14,
  },
  categoryChipTextActive: {
    color: "#fff",
    fontWeight: "700",
  },
  fabContainer: {
    position: "absolute",
    bottom: 20,
    right: 20,
    borderRadius: 30,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    backgroundColor: "#7B2CBF",
    width: 60,
    height: 60,
  },
  fab: {
    width: "100%",
    height: "100%",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    width: "100%",
    maxWidth: 480,
    borderRadius: 20,
    padding: 24,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  modalCloseButton: {
    padding: 4,
  },
  skeletonCard: {
    width: "48%",
    backgroundColor: "#eee",
    borderRadius: 15,
    padding: 12,
    height: 320,
    marginBottom: 15,
  },
  skeletonImage: {
    width: "100%",
    height: 180,
    backgroundColor: "#ddd",
    borderRadius: 10,
    marginBottom: 12,
  },
  skeletonText1: {
    width: "80%",
    height: 16,
    backgroundColor: "#ddd",
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonText2: {
    width: "50%",
    height: 12,
    backgroundColor: "#ddd",
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonText3: {
    width: "30%",
    height: 18,
    backgroundColor: "#ddd",
    borderRadius: 4,
  },
  dialogOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  dialogBox: {
    backgroundColor: "#ffffff",
    width: "90%",
    maxWidth: 360,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    elevation: 5,
  },
  dialogBoxDark: {
    backgroundColor: "#1e1e1e",
  },
  dialogTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
    textAlign: "center",
  },
  dialogMessage: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  dialogActionBtn: {
    width: "100%",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  dialogActionBtnText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 15,
  },
  dialogInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    width: "100%",
    fontSize: 16,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  dialogBtnHalf: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  centeredLoader: {
    position: "absolute",
    top: 150,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 45,
    width: "100%",
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "600",
  },
});