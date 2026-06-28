import React from "react";
import {
  View,
  Text,
  StyleSheet,
} from "react-native";

type SaleProps = {
  producto: string;
  cantidad: number;
  total: number;
  fecha: string;
};

export default function SaleCard({
  producto,
  cantidad,
  total,
  fecha,
}: SaleProps) {
  return (
    <View style={styles.card}>
      <Text>{producto}</Text>
      <Text>Cantidad: {cantidad}</Text>
      <Text>Total: ${total}</Text>
      <Text>{fecha}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
  },
});