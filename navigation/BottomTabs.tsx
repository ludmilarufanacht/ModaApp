import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import HomeScreen from "../screens/HomeScreen";
import CatalogoScreen from "../screens/CatalogoScreen";
import SalesScreen from "../screens/SalesScreen";
import StatisticsScreen from "../screens/StatisticsScreen";

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#7B2CBF",

        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = "home";

          switch (route.name) {
            case "Inicio":
              iconName = "home";
              break;
            case "Stock":
              iconName = "cube";
              break;
            case "Ventas":
              iconName = "cash";
              break;
            case "Patrones":
              iconName = "color-palette";
              break;
            case "Estadísticas":
              iconName = "bar-chart";
              break;
          }

          return (
            <Ionicons
              name={iconName}
              size={size}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen name="Inicio" component={HomeScreen} />
      <Tab.Screen name="Catalogo" component={CatalogoScreen} />
      <Tab.Screen name="Ventas" component={SalesScreen} />
      <Tab.Screen
        name="Estadísticas"
        component={StatisticsScreen}
      />
    </Tab.Navigator>
  );
}