import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const MelanomaResultsScreen = ({ route, navigation }) => {
  const { results, imageUri } = route.params;

  const isMalignant = results.prediction === "malignant";
  const isUnsure = results.prediction === "unsure";

  const getResultColor = () => {
    if (isMalignant) return "#D32F2F";
    if (isUnsure) return "#FF9800";
    return "#4CAF50";
  };

  const getResultTitle = () => {
    if (isMalignant) return "High Risk Detected";
    if (isUnsure) return "Inconclusive Result";
    return "Low Risk Detected";
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate("Home")}>
          <Ionicons name="close" size={28} color="#4A2E12" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Melanoma Analysis</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* IMAGE PREVIEW */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUri }} style={styles.image} />
          <View style={[styles.statusBadge, { backgroundColor: getResultColor() }]}>
            <Text style={styles.statusText}>
              {results.prediction.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* RESULT CARD */}
        <View style={styles.resultCard}>
          <View style={[styles.resultHeader, { backgroundColor: getResultColor() + "10" }]}>
            <MaterialCommunityIcons 
              name={isMalignant ? "alert-octagon" : isUnsure ? "help-circle" : "check-circle"} 
              size={32} 
              color={getResultColor()} 
            />
            <Text style={[styles.resultTitle, { color: getResultColor() }]}>
              {getResultTitle()}
            </Text>
          </View>

          <View style={styles.details}>
            <View style={styles.scoreRow}>
              <Text style={styles.scoreLabel}>Confidence Score</Text>
              <Text style={styles.scoreValue}>{results.confidence}%</Text>
            </View>
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { width: `${results.confidence}%`, backgroundColor: getResultColor() }]} />
            </View>

            <Text style={styles.messageTitle}>Summary</Text>
            <Text style={styles.messageText}>{results.message}</Text>
          </View>
        </View>

        {/* WARNING / ADVICE */}
        <View style={styles.adviceCard}>
          <Ionicons name="information-circle-outline" size={24} color="#8A7A64" />
          <Text style={styles.adviceText}>
            AI analysis is for screening purposes only and does not replace a professional medical diagnosis. 
            {isMalignant || isUnsure ? " We strongly recommend consulting a board-certified dermatologist." : " Always monitor your moles for changes in shape, color, or size."}
          </Text>
        </View>

        {/* ACTIONS */}
        <View style={styles.actions}>
          <TouchableOpacity 
            style={[styles.btn, { backgroundColor: "#825A3B" }]}
            onPress={() => navigation.navigate("Home")}
          >
            <Text style={styles.btnText}>Back to Dashboard</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.btn, styles.btnOutline]}
            onPress={() => navigation.replace("MelanomaAnalysisCamera")}
          >
            <Text style={[styles.btnText, { color: "#825A3B" }]}>Scan Another Mole</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default MelanomaResultsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAF6EF" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#4A2E12" },
  scrollContent: { padding: 20 },
  imageContainer: {
    width: "100%",
    height: width * 0.8,
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 24,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  image: { width: "100%", height: "100%" },
  statusBadge: {
    position: "absolute",
    bottom: 16,
    right: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  statusText: { color: "#FFF", fontWeight: "bold", fontSize: 14 },
  resultCard: {
    backgroundColor: "#FFF",
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    gap: 12,
  },
  resultTitle: { fontSize: 20, fontWeight: "bold" },
  details: { padding: 20 },
  scoreRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  scoreLabel: { color: "#8A7A64", fontWeight: "600" },
  scoreValue: { color: "#4A2E12", fontWeight: "bold" },
  progressContainer: {
    height: 8,
    backgroundColor: "#FAF6EF",
    borderRadius: 4,
    marginBottom: 24,
    overflow: "hidden",
  },
  progressBar: { height: "100%", borderRadius: 4 },
  messageTitle: { fontSize: 16, fontWeight: "bold", color: "#4A2E12", marginBottom: 8 },
  messageText: { fontSize: 14, color: "#6B5E4C", lineHeight: 22 },
  adviceCard: {
    flexDirection: "row",
    backgroundColor: "rgba(130, 90, 59, 0.05)",
    padding: 16,
    borderRadius: 16,
    gap: 12,
    marginBottom: 30,
  },
  adviceText: { flex: 1, fontSize: 13, color: "#8A7A64", lineHeight: 18 },
  actions: { gap: 12, marginBottom: 40 },
  btn: {
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  btnOutline: {
    borderWidth: 2,
    borderColor: "#825A3B",
  },
  btnText: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
});
