// src/screens/PreviewScreen.tsx
import React, { useCallback, useEffect, useState } from "react";
import { View, Button, Alert, StyleSheet } from "react-native";
import ImageViewing from "react-native-image-viewing";
import { NavigationProps, RouteProps } from "../types/navigation";
import { listPhotos, PhotoItem } from "../storage/photoStorage";
import { sendEmailWithPhoto } from "../utils/emailService";

type Props = {
  navigation: NavigationProps<"Preview">;
  route: RouteProps<"Preview">;
};

export default function PreviewScreen({ route }: Props) {
  const { ids, startId } = route.params;
  const [visible, setVisible] = useState(true);
  const [index, setIndex] = useState(Math.max(0, ids.indexOf(startId)));
  const [resolved, setResolved] = useState<{ uri: string }[]>([]);

  useEffect(() => {
    (async () => {
      const all = await listPhotos();
      const map = new Map(all.map((p) => [p.id, p]));
      setResolved(
        ids
          .map((id) => map.get(id))
          .filter(Boolean)
          .map((p) => ({ uri: (p as PhotoItem).path }))
      );
    })();
  }, [ids]);

  const handleEmail = useCallback(async () => {
    try {
      const current = resolved[index];
      if (!current) return;
      await sendEmailWithPhoto({
        to: "voce@exemplo.com",
        subject: "Registro de segurança",
        body: "Segue a foto registrada pelo app.",
        fileUri: current.uri,
      });
      Alert.alert("Enviado", "E-mail enviado com sucesso.");
    } catch (e: any) {
      Alert.alert("Falha ao enviar", e?.message || "Verifique a configuração de e-mail.");
    }
  }, [resolved, index]);

  return (
    <View style={styles.container}>
      <ImageViewing
        images={resolved.length ? resolved : [{ uri: "" }]}
        imageIndex={index}
        visible={visible}
        onImageIndexChange={setIndex}
        onRequestClose={() => setVisible(false)}
      />
      <View style={styles.actions}>
        <Button title="Enviar por e-mail" onPress={handleEmail} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  actions: { position: "absolute", bottom: 24, alignSelf: "center", width: 220 },
});
