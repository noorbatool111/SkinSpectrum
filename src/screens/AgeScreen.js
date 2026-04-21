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
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../context/UserContext';

const { width } = Dimensions.get('window');

const AgeScreen = ({ navigation }) => {
  const { userName, syncProfileData } = useUser();
  const [selected, setSelected] = useState(null);

  const headerFade = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-20)).current;
  const cardSlide = useRef(new Animated.Value(60)).current;
  const cardFade = useRef(new Animated.Value(0)).current;

  // Individual stagger anims
  const anims = useRef(
    Array.from({ length: 6 }, () => new Animated.Value(0))
  ).current;

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
      Animated.stagger(
        80,
        anims.map((a) =>
          Animated.spring(a, {
            toValue: 1,
            friction: 7,
            tension: 50,
            useNativeDriver: true,
          })
        )
      ),
    ]).start();
  }, []);

  const ageRanges = [
    { key: 'under-18', label: 'Under 18', emoji: '🧒', desc: 'Teen skin care' },
    { key: '18-24', label: '18 – 24', emoji: '🧑', desc: 'Young adult' },
    { key: '25-34', label: '25 – 34', emoji: '👩', desc: 'Prevention focus' },
    { key: '35-44', label: '35 – 44', emoji: '👨‍💼', desc: 'Early signs' },
    { key: '45-54', label: '45 – 54', emoji: '🧑‍🦳', desc: 'Active monitoring' },
    { key: '55+', label: '55+', emoji: '👴', desc: 'Priority screening' },
  ];

  const handleContinue = async () => {
    if (selected) {
      await syncProfileData({ age: selected });
      navigation.navigate('SkinType');
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
          <Ionicons name="calendar" size={34} color="#825A3B" />
        </View>

        <Text style={styles.title}>How old are you,{'\n'}{displayName}?</Text>
        <Text style={styles.subtitle}>
          Age affects skin health — we'll tailor insights to you.
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
          {/* Age Range List */}
          {ageRanges.map((range, index) => {
            const isSelected = selected === range.key;
            return (
              <Animated.View
                key={range.key}
                style={{
                  opacity: anims[index],
                  transform: [
                    {
                      translateX: anims[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: [40, 0],
                      }),
                    },
                  ],
                }}
              >
                <TouchableOpacity
                  style={[
                    styles.ageRow,
                    isSelected && styles.ageRowSelected,
                  ]}
                  onPress={() => setSelected(range.key)}
                  activeOpacity={0.8}
                >
                  {/* Emoji */}
                  <View
                    style={[
                      styles.emojiBox,
                      isSelected && styles.emojiBoxSelected,
                    ]}
                  >
                    <Text style={styles.emoji}>{range.emoji}</Text>
                  </View>

                  {/* Text */}
                  <View style={styles.ageTextBox}>
                    <Text
                      style={[
                        styles.ageLabel,
                        isSelected && styles.ageLabelSelected,
                      ]}
                    >
                      {range.label}
                    </Text>
                    <Text style={styles.ageDesc}>{range.desc}</Text>
                  </View>

                  {/* Radio */}
                  <View
                    style={[
                      styles.radio,
                      isSelected && styles.radioSelected,
                    ]}
                  >
                    {isSelected && <View style={styles.radioDot} />}
                  </View>
                </TouchableOpacity>
              </Animated.View>
            );
          })}

          {/* Info note */}
          <View style={styles.infoRow}>
            <Ionicons
              name="information-circle-outline"
              size={16}
              color="#B5A48E"
            />
            <Text style={styles.infoText}>
              We never share your personal details with third parties.
            </Text>
          </View>
        </ScrollView>

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
            {selected ? 'Continue' : 'Select your age range'}
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
  decorTop: { top: -50, left: -70 },
  decorBottom: { bottom: 60, right: -60 },

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
    paddingBottom: 16,
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
    paddingHorizontal: 24,
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

  // Age rows
  ageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF7F2',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  ageRowSelected: {
    borderColor: '#825A3B',
    backgroundColor: 'rgba(130, 90, 59, 0.04)',
  },

  // Emoji
  emojiBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: 'rgba(130, 90, 59, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  emojiBoxSelected: {
    backgroundColor: 'rgba(130, 90, 59, 0.12)',
  },
  emoji: {
    fontSize: 22,
  },

  // Text
  ageTextBox: {
    flex: 1,
  },
  ageLabel: {
    fontSize: 16,
    color: '#4A2E12',
    fontWeight: '700',
    marginBottom: 2,
  },
  ageLabelSelected: {
    color: '#825A3B',
  },
  ageDesc: {
    fontSize: 12,
    color: '#9B8A76',
    fontWeight: '500',
  },

  // Radio
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#D5CCC1',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  radioSelected: {
    borderColor: '#825A3B',
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#825A3B',
  },

  // Info
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
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

export default AgeScreen;
