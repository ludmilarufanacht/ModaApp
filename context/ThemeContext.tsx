import React, { createContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type ThemeContextType = {
  darkMode: boolean;
  toggleTheme: () => void;
  showCategories: boolean;
  toggleCategories: () => void;
};

export const ThemeContext = createContext<ThemeContextType>({
  darkMode: false,
  toggleTheme: () => {},
  showCategories: true,
  toggleCategories: () => {},
});

type ThemeProviderProps = {
  children: ReactNode;
};

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [darkMode, setDarkMode] = useState(false);
  const [showCategories, setShowCategories] = useState(true);

  useEffect(() => {
    // Load persisted settings on mount
    const loadSettings = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem("darkModeSetting");
        const savedCats = await AsyncStorage.getItem("showCategoriesSetting");
        if (savedTheme !== null) {
          setDarkMode(JSON.parse(savedTheme));
        }
        if (savedCats !== null) {
          setShowCategories(JSON.parse(savedCats));
        }
      } catch (err) {
        console.warn("Failed to load app settings from AsyncStorage");
      }
    };
    loadSettings();
  }, []);

  const toggleTheme = async () => {
    const nextVal = !darkMode;
    setDarkMode(nextVal);
    await AsyncStorage.setItem("darkModeSetting", JSON.stringify(nextVal));
  };

  const toggleCategories = async () => {
    const nextVal = !showCategories;
    setShowCategories(nextVal);
    await AsyncStorage.setItem("showCategoriesSetting", JSON.stringify(nextVal));
  };

  return (
    <ThemeContext.Provider
      value={{
        darkMode,
        toggleTheme,
        showCategories,
        toggleCategories,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};