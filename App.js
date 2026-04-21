import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { UserProvider } from './src/context/UserContext';

import WelcomeScreen from './src/screens/WelcomeScreen';
import IntroScreen from './src/screens/IntroScreen';
import PrivacyScreen from './src/screens/PrivacyScreen';
import LoginScreen from './src/screens/LoginScreen';
import MedicalScreen from './src/screens/MedicalScreen';
import NameScreen from './src/screens/NameScreen';
import GenderScreen from './src/screens/GenderScreen';
import AgeScreen from './src/screens/AgeScreen';
import SkinTypeScreen from './src/screens/SkinTypeScreen';
import FacialAreasScreen from './src/screens/FacialAreasScreen';
import ProfileSetupScreen from './src/screens/ProfileSetupScreen';
import HomeScreen from './src/screens/HomeScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <UserProvider>
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator 
            initialRouteName="Welcome"
            screenOptions={{ 
              headerShown: false,
              animation: 'fade_from_bottom',
              contentStyle: { backgroundColor: '#FAF6EF' },
            }}
          >
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Intro" component={IntroScreen} />
            <Stack.Screen 
              name="Privacy" 
              component={PrivacyScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen 
              name="Login" 
              component={LoginScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen 
              name="Medical" 
              component={MedicalScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen 
              name="Name" 
              component={NameScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen 
              name="Gender" 
              component={GenderScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen 
              name="Age" 
              component={AgeScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen 
              name="SkinType" 
              component={SkinTypeScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen 
              name="FacialAreas" 
              component={FacialAreasScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen 
              name="ProfileSetup" 
              component={ProfileSetupScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen 
              name="Home" 
              component={HomeScreen}
              options={{ animation: 'fade_from_bottom' }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </UserProvider>
  );
}
