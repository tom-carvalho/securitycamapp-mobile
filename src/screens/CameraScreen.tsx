// src/screens/CameraScreen.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View, Text, Button, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { NavigationProps, RouteProps } from "../types/navigation";
import { Camera, useCameraDevice, useCameraPermission } from "react-native-vision-camera";
import { persistPhoto } from "../storage/photoStorage";

type Props = {
  navigation: NavigationProps<"Camera">;
  route: RouteProps<"Camera">;
};

export default function CameraScreen({ navigation }: Props) {
  const cameraRef = useRef<Camera>(null);

  // Seleciona a câmera traseira (se quiser frontal: "front")
  const device = useCameraDevice("front");
  const { hasPermission, requestPermission } = useCameraPermission();

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      if (!hasPermission) {
        const status = await requestPermission();
        if (status !== "granted") {
          Alert.alert("Permissão negada", "Não será possível usar a câmera sem permissão.");
        }
      }
    })();
  }, [hasPermission, requestPermission]);

  const onCapture = useCallback(async () => {
    try {
      if (!cameraRef.current) return;
      setSaving(true);
      // VisionCamera v3: takePhoto
      const photo = await cameraRef.current.takePhoto({
        // qualidade / flash, etc.
        qualityPrioritization: "quality",
        flash: "off",
      });

      // Em Android, photo.path já costuma vir com "file://", no iOS também.
      // Persistimos (move) para o diretório do app:
      const saved = await persistPhoto(photo.path);

      setSaving(false);
      Alert.alert("Foto salva", "Foto armazenada localmente com sucesso!");
      // Volta para timeline (ela fará reload ao focar)
      navigation.navigate("Timeline");
    } catch (e: any) {
      setSaving(false);
      Alert.alert("Erro ao capturar", e?.message || "Tente novamente.");
    }
  }, [navigation]);

  const content = useMemo(() => {
    if (!device || !hasPermission) {
      return (
        <View style={styles.center}>
          <Text style={styles.title}>Preparando câmera…</Text>
          <ActivityIndicator />
        </View>
      );
    }
    return (
      <View style={styles.flex}>
        {/* Preview da câmera */}
        <Camera
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          device={device}
          isActive
          photo
        />

        <View style={styles.controls}>
          <Button title={saving ? "Salvando..." : "Capturar"} onPress={onCapture} disabled={saving} />
          <View style={{ height: 8 }} />
          <Button title="Voltar" onPress={() => navigation.navigate("Timeline")} />
        </View>
      </View>
    );
  }, [device, hasPermission, onCapture, saving, navigation]);

  return <View style={styles.container}>{content}</View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  flex: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 16 },
  title: { color: "#fff", fontSize: 18, fontWeight: "600", marginBottom: 12 },
  controls: {
    position: "absolute",
    bottom: 24,
    alignSelf: "center",
    width: 220,
  },
});
