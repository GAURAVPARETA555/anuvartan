import { Stack, router, useSegments } from "expo-router";
import { TouchableOpacity, Text, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthProvider } from "../src/context/AuthContext";
import { colors } from "../src/theme/colors";
import LottieView from "lottie-react-native";
import { useRef } from "react";

export default function RootLayout() {
  const segments = useSegments();

  // 👉 Fix TypeScript issue
  const Lottie = LottieView as any;

  const animationRef = useRef<any>(null);

  const handleLogout = async () => {
    await AsyncStorage.removeItem("access_token");
    await AsyncStorage.removeItem("refresh_token");
    await AsyncStorage.removeItem("role");
    await AsyncStorage.removeItem("user");
    await AsyncStorage.removeItem("user_id");

    router.replace("/(auth)/login");
  };

  const showLogout = segments[0] !== "(auth)";

  return (
    <AuthProvider>
      <Stack
        screenOptions={{
          headerTitle: "",
          // 👉 Logout Button (Right Side)
          headerRight: () =>
            showLogout ? (
              <TouchableOpacity
                onPress={handleLogout}
                style={{ marginRight: 15 }}
              >
                <Text
                  style={{ color: "red", fontWeight: "bold", fontSize: 16 }}
                >
                  Logout
                </Text>
              </TouchableOpacity>
            ) : null,

          // 👉 Back Button (Lottie on mobile, Text on web)
          headerLeft: ({ canGoBack }) =>
            (canGoBack || router.canGoBack()) ? (
              <TouchableOpacity
                onPress={() => {
                  if (Platform.OS !== "web") {
                    animationRef.current?.play();
                    setTimeout(() => router.back(), 250);
                  } else {
                    router.back();
                  }
                }}
                style={{ marginLeft: 10 }}
              >
                {Platform.OS !== "web" ? (
                  <Lottie
                    ref={animationRef}
                    source={require("../assets/lottieflow-arrow-09-2-000000-easey.json")}
                    autoPlay={false}
                    loop={false}
                    style={{ width: 40, height: 40 }}
                  />
                ) : (
                  <Text
                    style={{
                      fontSize: 22,
                      color: colors.primary,
                      fontWeight: "bold",
                    }}
                  >
                    ←
                  </Text>
                )}
              </TouchableOpacity>
            ) : null,
        }}
      />
    </AuthProvider>
  );
}