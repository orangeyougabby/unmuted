import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerTitleAlign: "center" }}>
        <Stack.Screen name="index" options={{ title: "Rooms" }} />
        <Stack.Screen name="auth" options={{ title: "Sign In" }} />
        <Stack.Screen name="room/[id]" options={{ title: "Room" }} />
        <Stack.Screen name="post/[id]" options={{ title: "Thread" }} />
        <Stack.Screen name="journal/index" options={{ title: "Journal" }} />
      </Stack>
    </SafeAreaProvider>
  );
}
