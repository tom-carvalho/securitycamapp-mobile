import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { NavigationProps, RouteProps } from "../types/navigation";

type Props = {
  navigation: NavigationProps<"Login">;
  route: RouteProps<"Login">;
};

export default function LoginScreen({ navigation }: Props) {
  // aqui entraria sua lógica real de login (google, biometria, etc.)
  const handleLogin = () => {
    navigation.replace("Timeline");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Security Cam • Login</Text>
      <Button title="Entrar" onPress={handleLogin} />
      <View style={{ height: 12 }} />
      <Button title="Ir para Config" onPress={() => navigation.navigate("Config")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "600", marginBottom: 16 },
});
