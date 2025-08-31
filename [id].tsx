import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Button, ActivityIndicator, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import supabase from "../lib/supabase";
import { AudioPlayer } from "../ui/AudioPlayer";
import { RecordButton } from "../ui/RecordButton";
import { getSignedUrl } from "../lib/storage";
import { getSessionOrRedirect } from "../lib/session";
import { uploadAudioFromUri } from "../lib/storage";
import { getDurationFromMetadata } from "../lib/audio";

type Post = {
  id: string;
  user_id: string;
  audio_path: string;
  duration_ms: number;
  created_at: string;
};

export default function RoomFeed() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("room_id", id)
      .order("created_at", { ascending: false });
    if (error) console.error(error);
    setPosts(data || []);
    setLoading(false);
  };

  useEffect(() => {
    (async () => {
      const ok = await getSessionOrRedirect(router);
      if (!ok) return;
      load();
    })();
  }, [id]);

  const createPost = async (localUri: string) => {
    try {
      const filePath = `posts/${Date.now()}-${Math.random().toString(36).slice(2)}.m4a`;
      const { data: user } = await supabase.auth.getUser();
      const userId = user.user?.id;
      if (!userId) throw new Error("No session");

      const { error: upErr } = await uploadAudioFromUri(localUri, filePath);
      if (upErr) throw upErr;
      const duration = await getDurationFromMetadata(localUri);

      const { error: insErr } = await supabase.from("posts").insert({
        room_id: id,
        user_id: userId,
        audio_path: filePath,
        duration_ms: duration
      });
      if (insErr) throw insErr;

      Alert.alert("Posted", "Your voice note is live.");
      load();
    } catch (e:any) {
      Alert.alert("Post failed", e.message || "Unknown error");
    }
  };

  if (loading) return <View style={{ flex:1, alignItems:"center", justifyContent:"center" }}><ActivityIndicator/></View>;

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => router.push(`/post/${item.id}`)}
            style={{ padding: 16, backgroundColor: "#fff", borderRadius: 16, borderWidth: 1, borderColor: "#eee" }}
          >
            <Text style={{ fontWeight: "600" }}>Voice post</Text>
            <AudioPlayer sourcePromise={getSignedUrl(item.audio_path)} durationMs={item.duration_ms} />
          </TouchableOpacity>
        )}
      />
      <View style={{ padding: 16, borderTopWidth: 1, borderTopColor: "#eee" }}>
        <RecordButton onSave={createPost} maxMillis={120000} />
      </View>
    </View>
  );
}
