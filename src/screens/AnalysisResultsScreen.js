import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert, ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useUser } from "../context/UserContext";

const AnalysisResultsScreen = ({ route, navigation }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { results } = route.params;
  const { skinType: userSkinType } = useUser();

  // ── Helpers ──────────────────────────────────
  const getSeverityColor = (s) => {
    if (s === 0) return "#9E9E9E";
    if (s <= 2) return "#4CAF50";
    if (s <= 4) return "#FFC107";
    if (s <= 6) return "#FF9800";
    if (s <= 8) return "#FF5722";
    return "#D32F2F";
  };

  const getSeverityLabel = (s) => {
    if (s === 0) return "None";
    if (s <= 2) return "Minimal";
    if (s <= 4) return "Mild";
    if (s <= 6) return "Moderate";
    if (s <= 8) return "High";
    return "Severe";
  };

  const getAcneLabel = (grade) => {
    if (typeof grade === "string" && !grade.startsWith("level")) return grade;
    return ({ level0: "Clear", level1: "Mild", level2: "Moderate", level3: "Severe" }[grade] || grade);
  };

  // ── Data from API ─────────────────────────────
  const acne       = results.acne        || {};
  const faceShape  = results.face_shape  || "N/A";

  // Prefer the skin type the user chose during the onboarding quiz;
  // fall back to the backend-inferred value if the quiz answer is missing.
  const formatSkinType = (key) =>
    key ? key.charAt(0).toUpperCase() + key.slice(1) : null;
  const skinType = formatSkinType(userSkinType) || results.skin_type || "N/A";
  const darkCircles = results.dark_circles || { detected: false, severity: 0, darkness_score: 0 };

  // Use all_conditions from backend (full 8, already sorted by severity)
  // Fall back to skin_conditions if all_conditions not present
  const rawConditions = results.all_conditions || results.skin_conditions || [];

  // Build severity lookup
  const conditionMap = {};
  rawConditions.forEach(c => { conditionMap[c.condition] = c.severity ?? 0; });

  // Always render all 8 conditions in fixed order
  const REPORT_CONDITIONS = [
    "Acne", "Dark Spots", "Blackheads", "Whiteheads",
    "Pigmentation", "Pores", "Redness", "Wrinkles",
  ];

  const allConditions = REPORT_CONDITIONS.map((name) => {
    const severity = name === "Acne"
      ? (acne.severity ?? conditionMap["Acne"] ?? 0)
      : (conditionMap[name] ?? 0);

    return {
      name,
      subtitle: name === "Acne"
        ? `Grade: ${getAcneLabel(acne.grade)} · ${acne.confidence ?? 0}% confidence`
        : `Severity: ${getSeverityLabel(severity)}`,
      severity,
      description: name === "Acne"
        ? `Acne graded as ${getAcneLabel(acne.grade)}. ${
            severity === 0 ? "No acne detected. Skin looks clear." :
            severity <= 3 ? "A few minor blemishes present." :
            severity <= 6 ? "Moderate breakouts detected." :
            "Significant acne detected. Consider a dermatologist consultation."
          }`
        : getConditionDescription(name),
    };
  });

  // Append dark circles only if detected or has meaningful severity
  if (darkCircles.detected || darkCircles.severity > 1) {
    allConditions.push({
      name: "Dark Circles",
      subtitle: darkCircles.detected ? "Detected" : "Mild shadowing",
      severity: darkCircles.severity ?? 0,
      description: darkCircles.detected
        ? "Dark circles detected under the eyes. May indicate fatigue, dehydration, or genetics."
        : "Mild under-eye shadowing detected.",
    });
  }

  // Split: detected (severity > 0) shown first, then undetected
  const detectedConditions   = allConditions.filter(c => c.severity > 0);
  const undetectedConditions = allConditions.filter(c => c.severity === 0);

  const saveResults = async () => {
    try {
      setIsLoading(true);
      const { saveAnalysis } = await import("../services/analysisStorage");
      const ok = await saveAnalysis({ results });
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
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color="#333" />
          <Text style={styles.backBtnText}>Back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <Text style={styles.pageTitle}>Skin Health Report</Text>

        {/* FACE SHAPE + SKIN TYPE */}
        <LinearGradient 
          colors={['#FF7E5F', '#FEB47B']} 
          start={{x:0, y:0}} end={{x:1, y:1}} 
          style={styles.summaryCard}
        >
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <View style={styles.summaryIconBg}>
                <MaterialCommunityIcons name="face-recognition" size={26} color="#FF7E5F" />
              </View>
              <Text style={styles.summaryLabel}>Face Shape</Text>
              <Text style={styles.summaryValue}>{faceShape}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <View style={styles.summaryIconBg}>
                <MaterialCommunityIcons name="palette" size={26} color="#FF7E5F" />
              </View>
              <Text style={styles.summaryLabel}>Skin Type</Text>
              <Text style={styles.summaryValue}>{skinType}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* DETECTED CONDITIONS */}
        {detectedConditions.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Detected Conditions</Text>
            {detectedConditions.map((c, i) => (
              <ConditionCard key={`det-${i}`} c={c}
                getSeverityColor={getSeverityColor}
                getSeverityLabel={getSeverityLabel} />
            ))}
          </>
        )}

        {/* UNDETECTED CONDITIONS — collapsed summary */}
        {undetectedConditions.length > 0 && (
          <View style={{ marginTop: 10, marginBottom: 20 }}>
            <Text style={styles.sectionTitle}>Not Detected</Text>
            <View style={styles.clearedCard}>
              {undetectedConditions.map((c, i) => (
                <View key={`und-${i}`} style={styles.clearedRow}>
                  <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
                  <Text style={styles.clearedText}>{c.name}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ACTIONS */}
        <View style={styles.actions}>
          <TouchableOpacity activeOpacity={0.85} onPress={saveResults} style={styles.actionBtnWrapper}>
            <LinearGradient
              colors={['#FF416C', '#FF4B2B']}
              start={{x:0, y:0}} end={{x:1, y:0}}
              style={styles.actionBtnGradient}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Ionicons name="save-outline" size={20} color="#FFF" />
                  <Text style={styles.btnText}>Save Results</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.secondaryBtnWrapper}
            onPress={() => navigation.navigate("SkinScanInstructions")}
          >
            <View style={styles.secondaryBtnInner}>
              <Ionicons name="camera" size={20} color="#FF416C" />
              <Text style={styles.newText}>New Scan</Text>
            </View>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

// ── Condition Card Component ──────────────────
const ConditionCard = ({ c, getSeverityColor, getSeverityLabel }) => (
  <View style={styles.card}>
    <View style={styles.row}>
      <View style={{ flex: 1, paddingRight: 10 }}>
        <Text style={styles.conditionName}>{c.name}</Text>
        <Text style={styles.conditionSub}>{c.subtitle}</Text>
      </View>
      <View style={[styles.badge, { backgroundColor: getSeverityColor(c.severity) + '15' }]}>
        <Text style={[styles.badgeText, { color: getSeverityColor(c.severity) }]}>{c.severity}/10</Text>
      </View>
    </View>
    <View style={styles.barBg}>
      <LinearGradient 
        colors={[getSeverityColor(c.severity), getSeverityColor(c.severity) + '99']} 
        start={{x:0, y:0}} end={{x:1, y:0}}
        style={[styles.barFill, { width: `${c.severity * 10}%` }]} 
      />
    </View>
    <Text style={styles.severityText}>{getSeverityLabel(c.severity)}</Text>
    <Text style={styles.desc}>{c.description}</Text>
  </View>
);

// ── Condition descriptions ────────────────────
function getConditionDescription(condition) {
  const map = {
    "Acne":        "Active acne lesions detected. Papules or pustules may be present.",
    "Dark Spots":  "Hyperpigmented spots detected. Often caused by sun exposure or post-acne marks.",
    "Blackheads":  "Open clogged pores detected. Common in oily skin areas.",
    "Whiteheads":  "Closed clogged pores detected. May appear as small white bumps.",
    "Pigmentation":"Uneven skin tone detected. May benefit from brightening treatments.",
    "Pores":       "Enlarged pores detected. Associated with oily or combination skin.",
    "Redness":     "Skin redness or inflammation detected. Could indicate sensitivity or irritation.",
    "Wrinkles":    "Fine lines or wrinkles detected. Signs of skin aging or dehydration.",
    "Dark Circles":"Dark circles detected under the eyes. May indicate fatigue or genetics.",
  };
  return map[condition] || "Skin condition detected. Consult a dermatologist for advice.";
}

export default AnalysisResultsScreen;

// ── Styles ────────────────────────────────────
const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: "#FAF6EF" },
  header: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 5 },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    alignSelf: "flex-start",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  backBtnText: { marginLeft: 6, fontSize: 15, fontWeight: "700", color: "#333" },
  pageTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1D2B64",
    marginBottom: 20,
  },
  scrollContent:  { padding: 20, paddingBottom: 50 },

  summaryCard: {
    borderRadius: 24, padding: 24, marginBottom: 30,
    shadowColor: "#FF7E5F", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8,
  },
  summaryIconBg: {
    backgroundColor: '#FFF', width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  summaryDivider: { width: 1, backgroundColor: "rgba(255,255,255,0.3)" },
  summaryLabel: { fontSize: 13, color: "rgba(255,255,255,0.9)", fontWeight: '500' },
  summaryValue: { fontSize: 18, fontWeight: "800", color: "#FFF", marginTop: 2 },
  summaryRow:  { flexDirection: "row", justifyContent: "space-around" },
  summaryItem: { alignItems: "center" },

  sectionTitle: { fontSize: 20, fontWeight: "800", marginBottom: 16, color: "#1D2B64" },

  card: {
    backgroundColor: "#FFF", padding: 20, borderRadius: 20, marginBottom: 16,
    shadowColor: "#000", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3,
    borderWidth: 1, borderColor: "rgba(0,0,0,0.03)",
  },
  row:          { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  conditionName:{ fontWeight: "800", fontSize: 16, color: "#333" },
  conditionSub: { fontSize: 12, color: "#888", marginTop: 4, fontWeight: '500' },
  badge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  badgeText: { fontWeight: "800", fontSize: 14 },
  barBg: { height: 8, backgroundColor: "#F0F0F0", marginVertical: 14, borderRadius: 4, overflow: 'hidden' },
  barFill: { height: "100%", borderRadius: 4 },
  severityText: { fontSize: 13, color: "#666", fontWeight: '600' },
  desc: { fontSize: 13, marginTop: 6, color: "#777", lineHeight: 20 },

  // Cleared/undetected compact card
  clearedCard: {
    backgroundColor: "rgba(76, 175, 80, 0.05)", padding: 20, borderRadius: 20,
    borderWidth: 1, borderColor: "rgba(76, 175, 80, 0.15)",
    flexDirection: "row", flexWrap: "wrap", gap: 12,
  },
  clearedRow:  { flexDirection: "row", alignItems: "center", gap: 6, width: "45%" },
  clearedText: { fontSize: 14, color: "#2E7D32", fontWeight: '600' },

  actions: { marginTop: 10, gap: 14 },
  actionBtnWrapper: {
    width: '100%',
    shadowColor: '#FF416C',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  actionBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 24,
    gap: 8,
  },
  btnText: { color: "#FFF", fontWeight: "800", fontSize: 16 },
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
    borderColor: 'rgba(255, 65, 108, 0.2)',
    gap: 8,
  },
  newText: { color: "#FF416C", fontWeight: "800", fontSize: 16 },
});