// src/screens/TimelineScreen.tsx
import React, { useCallback, useState } from "react";
import { View, Text, Button, StyleSheet, FlatList, Image, TouchableOpacity, RefreshControl, Alert } from "react-native";
import { NavigationProps, RouteProps } from "../types/navigation";
import { listPhotos, PhotoItem, removePhoto } from "../storage/photoStorage";
import { useFocusEffect } from "@react-navigation/native";
import DateTimePicker from "@react-native-community/datetimepicker";

type Props = {
  navigation: NavigationProps<"Timeline">;
  route: RouteProps<"Timeline">;
};

export default function TimelineScreen({ navigation }: Props) {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [start, setStart] = useState<Date | null>(null);
  const [end, setEnd] = useState<Date | null>(null);
  const [showStart, setShowStart] = useState(false);
  const [showEnd, setShowEnd] = useState(false);

  const load = useCallback(async () => {
    const items = await listPhotos();
    setPhotos(items);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const filtered = React.useMemo(() => {
    return photos.filter((p) => {
      const d = new Date(p.createdAt);
      if (start && d < start) return false;
      if (end && d > end) return false;
      return true;
    });
  }, [photos, start, end]);

  const onLongPress = useCallback((item: PhotoItem) => {
    Alert.alert(
      "Excluir foto?",
      "Essa ação não pode ser desfeita.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            await removePhoto(item);
            await load();
          },
        },
      ]
    );
  }, [load]);

  const renderItem = ({ item }: { item: PhotoItem }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => {
        const ids = (filtered.length ? filtered : photos).map((p) => p.id);
        navigation.navigate("Preview", { ids, startId: item.id });
      }}
      onLongPress={() => onLongPress(item)}
    >
      <Image source={{ uri: item.path }} style={styles.thumb} resizeMode="cover" />
      <Text style={styles.caption}>{new Date(item.createdAt).toLocaleString()}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Timeline</Text>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <Button title={start ? start.toLocaleDateString() : "Início"} onPress={() => setShowStart(true)} />
          <Button title={end ? end.toLocaleDateString() : "Fim"} onPress={() => setShowEnd(true)} />
          <Button title="Limpar" onPress={() => { setStart(null); setEnd(null); }} />
          <Button title="Câmera" onPress={() => navigation.navigate("Camera")} />
        </View>
      </View>

      {showStart && (
        <DateTimePicker
          value={start ?? new Date()}
          mode="date"
          onChange={(_, d) => { setShowStart(false); if (d) setStart(new Date(d.setHours(0,0,0,0))); }}
        />
      )}
      {showEnd && (
        <DateTimePicker
          value={end ?? new Date()}
          mode="date"
          onChange={(_, d) => { setShowEnd(false); if (d) setEnd(new Date(d.setHours(23,59,59,999))); }}
        />
      )}

      <FlatList
        data={filtered}
        keyExtractor={(it) => it.id}
        numColumns={2}
        columnWrapperStyle={{ gap: 12 }}
        contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={{ color: "#666" }}>Nenhuma foto ainda.</Text>
            <View style={{ height: 8 }} />
            <Button title="Tirar primeira foto" onPress={() => navigation.navigate("Camera")} />
          </View>
        }
      />

      <View style={{ height: 12 }} />
      <Button title="Configurações" onPress={() => navigation.navigate("Config")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  title: { fontSize: 20, fontWeight: "700" },
  card: { flex: 1, gap: 6 },
  thumb: { width: "100%", aspectRatio: 1, borderRadius: 10, backgroundColor: "#eee" },
  caption: { fontSize: 12, color: "#666" },
  empty: { alignItems: "center", padding: 24 },
});
