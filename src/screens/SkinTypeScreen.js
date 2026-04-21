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

const SkinTypeScreen = ({ navigation }) => {
  const { syncProfileData } = useUser();
  const [selectedType, setSelectedType] = useState(null);
  const [selectedConcerns, setSelectedConcerns] = useState([]);

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

  const skinTypes = [
    { key: 'oily', label: 'Oily', icon: 'water-outline', desc: 'Shiny, enlarged pores' },
    { key: 'dry', label: 'Dry', icon: 'leaf-outline', desc: 'Tight, flaky patches' },
    { key: 'combination', label: 'Combination', icon: 'contrast-outline', desc: 'Oily T-zone, dry cheeks' },
    { key: 'normal', label: 'Normal', icon: 'happy-outline', desc: 'Balanced, few issues' },
    { key: 'sensitive', label: 'Sensitive', icon: 'alert-circle-outline', desc: 'Reacts easily, redness' },
  ];

  const concerns = [
    { key: 'acne', label: 'Acne', icon: 'ellipse-outline' },
    { key: 'wrinkles', label: 'Wrinkles', icon: 'git-branch-outline' },
    { key: 'dark-spots', label: 'Dark Spots', icon: 'ellipsis-horizontal-circle-outline' },
    { key: 'redness', label: 'Redness', icon: 'flame-outline' },
    { key: 'dryness', label: 'Dryness', icon: 'snow-outline' },
    { key: 'sun-damage', label: 'Sun Damage', icon: 'sunny-outline' },
    { key: 'large-pores', label: 'Large Pores', icon: 'radio-button-on-outline' },
    { key: 'uneven-tone', label: 'Uneven Tone', icon: 'color-palette-outline' },
    { key: 'moles', label: 'Moles', icon: 'scan-circle-outline' },
    { key: 'dark-circles', label: 'Dark Circles', icon: 'eye-outline' },
  ];

  const toggleConcern = (key) => {
    setSelectedConcerns((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const isValid = selectedType !== null && selectedConcerns.length > 0;

  const handleContinue = async () => {
    if (isValid) {
      await syncProfileData({
        skinType: selectedType,
        skinConcerns: selectedConcerns
      });
      navigation.navigate('FacialAreas');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF6EF" />

      {/* Decorative */}
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
          <MaterialCommunityIcons name="face-woman-shimmer" size={34} color="#825A3B" />
        </View>

        <Text style={styles.title}>Tell us about{'\n'}your skin</Text>
        <Text style={styles.subtitle}>
          Select your skin type and any concerns you have.
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
          {/* Section: Skin Type */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Skin Type</Text>
            <Text style={styles.sectionBadge}>Pick one</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.typeScroll}
          >
            {skinTypes.map((type) => {
              const isSelected = selectedType === type.key;
              return (
                <TouchableOpacity
                  key={type.key}
                  style={[
                    styles.typeCard,
                    isSelected && styles.typeCardSelected,
                  ]}
                  onPress={() => setSelectedType(type.key)}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.typeIconBox,
                      isSelected && styles.typeIconBoxSelected,
                    ]}
                  >
                    <Ionicons
                      name={type.icon}
                      size={24}
                      color={isSelected ? '#FFF' : '#825A3B'}
                    />
                  </View>
                  <Text
                    style={[
                      styles.typeLabel,
                      isSelected && styles.typeLabelSelected,
                    ]}
                  >
                    {type.label}
                  </Text>
                  <Text style={styles.typeDesc}>{type.desc}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Section: Concerns */}
          <View style={[styles.sectionHeader, { marginTop: 24 }]}>
            <Text style={styles.sectionTitle}>Skin Concerns</Text>
            <Text style={styles.sectionBadge}>
              {selectedConcerns.length > 0
                ? `${selectedConcerns.length} selected`
                : 'Pick any'}
            </Text>
          </View>

          <View style={styles.concernsGrid}>
            {concerns.map((concern) => {
              const isSelected = selectedConcerns.includes(concern.key);
              return (
                <TouchableOpacity
                  key={concern.key}
                  style={[
                    styles.concernChip,
                    isSelected && styles.concernChipSelected,
                  ]}
                  onPress={() => toggleConcern(concern.key)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={isSelected ? 'checkmark-circle' : concern.icon}
                    size={16}
                    color={isSelected ? '#FFF' : '#825A3B'}
                  />
                  <Text
                    style={[
                      styles.concernText,
                      isSelected && styles.concernTextSelected,
                    ]}
                  >
                    {concern.label}
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
            {!selectedType
              ? 'Select your skin type'
              : selectedConcerns.length === 0
              ? 'Select at least one concern'
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
  decorTop: { top: -60, right: -50 },

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
  },

  // Section header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 28,
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

  // Skin type horizontal scroll
  typeScroll: {
    paddingLeft: 28,
    paddingRight: 14,
    gap: 10,
  },
  typeCard: {
    width: 120,
    backgroundColor: '#FAF7F2',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  typeCardSelected: {
    borderColor: '#825A3B',
    backgroundColor: 'rgba(130, 90, 59, 0.04)',
  },
  typeIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(130, 90, 59, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  typeIconBoxSelected: {
    backgroundColor: '#825A3B',
  },
  typeLabel: {
    fontSize: 14,
    color: '#4A2E12',
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  typeLabelSelected: {
    color: '#825A3B',
  },
  typeDesc: {
    fontSize: 11,
    color: '#9B8A76',
    textAlign: 'center',
    lineHeight: 15,
  },

  // Concerns grid
  concernsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 24,
    gap: 8,
  },
  concernChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF7F2',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'transparent',
    gap: 6,
  },
  concernChipSelected: {
    backgroundColor: '#825A3B',
    borderColor: '#825A3B',
  },
  concernText: {
    fontSize: 13,
    color: '#5C3D1A',
    fontWeight: '600',
  },
  concernTextSelected: {
    color: '#FFF',
  },

  // Continue button
  continueButton: {
    backgroundColor: '#5C3318',
    marginHorizontal: 28,
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

export default SkinTypeScreen;
