import { Audio } from "expo-av";

export async function getDurationFromMetadata(localUri: string): Promise<number> {
  const sound = new Audio.Sound();
  try {
    await sound.loadAsync({ uri: localUri }, { shouldPlay: false });
    const status = await sound.getStatusAsync();
    if (status.isLoaded) {
      return Math.round((status.durationMillis || 0));
    }
    return 0;
  } finally {
    try { await sound.unloadAsync(); } catch {}
  }
}
