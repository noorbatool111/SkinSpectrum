import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  StatusBar,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useUser } from '../context/UserContext';

const { width } = Dimensions.get('window');
const CARD_GAP = 14;
const CARD_WIDTH = (width - 56 - CARD_GAP) / 2;

const GenderScreen = ({ navigation }) => {
  const { userName, syncProfileData } = useUser();
  const [selected, setSelected] = useState(null);

  const headerFade = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-20)).current;
  const cardSlide = useRef(new Animated.Value(60)).current;
  const cardFade = useRef(new Animated.Value(0)).current;
  const option1 = useRef(new Animated.Value(0)).current;
  const option2 = useRef(new Animated.Value(0)).current;
  const option3 = useRef(new Animated.Value(0)).current;
  const option4 = useRef(new Animated.Value(0)).current;

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
      Animated.stagger(100, [
        Animated.spring(option1, {
          toValue: 1,
          friction: 7,
          tension: 50,
          useNativeDriver: true,
        }),
        Animated.spring(option2, {
          toValue: 1,
          friction: 7,
          tension: 50,
          useNativeDriver: true,
        }),
        Animated.spring(option3, {
          toValue: 1,
          friction: 7,
          tension: 50,
          useNativeDriver: true,
        }),
        Animated.spring(option4, {
          toValue: 1,
          friction: 7,
          tension: 50,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const genderOptions = [
    {
      key: 'male',
      label: 'Male',
      icon: 'male',
      lib: 'ionicons',
      color: '#5B8DBE',
      bgColor: 'rgba(91, 141, 190, 0.08)',
      anim: option1,
    },
    {
      key: 'female',
      label: 'Female',
      icon: 'female',
      lib: 'ionicons',
      color: '#C47B8E',
      bgColor: 'rgba(196, 123, 142, 0.08)',
      anim: option2,
    },
    {
      key: 'non-binary',
      label: 'Non-binary',
      icon: 'gender-non-binary',
      lib: 'mci',
      color: '#9B7DC4',
      bgColor: 'rgba(155, 125, 196, 0.08)',
      anim: option3,
    },
    {
      key: 'prefer-not',
      label: 'Prefer not to say',
      icon: 'remove-circle-outline',
      lib: 'ionicons',
      color: '#8A7A64',
      bgColor: 'rgba(130, 90, 59, 0.06)',
      anim: option4,
    },
  ];

  const handleContinue = async () => {
    if (selected) {
      await syncProfileData({ gender: selected });
      navigation.navigate('Age');
    }
  };

  const displayName = userName || 'Friend';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF6EF" />

      {/* Decorative */}
      <View style={[styles.decorCircle, styles.decorTop]} />
      <View style={[styles.decorCircle, styles.decorBottom]} />

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
          <Ionicons name="people" size={34} color="#825A3B" />
        </View>

        <Text style={styles.title}>
          Hi {displayName},{'\n'}how do you identify?
        </Text>
        <Text style={styles.subtitle}>
          This helps us personalize your skin analysis.
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
        {/* Gender Grid */}
        <View style={styles.grid}>
          {genderOptions.map((option) => {
            const isSelected = selected === option.key;
            return (
              <Animated.View
                key={option.key}
                style={{
                  opacity: option.anim,
                  transform: [
                    {
                      scale: option.anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.8, 1],
                      }),
                    },
                  ],
                }}
              >
                <TouchableOpacity
                  style={[
                    styles.genderCard,
                    { backgroundColor: isSelected ? option.bgColor : '#FAF7F2' },
                    isSelected && {
                      borderColor: option.color,
                      shadowColor: option.color,
                      shadowOpacity: 0.15,
                      elevation: 4,
                    },
                  ]}
                  onPress={() => setSelected(option.key)}
                  activeOpacity={0.8}
                >
                  {/* Selection indicator */}
                  <View
                    style={[
                      styles.radioOuter,
                      isSelected && { borderColor: option.color },
                    ]}
                  >
                    {isSelected && (
                      <View
                        style={[
                          styles.radioInner,
                          { backgroundColor: option.color },
                        ]}
                      />
                    )}
                  </View>

                  {/* Icon */}
                  <View
                    style={[
                      styles.genderIconBox,
                      {
                        backgroundColor: isSelected
                          ? option.color + '18'
                          : 'rgba(130, 90, 59, 0.06)',
                      },
                    ]}
                  >
                    {option.lib === 'ionicons' ? (
                      <Ionicons
                        name={option.icon}
                        size={28}
                        color={isSelected ? option.color : '#B5A48E'}
                      />
                    ) : (
                      <MaterialCommunityIcons
                        name={option.icon}
                        size={28}
                        color={isSelected ? option.color : '#B5A48E'}
                      />
                    )}
                  </View>

                  {/* Label */}
                  <Text
                    style={[
                      styles.genderLabel,
                      isSelected && { color: option.color, fontWeight: '700' },
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>

        {/* Info note */}
        <View style={styles.infoRow}>
          <Ionicons name="information-circle-outline" size={16} color="#B5A48E" />
          <Text style={styles.infoText}>
            This information is used solely to improve analysis accuracy.
          </Text>
        </View>

        {/* Spacer */}
        <View style={{ flex: 1 }} />

        {/* Continue Button */}
        <TouchableOpacity
          style={[
            styles.continueButton,
            !selected && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          activeOpacity={0.85}
          disabled={!selected}
        >
          <Text style={styles.continueButtonText}>
            {selected ? 'Continue' : 'Select an option'}
          </Text>
          {selected && (
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

  // Decorative
  decorCircle: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(130, 90, 59, 0.03)',
  },
  decorTop: { top: -60, right: -50 },
  decorBottom: { bottom: 100, left: -80 },

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
    paddingBottom: 18,
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
    paddingHorizontal: 28,
    paddingTop: 28,
    paddingBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 8,
  },

  // Grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: CARD_GAP,
  },

  // Gender card
  genderCard: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 0.85,
    paddingVertical: 22,
    paddingHorizontal: 16,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  radioOuter: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D5CCC1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  genderIconBox: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  genderLabel: {
    fontSize: 14,
    color: '#6B5A3E',
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 18,
  },

  // Info note
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    paddingHorizontal: 4,
    gap: 6,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#B5A48E',
    lineHeight: 17,
  },

  // Continue button
  continueButton: {
    backgroundColor: '#5C3318',
    width: '100%',
    paddingVertical: 17,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
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

export default GenderScreen;
