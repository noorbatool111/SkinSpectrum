import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Animated,
  StatusBar,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const LOGO_SIZE = 80;

const PrivacyScreen = ({ navigation }) => {
  const headerFade = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-20)).current;
  const cardSlide = useRef(new Animated.Value(60)).current;
  const cardFade = useRef(new Animated.Value(0)).current;
  const [consent1, setConsent1] = useState(false);
  const [consent2, setConsent2] = useState(false);

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

  const handleAcceptAll = () => {
    setConsent1(true);
    setConsent2(true);
  };

  const handleNext = () => {
    navigation.navigate('Medical');
  };

  const allAccepted = consent1 && consent2;
  const progressCount = (consent1 ? 1 : 0) + (consent2 ? 1 : 0);

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
        {/* Shield icon */}
        <View style={styles.shieldContainer}>
          <Ionicons name="shield-checkmark" size={36} color="#825A3B" />
        </View>

        <Text style={styles.title}>Privacy first</Text>
        <Text style={styles.subtitle}>
          Your privacy and data security matter to us.{'\n'}We only use your data to help you.
        </Text>

        {/* Progress indicator */}
        <View style={styles.progressRow}>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${(progressCount / 2) * 100}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>{progressCount}/2</Text>
        </View>
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
          {/* Consent Card 1 */}
          <TouchableOpacity
            style={[styles.consentCard, consent1 && styles.consentCardActive]}
            onPress={() => setConsent1(!consent1)}
            activeOpacity={0.85}
          >
            <View style={styles.consentHeader}>
              <View style={styles.consentIconBox}>
                <Ionicons name="body-outline" size={18} color="#825A3B" />
              </View>
              <Text style={styles.consentLabel}>Skin & Health Data</Text>
              <View
                style={[
                  styles.toggle,
                  consent1 && styles.toggleActive,
                ]}
              >
                <View
                  style={[
                    styles.toggleKnob,
                    consent1 && styles.toggleKnobActive,
                  ]}
                />
              </View>
            </View>
            <Text style={styles.consentText}>
              I consent to the processing of my skin and health-related data
              such as skin images, skin type, and lifestyle information for
              personalized skin analysis, melanoma risk assessment, and skincare
              recommendations.
            </Text>
          </TouchableOpacity>

          {/* Consent Card 2 */}
          <TouchableOpacity
            style={[styles.consentCard, consent2 && styles.consentCardActive]}
            onPress={() => setConsent2(!consent2)}
            activeOpacity={0.85}
          >
            <View style={styles.consentHeader}>
              <View style={styles.consentIconBox}>
                <Ionicons name="camera-outline" size={18} color="#825A3B" />
              </View>
              <Text style={styles.consentLabel}>Facial Image Analysis</Text>
              <View
                style={[
                  styles.toggle,
                  consent2 && styles.toggleActive,
                ]}
              >
                <View
                  style={[
                    styles.toggleKnob,
                    consent2 && styles.toggleKnobActive,
                  ]}
                />
              </View>
            </View>
            <Text style={styles.consentText}>
              I consent to the processing of my facial images to enable
              AI-based skin analysis, issue detection, progress tracking, and
              personalized skincare insights within SkinSpectrum.
            </Text>
          </TouchableOpacity>

          {/* Accept All */}
          {!allAccepted && (
            <TouchableOpacity
              style={styles.acceptAllButton}
              onPress={handleAcceptAll}
              activeOpacity={0.7}
            >
              <Ionicons name="checkmark-done" size={18} color="#825A3B" />
              <Text style={styles.acceptAllText}>Accept all</Text>
            </TouchableOpacity>
          )}

          {/* Next Button */}
          <TouchableOpacity
            style={[styles.nextButton, !allAccepted && styles.nextButtonDisabled]}
            onPress={handleNext}
            activeOpacity={0.85}
            disabled={!allAccepted}
          >
            <Text style={styles.nextButtonText}>
              {allAccepted ? 'Continue' : 'Please accept to continue'}
            </Text>
            {allAccepted && (
              <View style={styles.nextArrow}>
                <Ionicons name="arrow-forward" size={18} color="#FFF" />
              </View>
            )}
          </TouchableOpacity>
        </ScrollView>
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
  decorTop: { top: -60, left: -60 },

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
    paddingBottom: 20,
    paddingHorizontal: 30,
  },
  shieldContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: 'rgba(130, 90, 59, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    color: '#4A2E12',
    fontFamily: 'serif',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#8A7A64',
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 18,
  },

  // Progress
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '60%',
    gap: 10,
  },
  progressTrack: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(130, 90, 59, 0.1)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#825A3B',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#825A3B',
    fontWeight: '700',
  },

  // Bottom Card
  bottomCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 8,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 10,
  },

  // Consent cards
  consentCard: {
    backgroundColor: '#FAF7F2',
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  consentCardActive: {
    borderColor: '#825A3B',
    backgroundColor: 'rgba(130, 90, 59, 0.04)',
  },
  consentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  consentIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(130, 90, 59, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  consentLabel: {
    flex: 1,
    fontSize: 15,
    color: '#4A2E12',
    fontWeight: '700',
  },

  // Toggle switch
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#D5CCC1',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: '#825A3B',
  },
  toggleKnob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleKnobActive: {
    alignSelf: 'flex-end',
  },

  consentText: {
    fontSize: 13,
    color: '#7A6A56',
    lineHeight: 20,
  },

  // Accept all
  acceptAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    gap: 6,
  },
  acceptAllText: {
    fontSize: 15,
    color: '#825A3B',
    fontWeight: '700',
  },

  // Next button
  nextButton: {
    backgroundColor: '#5C3318',
    width: '100%',
    paddingVertical: 17,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 10,
    shadowColor: '#3A1E0A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 5,
  },
  nextButtonDisabled: {
    backgroundColor: '#C4B5A5',
    shadowOpacity: 0,
    elevation: 0,
  },
  nextButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  nextArrow: {
    marginLeft: 10,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default PrivacyScreen;
