import React, { createContext, useState, useContext, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { LoginManager } from 'react-native-fbsdk-next';
import { getProfile, updateProfile as updateProfileApi } from '../services/api';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [userData, setUserData] = useState(null); // The basic user info from backend
  const [isLoading, setIsLoading] = useState(true);

  // Local state for the onboarding flow that replicates database fields
  const [userName, setUserName] = useState('');
  const [userGender, setUserGender] = useState('');
  const [userAge, setUserAge] = useState('');
  const [skinType, setSkinType] = useState('');
  const [skinConcerns, setSkinConcerns] = useState([]);
  const [facialAreas, setFacialAreas] = useState([]);
  const [userChallenges, setUserChallenges] = useState([]);

  // Load user data on app start
  useEffect(() => {
    const bootstrapAsync = async () => {
      setIsLoading(true);
      try {
        const token = await SecureStore.getItemAsync('userToken');
        if (token) {
          setUserToken(token);
          // Fetch full profile from backend to initialize context
          const profile = await getProfile();
          setUserData(profile);
          
          // Seed the onboarding variables if they exist
          if (profile.name) setUserName(profile.name);
          if (profile.gender) setUserGender(profile.gender);
          if (profile.age) setUserAge(profile.age);
          if (profile.skinType) setSkinType(profile.skinType);
          if (profile.skinConcerns) setSkinConcerns(profile.skinConcerns);
          if (profile.facialAreas) setFacialAreas(profile.facialAreas);
        }
      } catch (e) {
        // Restoring token failed or profile fetch failed (token expired)
        console.log('Failed to restore session:', e);
        await SecureStore.deleteItemAsync('userToken');
        setUserToken(null);
      }
      setIsLoading(false);
    };

    bootstrapAsync();
  }, []);

  // Use this function when the user signs in or signs up
  const signIn = async (token, user) => {
    try {
      await SecureStore.setItemAsync('userToken', token);
      setUserToken(token);
      setUserData(user);
      
      // Seed the localized onboarding variables immediately after login
      if (user.name) setUserName(user.name);
      if (user.gender) setUserGender(user.gender);
      if (user.age) setUserAge(user.age);
      if (user.skinType) setSkinType(user.skinType);
      if (user.skinConcerns) setSkinConcerns(user.skinConcerns);
      if (user.facialAreas) setFacialAreas(user.facialAreas);
      if (user.userChallenges) setUserChallenges(user.userChallenges);
    } catch (e) {
      console.error('Failed to save token', e);
    }
  };

  const signOut = async () => {
    // Set state immediately for snappy UI reaction
    setUserToken(null);
    setUserData(null);
    
    // Reset local state variables
    setUserName('');
    setUserGender('');
    setUserAge('');
    setSkinType('');
    setSkinConcerns([]);
    setFacialAreas([]);
    
    try {
      await SecureStore.deleteItemAsync('userToken');
      
      // Clear native social sessions if they exist
      try {
        await GoogleSignin.signOut();
      } catch (ge) { /* ignore if not logged in via google */ }
      
      try {
        LoginManager.logOut();
      } catch (fe) { /* ignore if not logged in via facebook */ }
      
    } catch (e) {
      console.error('Failed to logout cleanly:', e);
    }
  };

  // Safe wrapper around setting and syncing profile data
  const syncProfileData = async (data) => {
    try {
      // Optimitic update local context
      if (data.name !== undefined) setUserName(data.name);
      if (data.gender !== undefined) setUserGender(data.gender);
      if (data.age !== undefined) setUserAge(data.age);
      if (data.skinType !== undefined) setSkinType(data.skinType);
      if (data.skinConcerns) setSkinConcerns(data.skinConcerns);
      if (data.facialAreas) setFacialAreas(data.facialAreas);
      if (data.userChallenges) setUserChallenges(data.userChallenges);
      
      // Sync to backend if token exists
      if (userToken) {
        const updatedUser = await updateProfileApi(data);
        setUserData(updatedUser); // Update the core DB representation
      }
    } catch (error) {
      console.error('Failed to sync profile data:', error);
      // Optionally handle the error (e.g., revert state, show toast)
    }
  };

  return (
    <UserContext.Provider value={{
      isLoading,
      userToken,
      userData,
      signIn,
      signOut,
      syncProfileData,
      
      // Onboarding specific state
      userName, setUserName,
      userGender, setUserGender,
      userAge, setUserAge,
      skinType, setSkinType,
      skinConcerns, setSkinConcerns,
      facialAreas, setFacialAreas,
      userChallenges, setUserChallenges,
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export default UserContext;
