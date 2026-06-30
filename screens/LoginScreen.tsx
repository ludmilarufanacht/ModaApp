import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import { getData, saveData } from "../services/storage";

const usuario = "admin";
const password = "1234";

type Cuenta = {
  usuario: string;
  password: string;
};

type Props = {
  navigation: any;
};

export default function LoginScreen({ navigation }: Props) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [confirmarPass, setConfirmarPass] =
    useState("");
  const [crearCuenta, setCrearCuenta] =
    useState(false);
  const [mostrarPassword, setMostrarPassword] =
    useState(false);
  const [mensajeError, setMensajeError] =
    useState("");
  const [cuentaCreada, setCuentaCreada] =
    useState(false);

  const iniciarSesion = async () => {
    setMensajeError("");
    setCuentaCreada(false);

    if (!user.trim() || !pass.trim()) {
      setMensajeError("Debe completar todos los campos.");
      return;
    }

    const usuarioIngresado = user.trim();
    const usuariosGuardados: Cuenta[] =
      await getData("usuarios");

    const existeUsuarioGuardado =
      usuariosGuardados.some(
        (cuenta) =>
          cuenta.usuario === usuarioIngresado &&
          cuenta.password === pass
      );

    if (
      (usuarioIngresado !== usuario ||
        pass !== password) &&
      !existeUsuarioGuardado
    ) {
      setMensajeError("Usuario o contraseña incorrectos.");
      return;
    }

    navigation.navigate("Principal");
  };

  const registrarCuenta = async () => {
    setMensajeError("");
    setCuentaCreada(false);

    if (
      !user.trim() ||
      !pass.trim() ||
      !confirmarPass.trim()
    ) {
      setMensajeError("Debe completar todos los campos.");
      return;
    }

    if (pass !== confirmarPass) {
      setMensajeError("Las contraseñas no coinciden.");
      return;
    }

    const usuariosGuardados: Cuenta[] =
      await getData("usuarios");
    const usuarioNuevo = user.trim();

    const usuarioExiste =
      usuarioNuevo === usuario ||
      usuariosGuardados.some(
        (cuenta) => cuenta.usuario === usuarioNuevo
      );

    if (usuarioExiste) {
      setMensajeError("Ese usuario ya existe.");
      return;
    }

    const nuevosUsuarios = [
      ...usuariosGuardados,
      {
        usuario: usuarioNuevo,
        password: pass,
      },
    ];

    await saveData("usuarios", nuevosUsuarios);

    setCrearCuenta(false);
    setPass("");
    setConfirmarPass("");
    setMensajeError("Cuenta creada. Ya puede ingresar.");
    setCuentaCreada(true);
  };

  const cambiarModo = () => {
    setCrearCuenta(!crearCuenta);
    setMensajeError("");
    setCuentaCreada(false);
    setPass("");
    setConfirmarPass("");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Fashion Manager</Text>
      <Text style={styles.subtitle}>
        {crearCuenta
          ? "Crear cuenta"
          : "Iniciar sesión"}
      </Text>

      <TextInput
        placeholder="Usuario"
        style={styles.input}
        value={user}
        onChangeText={setUser}
      />

      <TextInput
        placeholder="Contraseña"
        value={pass}
        onChangeText={setPass}
        secureTextEntry={!mostrarPassword}
        style={styles.input}
      />

      {crearCuenta && (
        <TextInput
          placeholder="Confirmar contraseña"
          value={confirmarPass}
          onChangeText={setConfirmarPass}
          secureTextEntry={!mostrarPassword}
          style={styles.input}
        />
      )}

      <TouchableOpacity
        onPress={() =>
          setMostrarPassword(!mostrarPassword)
        }
      >
        <Text style={styles.mostrar}>
          {mostrarPassword
            ? "Ocultar contraseña"
            : "Mostrar contraseña"}
        </Text>
      </TouchableOpacity>

      {mensajeError ? (
        <Text
          style={[
            styles.message,
            cuentaCreada
              ? styles.success
              : styles.error,
          ]}
        >
          {mensajeError}
        </Text>
      ) : null}
      <TouchableOpacity
        style={styles.button}
        onPress={
          crearCuenta
            ? registrarCuenta
            : iniciarSesion
        }
      >
        <Text style={styles.buttonText}>
          {crearCuenta
            ? "Crear cuenta"
            : "Ingresar"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.linkButton}
        onPress={cambiarModo}
      >
        <Text style={styles.linkText}>
          {crearCuenta
            ? "Ya tengo una cuenta"
            : "Crear una cuenta"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 32,
    textAlign: "center",
    marginBottom: 8,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 30,
    color: "#555",
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    marginBottom: 15,
    borderRadius: 10,
  },
  button: {
    backgroundColor: "#7B2CBF",
    padding: 15,
    borderRadius: 10,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
  message: {
    marginBottom: 15,
    textAlign: "center",
  },
  error: {
    color: "red",
  },
  success: {
    color: "green",
  },
  mostrar: {
    color: "#7B2CBF",
    textAlign: "right",
    marginBottom: 15,
  },
  linkButton: {
    padding: 15,
    marginTop: 5,
  },
  linkText: {
    color: "#7B2CBF",
    textAlign: "center",
    fontWeight: "bold",
  },
});
