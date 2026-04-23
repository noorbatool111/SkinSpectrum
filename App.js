import React from "react";
import { View, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { UserProvider, useUser } from "./src/context/UserContext";

import WelcomeScreen from "./src/screens/WelcomeScreen";
import IntroScreen from "./src/screens/IntroScreen";
import PrivacyScreen from "./src/screens/PrivacyScreen";
import LoginScreen from "./src/screens/LoginScreen";
import SignupScreen from "./src/screens/SignupScreen";
import MedicalScreen from "./src/screens/MedicalScreen";
import NameScreen from "./src/screens/NameScreen";
import GenderScreen from "./src/screens/GenderScreen";
import AgeScreen from "./src/screens/AgeScreen";
import SkinTypeScreen from "./src/screens/SkinTypeScreen";
import FacialAreasScreen from "./src/screens/FacialAreasScreen";
import ProfileSetupScreen from "./src/screens/ProfileSetupScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import HomeScreen from "./src/screens/HomeScreen";
import SkinAnalysisCameraScreen from "./src/screens/SkinAnalysisCameraScreen";
import AnalysisResultsScreen from "./src/screens/AnalysisResultsScreen";

const Stack = createNativeStackNavigator();

// This component uses context to decide which screens to show
const RootNavigator = () => {
  const { isLoading, userToken, userData } = useUser();

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#FAF6EF",
        }}
      >
        <ActivityIndicator size="large" color="#5C3318" />
      </View>
    );
  }

  // If token exists, user is logged in
  if (userToken) {
    // If onboarding is incomplete, dump them into the onboarding flow
    // At this point, we could technically route them dynamically, but we'll start them at Home if complete, else Privacy.
    const initialForAuth = userData?.isOnboardingComplete ? "Home" : "Privacy";

    return (
      <Stack.Navigator
        key="authenticated"
        initialRouteName={initialForAuth}
        screenOptions={{
          headerShown: false,
          animation: "fade_from_bottom",
          contentStyle: { backgroundColor: "#FAF6EF" },
        }}
      >
        {/* Onboarding Flow Screens (if not complete) */}
        <Stack.Screen
          name="Privacy"
          component={PrivacyScreen}
          options={{ animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="Medical"
          component={MedicalScreen}
          options={{ animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="Name"
          component={NameScreen}
          options={{ animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="Gender"
          component={GenderScreen}
          options={{ animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="Age"
          component={AgeScreen}
          options={{ animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="SkinType"
          component={SkinTypeScreen}
          options={{ animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="FacialAreas"
          component={FacialAreasScreen}
          options={{ animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="ProfileSetup"
          component={ProfileSetupScreen}
          options={{ animation: "slide_from_right" }}
        />

        {/* Main App */}
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ animation: "fade_from_bottom" }}
        />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{ animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="SkinAnalysisCamera"
          component={SkinAnalysisCameraScreen}
          options={{ animation: "slide_from_bottom" }}
        />
        <Stack.Screen
          name="AnalysisResults"
          component={AnalysisResultsScreen}
          options={{ animation: "slide_from_bottom" }}
        />
      </Stack.Navigator>
    );
  }

  // Public/Unauthenticated Flow
  return (
    <Stack.Navigator
      key="unauthenticated"
      initialRouteName="Welcome"
      screenOptions={{
        headerShown: false,
        animation: "fade_from_bottom",
        contentStyle: { backgroundColor: "#FAF6EF" },
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Intro" component={IntroScreen} />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="Signup"
        component={SignupScreen}
        options={{ animation: "slide_from_right" }}
      />
    </Stack.Navigator>
  );
};

export default function App() {
  return (
    <UserProvider>
      <SafeAreaProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </UserProvider>
  );
}
