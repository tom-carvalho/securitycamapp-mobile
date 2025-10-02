// src/storage/photoStorage.ts
import RNFS from "react-native-fs";
import { Platform } from "react-native";

const BASE_DIR = `${RNFS.DocumentDirectoryPath}/security_cam_photos`;

export type PhotoItem = {
  id: string;        // filename
  path: string;      // file://...
  createdAt: number; // epoch ms
};

export async function ensureBaseDir() {
  const exists = await RNFS.exists(BASE_DIR);
  if (!exists) await RNFS.mkdir(BASE_DIR);
  return BASE_DIR;
}

export async function persistPhoto(tempPath: string): Promise<PhotoItem> {
  await ensureBaseDir();
  const ts = Date.now();
  const filename = `photo_${ts}.jpg`;
  const dest = `${BASE_DIR}/${filename}`;

  const normalizedSrc = tempPath.startsWith("file://")
    ? tempPath.replace("file://", "")
    : tempPath;

  await RNFS.moveFile(normalizedSrc, dest);
  return {
    id: filename,
    path: Platform.select({
      ios: `file://${dest}`,
      android: `file://${dest}`,
      default: `file://${dest}`,
    }) as string,
    createdAt: ts,
  };
}

export async function listPhotos(): Promise<PhotoItem[]> {
  await ensureBaseDir();
  const entries = await RNFS.readDir(BASE_DIR);
  return entries
    .filter((e) => e.isFile() && e.name.toLowerCase().endsWith(".jpg"))
    .map((e) => ({
      id: e.name,
      path: Platform.select({
        ios: `file://${e.path}`,
        android: `file://${e.path}`,
        default: `file://${e.path}`,
      }) as string,
      createdAt: e.mtime ? new Date(e.mtime).getTime() : 0,
    }))
    .sort((a, b) => b.createdAt - a.createdAt);
}

export async function removePhoto(item: PhotoItem) {
  const p = item.path.startsWith("file://") ? item.path.replace("file://", "") : item.path;
  if (await RNFS.exists(p)) await RNFS.unlink(p);
}
