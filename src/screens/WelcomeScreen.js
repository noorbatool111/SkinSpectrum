import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  Animated,
  StatusBar,
  TouchableWithoutFeedback,
} from 'react-native';

const { width, height } = Dimensions.get('window');
const LOGO_SIZE = width * 0.55;

const WelcomeScreen = ({ navigation }) => {
  const logoFade = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.85)).current;
  const titleFade = useRef(new Animated.Value(0)).current;
  const titleSlide = useRef(new Animated.Value(-30)).current;
  const taglineFade = useRef(new Animated.Value(0)).current;
  const hintFade = useRef(new Animated.Value(0)).current;
  const glowScale = useRef(new Animated.Value(0.6)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      // 1. Glow ring expands
      Animated.parallel([
        Animated.timing(glowOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(glowScale, {
          toValue: 1,
          friction: 5,
          tension: 30,
          useNativeDriver: true,
        }),
      ]),
      // 2. Logo appears
      Animated.parallel([
        Animated.timing(logoFade, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      // 3. Title slides in
      Animated.parallel([
        Animated.timing(titleFade, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(titleSlide, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      // 4. Tagline + hint
      Animated.parallel([
        Animated.timing(taglineFade, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(hintFade, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      // Subtle continuous pulse on glow ring
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.08,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
  }, []);

  const handlePress = () => {
    navigation.replace('Intro');
  };

  return (
    <TouchableWithoutFeedback onPress={handlePress}>
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FAF6EF" />

        {/* Decorative dots */}
        <View style={[styles.dot, styles.dotTopLeft]} />
        <View style={[styles.dot, styles.dotTopRight]} />
        <View style={[styles.dotSmall, styles.dotMidLeft]} />
        <View style={[styles.dotSmall, styles.dotBottomRight]} />

        {/* Main content area */}
        <View style={styles.centerArea}>
          {/* Glow ring behind logo */}
          <Animated.View
            style={[
              styles.glowRing,
              {
                opacity: glowOpacity,
                transform: [
                  { scale: Animated.multiply(glowScale, pulseAnim) },
                ],
              },
            ]}
          />

          {/* Logo */}
          <Animated.View
            style={[
              styles.logoWrapper,
              {
                opacity: logoFade,
                transform: [{ scale: logoScale }],
              },
            ]}
          >
            <View style={styles.logoShadow}>
              <Image
                source={require('../assets/images/logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
          </Animated.View>
        </View>

        {/* Title */}
        <View style={styles.textArea}>
          <Animated.Text
            style={[
              styles.title,
              {
                opacity: titleFade,
                transform: [{ translateY: titleSlide }],
              },
            ]}
          >
            SkinSpectrum
          </Animated.Text>

          <Animated.Text
            style={[styles.tagline, { opacity: taglineFade }]}
          >
            AI-Powered Skin Health
          </Animated.Text>
        </View>

        {/* Bottom hint */}
        <Animated.View style={[styles.hintArea, { opacity: hintFade }]}>
          <View style={styles.hintLine} />
          <Text style={styles.hintText}>Tap anywhere to continue</Text>
          <View style={styles.hintLine} />
        </Animated.View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF6EF',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 70,
  },

  // Decorative background dots
  dot: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(130, 90, 59, 0.04)',
  },
  dotSmall: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(130, 90, 59, 0.06)',
  },
  dotTopLeft: { top: -30, left: -30 },
  dotTopRight: { top: 80, right: -40 },
  dotMidLeft: { top: height * 0.45, left: 20 },
  dotBottomRight: { bottom: 120, right: 30 },

  // Center logo area
  centerArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowRing: {
    position: 'absolute',
    width: LOGO_SIZE + 60,
    height: LOGO_SIZE + 60,
    borderRadius: (LOGO_SIZE + 60) / 2,
    borderWidth: 2,
    borderColor: 'rgba(130, 90, 59, 0.12)',
    backgroundColor: 'rgba(130, 90, 59, 0.03)',
  },
  logoWrapper: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoShadow: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    borderRadius: LOGO_SIZE / 2,
    shadowColor: '#825A3B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  logo: {
    width: '100%',
    height: '100%',
  },

  // Text area
  textArea: {
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 38,
    color: '#4A2E12',
    fontFamily: 'serif',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 15,
    color: '#9B8570',
    letterSpacing: 2,
    textTransform: 'uppercase',
    fontWeight: '500',
  },

  // Hint
  hintArea: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  hintLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(130, 90, 59, 0.15)',
  },
  hintText: {
    fontSize: 13,
    color: '#B5A18D',
    letterSpacing: 0.5,
    marginHorizontal: 15,
  },
});

export default WelcomeScreen;