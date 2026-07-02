import React, { useEffect, useState, useRef, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
  Modal,
  Alert,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Filter, Search, Trash2, Plus, Minus, X } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useIsFocused } from "@react-navigation/native";
import { ThemeContext } from "../context/ThemeContext";
import { saveData, getData } from "../services/storage";
import CustomDialog from "../components/CustomDialog";

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
  const isFocused = useIsFocused();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [cart, setCart] = useState<{ producto: Producto; cantidad: number }[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [observaciones, setObservaciones] = useState("");
  const [loading, setLoading] = useState(true);
  const { darkMode } = useContext(ThemeContext);

  // Screen Transitions
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  // Search Modal slide animation
  const searchModalAnim = useRef(new Animated.Value(0)).current;

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

  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
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
    const p = await getData("productos");
    const v = await getData("ventas");
    setProductos(p || []);
    setVentas(v || []);
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

  // Despliegue del buscador: al abrirse, el panel baja con un pequeño
  // desplazamiento y aparece con fade (animación de "slide down").
  useEffect(() => {
    if (showSearchModal) {
      searchModalAnim.setValue(0);
      Animated.spring(searchModalAnim, {
        toValue: 1,
        friction: 8,
        tension: 60,
        useNativeDriver: true,
      }).start();
    } else {
      searchModalAnim.setValue(0);
    }
  }, [showSearchModal]);

  const getCategoriasDinamicas = () => {
    const uniqueCats = productos.map((p) => p.categoria).filter(Boolean);
    return ["Todas", ...Array.from(new Set(uniqueCats))];
  };

  const filteredProducts = productos.filter((p) => {
    const query = searchQuery.trim().toLowerCase();
    const coincideBusqueda =
      !query ||
      p.nombre.toLowerCase().includes(query) ||
      p.categoria.toLowerCase().includes(query) ||
      p.talle.toLowerCase().includes(query) ||
      p.color.toLowerCase().includes(query);

    const coincideCategoria =
      selectedCategory === "Todas" || p.categoria === selectedCategory;

    return coincideBusqueda && coincideCategoria;
  });

  const addToCart = (producto: Producto) => {
    const existing = cart.find((item) => item.producto.id === producto.id);
    if (existing) {
      if (existing.cantidad + 1 > producto.cantidad) {
        Alert.alert("Stock insuficiente", `Solo quedan ${producto.cantidad} unidades.`);
        return;
      }
      setCart(
        cart.map((item) =>
          item.producto.id === producto.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        )
      );
    } else {
      if (producto.cantidad < 1) {
        triggerDialog({
          title: "Sin Stock",
          message: "Este producto no tiene stock disponible.",
        });
        return;
      }
      setCart([...cart, { producto, cantidad: 1 }]);
    }
    setSearchQuery("");
    setShowSearchModal(false);
  };

  const updateCartQty = (id: string, newQty: number) => {
    if (newQty <= 0) {
      removeFromCart(id);
      return;
    }
    const item = cart.find((i) => i.producto.id === id);
    if (item && newQty > item.producto.cantidad) {
      triggerDialog({
        title: "Stock insuficiente",
        message: `Solo quedan ${item.producto.cantidad} unidades de este producto.`,
      });
      return;
    }
    setCart(
      cart.map((i) =>
        i.producto.id === id ? { ...i, cantidad: newQty } : i
      )
    );
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter((item) => item.producto.id !== id));
  };

  const calcularTotal = () => {
    return cart.reduce((sum, item) => sum + item.producto.precio * item.cantidad, 0);
  };

  const preRegistrarVenta = () => {
    if (cart.length === 0) return;
    triggerDialog({
      title: "Confirmar Venta",
      message: `¿Estás seguro de registrar esta venta por un total de $${calcularTotal()}?`,
      confirmText: "Confirmar",
      cancelText: "Cancelar",
      onConfirm: registrarVentaCompleta,
    });
  };

  const registrarVentaCompleta = async () => {
    if (cart.length === 0) return;

    // Create a list of sales records, one for each cart item
    const nuevasVentasRegistradas: Venta[] = cart.map((item) => ({
      id: `${Date.now()}-${item.producto.id}`,
      productoId: item.producto.id,
      productoNombre: `${item.producto.nombre} (${item.producto.talle}/${item.producto.color})`,
      cantidad: item.cantidad,
      total: item.cantidad * item.producto.precio,
      fecha: new Date().toLocaleDateString(),
    }));

    // Add them to existing sales list
    const nuevasVentas = [...ventas, ...nuevasVentasRegistradas];

    // Discount stock from catalog products
    const nuevosProductos = productos.map((p) => {
      const cartItem = cart.find((item) => item.producto.id === p.id);
      if (cartItem) {
        return {
          ...p,
          cantidad: Math.max(0, p.cantidad - cartItem.cantidad),
        };
      }
      return p;
    });

    // Update states
    setVentas(nuevasVentas);
    setProductos(nuevosProductos);
    setCart([]);
    setObservaciones("");

    // Save to AsyncStorage
    await saveData("ventas", nuevasVentas);
    await saveData("productos", nuevosProductos);

    triggerDialog({
      title: "¡Venta Registrada!",
      message: "La venta se ha procesado con éxito.",
    });
  };


  return (
    <SafeAreaView style={[styles.container, darkMode && { backgroundColor: "#121212" }]} edges={["top", "bottom"]}>
      {loading ? (
        <View style={styles.centeredLoader}>
          <ActivityIndicator size="large" color="#7B2CBF" />
          <Text style={[styles.loaderText, { marginTop: 12 }, darkMode && { color: "#aaa" }]}>
            Cargando ventas...
          </Text>
        </View>
      ) : (
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], flex: 1 }}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Text style={[styles.title, darkMode && { color: "#fff" }]}>
              Registro de Ventas
            </Text>

            {/* Buscador de Producto */}
            <Text style={[styles.subtitle, darkMode && { color: "#fff" }]}>Agregar Productos a la Venta</Text>
        <TouchableOpacity
          style={[styles.searchSelector, darkMode && { backgroundColor: "#1e1e1e", borderColor: "#333" }]}
          onPress={() => setShowSearchModal(true)}
        >
          <Search color={darkMode ? "#aaa" : "#666"} size={20} style={{ marginRight: 10 }} />
          <Text style={{ color: darkMode ? "#888" : "#888", fontSize: 16 }}>
            {searchQuery ? searchQuery : "Buscar producto por nombre, talle, color..."}
          </Text>
        </TouchableOpacity>

        {/* Modal de búsqueda en tiempo real */}
        <Modal
          visible={showSearchModal}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setShowSearchModal(false)}
        >
          <View style={styles.modalOverlay}>
            <Animated.View
              style={[
                styles.searchModalContent,
                darkMode && { backgroundColor: "#1e1e1e" },
                {
                  opacity: searchModalAnim,
                  transform: [
                    {
                      translateY: searchModalAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-60, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, darkMode && { color: "#fff" }]}>Buscar Producto</Text>
                <TouchableOpacity onPress={() => setShowSearchModal(false)}>
                  <X color={darkMode ? "#fff" : "#333"} size={24} />
                </TouchableOpacity>
              </View>

              <TextInput
                style={[
                  styles.searchInput,
                  darkMode && { backgroundColor: "#2c2c2c", color: "#fff", borderColor: "#444" },
                ]}
                placeholder="Nombre, categoría, talle o color..."
                placeholderTextColor={darkMode ? "#777" : "#888"}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />

              <View style={styles.categoryFilterHeader}>
                <Filter color="#7B2CBF" size={18} />
                <Text style={[styles.categoryFilterTitle, darkMode && { color: "#fff" }]}>
                  Categoría
                </Text>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryChipsRow}
              >
                {getCategoriasDinamicas().map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryChip,
                      darkMode && { backgroundColor: "#2c2c2c", borderColor: "#444" },
                      selectedCategory === cat && styles.categoryChipActive,
                    ]}
                    onPress={() => setSelectedCategory(cat)}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        darkMode && { color: "#ddd" },
                        selectedCategory === cat && styles.categoryChipTextActive,
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <ScrollView style={{ maxHeight: 350, marginTop: 10 }}>
                {filteredProducts.length === 0 ? (
                  <Text style={{ textAlign: "center", color: "#888", marginVertical: 20 }}>
                    No se encontraron productos coincidentes.
                  </Text>
                ) : (
                  filteredProducts.map((p) => (
                    <TouchableOpacity
                      key={p.id}
                      style={[styles.searchItem, darkMode && { borderBottomColor: "#333" }]}
                      onPress={() => addToCart(p)}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.searchItemName, darkMode && { color: "#fff" }]}>
                          {p.nombre}
                        </Text>
                        <Text style={{ color: "#888", fontSize: 13 }}>
                          Cat: {p.categoria} | Talle: {p.talle} | Color: {p.color}
                        </Text>
                      </View>
                      <View style={{ alignItems: "flex-end" }}>
                        <Text style={{ fontWeight: "bold", color: "#7B2CBF" }}>${p.precio}</Text>
                        <Text style={{ color: p.cantidad <= 3 ? "#d62828" : "#28a745", fontSize: 12 }}>
                          Stock: {p.cantidad}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            </Animated.View>
          </View>
        </Modal>

        {/* Carrito de Compras */}
        <Text style={[styles.subtitle, darkMode && { color: "#fff" }]}>Carrito de Ventas</Text>
        {cart.length === 0 ? (
          <View style={[styles.emptyCartBox, darkMode && { backgroundColor: "#1e1e1e" }]}>
            <Text style={{ color: "#888", textAlign: "center" }}>
              El carrito está vacío. Agrega productos arriba para registrar una venta.
            </Text>
          </View>
        ) : (
          <View style={[styles.cartBox, darkMode && { backgroundColor: "#1e1e1e" }]}>
            {cart.map((item) => (
              <View key={item.producto.id} style={[styles.cartItem, darkMode && { borderBottomColor: "#333" }]}>
                <View style={{ flex: 1, marginRight: 10 }}>
                  <Text style={[styles.cartItemName, darkMode && { color: "#fff" }]} numberOfLines={1}>
                    {item.producto.nombre}
                  </Text>
                  <Text style={{ color: "#888", fontSize: 12 }}>
                    Talle: {item.producto.talle} | Color: {item.producto.color} | ${item.producto.precio} c/u
                  </Text>
                </View>

                {/* Controles de cantidad pequeños */}
                <View style={styles.cartControls}>
                  <TouchableOpacity
                    style={styles.qtyBtnSmall}
                    onPress={() => updateCartQty(item.producto.id, item.cantidad - 1)}
                  >
                    <Minus color="#666" size={14} />
                  </TouchableOpacity>
                  <Text style={[styles.qtyTextSmall, darkMode && { color: "#fff" }]}>
                    {item.cantidad}
                  </Text>
                  <TouchableOpacity
                    style={styles.qtyBtnSmall}
                    onPress={() => updateCartQty(item.producto.id, item.cantidad + 1)}
                  >
                    <Plus color="#666" size={14} />
                  </TouchableOpacity>
                  <Text style={[styles.cartItemTotal, darkMode && { color: "#fff" }]}>
                    ${item.producto.precio * item.cantidad}
                  </Text>
                  <TouchableOpacity
                    onPress={() => removeFromCart(item.producto.id)}
                    style={styles.deleteCartItemBtn}
                  >
                    <Trash2 color="#d62828" size={18} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            {/* Total general del carrito */}
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, darkMode && { color: "#fff" }]}>Total a Pagar:</Text>
              <Text style={styles.totalValue}>${calcularTotal()}</Text>
            </View>
          </View>
        )}

        {/* Recuadro de Observaciones */}
        {cart.length > 0 && (
          <View style={{ marginTop: 15 }}>
            <Text style={[styles.label, darkMode && { color: "#fff" }]}>Observaciones</Text>
            <TextInput
              style={[
                styles.observacionesInput,
                darkMode && { backgroundColor: "#1e1e1e", color: "#fff", borderColor: "#333" },
              ]}
              placeholder="Observaciones de la venta (ej. Pago con tarjeta, entrega pendiente...)"
              placeholderTextColor={darkMode ? "#666" : "#888"}
              value={observaciones}
              onChangeText={setObservaciones}
              multiline
              numberOfLines={3}
            />

            <TouchableOpacity style={styles.button} onPress={preRegistrarVenta}>
              <Text style={styles.buttonText}>Registrar Venta</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Ventas Realizadas */}
        <Text style={[styles.subtitle, darkMode && { color: "#fff" }]}>Ventas Realizadas</Text>

        {loading ? (
          [1, 2].map((i) => (
            <Animated.View
              key={i}
              style={[
                styles.skeletonCard,
                darkMode && { backgroundColor: "#2c2c2c" },
                { opacity: pulseAnim },
              ]}
            >
              <View style={[styles.skeletonText1, darkMode && { backgroundColor: "#3a3a3a" }]} />
              <View style={[styles.skeletonText2, darkMode && { backgroundColor: "#3a3a3a" }]} />
              <View style={[styles.skeletonText3, darkMode && { backgroundColor: "#3a3a3a" }]} />
            </Animated.View>
          ))
        ) : ventas.length === 0 ? (
          <Text style={[styles.noVentas, darkMode && { color: "#888" }]}>
            Aún no hay ventas registradas.
          </Text>
        ) : (
          [...ventas].reverse().map((item) => (
            <View key={item.id} style={[styles.card, darkMode && { backgroundColor: "#1e1e1e" }]}>
              <Text style={[styles.cardProducto, darkMode && { color: "#fff" }]}>
                {item.productoNombre}
              </Text>
              <Text style={[styles.cardDetalle, darkMode && { color: "#aaa" }]}>
                Cantidad: {item.cantidad} | Total: ${item.total}
              </Text>
              <Text style={[styles.cardFecha, darkMode && { color: "#777" }]}>
                {item.fecha}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
        </Animated.View>
      )}

      <CustomDialog
        visible={dialogVisible}
        title={dialogTitle}
        message={dialogMessage}
        confirmText={dialogConfirmText}
        cancelText={dialogCancelText}
        onConfirm={dialogOnConfirm}
        onCancel={dialogOnCancel}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f6f6f6",
  },
  scrollContent: {
    paddingBottom: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 10,
    color: "#333",
  },
  searchSelector: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 80,
    paddingHorizontal: 15,
  },
  searchModalContent: {
    backgroundColor: "#fff",
    width: "95%",
    maxWidth: 640,
    borderRadius: 20,
    padding: 20,
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
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    fontSize: 16,
    marginBottom: 10,
  },
  categoryFilterHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  categoryFilterTitle: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  categoryChipsRow: {
    alignItems: "center",
    paddingBottom: 8,
  },
  categoryChip: {
    backgroundColor: "#f2f2f2",
    borderWidth: 1,
    borderColor: "#e2e2e2",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: "#7B2CBF",
    borderColor: "#7B2CBF",
  },
  categoryChipText: {
    color: "#555",
    fontSize: 13,
    fontWeight: "700",
  },
  categoryChipTextActive: {
    color: "#fff",
  },
  searchItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  searchItemName: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 2,
  },
  emptyCartBox: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#eee",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
  },
  cartBox: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: "#eee",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cartItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  cartItemName: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
  },
  cartControls: {
    flexDirection: "row",
    alignItems: "center",
  },
  qtyBtnSmall: {
    backgroundColor: "#eee",
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyTextSmall: {
    fontSize: 14,
    fontWeight: "bold",
    marginHorizontal: 8,
    minWidth: 14,
    textAlign: "center",
    color: "#333",
  },
  cartItemTotal: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 15,
    minWidth: 45,
    textAlign: "right",
  },
  deleteCartItemBtn: {
    marginLeft: 12,
    padding: 4,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 15,
    paddingTop: 10,
    borderTopWidth: 1.5,
    borderTopColor: "#eee",
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  totalValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#7B2CBF",
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 6,
  },
  observacionesInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    fontSize: 14,
    marginBottom: 15,
    textAlignVertical: "top",
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
    fontSize: 16,
  },
  noVentas: {
    color: "#888",
    fontStyle: "italic",
    textAlign: "center",
    marginVertical: 10,
  },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#eee",
  },
  cardProducto: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  cardDetalle: {
    fontSize: 14,
    color: "#555",
    marginBottom: 5,
  },
  cardFecha: {
    fontSize: 12,
    color: "#999",
  },
  skeletonCard: {
    padding: 15,
    height: 90,
    borderRadius: 12,
    marginBottom: 10,
  },
  skeletonText1: {
    width: "70%",
    height: 16,
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonText2: {
    width: "50%",
    height: 12,
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonText3: {
    width: "30%",
    height: 10,
    borderRadius: 4,
  },
  loaderContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loaderText: {
    marginTop: 12,
    fontSize: 15,
    color: "#555",
    fontWeight: "500",
  },
  centeredLoader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
});