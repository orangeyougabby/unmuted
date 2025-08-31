import React, { useEffect, useRef, useState } from "react";
import { View, Button, Text } from "react-native";
import { Audio } from "expo-av";

type Props = {
  onSave: (localUri: string) => Promise<void>;
  maxMillis?: number; // cap recording length
};

export function RecordButton({ onSave, maxMillis = 120000 }: Props) {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const startRecording = async () => {
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== 'granted') {
      alert("Microphone permission required.");
      return;
    }
    await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
    const rec = new Audio.Recording();
    await rec.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
    await rec.startAsync();
    setRecording(rec);
    setElapsed(0);
    timerRef.current = setInterval(async () => {
      setElapsed((e) => {
        const next = e + 250;
        if (next >= maxMillis) stopRecording(true);
        return next;
      });
    }, 250);
  };

  const stopRecording = async (auto=false) => {
    if (!recording) return;
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      if (uri) await onSave(uri);
    } finally {
      if (timerRef.current) clearInterval(timerRef.current);
      setRecording(null);
      setElapsed(0);
    }
  };

  return (
    <View style={{ gap: 8 }}>
      {recording ? (
        <Button title="Stop" onPress={() => stopRecording(false)} />
      ) : (
        <Button title="Record" onPress={startRecording} />
      )}
      {recording ? <Text>Recording… {Math.round(elapsed/1000)}s / {Math.round(maxMillis/1000)}s</Text> : null}
    </View>
  );
}
