import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Animated,
  StatusBar,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const LOGO_SIZE = width * 0.45;

const IntroScreen = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const logoFade = useRef(new Animated.Value(0)).current;
  const textSlide = useRef(new Animated.Value(30)).current;
  const textFade = useRef(new Animated.Value(0)).current;
  const pillsFade = useRef(new Animated.Value(0)).current;
  const pillsSlide = useRef(new Animated.Value(20)).current;
  const buttonSlide = useRef(new Animated.Value(40)).current;
  const buttonFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      // Logo entrance
      Animated.parallel([
        Animated.timing(logoFade, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 7,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      // Text slide up
      Animated.parallel([
        Animated.timing(textFade, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(textSlide, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      // Feature pills
      Animated.parallel([
        Animated.timing(pillsFade, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(pillsSlide, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
      // Buttons
      Animated.parallel([
        Animated.timing(buttonFade, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(buttonSlide, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const features = [
    { icon: 'scan-outline', label: 'AI Detection', lib: 'ionicons' },
    { icon: 'chart-timeline-variant', label: 'Progress', lib: 'mci' },
    { icon: 'sparkles-outline', label: 'Personalized', lib: 'ionicons' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF6EF" />

      {/* Decorative elements */}
      <View style={[styles.decorCircle, styles.decorTopRight]} />
      <View style={[styles.decorCircle, styles.decorBottomLeft]} />

      <View style={styles.content}>
        {/* Logo Section */}
        <Animated.View
          style={[
            styles.logoSection,
            {
              opacity: logoFade,
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          <View style={styles.logoOuter}>
            <View style={styles.logoRing}>
              <Image
                source={require('../assets/images/logo.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
          </View>
        </Animated.View>

        {/* Text Content */}
        <Animated.View
          style={[
            styles.textSection,
            {
              opacity: textFade,
              transform: [{ translateY: textSlide }],
            },
          ]}
        >
          <Text style={styles.title}>Your skin tells a story—</Text>
          <Text style={styles.subtitle}>
            SkinSpectrum helps you understand it, protect it with{' '}
            <Text style={styles.highlight}>AI</Text> and{' '}
            <Text style={styles.highlight}>Data Science</Text>.
          </Text>
        </Animated.View>

        {/* Feature Pills */}
        <Animated.View
          style={[
            styles.pillsRow,
            {
              opacity: pillsFade,
              transform: [{ translateY: pillsSlide }],
            },
          ]}
        >
          {features.map((feature, index) => (
            <View key={index} style={styles.pill}>
              {feature.lib === 'ionicons' ? (
                <Ionicons name={feature.icon} size={16} color="#825A3B" />
              ) : (
                <MaterialCommunityIcons
                  name={feature.icon}
                  size={16}
                  color="#825A3B"
                />
              )}
              <Text style={styles.pillText}>{feature.label}</Text>
            </View>
          ))}
        </Animated.View>

        {/* Action Buttons */}
        <Animated.View
          style={[
            styles.buttonSection,
            {
              opacity: buttonFade,
              transform: [{ translateY: buttonSlide }],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('Signup')}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryButtonText}>Get Started</Text>
            <View style={styles.buttonArrow}>
              <Ionicons name="arrow-forward" size={20} color="#FFF" />
            </View>
          </TouchableOpacity>

          <View style={styles.signInRow}>
            <Text style={styles.signInText}>Already have an account? </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.7}
            >
              <Text style={styles.signInLink}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF6EF',
  },

  // Decorative circles
  decorCircle: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(130, 90, 59, 0.03)',
  },
  decorTopRight: { top: -60, right: -60 },
  decorBottomLeft: { bottom: 40, left: -80 },

  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: 30,
    paddingBottom: 30,
    paddingHorizontal: 28,
  },

  // Logo
  logoSection: {
    alignItems: 'center',
    marginTop: 10,
  },
  logoOuter: {
    width: LOGO_SIZE + 20,
    height: LOGO_SIZE + 20,
    borderRadius: (LOGO_SIZE + 20) / 2,
    backgroundColor: 'rgba(130, 90, 59, 0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoRing: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    borderRadius: LOGO_SIZE / 2,
    shadowColor: '#825A3B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  logoImage: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
  },

  // Text
  textSection: {
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  title: {
    fontSize: 26,
    color: '#4A2E12',
    fontFamily: 'serif',
    textAlign: 'center',
    marginBottom: 14,
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 15,
    color: '#7A6652',
    textAlign: 'center',
    lineHeight: 24,
  },
  highlight: {
    color: '#825A3B',
    fontWeight: '700',
  },

  // Feature pills
  pillsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(130, 90, 59, 0.08)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  pillText: {
    fontSize: 12,
    color: '#6B4D35',
    fontWeight: '600',
    letterSpacing: 0.3,
  },

  // Buttons
  buttonSection: {
    width: '100%',
  },
  primaryButton: {
    backgroundColor: '#5C3318',
    width: '100%',
    paddingVertical: 18,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: '#3A1E0A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  buttonArrow: {
    marginLeft: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signInRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 22,
  },
  signInText: {
    color: '#8A7A64',
    fontSize: 14,
  },
  signInLink: {
    color: '#5C3318',
    fontSize: 14,
    fontWeight: '700',
  },
});

export default IntroScreen;
