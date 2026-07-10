import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from "expo-image-picker";
import { analyzeSkinImage } from "../services/api";

const SkinScanInstructionsScreen = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false);

  const takePhoto = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (permissionResult.status !== 'granted') {
        Alert.alert("Permission Required", "Camera permission is needed to take photos.");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.9,
      });

      if (!result.canceled) {
        await uploadAndAnalyze(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Error", "Error opening camera");
    }
  };

  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.status !== 'granted') {
        Alert.alert("Permission Required", "Gallery permission is needed to upload images.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.9,
      });

      if (!result.canceled) {
        await uploadAndAnalyze(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Error", "Error picking image");
    }
  };

  const uploadAndAnalyze = async (imageUri) => {
    try {
      setIsLoading(true);
      const analysisResult = await analyzeSkinImage(imageUri);
      navigation.navigate("AnalysisResults", {
        results: analysisResult,
      });
    } catch (error) {
      const errorData = error?.response?.data;
      if (errorData && errorData.error === 'NO_FACE') {
        Alert.alert("No Face Detected", errorData.message || "Please take the picture again.");
      } else {
        Alert.alert(
          "Analysis Failed",
          "Could not analyze image. Make sure your face is visible and well-lit."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FAF6EF' }}>
      <ScrollView 
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 50, flexGrow: 1, alignItems: 'center' }} 
        style={{ backgroundColor: '#FAF6EF' }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ width: '100%' }}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            activeOpacity={0.8}
            disabled={isLoading}
          >
            <Ionicons name="arrow-back" size={20} color="#4A2E12" />
            <Text style={styles.backBtnText}>Back</Text>
          </TouchableOpacity>
        </View>

        <Image 
          source={require('../../assets/illustration.png')} 
          style={styles.heroIllustration}
          resizeMode="contain"
        />

        <Text style={styles.pageTitle}>Let's scan your face</Text>
        <Text style={styles.pageSubtitle}>Follow these tips for an accurate AI skin analysis.</Text>

        {/* Photo Upload Tips (Premium Card) */}
        <View style={styles.tipsCard}>
          <View style={styles.tipItem}>
            <View style={styles.tipIconBg}>
              <Ionicons name="sunny" size={20} color="#FF9800" />
            </View>
            <Text style={styles.tipText}>Ensure good, even front lighting</Text>
          </View>
          <View style={styles.tipItem}>
            <View style={styles.tipIconBg}>
              <Ionicons name="scan" size={20} color="#4CAF50" />
            </View>
            <Text style={styles.tipText}>Remove glasses & pull hair back</Text>
          </View>
          <View style={[styles.tipItem, { marginBottom: 0 }]}>
            <View style={styles.tipIconBg}>
              <Ionicons name="eye" size={20} color="#2196F3" />
            </View>
            <Text style={styles.tipText}>Align your face in the oval frame</Text>
          </View>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            activeOpacity={0.85} 
            onPress={takePhoto}
            style={styles.actionBtnWrapper}
            disabled={isLoading}
          >
            <LinearGradient
              colors={['#FF7E5F', '#FEB47B']}
              start={{x:0, y:0}} end={{x:1, y:0}}
              style={styles.actionBtnGradient}
            >
              <Ionicons name="camera" size={24} color="#FFF" />
              <Text style={styles.actionBtnText}>Take a Photo</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            activeOpacity={0.85} 
            onPress={pickImage}
            style={styles.secondaryBtnWrapper}
            disabled={isLoading}
          >
            <View style={styles.secondaryBtnInner}>
              <Ionicons name="image" size={22} color="#FF7E5F" />
              <Text style={styles.secondaryBtnText}>Upload from Gallery</Text>
            </View>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#FF7E5F" />
            <Text style={styles.loadingText}>Analyzing skin...</Text>
          </View>
        </View>
      )}

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  backBtn: {
    marginTop: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  backBtnText: {
    marginLeft: 6,
    fontSize: 15,
    color: '#4A2E12',
    fontWeight: '700'
  },
  heroIllustration: {
    width: 220,
    height: 220,
    marginTop: 10,
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#4A2E12',
    marginBottom: 8,
    textAlign: 'center',
  },
  pageSubtitle: {
    fontSize: 15,
    color: '#888',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  tipsCard: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 30,
    shadowColor: '#FF7E5F',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 14,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 126, 95, 0.1)',
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  tipIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FAF6EF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipText: {
    flex: 1,
    fontSize: 15,
    color: '#4A2E12',
    fontWeight: '600',
  },
  actionsContainer: {
    width: '100%',
    gap: 16,
  },
  actionBtnWrapper: {
    width: '100%',
    shadowColor: '#FF7E5F',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  actionBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 24,
    gap: 10,
  },
  actionBtnText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFF',
  },
  secondaryBtnWrapper: {
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  secondaryBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 24,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 126, 95, 0.2)',
    gap: 10,
  },
  secondaryBtnText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FF7E5F',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingCard: {
    backgroundColor: '#FFF',
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '700',
    color: '#4A2E12',
  },
});

export default SkinScanInstructionsScreen;
