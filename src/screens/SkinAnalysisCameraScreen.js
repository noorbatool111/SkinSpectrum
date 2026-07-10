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
import { CameraView, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { analyzeSkinImage } from "../services/api";

const { width, height } = Dimensions.get("window");
const TOP_OFFSET =
  Platform.OS === "android" ? StatusBar.currentHeight || 24 : 44;

const SkinAnalysisCameraScreen = ({ navigation }) => {
  const cameraRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraType, setCameraType] = useState("front");
  const [flash, setFlash] = useState("off");
  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    const requestPermissions = async () => {
      const cameraStatus = await requestPermission();
      const photoStatus =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (cameraStatus.status !== "granted") {
        Alert.alert("Permission Required", "Camera permission is needed to scan your face.");
      }
      if (photoStatus.status !== "granted") {
        Alert.alert("Permission Required", "Gallery permission is needed to upload images.");
      }
    };
    requestPermissions();
  }, []);

  const takePicture = async () => {
    if (!cameraReady || !cameraRef.current) {
      Alert.alert("Error", "Camera not ready");
      return;
    }

    try {
      setIsLoading(true);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.9,
      });
      await uploadAndAnalyze(photo.uri);
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Error capturing image");
    } finally {
      setIsLoading(false);
    }
  };

  const pickImage = async () => {
    try {
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

      console.log("API RESULT:", analysisResult);

      navigation.navigate("AnalysisResults", {
        results: analysisResult,
      });
    } catch (error) {
      console.log("ERROR:", error?.response || error);

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
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={cameraType}
        flashMode={flash}
        onCameraReady={() => setCameraReady(true)}
      />

      {/* HEADER */}
      <View style={[styles.header, { paddingTop: TOP_OFFSET }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Capture Face</Text>
        <TouchableOpacity onPress={() => setCameraType(cameraType === 'front' ? 'back' : 'front')}>
          <Ionicons name="camera-reverse-outline" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* GUIDE OVERLAY */}
      <View style={styles.overlay}>
        <View style={styles.guideContainer}>
          <View style={styles.guideBox} />
          <Text style={styles.guideText}>Align your face in the frame</Text>
        </View>
      </View>

      {/* CONTROLS */}
      <View style={styles.bottom}>
        <TouchableOpacity onPress={pickImage} style={styles.iconBtn}>
          <Ionicons name="image-outline" size={28} color="#FFF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.capture}
          onPress={takePicture}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#825A3B" />
          ) : (
            <View style={styles.inner} />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setFlash(flash === "off" ? "on" : "off")}
          style={styles.iconBtn}
        >
          <Ionicons
            name={flash === "off" ? "flash-off" : "flash"}
            size={28}
            color="#FFF"
          />
        </TouchableOpacity>
      </View>

      {isLoading && (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#FFF" />
          <Text style={{ color: "#FFF", marginTop: 15, fontWeight: '600' }}>
            Analyzing your skin...
          </Text>
        </View>
      )}
    </View>
  );
};

export default SkinAnalysisCameraScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  camera: { ...StyleSheet.absoluteFillObject },
  header: {
    position: "absolute",
    top: 0,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: 'center',
    padding: 20,
    backgroundColor: "rgba(0,0,0,0.3)",
    zIndex: 10,
  },
  headerText: { color: "#FFF", fontSize: 18, fontWeight: "700" },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: 'transparent',
  },
  guideContainer: {
    alignItems: 'center',
  },
  guideBox: {
    width: width * 0.65,
    height: width * 0.85,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.8)',
    borderRadius: width * 0.35,
    borderStyle: 'dashed',
  },
  guideText: {
    color: "#FFF",
    marginTop: 20,
    fontSize: 16,
    fontWeight: '500',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    overflow: 'hidden',
  },
  bottom: {
    position: "absolute",
    bottom: 50,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  capture: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.3)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: '#FFF',
  },
  inner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FFF",
  },
  iconBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loading: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
});