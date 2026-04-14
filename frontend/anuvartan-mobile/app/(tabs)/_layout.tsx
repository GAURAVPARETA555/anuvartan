import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarStyle: { display: "none" } }}>
      <Tabs.Screen name="patient" />
      <Tabs.Screen name="nurse" />
      <Tabs.Screen name="doctor" />
    </Tabs>
  );
}
