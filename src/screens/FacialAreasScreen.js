import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  StatusBar,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useUser } from '../context/UserContext';

const { width } = Dimensions.get('window');
const AREA_SIZE = (width - 56 - 24) / 3; // 3 columns with gaps

const FacialAreasScreen = ({ navigation }) => {
  const { syncProfileData } = useUser();
  const [selectedAreas, setSelectedAreas] = useState([]);
  const [selectedChallenges, setSelectedChallenges] = useState([]);

  const headerFade = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-20)).current;
  const cardSlide = useRef(new Animated.Value(60)).current;
  const cardFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(headerFade, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(headerSlide, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(cardFade, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(cardSlide, {
          toValue: 0,
          friction: 8,
          tension: 50,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const facialAreas = [
    { key: 'forehead', label: 'Forehead', icon: 'border-top' },
    { key: 'nose', label: 'Nose', icon: 'dots-vertical' },
    { key: 'cheeks', label: 'Cheeks', icon: 'circle-double' },
    { key: 'chin', label: 'Chin', icon: 'chevron-down' },
    { key: 'jawline', label: 'Jawline', icon: 'vector-curve' },
    { key: 'around-eyes', label: 'Around Eyes', icon: 'eye-outline' },
    { key: 'lips', label: 'Lips', icon: 'minus' },
    { key: 'neck', label: 'Neck', icon: 'reorder-horizontal' },
    { key: 'temples', label: 'Temples', icon: 'adjust' },
  ];

  const challenges = [
    { key: 'routine', label: 'Building a routine', icon: 'calendar-outline' },
    { key: 'products', label: 'Finding right products', icon: 'search-outline' },
    { key: 'breakouts', label: 'Managing breakouts', icon: 'alert-circle-outline' },
    { key: 'aging', label: 'Signs of aging', icon: 'time-outline' },
    { key: 'sensitivity', label: 'Skin sensitivity', icon: 'shield-outline' },
    { key: 'hydration', label: 'Staying hydrated', icon: 'water-outline' },
    { key: 'sun', label: 'Sun protection', icon: 'sunny-outline' },
    { key: 'scarring', label: 'Scar management', icon: 'bandage-outline' },
    { key: 'pigmentation', label: 'Uneven pigmentation', icon: 'color-palette-outline' },
    { key: 'monitoring', label: 'Mole monitoring', icon: 'scan-outline' },
  ];

  const toggleArea = (key) => {
    setSelectedAreas((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const toggleChallenge = (key) => {
    setSelectedChallenges((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const isValid = selectedAreas.length > 0 && selectedChallenges.length > 0;

  const handleContinue = async () => {
    if (isValid) {
      await syncProfileData({
        facialAreas: selectedAreas,
        userChallenges: selectedChallenges
      });
      navigation.navigate('ProfileSetup');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF6EF" />

      <View style={[styles.decorCircle, styles.decorTop]} />

      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
        activeOpacity={0.7}
      >
        <View style={styles.backButtonInner}>
          <Ionicons name="chevron-back" size={22} color="#5C3D1A" />
        </View>
      </TouchableOpacity>

      {/* Header */}
      <Animated.View
        style={[
          styles.headerSection,
          {
            opacity: headerFade,
            transform: [{ translateY: headerSlide }],
          },
        ]}
      >
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name="face-recognition" size={34} color="#825A3B" />
        </View>

        <Text style={styles.title}>Focus areas &{'\n'}your challenges</Text>
        <Text style={styles.subtitle}>
          Help us understand where to focus your analysis.
        </Text>
      </Animated.View>

      {/* Bottom Card */}
      <Animated.View
        style={[
          styles.bottomCard,
          {
            opacity: cardFade,
            transform: [{ translateY: cardSlide }],
          },
        ]}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Section: Facial Areas */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Facial Areas</Text>
            <Text style={styles.sectionBadge}>
              {selectedAreas.length > 0
                ? `${selectedAreas.length} selected`
                : 'Tap to select'}
            </Text>
          </View>

          <View style={styles.areasGrid}>
            {facialAreas.map((area) => {
              const isSelected = selectedAreas.includes(area.key);
              return (
                <TouchableOpacity
                  key={area.key}
                  style={[
                    styles.areaCard,
                    isSelected && styles.areaCardSelected,
                  ]}
                  onPress={() => toggleArea(area.key)}
                  activeOpacity={0.8}
                >
                  {isSelected && (
                    <View style={styles.areaCheck}>
                      <Ionicons name="checkmark" size={10} color="#FFF" />
                    </View>
                  )}
                  <MaterialCommunityIcons 
                    name={area.icon} 
                    size={28} 
                    color={isSelected ? '#825A3B' : '#B5A48E'} 
                    style={{ marginBottom: 6 }}
                  />
                  <Text
                    style={[
                      styles.areaLabel,
                      isSelected && styles.areaLabelSelected,
                    ]}
                  >
                    {area.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Section: Challenges */}
          <View style={[styles.sectionHeader, { marginTop: 22 }]}>
            <Text style={styles.sectionTitle}>Your Challenges</Text>
            <Text style={styles.sectionBadge}>
              {selectedChallenges.length > 0
                ? `${selectedChallenges.length} selected`
                : 'Pick any'}
            </Text>
          </View>

          <View style={styles.challengesGrid}>
            {challenges.map((ch) => {
              const isSelected = selectedChallenges.includes(ch.key);
              return (
                <TouchableOpacity
                  key={ch.key}
                  style={[
                    styles.challengeRow,
                    isSelected && styles.challengeRowSelected,
                  ]}
                  onPress={() => toggleChallenge(ch.key)}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.challengeIconBox,
                      isSelected && styles.challengeIconBoxSelected,
                    ]}
                  >
                    <Ionicons
                      name={isSelected ? 'checkmark' : ch.icon}
                      size={18}
                      color={isSelected ? '#FFF' : '#825A3B'}
                    />
                  </View>
                  <Text
                    style={[
                      styles.challengeText,
                      isSelected && styles.challengeTextSelected,
                    ]}
                  >
                    {ch.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* Continue Button */}
        <TouchableOpacity
          style={[
            styles.continueButton,
            !isValid && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          activeOpacity={0.85}
          disabled={!isValid}
        >
          <Text style={styles.continueButtonText}>
            {selectedAreas.length === 0
              ? 'Select facial areas'
              : selectedChallenges.length === 0
              ? 'Select your challenges'
              : 'Continue'}
          </Text>
          {isValid && (
            <View style={styles.continueArrow}>
              <Ionicons name="arrow-forward" size={18} color="#FFF" />
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF6EF',
  },
  decorCircle: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(130, 90, 59, 0.03)',
  },
  decorTop: { top: -60, left: -50 },

  // Back button
  backButton: {
    position: 'absolute',
    top: 55,
    left: 20,
    zIndex: 10,
  },
  backButtonInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(130, 90, 59, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Header
  headerSection: {
    alignItems: 'center',
    paddingTop: 70,
    paddingBottom: 14,
    paddingHorizontal: 30,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: 'rgba(130, 90, 59, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    color: '#4A2E12',
    fontFamily: 'serif',
    letterSpacing: 0.5,
    marginBottom: 8,
    textAlign: 'center',
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 14,
    color: '#8A7A64',
    textAlign: 'center',
    lineHeight: 21,
  },

  // Bottom Card
  bottomCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 24,
    paddingBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 8,
  },
  scrollContent: {
    paddingBottom: 10,
    paddingHorizontal: 24,
  },

  // Section header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#4A2E12',
    fontWeight: '700',
  },
  sectionBadge: {
    fontSize: 12,
    color: '#825A3B',
    fontWeight: '600',
    backgroundColor: 'rgba(130, 90, 59, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },

  // Facial areas grid (3 columns)
  areasGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  areaCard: {
    width: AREA_SIZE,
    aspectRatio: 1,
    backgroundColor: '#FAF7F2',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  areaCardSelected: {
    borderColor: '#825A3B',
    backgroundColor: 'rgba(130, 90, 59, 0.06)',
  },
  areaCheck: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#825A3B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  areaEmoji: {
    fontSize: 24,
    marginBottom: 6,
  },
  areaLabel: {
    fontSize: 11,
    color: '#6B5A3E',
    fontWeight: '600',
    textAlign: 'center',
  },
  areaLabelSelected: {
    color: '#825A3B',
    fontWeight: '700',
  },

  // Challenges
  challengesGrid: {
    gap: 8,
  },
  challengeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF7F2',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  challengeRowSelected: {
    borderColor: '#825A3B',
    backgroundColor: 'rgba(130, 90, 59, 0.04)',
  },
  challengeIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(130, 90, 59, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  challengeIconBoxSelected: {
    backgroundColor: '#825A3B',
  },
  challengeText: {
    fontSize: 14,
    color: '#4A2E12',
    fontWeight: '600',
  },
  challengeTextSelected: {
    color: '#825A3B',
    fontWeight: '700',
  },

  // Continue button
  continueButton: {
    backgroundColor: '#5C3318',
    marginHorizontal: 24,
    paddingVertical: 17,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 14,
    shadowColor: '#3A1E0A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 5,
  },
  continueButtonDisabled: {
    backgroundColor: '#C4B5A5',
    shadowOpacity: 0,
    elevation: 0,
  },
  continueButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  continueArrow: {
    marginLeft: 10,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default FacialAreasScreen;
