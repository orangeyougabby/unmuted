import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import supabase from "../lib/supabase";
import { RecordButton } from "../ui/RecordButton";
import { uploadAudioFromUri } from "../lib/storage";
import { getDurationFromMetadata } from "../lib/audio";
import { getTodayISO } from "../lib/time";

const moods = [1,2,3,4,5];

export default function JournalScreen() {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [todayEntry, setTodayEntry] = useState<any>(null);

  const load = async () => {
    const today = getTodayISO();
    const { data } = await supabase.from("journal_entries").select("*").eq("entry_date", today).maybeSingle();
    setTodayEntry(data);
    setSelectedMood(data?.mood ?? null);
  };

  useEffect(() => { load(); }, []);

  const saveMood = async (mood: number) => {
    const today = getTodayISO();
    const { data: user } = await supabase.auth.getUser();
    const userId = user.user?.id;
    if (!userId) return Alert.alert("Not signed in");

    // upsert
    const { error } = await supabase.from("journal_entries").upsert(
      { user_id: userId, entry_date: today, mood },
      { onConflict: "user_id,entry_date" }
    );
    if (error) Alert.alert("Error", error.message);
    setSelectedMood(mood);
    load();
  };

  const saveVoice = async (localUri: string) => {
    const today = getTodayISO();
    const { data: user } = await supabase.auth.getUser();
    const userId = user.user?.id;
    if (!userId) return Alert.alert("Not signed in");

    const path = `journal/${userId}/${today}.m4a`;
    const { error: upErr } = await uploadAudioFromUri(localUri, path);
    if (upErr) return Alert.alert("Upload error", upErr.message);

    const duration = await getDurationFromMetadata(localUri);
    const { error } = await supabase.from("journal_entries").upsert(
      { user_id: userId, entry_date: today, audio_path: path },
      { onConflict: "user_id,entry_date" }
    );
    if (error) Alert.alert("Error", error.message);
    load();
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: "700", marginBottom: 12 }}>How are you today?</Text>
      <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
        {moods.map((m) => (
          <TouchableOpacity
            key={m}
            onPress={() => saveMood(m)}
            style={{
              paddingVertical: 12,
              paddingHorizontal: 16,
              backgroundColor: selectedMood === m ? "#FFEDD5" : "#fff",
              borderRadius: 12,
              borderWidth: 1,
              borderColor: selectedMood === m ? "#f97316" : "#eee"
            }}
          >
            <Text style={{ fontWeight: "600" }}>{m}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 8 }}>Optional private voice note</Text>
      <RecordButton onSave={saveVoice} maxMillis={60000} />
    </View>
  );
}
