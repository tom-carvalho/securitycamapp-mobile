import React, { useState } from "react";
import { View, Text, Switch, StyleSheet } from "react-native";
import { NavigationProps, RouteProps } from "../types/navigation";

type Props = {
  navigation: NavigationProps<"Config">;
  route: RouteProps<"Config">;
};

export default function ConfigScreen({}: Props) {
  const [onUnlock, setOnUnlock] = useState(true);
  const [onWrongPass, setOnWrongPass] = useState(true);
  const [sendEmail, setSendEmail] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Configurações</Text>

      <View style={styles.row}>
        <Text style={styles.label}>Tirar foto ao desbloquear</Text>
        <Switch value={onUnlock} onValueChange={setOnUnlock} />
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Foto em senha/biometria incorreta</Text>
        <Switch value={onWrongPass} onValueChange={setOnWrongPass} />
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Enviar por e-mail</Text>
        <Switch value={sendEmail} onValueChange={setSendEmail} />
      </View>

      <Text style={styles.hint}>
        Essas opções são apenas exemplo. Depois conectamos com o armazenamento local e o serviço de e-mail.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 16 },
  title: { fontSize: 20, fontWeight: "700" },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 8 },
  label: { fontSize: 16 },
  hint: { fontSize: 12, color: "#666", marginTop: 8 },
});
