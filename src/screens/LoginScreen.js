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
import { AntDesign, FontAwesome, Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const LOGO_SIZE = 100;

const LoginScreen = ({ navigation }) => {
  const headerFade = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-20)).current;
  const cardSlide = useRef(new Animated.Value(60)).current;
  const cardFade = useRef(new Animated.Value(0)).current;
  const btn1Fade = useRef(new Animated.Value(0)).current;
  const btn2Fade = useRef(new Animated.Value(0)).current;
  const btn3Fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      // Header
      Animated.parallel([
        Animated.timing(headerFade, {
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
      // Card slide up
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
      // Staggered buttons
      Animated.stagger(120, [
        Animated.timing(btn1Fade, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(btn2Fade, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(btn3Fade, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

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

      {/* Header Section */}
      <Animated.View
        style={[
          styles.headerSection,
          {
            opacity: headerFade,
            transform: [{ translateY: headerSlide }],
          },
        ]}
      >
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/images/logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.appName}>SkinSpectrum</Text>
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
        <Text style={styles.cardTitle}>Welcome back</Text>
        <Text style={styles.cardSubtitle}>
          Sign in to continue your skin health journey
        </Text>

        {/* Social Buttons */}
        <Animated.View style={{ opacity: btn1Fade }}>
          <TouchableOpacity
            style={[styles.socialButton, styles.googleButton]}
            activeOpacity={0.85}
          >
            <View style={styles.socialIconBox}>
              <AntDesign name="google" size={20} color="#DB4437" />
            </View>
            <Text style={[styles.socialText, styles.googleText]}>
              Continue with Google
            </Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={{ opacity: btn2Fade }}>
          <TouchableOpacity
            style={[styles.socialButton, styles.appleButton]}
            activeOpacity={0.85}
          >
            <View style={styles.socialIconBox}>
              <AntDesign name="apple1" size={20} color="#FFF" />
            </View>
            <Text style={[styles.socialText, styles.appleText]}>
              Continue with Apple
            </Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={{ opacity: btn3Fade }}>
          <TouchableOpacity
            style={[styles.socialButton, styles.facebookButton]}
            activeOpacity={0.85}
          >
            <View style={styles.socialIconBox}>
              <FontAwesome name="facebook" size={20} color="#FFF" />
            </View>
            <Text style={[styles.socialText, styles.facebookText]}>
              Continue with Facebook
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Email login */}
        <TouchableOpacity style={styles.emailButton} activeOpacity={0.85}>
          <Ionicons name="mail-outline" size={20} color="#5C3318" />
          <Text style={styles.emailButtonText}>Login with Email</Text>
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
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(130, 90, 59, 0.03)',
  },
  decorTop: { top: -80, right: -60 },

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
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
  },
  logoContainer: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    borderRadius: LOGO_SIZE / 2,
    shadowColor: '#825A3B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 14,
  },
  logoImage: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
  },
  appName: {
    fontSize: 28,
    color: '#4A2E12',
    fontFamily: 'serif',
    letterSpacing: 1,
  },

  // Bottom card
  bottomCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 28,
    paddingTop: 35,
    paddingBottom: 45,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 8,
  },
  cardTitle: {
    fontSize: 26,
    color: '#3E2210',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#9B8A76',
    textAlign: 'center',
    marginBottom: 28,
  },

  // Social buttons
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  socialIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '600',
    marginRight: 36, // offset for visual centering
  },
  googleButton: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#EDEDED',
  },
  googleText: {
    color: '#4A3A28',
  },
  appleButton: {
    backgroundColor: '#1A1A1E',
  },
  appleText: {
    color: '#FFF',
  },
  facebookButton: {
    backgroundColor: '#6B4830',
  },
  facebookText: {
    color: '#FFF',
  },

  // Divider
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E8E2D9',
  },
  dividerText: {
    marginHorizontal: 14,
    fontSize: 13,
    color: '#B5A48E',
    fontWeight: '500',
  },

  // Email button
  emailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 15,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#5C3318',
    gap: 8,
  },
  emailButtonText: {
    fontSize: 15,
    color: '#5C3318',
    fontWeight: '600',
  },
});

export default LoginScreen;
