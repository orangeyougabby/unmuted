import React, { useEffect, useRef, useState } from "react";
import { View, Text, Button } from "react-native";
import { Audio } from "expo-av";
import Slider from "@react-native-community/slider";

type Props = {
  sourcePromise: Promise<string>; // signed URL promise
  durationMs: number;
};

export function AudioPlayer({ sourcePromise, durationMs }: Props) {
  const soundRef = useRef<Audio.Sound | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [uri, setUri] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    sourcePromise.then((u) => mounted && setUri(u)).catch(console.error);
    return () => { mounted = false; };
  }, [sourcePromise]);

  useEffect(() => {
    let interval: any;
    (async () => {
      if (!uri) return;
      const { sound } = await Audio.Sound.createAsync({ uri }, { shouldPlay: false });
      soundRef.current = sound;
      setLoading(false);
    })();

    interval = setInterval(async () => {
      if (!soundRef.current) return;
      const status = await soundRef.current.getStatusAsync();
      if (status.isLoaded) setPosition(status.positionMillis || 0);
    }, 250);

    return () => { clearInterval(interval); if (soundRef.current) soundRef.current.unloadAsync(); };
  }, [uri]);

  const toggle = async () => {
    if (!soundRef.current) return;
    const status = await soundRef.current.getStatusAsync();
    if (!status.isLoaded) return;
    if (status.isPlaying) {
      await soundRef.current.pauseAsync();
      setIsPlaying(false);
    } else {
      await soundRef.current.playAsync();
      setIsPlaying(true);
    }
  };

  const seek = async (ms: number) => {
    if (!soundRef.current) return;
    await soundRef.current.setPositionAsync(ms);
  };

  if (loading) return <Text>Loading audio…</Text>;

  return (
    <View>
      <Slider
        value={position}
        minimumValue={0}
        maximumValue={durationMs || Math.max(position, 1000)}
        onSlidingComplete={seek}
      />
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <Button title={isPlaying ? "Pause" : "Play"} onPress={toggle} />
        <Text>{Math.round((position/1000))}s / {Math.round((durationMs/1000))}s</Text>
      </View>
    </View>
  );
}
