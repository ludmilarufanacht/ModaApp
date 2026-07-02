import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getData, saveData } from "../services/storage";
import LoadingOverlay from "../components/LoadingOverlay";

type Props = {
  navigation: any;
};

export default function LoginScreen({ navigation }: Props) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const handleAuth = async () => {
    setErrorMsg("");
    
    const cleanUser = user.trim();
    const cleanPass = pass.trim();

    if (!cleanUser || !cleanPass) {
      setErrorMsg("Por favor, completa todos los campos.");
      return;
    }

    // Cargar usuarios de almacenamiento local
    let usuariosExistentes;
    try {
      usuariosExistentes = await getData("usuarios");
    } catch (err) {
      console.warn("Error al acceder a los datos de usuarios:", err);
      setErrorMsg("No pudimos acceder a los datos. Cerrá y volvé a abrir la app.");
      return;
    }
    // Usuario por defecto si está vacío
    const listaUsuarios =
      Array.isArray(usuariosExistentes) && usuariosExistentes.length > 0
        ? usuariosExistentes
        : [{ user: "ludmi", pass: "1234" }];

    if (isRegister) {
      if (cleanPass !== confirmPass.trim()) {
        setErrorMsg("Las contraseñas no coinciden.");
        return;
      }
      
      const existe = listaUsuarios.find(
        (u: any) => u.user.toLowerCase() === cleanUser.toLowerCase()
      );
      
      if (existe) {
        setErrorMsg("El nombre de usuario ya está en uso.");
        return;
      }

      const nuevosUsuarios = [...listaUsuarios, { user: cleanUser, pass: cleanPass }];
      await saveData("usuarios", nuevosUsuarios);
      
      if (Platform.OS === "web") {
        window.alert("Cuenta creada correctamente. ¡Ya puedes iniciar sesión!");
      } else {
        Alert.alert("Éxito", "Cuenta creada correctamente. ¡Ya puedes iniciar sesión!");
      }
      setIsRegister(false);
      setPass("");
      setConfirmPass("");
      setErrorMsg("");
    } else {
      const usuarioEncontrado = listaUsuarios.find(
        (u: any) =>
          u.user.toLowerCase() === cleanUser.toLowerCase() && u.pass === cleanPass
      );

      if (usuarioEncontrado) {
        setAuthLoading(true);
        setTimeout(() => {
          setAuthLoading(false);
          navigation.replace("Principal", {
            screen: "Inicio",
            params: { usuario: cleanUser },
          });
        }, 2000);
      } else {
        setErrorMsg("Usuario o contraseña incorrectos.");
      }
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.card}>
        <Text style={styles.title}>Moda App</Text>
        <Text style={styles.subtitle}>
          {isRegister ? "Crea una cuenta nueva" : "Inicia sesión para continuar"}
        </Text>

        {errorMsg ? <Text style={styles.errorText}>⚠️ {errorMsg}</Text> : null}

        <TextInput
          placeholder="Usuario"
          placeholderTextColor="#aaa"
          style={styles.input}
          value={user}
          onChangeText={setUser}
          autoCapitalize="none"
        />

        <TextInput
          placeholder="Contraseña"
          placeholderTextColor="#aaa"
          secureTextEntry
          style={styles.input}
          value={pass}
          onChangeText={setPass}
          autoCapitalize="none"
        />

        {isRegister && (
          <TextInput
            placeholder="Confirmar Contraseña"
            placeholderTextColor="#aaa"
            secureTextEntry
            style={styles.input}
            value={confirmPass}
            onChangeText={setConfirmPass}
            autoCapitalize="none"
          />
        )}

        <TouchableOpacity style={styles.button} onPress={handleAuth}>
          <Text style={styles.buttonText}>
            {isRegister ? "Registrarse" : "Ingresar"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.switchButton}
          onPress={() => {
            setIsRegister(!isRegister);
            setErrorMsg("");
            setPass("");
            setConfirmPass("");
          }}
        >
          <Text style={styles.switchText}>
            {isRegister
              ? "¿Ya tienes cuenta? Inicia sesión"
              : "¿No tienes cuenta? Regístrate aquí"}
          </Text>
        </TouchableOpacity>
      </View>
      <LoadingOverlay visible={authLoading} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f6f6f6",
    padding: 20,
  },
  card: {
    backgroundColor: "#fff",
    width: "100%",
    maxWidth: 400,
    padding: 30,
    borderRadius: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  title: {
    fontSize: 28,
    textAlign: "center",
    fontWeight: "bold",
    color: "#7B2CBF",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 25,
  },
  errorText: {
    color: "#d62828",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    backgroundColor: "#fde8e8",
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    backgroundColor: "#fafafa",
    padding: 14,
    fontSize: 16,
    marginBottom: 15,
    borderRadius: 12,
    color: "#333",
  },
  button: {
    backgroundColor: "#7B2CBF",
    padding: 16,
    borderRadius: 12,
    marginTop: 10,
    elevation: 2,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
  switchButton: {
    marginTop: 20,
    padding: 10,
  },
  switchText: {
    color: "#7B2CBF",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 14,
  },
});