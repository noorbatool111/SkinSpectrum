import React, { useRef, useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
  ActivityIndicator,
  Dimensions,
  Platform,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as CameraModule from "expo-camera";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { analyzeSkinImage } from "../services/api";

const Camera = CameraModule.CameraView;

const { width, height } = Dimensions.get("window");
const TOP_OFFSET =
  Platform.OS === "android" ? StatusBar.currentHeight || 24 : 44;

const SkinAnalysisCameraScreen = ({ navigation }) => {
  const cameraRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraType, setCameraType] = useState("front");
  const [flash, setFlash] = useState("off");

  // Request camera and photo permissions on mount
  useEffect(() => {
    const requestPermissions = async () => {
      const cameraStatus = await CameraModule.requestCameraPermissionsAsync();
      const photoStatus =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (cameraStatus.status !== "granted") {
        Alert.alert(
          "Camera Permission",
          "We need camera access to analyze your skin.",
        );
      }
      if (photoStatus.status !== "granted") {
        Alert.alert("Photo Permission", "We need access to your photos.");
      }
    };

    requestPermissions();
  }, []);

  const takePicture = async () => {
    if (!cameraReady || !cameraRef.current) {
      Alert.alert("Camera Error", "Camera is not ready. Please try again.");
      return;
    }

    try {
      setIsLoading(true);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.9,
        base64: false,
        skipProcessing: false,
      });

      // Send to analysis
      await uploadAndAnalyze(photo.uri);
    } catch (error) {
      console.error("Error taking picture:", error);
      Alert.alert("Camera Error", "Failed to capture image. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.9,
      });

      if (!result.canceled) {
        const imageUri = result.assets[0].uri;
        await uploadAndAnalyze(imageUri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  };

  const uploadAndAnalyze = async (imageUri) => {
    try {
      setIsLoading(true);
      const analysisResult = await analyzeSkinImage(imageUri);

      if (analysisResult.success) {
        // Navigate to results screen with the analysis data
        navigation.navigate("AnalysisResults", {
          results: analysisResult.data,
        });
      } else {
        Alert.alert(
          "Analysis Failed",
          analysisResult.message ||
            "Could not analyze image. Please try again.",
        );
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      Alert.alert(
        "Upload Error",
        "Failed to upload image. Please check your connection.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Camera View - Full Screen */}
      <Camera
        ref={cameraRef}
        style={styles.camera}
        facing={cameraType}
        flashMode={flash}
        onCameraReady={() => setCameraReady(true)}
      />

      {/* Header Overlay */}
      <View style={[styles.headerOverlay, { paddingTop: TOP_OFFSET + 8 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Capture Face</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Center Guide Frame */}
      <View style={styles.centerContent} pointerEvents="none">
        <View style={styles.guideFrame}>
          <View style={[styles.guideLine, styles.topLine]} />
          <View style={[styles.guideLine, styles.bottomLine]} />
          <View style={[styles.guideLine, styles.leftLine]} />
          <View style={[styles.guideLine, styles.rightLine]} />
        </View>
        <Text style={styles.guideText}>Position your face in the frame</Text>
      </View>

      {/* Bottom Controls */}
      <View style={[styles.bottomOverlay, { zIndex: 15 }]}>
        {/* Tips */}
        <View style={styles.tipsContainer}>
          <View style={styles.tip}>
            <MaterialCommunityIcons
              name="lightbulb-on-outline"
              size={16}
              color="#FFD700"
            />
            <Text style={styles.tipText}>Good lighting needed</Text>
          </View>
          <View style={styles.tip}>
            <MaterialCommunityIcons
              name="face-recognition"
              size={16}
              color="#FFD700"
            />
            <Text style={styles.tipText}>Face must be visible</Text>
          </View>
          <View style={styles.tip}>
            <MaterialCommunityIcons
              name="ruler-square"
              size={16}
              color="#FFD700"
            />
            <Text style={styles.tipText}>Fill the frame completely</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.controlsRow}>
          {/* Flash Toggle */}
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => setFlash(flash === "off" ? "on" : "off")}
          >
            <Ionicons
              name={flash === "off" ? "flash-off" : "flash"}
              size={24}
              color="#FFF"
            />
          </TouchableOpacity>

          {/* Capture Button */}
          <TouchableOpacity
            style={[
              styles.captureButton,
              isLoading && styles.captureButtonDisabled,
            ]}
            onPress={takePicture}
            disabled={isLoading || !cameraReady}
          >
            {isLoading ? (
              <ActivityIndicator size="large" color="#825A3B" />
            ) : (
              <View style={styles.captureButtonInner} />
            )}
          </TouchableOpacity>

          {/* Gallery Toggle */}
          <TouchableOpacity style={styles.controlButton} onPress={pickImage}>
            <Ionicons name="image-outline" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Loading Indicator */}
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#825A3B" />
            <Text style={styles.loadingText}>Analyzing your skin...</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  camera: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },

  // Header
  headerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 40,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFF",
  },

  // Center Content
  centerContent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 5,
  },
  guideFrame: {
    width: 240,
    height: 300,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  guideLine: {
    position: "absolute",
    backgroundColor: "#4CAF50",
  },
  topLine: {
    top: 10,
    left: 20,
    right: 20,
    height: 2,
    width: 60,
  },
  bottomLine: {
    bottom: 10,
    left: 20,
    right: 20,
    height: 2,
    width: 60,
  },
  leftLine: {
    top: 20,
    bottom: 20,
    left: 10,
    width: 2,
    height: 60,
  },
  rightLine: {
    top: 20,
    bottom: 20,
    right: 10,
    width: 2,
    height: 60,
  },
  guideText: {
    position: "absolute",
    bottom: -50,
    color: "#FFF",
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },

  // Bottom Overlay
  bottomOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 16,
  },

  // Tips
  tipsContainer: {
    marginBottom: 24,
  },
  tip: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  tipText: {
    color: "#FFD700",
    fontSize: 12,
    marginLeft: 8,
    fontWeight: "500",
  },

  // Controls
  controlsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginBottom: 16,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  captureButton: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "#825A3B",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  captureButtonInner: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: "#FFF",
  },

  // Loading
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 20,
  },
  loadingText: {
    color: "#FFF",
    marginTop: 16,
    fontSize: 16,
    fontWeight: "600",
  },
});

export default SkinAnalysisCameraScreen;
