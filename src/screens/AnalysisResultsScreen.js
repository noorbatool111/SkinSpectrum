import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

const AnalysisResultsScreen = ({ route, navigation }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { results } = route.params;

  // 🔥 FORMAT BACKEND DATA
  const formattedResults = {
    ...results,
    conditions: [
      {
        name: "Acne",
        severity: results.acne || 0,
        description: "Skin breakouts and inflammation detected.",
      },
      {
        name: "Wrinkles",
        severity: results.wrinkles || 0,
        description: "Fine lines and skin aging signs detected.",
      },
    ],
  };

  const getSeverityColor = (severity) => {
    if (severity <= 2) return "#4CAF50";
    if (severity <= 4) return "#FFC107";
    if (severity <= 6) return "#FF9800";
    if (severity <= 8) return "#FF5722";
    return "#D32F2F";
  };

  const getSeverityLabel = (severity) => {
    if (severity <= 2) return "Low";
    if (severity <= 4) return "Medium";
    if (severity <= 6) return "Moderate";
    if (severity <= 8) return "High";
    return "Very High";
  };

  const saveResults = async () => {
    try {
      setIsLoading(true);
      const { saveAnalysis } = await import("../services/analysisStorage");
      const ok = await saveAnalysis({ results: formattedResults });

      if (ok) {
        Alert.alert("Success", "Analysis saved!");
        navigation.navigate("Home");
      } else {
        Alert.alert("Error", "Failed to save.");
      }
    } catch {
      Alert.alert("Error", "Save failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#825A3B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Analysis Results</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* FACE + SKIN */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <MaterialCommunityIcons
                name="face-recognition"
                size={26}
                color="#825A3B"
              />
              <Text style={styles.label}>Face Shape</Text>
              <Text style={styles.value}>
                {formattedResults.face_shape || "N/A"}
              </Text>
            </View>

            <View style={styles.summaryItem}>
              <MaterialCommunityIcons
                name="palette"
                size={26}
                color="#7B9E6B"
              />
              <Text style={styles.label}>Skin Type</Text>
              <Text style={styles.value}>
                {formattedResults.skin_type || "N/A"}
              </Text>
            </View>
          </View>
        </View>

        {/* CONDITIONS */}
        <Text style={styles.sectionTitle}>Skin Conditions</Text>

        {formattedResults.conditions.map((c, i) => (
          <View key={i} style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.conditionName}>
                {c.name === "Acne"
                  ? "Acne Detection"
                  : "Wrinkle Analysis"}
              </Text>

              <View
                style={[
                  styles.badge,
                  { backgroundColor: getSeverityColor(c.severity) },
                ]}
              >
                <Text style={styles.badgeText}>{c.severity}/10</Text>
              </View>
            </View>

            {/* BAR */}
            <View style={styles.barBg}>
              <View
                style={[
                  styles.barFill,
                  {
                    width: `${c.severity * 10}%`,
                    backgroundColor: getSeverityColor(c.severity),
                  },
                ]}
              />
            </View>

            <Text style={styles.severityText}>
              {getSeverityLabel(c.severity)}
            </Text>

            <Text style={styles.desc}>{c.description}</Text>
          </View>
        ))}

        {/* BUTTONS */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.saveBtn} onPress={saveResults}>
            {isLoading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Ionicons name="save-outline" size={18} color="#FFF" />
                <Text style={styles.btnText}>Save</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.newBtn}
            onPress={() => navigation.replace("SkinAnalysisCamera")}
          >
            <Ionicons name="camera" size={18} color="#825A3B" />
            <Text style={styles.newText}>New Scan</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AnalysisResultsScreen;

// ------------------ STYLES ------------------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAF6EF" },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4A2E12",
  },

  scrollContent: { padding: 16 },

  summaryCard: {
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },

  summaryItem: { alignItems: "center" },

  label: { fontSize: 12, color: "#888", marginTop: 5 },

  value: { fontSize: 16, fontWeight: "bold" },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },

  card: {
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  conditionName: { fontWeight: "bold" },

  badge: { padding: 6, borderRadius: 10 },

  badgeText: { color: "#FFF", fontWeight: "bold" },

  barBg: {
    height: 8,
    backgroundColor: "#eee",
    marginVertical: 10,
    borderRadius: 5,
  },

  barFill: { height: "100%", borderRadius: 5 },

  severityText: { fontSize: 12, color: "#666" },

  desc: { fontSize: 12, marginTop: 5, color: "#777" },

  actions: { marginTop: 20 },

  saveBtn: {
    backgroundColor: "#825A3B",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    marginBottom: 10,
  },

  btnText: { color: "#FFF", fontWeight: "bold" },

  newBtn: {
    borderWidth: 2,
    borderColor: "#825A3B",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },

  newText: { color: "#825A3B", fontWeight: "bold" },
});