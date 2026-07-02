import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const BACKEND_URL = "http://localhost:3000/api/db";

export const saveData = async (key: string, value: any) => {
  // 1. Save to AsyncStorage
  await AsyncStorage.setItem(key, JSON.stringify(value));

  // 2. If on web, try to sync to db.json on local server
  if (Platform.OS === "web") {
    try {
      const productosStr = await AsyncStorage.getItem("productos");
      const ventasStr = await AsyncStorage.getItem("ventas");
      const categoriasStr = await AsyncStorage.getItem("categorias");
      const usuariosStr = await AsyncStorage.getItem("usuarios");

      const dbState = {
        productos: key === "productos" ? value : (productosStr ? JSON.parse(productosStr) : []),
        ventas: key === "ventas" ? value : (ventasStr ? JSON.parse(ventasStr) : []),
        categorias: key === "categorias" ? value : (categoriasStr ? JSON.parse(categoriasStr) : []),
        usuarios: key === "usuarios" ? value : (usuariosStr ? JSON.parse(usuariosStr) : [
          { user: "ludmi", pass: "1234" }
        ]),
      };

      await fetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dbState),
      });
    } catch (err) {
      console.warn("Could not sync with local database server. Saving locally only.");
    }
  }
};

export const getData = async (key: string) => {
  // 1. Try to load from local db server first (if on web) to sync dev changes
  if (Platform.OS === "web") {
    try {
      const res = await fetch(BACKEND_URL);
      const data = await res.json();
      if (data && data[key] !== undefined) {
        // Sync back to AsyncStorage so they match
        await AsyncStorage.setItem(key, JSON.stringify(data[key]));
        return data[key];
      }
    } catch (err) {
      console.warn("Could not load from database server. Falling back to local storage.");
    }
  }

  // 2. Fallback to AsyncStorage
  const value = await AsyncStorage.getItem(key);
  return value ? JSON.parse(value) : [];
};