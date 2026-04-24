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

  // Permissions
  useEffect(() => {
    const requestPermissions = async () => {
      const cameraStatus = await CameraModule.requestCameraPermissionsAsync();
      const photoStatus =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (cameraStatus.status !== "granted") {
        Alert.alert("Camera Permission Required");
      }
      if (photoStatus.status !== "granted") {
        Alert.alert("Gallery Permission Required");
      }
    };

    requestPermissions();
  }, []);

  // 📸 TAKE PICTURE
  const takePicture = async () => {
    if (!cameraReady || !cameraRef.current) {
      Alert.alert("Camera not ready");
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
      Alert.alert("Error capturing image");
    } finally {
      setIsLoading(false);
    }
  };

  // 🖼️ PICK IMAGE
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 0.9,
      });

      if (!result.canceled) {
        await uploadAndAnalyze(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Error picking image");
    }
  };

  // 🔥 FIXED FUNCTION (IMPORTANT)
  const uploadAndAnalyze = async (imageUri) => {
    try {
      setIsLoading(true);

      const analysisResult = await analyzeSkinImage(imageUri);

      console.log("API RESULT:", analysisResult);

      // ✅ DIRECT NAVIGATION (FIXED)
      navigation.navigate("AnalysisResults", {
        results: analysisResult,
      });
    } catch (error) {
      console.log("ERROR:", error?.response || error);

      Alert.alert(
        "Analysis Failed",
        "Could not analyze image. Make sure servers are running."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Camera
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
        <View style={{ width: 24 }} />
      </View>

      {/* GUIDE */}
      <View style={styles.center}>
        <Text style={{ color: "#FFF" }}>Align your face properly</Text>
      </View>

      {/* CONTROLS */}
      <View style={styles.bottom}>
        <TouchableOpacity onPress={pickImage}>
          <Ionicons name="image-outline" size={28} color="#FFF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.capture}
          onPress={takePicture}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <View style={styles.inner} />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() =>
            setFlash(flash === "off" ? "on" : "off")
          }
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
          <Text style={{ color: "#FFF", marginTop: 10 }}>
            Analyzing...
          </Text>
        </View>
      )}
    </View>
  );
};

export default SkinAnalysisCameraScreen;

// ---------------- STYLES ----------------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },

  camera: {
    ...StyleSheet.absoluteFillObject,
  },

  header: {
    position: "absolute",
    top: 0,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "rgba(0,0,0,0.4)",
  },

  headerText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  bottom: {
    position: "absolute",
    bottom: 40,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },

  capture: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
  },

  inner: {
    width: 55,
    height: 55,
    borderRadius: 28,
    backgroundColor: "#000",
  },

  loading: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
});