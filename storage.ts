import supabase from "./supabase";
import * as FileSystem from "expo-file-system";

export async function uploadAudioFromUri(localUri: string, destPath: string) {
  // Read file as base64 and upload to Supabase Storage
  const fileB64 = await FileSystem.readAsStringAsync(localUri, { encoding: FileSystem.EncodingType.Base64 });
  const byteArray = Buffer.from(fileB64, "base64");

  const { error } = await supabase.storage.from("audio").upload(destPath, byteArray, {
    contentType: "audio/m4a",
    upsert: true
  });
  return { error };
}

export async function getSignedUrl(path: string, expiresIn = 60) {
  const { data, error } = await supabase.storage.from("audio").createSignedUrl(path, expiresIn);
  if (error || !data?.signedUrl) throw error || new Error("No signed URL");
  return data.signedUrl;
}
