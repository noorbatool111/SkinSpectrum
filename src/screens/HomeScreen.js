import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  StatusBar,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useUser } from "../context/UserContext";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 56 - 12) / 2;

const HomeScreen = ({ navigation }) => {
  const { userName, skinType, skinConcerns } = useUser();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-20)).current;
  const cardsSlide = useRef(new Animated.Value(30)).current;
  const cardsFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(headerSlide, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(cardsFade, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(cardsSlide, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const displayName = userName || "Friend";
  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const quickActions = [
    {
      key: "scan",
      label: "Scan Skin",
      desc: "AI-powered analysis",
      icon: "scan-outline",
      color: "#825A3B",
      bg: "rgba(130, 90, 59, 0.08)",
    },
    {
      key: "track",
      label: "Track Progress",
      desc: "View your journey",
      icon: "trending-up-outline",
      color: "#5B8DBE",
      bg: "rgba(91, 141, 190, 0.08)",
    },
    {
      key: "routine",
      label: "My Routine",
      desc: "Daily skincare plan",
      icon: "calendar-outline",
      color: "#7B9E6B",
      bg: "rgba(123, 158, 107, 0.08)",
    },
    {
      key: "learn",
      label: "Learn",
      desc: "Skin health tips",
      icon: "book-outline",
      color: "#C47B8E",
      bg: "rgba(196, 123, 142, 0.08)",
    },
  ];

  const dailyTips = [
    {
      icon: "sunny-outline",
      tip: "Apply SPF 30+ sunscreen, even on cloudy days.",
      color: "#D4A03E",
    },
    {
      icon: "water-outline",
      tip: "Drink at least 8 glasses of water today.",
      color: "#5B8DBE",
    },
    {
      icon: "moon-outline",
      tip: "Apply your night serum before bed for best results.",
      color: "#9B7DC4",
    },
  ];

  const skinScore = 78;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF6EF" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: headerSlide }],
            },
          ]}
        >
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>{greeting()},</Text>
            <Text style={styles.userName}>{displayName} ✨</Text>
          </View>
          <TouchableOpacity
            style={styles.avatarSmall}
            activeOpacity={0.8}
            onPress={() => navigation.navigate("Profile")}
          >
            <Text style={styles.avatarSmallText}>
              {displayName.charAt(0).toUpperCase()}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Skin Health Score Card */}
        <Animated.View
          style={[
            styles.scoreCard,
            {
              opacity: cardsFade,
              transform: [{ translateY: cardsSlide }],
            },
          ]}
        >
          <View style={styles.scoreLeft}>
            <Text style={styles.scoreLabel}>Skin Health Score</Text>
            <View style={styles.scoreRow}>
              <Text style={styles.scoreNumber}>{skinScore}</Text>
              <Text style={styles.scoreMax}>/100</Text>
            </View>
            <View style={styles.scoreBar}>
              <View style={[styles.scoreFill, { width: `${skinScore}%` }]} />
            </View>
            <Text style={styles.scoreHint}>
              {skinScore >= 80
                ? "Excellent! Keep it up"
                : skinScore >= 60
                  ? "Good — room to improve"
                  : "Let's work on this together"}
            </Text>
          </View>
          <View style={styles.scoreRight}>
            <View style={styles.scoreCircle}>
              <MaterialCommunityIcons
                name="heart-pulse"
                size={28}
                color="#825A3B"
              />
            </View>
          </View>
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View
          style={{
            opacity: cardsFade,
            transform: [{ translateY: cardsSlide }],
          }}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
          </View>

          <View style={styles.actionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.key}
                style={styles.actionCard}
                activeOpacity={0.85}
                onPress={() => {
                  if (action.key === "scan") {
                    navigation.navigate("SkinAnalysisCamera");
                  } else if (action.key === "track") {
                    // TODO: Navigate to tracking screen
                  } else if (action.key === "routine") {
                    // TODO: Navigate to routine screen
                  } else if (action.key === "learn") {
                    // TODO: Navigate to learning screen
                  }
                }}
              >
                <View
                  style={[styles.actionIconBox, { backgroundColor: action.bg }]}
                >
                  <Ionicons name={action.icon} size={24} color={action.color} />
                </View>
                <Text style={styles.actionLabel}>{action.label}</Text>
                <Text style={styles.actionDesc}>{action.desc}</Text>
                <View style={styles.actionArrow}>
                  <Ionicons name="arrow-forward" size={14} color="#B5A48E" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Your Profile Tags */}
        {skinType && (
          <View style={styles.profileTagsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your Profile</Text>
              <TouchableOpacity activeOpacity={0.6}>
                <Text style={styles.seeAll}>Edit</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.profileTagsScroll}
            >
              <View style={styles.profileTag}>
                <Ionicons name="water-outline" size={14} color="#825A3B" />
                <Text style={styles.profileTagText}>
                  {skinType
                    .replace(/-/g, " ")
                    .replace(/\b\w/g, (c) => c.toUpperCase())}{" "}
                  Skin
                </Text>
              </View>
              {skinConcerns &&
                skinConcerns.slice(0, 4).map((concern, i) => (
                  <View key={i} style={styles.profileTag}>
                    <Text style={styles.profileTagText}>
                      {concern
                        .replace(/-/g, " ")
                        .replace(/\b\w/g, (c) => c.toUpperCase())}
                    </Text>
                  </View>
                ))}
            </ScrollView>
          </View>
        )}

        {/* Daily Tips */}
        <View style={styles.tipsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Daily Tips</Text>
            <TouchableOpacity activeOpacity={0.6}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>

          {dailyTips.map((tip, index) => (
            <View key={index} style={styles.tipCard}>
              <View
                style={[
                  styles.tipIconBox,
                  { backgroundColor: tip.color + "15" },
                ]}
              >
                <Ionicons name={tip.icon} size={20} color={tip.color} />
              </View>
              <Text style={styles.tipText}>{tip.tip}</Text>
            </View>
          ))}
        </View>

        {/* Bottom Spacer for nav */}
        <View style={{ height: 90 }} />
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} activeOpacity={0.7}>
          <Ionicons name="home" size={24} color="#825A3B" />
          <Text style={[styles.navLabel, styles.navLabelActive]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.7}
          onPress={() => navigation.navigate("SkinAnalysisCamera")}
        >
          <Ionicons name="scan-outline" size={24} color="#B5A48E" />
          <Text style={styles.navLabel}>Scan</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navCenterBtn} activeOpacity={0.85}>
          <View style={styles.navCenterInner}>
            <Ionicons name="add" size={28} color="#FFF" />
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} activeOpacity={0.7}>
          <Ionicons name="analytics-outline" size={24} color="#B5A48E" />
          <Text style={styles.navLabel}>Progress</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.7}
          onPress={() => navigation.navigate("Profile")}
        >
          <Ionicons name="person-outline" size={24} color="#B5A48E" />
          <Text style={styles.navLabel}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF6EF",
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 10,
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 15,
    color: "#8A7A64",
    fontWeight: "500",
  },
  userName: {
    fontSize: 26,
    color: "#4A2E12",
    fontWeight: "700",
    marginTop: 2,
  },
  avatarSmall: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#825A3B",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#825A3B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarSmallText: {
    fontSize: 20,
    color: "#FFF",
    fontWeight: "700",
  },

  // Score Card
  scoreCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 22,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  scoreLeft: {
    flex: 1,
  },
  scoreLabel: {
    fontSize: 13,
    color: "#8A7A64",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 10,
  },
  scoreNumber: {
    fontSize: 42,
    color: "#4A2E12",
    fontWeight: "800",
  },
  scoreMax: {
    fontSize: 16,
    color: "#B5A48E",
    fontWeight: "600",
    marginLeft: 2,
  },
  scoreBar: {
    height: 6,
    backgroundColor: "rgba(130, 90, 59, 0.1)",
    borderRadius: 3,
    marginBottom: 8,
    overflow: "hidden",
  },
  scoreFill: {
    height: "100%",
    backgroundColor: "#825A3B",
    borderRadius: 3,
  },
  scoreHint: {
    fontSize: 12,
    color: "#9B8A76",
    fontWeight: "500",
  },
  scoreRight: {
    justifyContent: "center",
    marginLeft: 16,
  },
  scoreCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(130, 90, 59, 0.08)",
    alignItems: "center",
    justifyContent: "center",
  },

  // Section
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    color: "#4A2E12",
    fontWeight: "700",
  },
  seeAll: {
    fontSize: 13,
    color: "#825A3B",
    fontWeight: "600",
  },

  // Actions Grid
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  actionCard: {
    width: CARD_WIDTH,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  actionIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  actionLabel: {
    fontSize: 15,
    color: "#4A2E12",
    fontWeight: "700",
    marginBottom: 3,
  },
  actionDesc: {
    fontSize: 12,
    color: "#9B8A76",
    fontWeight: "500",
    marginBottom: 10,
  },
  actionArrow: {
    alignSelf: "flex-end",
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(130, 90, 59, 0.06)",
    alignItems: "center",
    justifyContent: "center",
  },

  // Profile Tags
  profileTagsSection: {
    marginBottom: 24,
  },
  profileTagsScroll: {
    gap: 8,
  },
  profileTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(130, 90, 59, 0.08)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 6,
  },
  profileTagText: {
    fontSize: 13,
    color: "#825A3B",
    fontWeight: "600",
  },

  // Tips
  tipsSection: {
    marginBottom: 10,
  },
  tipCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  tipIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: "#4A2E12",
    fontWeight: "500",
    lineHeight: 19,
  },

  // Bottom Nav
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-around",
    backgroundColor: "#FFFFFF",
    paddingTop: 10,
    paddingBottom: 28,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 10,
  },
  navItem: {
    alignItems: "center",
    flex: 1,
  },
  navLabel: {
    fontSize: 11,
    color: "#B5A48E",
    fontWeight: "600",
    marginTop: 4,
  },
  navLabelActive: {
    color: "#825A3B",
  },
  navCenterBtn: {
    flex: 1,
    alignItems: "center",
    marginTop: -22,
  },
  navCenterInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#5C3318",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#3A1E0A",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
});

export default HomeScreen;
