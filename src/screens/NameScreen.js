import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  StatusBar,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../context/UserContext';

const { width } = Dimensions.get('window');

const NameScreen = ({ navigation }) => {
  const { syncProfileData } = useUser();
  const [name, setName] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const headerFade = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-20)).current;
  const cardSlide = useRef(new Animated.Value(60)).current;
  const cardFade = useRef(new Animated.Value(0)).current;
  const inputScale = useRef(new Animated.Value(0.95)).current;
  const inputFade = useRef(new Animated.Value(0)).current;

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
      Animated.parallel([
        Animated.timing(inputFade, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(inputScale, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const isValid = name.trim().length >= 2;

  const handleContinue = async () => {
    if (isValid) {
      await syncProfileData({ name: name.trim() });
      navigation.navigate('Gender');
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
          {/* Greeting icon */}
          <View style={styles.iconContainer}>
            <Ionicons name="hand-left" size={34} color="#825A3B" />
          </View>

          <Text style={styles.title}>What should we{'\n'}call you?</Text>
          <Text style={styles.subtitle}>
            We'd love to personalize your experience.
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
          {/* Greeting preview */}
          <View style={styles.previewContainer}>
            <Text style={styles.previewLabel}>
              {name.trim().length > 0
                ? `Hi ${name.trim()} 👋`
                : 'Enter your name below'}
            </Text>
            {name.trim().length > 0 && (
              <Text style={styles.previewSubtext}>
                That's what we'll call you in the app
              </Text>
            )}
          </View>

          {/* Input Section */}
          <Animated.View
            style={[
              styles.inputWrapper,
              {
                opacity: inputFade,
                transform: [{ scale: inputScale }],
              },
            ]}
          >
            <View
              style={[
                styles.inputContainer,
                isFocused && styles.inputContainerFocused,
                isValid && styles.inputContainerValid,
              ]}
            >
              <View style={styles.inputIconBox}>
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={isFocused ? '#825A3B' : '#B5A48E'}
                />
              </View>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Sarah"
                placeholderTextColor="#C4B5A5"
                value={name}
                onChangeText={setName}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                autoCapitalize="words"
                autoCorrect={false}
                maxLength={30}
                returnKeyType="done"
                onSubmitEditing={handleContinue}
              />
              {isValid && (
                <View style={styles.validBadge}>
                  <Ionicons name="checkmark" size={16} color="#FFF" />
                </View>
              )}
            </View>

            {/* Character hint */}
            <Text style={styles.charHint}>
              {name.trim().length < 2
                ? 'At least 2 characters'
                : `${name.trim().length}/30 characters`}
            </Text>
          </Animated.View>

          {/* Spacer */}
          <View style={{ flex: 1 }} />

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
              {isValid ? 'Continue' : 'Enter your name'}
            </Text>
            {isValid && (
              <View style={styles.continueArrow}>
                <Ionicons name="arrow-forward" size={18} color="#FFF" />
              </View>
            )}
          </TouchableOpacity>

          {/* Skip option */}
          <TouchableOpacity
            style={styles.skipButton}
            onPress={async () => {
              await syncProfileData({ name: 'Friend' });
              navigation.navigate('Gender');
            }}
            activeOpacity={0.6}
          >
            <Text style={styles.skipText}>Skip for now</Text>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
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
    fontSize: 28,
    color: '#4A2E12',
    fontFamily: 'serif',
    letterSpacing: 0.5,
    marginBottom: 8,
    textAlign: 'center',
    lineHeight: 36,
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
    paddingTop: 30,
    paddingBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 8,
  },

  // Preview
  previewContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },
  previewLabel: {
    fontSize: 24,
    color: '#4A2E12',
    fontWeight: '700',
    textAlign: 'center',
  },
  previewSubtext: {
    fontSize: 13,
    color: '#9B8A76',
    marginTop: 4,
  },

  // Input
  inputWrapper: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF7F2',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  inputContainerFocused: {
    borderColor: '#D4B896',
    backgroundColor: '#FFF',
  },
  inputContainerValid: {
    borderColor: '#825A3B',
  },
  inputIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(130, 90, 59, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 18,
    color: '#4A2E12',
    paddingVertical: 14,
    fontWeight: '500',
  },
  validBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#825A3B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  charHint: {
    fontSize: 12,
    color: '#B5A48E',
    marginTop: 8,
    marginLeft: 4,
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

  // Skip
  skipButton: {
    alignItems: 'center',
    marginTop: 16,
  },
  skipText: {
    fontSize: 14,
    color: '#9B8A76',
    fontWeight: '500',
  },
});

export default NameScreen;
