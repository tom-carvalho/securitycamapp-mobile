// App.tsx
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "./src/screens/LoginScreen";
import TimelineScreen from "./src/screens/TimelineScreen";
import ConfigScreen from "./src/screens/ConfigScreen";
import CameraScreen from "./src/screens/CameraScreen";
import PreviewScreen from "./src/screens/PreviewScreen"; // <- novo import

import { RootStackParamList } from "./src/types/navigation";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: true }}>
        <Stack.Screen name="Login" component={LoginScreen} options={{ title: "Login" }} />
        <Stack.Screen name="Timeline" component={TimelineScreen} options={{ title: "Timeline" }} />
        <Stack.Screen name="Config" component={ConfigScreen} options={{ title: "Configurações" }} />
        <Stack.Screen name="Camera" component={CameraScreen} options={{ title: "Câmera" }} />
        <Stack.Screen name="Preview" component={PreviewScreen} options={{ title: "Preview" }} />{/* novo */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
