import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const AnalysisResultsScreen = ({ route, navigation }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { results } = route.params;

  const getSeverityColor = (severity) => {
    if (severity <= 2) return "#4CAF50"; // Green - Low
    if (severity <= 4) return "#FFC107"; // Yellow - Medium
    if (severity <= 6) return "#FF9800"; // Orange - Medium-High
    if (severity <= 8) return "#FF5722"; // Red-Orange - High
    return "#D32F2F"; // Red - Very High
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
      // Save locally to AsyncStorage
      const { saveAnalysis } = await import("../services/analysisStorage");
      const ok = await saveAnalysis({ results });
      if (ok) {
        Alert.alert("Success", "Analysis saved to your profile!");
        navigation.navigate("Home");
      } else {
        Alert.alert("Error", "Failed to save analysis locally.");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to save analysis. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const shareResults = async () => {
    try {
      Alert.alert("Share", "Share feature coming soon!");
    } catch (error) {
      Alert.alert("Error", "Failed to share results.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#825A3B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Analysis Results</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Face Shape & Skin Type Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <MaterialCommunityIcons
                name="face-recognition"
                size={28}
                color="#825A3B"
              />
              <Text style={styles.summaryLabel}>Face Shape</Text>
              <Text style={styles.summaryValue}>{results.face_shape}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryItem}>
              <MaterialCommunityIcons
                name="palette"
                size={28}
                color="#7B9E6B"
              />
              <Text style={styles.summaryLabel}>Skin Type</Text>
              <Text style={styles.summaryValue}>{results.skin_type}</Text>
            </View>
          </View>
        </View>

        {/* Conditions Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detected Conditions</Text>

          {results.conditions && results.conditions.length > 0 ? (
            <View>
              {results.conditions.map((condition, index) => (
                <View key={index} style={styles.conditionCard}>
                  <View style={styles.conditionHeader}>
                    <Text style={styles.conditionName}>{condition.name}</Text>
                    <View
                      style={[
                        styles.severityBadge,
                        {
                          backgroundColor: getSeverityColor(condition.severity),
                        },
                      ]}
                    >
                      <Text style={styles.severityText}>
                        {condition.severity}/10
                      </Text>
                    </View>
                  </View>

                  {/* Severity Bar */}
                  <View style={styles.severityBarContainer}>
                    <View style={styles.severityBarBackground}>
                      <View
                        style={[
                          styles.severityBarFill,
                          {
                            width: `${(condition.severity / 10) * 100}%`,
                            backgroundColor: getSeverityColor(
                              condition.severity,
                            ),
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.severityLabel}>
                      {getSeverityLabel(condition.severity)}
                    </Text>
                  </View>

                  {/* Description */}
                  {condition.description && (
                    <Text style={styles.conditionDescription}>
                      {condition.description}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.noDataText}>
              No conditions detected. Great skin! 🎉
            </Text>
          )}
        </View>

        {/* Recommendations Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personalized Recommendations</Text>

          {results.recommendations && results.recommendations.length > 0 ? (
            <View>
              {results.recommendations.map((recommendation, index) => (
                <View key={index} style={styles.recommendationCard}>
                  <View style={styles.recommendationIcon}>
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color="#4CAF50"
                    />
                  </View>
                  <Text style={styles.recommendationText}>
                    {recommendation}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.noDataText}>No recommendations available.</Text>
          )}
        </View>

        {/* Weather Advice Section */}
        {results.weather_advice && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Today's UV & Weather</Text>

            <View style={styles.weatherCard}>
              <View style={styles.weatherContent}>
                <MaterialCommunityIcons
                  name="sun-thermometer"
                  size={32}
                  color="#FF9800"
                />
                <View style={styles.weatherInfo}>
                  <Text style={styles.weatherLabel}>UV Index</Text>
                  <Text style={styles.weatherValue}>
                    {results.weather_advice.uv_index}
                  </Text>
                </View>
              </View>
              <Text style={styles.weatherAdvice}>
                {results.weather_advice.advice}
              </Text>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={[styles.actionButton, styles.saveButton]}
            onPress={saveResults}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <>
                <Ionicons name="save-outline" size={18} color="#FFF" />
                <Text style={styles.actionButtonText}>Save Results</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.shareButton]}
            onPress={shareResults}
          >
            <Ionicons name="share-social-outline" size={18} color="#825A3B" />
            <Text style={[styles.actionButtonText, styles.shareButtonText]}>
              Share
            </Text>
          </TouchableOpacity>
        </View>

        {/* New Analysis Button */}
        <TouchableOpacity
          style={styles.newAnalysisButton}
          onPress={() => navigation.replace("SkinAnalysisCamera")}
        >
          <Ionicons name="camera" size={18} color="#825A3B" />
          <Text style={styles.newAnalysisButtonText}>Perform New Analysis</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF6EF",
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E8DCC8",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(130, 90, 59, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#4A2E12",
  },

  // Scroll Content
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  // Summary Card
  summaryCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 12,
  },
  summaryLabel: {
    fontSize: 12,
    color: "#8A7A64",
    marginTop: 8,
    fontWeight: "500",
  },
  summaryValue: {
    fontSize: 16,
    color: "#4A2E12",
    fontWeight: "700",
    marginTop: 4,
  },
  divider: {
    width: 1,
    height: 50,
    backgroundColor: "#E8DCC8",
  },

  // Section
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#4A2E12",
    marginBottom: 12,
  },

  // Condition Card
  conditionCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  conditionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  conditionName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#4A2E12",
    flex: 1,
  },
  severityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    marginLeft: 8,
  },
  severityText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFF",
  },

  // Severity Bar
  severityBarContainer: {
    marginBottom: 12,
  },
  severityBarBackground: {
    height: 8,
    backgroundColor: "#E8DCC8",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  severityBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  severityLabel: {
    fontSize: 11,
    color: "#8A7A64",
    fontWeight: "500",
  },

  // Condition Description
  conditionDescription: {
    fontSize: 12,
    color: "#666",
    lineHeight: 18,
  },

  // Recommendation Card
  recommendationCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "rgba(76, 175, 80, 0.08)",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
  },
  recommendationIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  recommendationText: {
    flex: 1,
    fontSize: 13,
    color: "#333",
    lineHeight: 20,
    fontWeight: "500",
  },

  // Weather Card
  weatherCard: {
    backgroundColor: "rgba(255, 152, 0, 0.08)",
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#FF9800",
  },
  weatherContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  weatherInfo: {
    marginLeft: 12,
  },
  weatherLabel: {
    fontSize: 12,
    color: "#8A7A64",
    fontWeight: "500",
  },
  weatherValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FF9800",
    marginTop: 2,
  },
  weatherAdvice: {
    fontSize: 13,
    color: "#666",
    lineHeight: 20,
  },

  // Actions Section
  actionsSection: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  saveButton: {
    backgroundColor: "#825A3B",
  },
  shareButton: {
    backgroundColor: "#FFF",
    borderWidth: 2,
    borderColor: "#825A3B",
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFF",
  },
  shareButtonText: {
    color: "#825A3B",
  },

  // New Analysis Button
  newAnalysisButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: "#825A3B",
    borderRadius: 12,
    gap: 8,
    marginBottom: 24,
  },
  newAnalysisButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#825A3B",
  },

  // No Data
  noDataText: {
    fontSize: 13,
    color: "#999",
    textAlign: "center",
    paddingVertical: 20,
    fontStyle: "italic",
  },
});

export default AnalysisResultsScreen;
