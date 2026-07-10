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
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const MedicalScreen = ({ navigation }) => {
  const headerFade = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-20)).current;
  const cardSlide = useRef(new Animated.Value(60)).current;
  const cardFade = useRef(new Animated.Value(0)).current;
  const [acknowledged, setAcknowledged] = useState(false);

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

  const handleContinue = () => {
    navigation.navigate('Name');
  };

  const disclaimerItems = [
    {
      icon: 'medical-outline',
      lib: 'ionicons',
      title: 'Not a Medical Device',
      text: 'SkinSpectrum is designed for informational and educational purposes only. It is not a certified medical device.',
    },
    {
      icon: 'stethoscope',
      lib: 'mci',
      title: 'Consult a Professional',
      text: 'Always seek the advice of a qualified dermatologist or healthcare provider for any skin concerns or conditions.',
    },
    {
      icon: 'analytics-outline',
      lib: 'ionicons',
      title: 'AI-Assisted Analysis',
      text: 'Our AI models provide risk assessments and suggestions. Results should never replace professional medical diagnosis.',
    },
    {
      icon: 'alert-circle-outline',
      lib: 'ionicons',
      title: 'Emergency Situations',
      text: 'If you notice rapid changes in moles, skin lesions, or experience symptoms, contact a medical professional immediately.',
    },
  ];

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
        {/* Medical icon */}
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name="heart-pulse" size={36} color="#FF7E5F" />
        </View>

        <Text style={styles.title}>Medical disclaimer</Text>
        <Text style={styles.subtitle}>
          Please read the following important{'\n'}information before proceeding.
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
          {/* Disclaimer Items */}
          {disclaimerItems.map((item, index) => (
            <View key={index} style={styles.disclaimerCard}>
              <View style={styles.disclaimerHeader}>
                <View style={styles.disclaimerIconBox}>
                  {item.lib === 'ionicons' ? (
                    <Ionicons name={item.icon} size={18} color="#FF7E5F" />
                  ) : (
                    <MaterialCommunityIcons
                      name={item.icon}
                      size={18}
                      color="#FF7E5F"
                    />
                  )}
                </View>
                <Text style={styles.disclaimerTitle}>{item.title}</Text>
              </View>
              <Text style={styles.disclaimerText}>{item.text}</Text>
            </View>
          ))}

          {/* Acknowledgment toggle */}
          <TouchableOpacity
            style={[
              styles.acknowledgeRow,
              acknowledged && styles.acknowledgeRowActive,
            ]}
            onPress={() => setAcknowledged(!acknowledged)}
            activeOpacity={0.85}
          >
            <View
              style={[
                styles.toggle,
                acknowledged && styles.toggleActive,
              ]}
            >
              <View
                style={[
                  styles.toggleKnob,
                  acknowledged && styles.toggleKnobActive,
                ]}
              />
            </View>
            <Text style={styles.acknowledgeText}>
              I understand that SkinSpectrum does not provide medical diagnoses
              and is not a substitute for professional medical advice.
            </Text>
          </TouchableOpacity>

          {/* Continue Button */}
          <TouchableOpacity
            style={[
              styles.continueButtonWrapper,
              !acknowledged && styles.continueButtonDisabledWrapper,
            ]}
            onPress={handleContinue}
            activeOpacity={0.85}
            disabled={!acknowledged}
          >
            {acknowledged ? (
              <LinearGradient
                colors={['#FF416C', '#FF4B2B']}
                start={{x:0, y:0}} end={{x:1, y:0}}
                style={styles.continueButtonGradient}
              >
                <Text style={styles.continueButtonText}>I Understand, Continue</Text>
                <View style={styles.continueArrow}>
                  <Ionicons name="arrow-forward" size={18} color="#FFF" />
                </View>
              </LinearGradient>
            ) : (
              <View style={styles.continueButtonDisabled}>
                <Text style={styles.continueButtonText}>Please acknowledge to continue</Text>
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
    backgroundColor: 'rgba(255, 126, 95, 0.05)',
  },
  decorTop: { top: -60, right: -60 },
  decorBottom: { bottom: 80, left: -80 },

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
    backgroundColor: 'rgba(255, 126, 95, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    color: '#1D2B64',
    fontFamily: 'serif',
    letterSpacing: 0.5,
    marginBottom: 8,
    fontWeight: '800',
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

  // Disclaimer cards
  disclaimerCard: {
    backgroundColor: '#FAF7F2',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
  },
  disclaimerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  disclaimerIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 126, 95, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  disclaimerTitle: {
    flex: 1,
    fontSize: 15,
    color: '#4A2E12',
    fontWeight: '700',
  },
  disclaimerText: {
    fontSize: 13,
    color: '#7A6A56',
    lineHeight: 20,
    paddingLeft: 42,
  },

  // Acknowledgment
  acknowledgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF7F2',
    borderRadius: 14,
    padding: 16,
    marginTop: 6,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  acknowledgeRowActive: {
    borderColor: '#FF7E5F',
    backgroundColor: 'rgba(255, 126, 95, 0.04)',
  },

  // Toggle switch
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#D5CCC1',
    justifyContent: 'center',
    paddingHorizontal: 2,
    marginRight: 14,
    flexShrink: 0,
  },
  toggleActive: {
    backgroundColor: '#FF7E5F',
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

  acknowledgeText: {
    flex: 1,
    fontSize: 13,
    color: '#5C3D1A',
    lineHeight: 19,
    fontWeight: '500',
  },

  // Continue button
  continueButtonWrapper: {
    width: '100%',
    shadowColor: '#FF416C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  continueButtonDisabledWrapper: {
    shadowOpacity: 0,
    elevation: 0,
  },
  continueButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 17,
    borderRadius: 28,
  },
  continueButtonDisabled: {
    backgroundColor: '#EAEAEA',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 17,
    borderRadius: 28,
  },
  continueButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});

export default MedicalScreen;
