import React, { useContext } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Home, Package, ShoppingBag, BarChart3 } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemeContext } from "../context/ThemeContext";

import HomeScreen from "../screens/HomeScreen";
import CatalogoScreen from "../screens/CatalogoScreen";
import SalesScreen from "../screens/SalesScreen";
import StatisticsScreen from "../screens/StatisticsScreen";

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  const { darkMode } = useContext(ThemeContext);
  // Insets reales del dispositivo (notch, home indicator, barra de gestos).
  // En web `insets.bottom` es 0, así que NO agregamos padding inferior extra
  // (eso era lo que dejaba una franja blanca vacía). En móvil, en cambio, se
  // suma el inset para que las etiquetas no queden tapadas por la barra.
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        animation: "fade", // Cross-fade screen navigation transition
        tabBarActiveTintColor: "#7B2CBF",
        tabBarInactiveTintColor: "#666",
        // Alto base 60 + el inset inferior. El contenido útil del ítem
        // (icono + etiqueta) queda en 60 - paddingTop(8) = ~52px, suficiente
        // para que la etiqueta no se recorte, sin franja blanca en web.
        tabBarStyle: {
          height: 60 + insets.bottom,
          paddingTop: 8,
          paddingBottom: insets.bottom,
          backgroundColor: darkMode ? "#1e1e1e" : "#ffffff",
          borderTopWidth: 1,
          borderTopColor: darkMode ? "#333333" : "#eeeeee",
          elevation: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginTop: 2,
        },

        tabBarIcon: ({ color, size }) => {
          switch (route.name) {
            case "Inicio":
              return <Home color={color} size={size} />;
            case "Catálogo":
              return <Package color={color} size={size} />;
            case "Ventas":
              return <ShoppingBag color={color} size={size} />;
            case "Estadísticas":
              return <BarChart3 color={color} size={size} />;
            default:
              return <Home color={color} size={size} />;
          }
        },
      })}
    >
      <Tab.Screen name="Inicio" component={HomeScreen} />
      <Tab.Screen name="Catálogo" component={CatalogoScreen} />
      <Tab.Screen name="Ventas" component={SalesScreen} />
      <Tab.Screen name="Estadísticas" component={StatisticsScreen} />
    </Tab.Navigator>
  );
}
