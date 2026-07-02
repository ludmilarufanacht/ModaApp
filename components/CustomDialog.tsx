import React, { useContext, useEffect, useRef } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import { ThemeContext } from "../context/ThemeContext";

type Props = {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
};

export default function CustomDialog({
  visible,
  title,
  message,
  confirmText = "Aceptar",
  cancelText = "Cancelar",
  onConfirm,
  onCancel,
}: Props) {
  const { darkMode } = useContext(ThemeContext);
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0.85);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.dialogContainer,
            darkMode && styles.dialogContainerDark,
            {
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Text style={[styles.title, darkMode && styles.textDark]}>
            {title}
          </Text>
          <Text style={[styles.message, darkMode && styles.messageDark]}>
            {message}
          </Text>

          <View style={styles.buttonRow}>
            {onCancel && (
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.cancelBtn,
                  darkMode && styles.cancelBtnDark,
                ]}
                onPress={onCancel}
              >
                <Text
                  style={[
                    styles.cancelText,
                    darkMode && { color: "#aaa" },
                  ]}
                >
                  {cancelText}
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[
                styles.button,
                styles.confirmBtn,
              ]}
              onPress={onConfirm}
            >
              <Text style={styles.confirmText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  dialogContainer: {
    backgroundColor: "#ffffff",
    width: "90%",
    maxWidth: 400,
    borderRadius: 20,
    padding: 24,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    alignItems: "center",
  },
  dialogContainerDark: {
    backgroundColor: "#1e1e1e",
    shadowColor: "#000",
    shadowOpacity: 0.4,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
    textAlign: "center",
  },
  textDark: {
    color: "#fff",
  },
  message: {
    fontSize: 15,
    color: "#666",
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 24,
  },
  messageDark: {
    color: "#bbb",
  },
  buttonRow: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "center",
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 6,
  },
  cancelBtn: {
    backgroundColor: "#f1f1f1",
  },
  cancelBtnDark: {
    backgroundColor: "#2c2c2c",
  },
  cancelText: {
    color: "#555",
    fontWeight: "bold",
    fontSize: 15,
  },
  confirmBtn: {
    backgroundColor: "#7B2CBF",
  },
  confirmText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
});
