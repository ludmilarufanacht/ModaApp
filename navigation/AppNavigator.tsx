import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import BottomTabs from "./BottomTabs";
import LoginScreen from "../screens/LoginScreen";
import HomeScreen from "../screens/HomeScreen";
import CatalogoScreen from "../screens/CatalogoScreen";
import StatisticsScreen from "../screens/StatisticsScreen";
import SettingsScreen from "../screens/SettingsScreen";
import SalesScreen from "../screens/SalesScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
  <Stack.Navigator>

    <Stack.Screen
      name="Login"
      component={LoginScreen}
      options={{ headerShown: false }}
    />

    <Stack.Screen
      name="Principal"
      component={BottomTabs}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="Home"
      component={HomeScreen}
      options={{ headerShown: false}}
    />
    <Stack.Screen
      name="Catalogo"
      component={CatalogoScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="Estadísticas"
      component={StatisticsScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="Ventas"
      component={SalesScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="Configuración"
      component={SettingsScreen}
      options={{ headerShown: false }}
    />
  </Stack.Navigator>
</NavigationContainer>
  );
}
