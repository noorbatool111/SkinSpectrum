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
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AntDesign, FontAwesome, Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import * as Facebook from 'expo-auth-session/providers/facebook';
import { registerUser, googleAuth, facebookAuth } from '../services/api';
import { useUser } from '../context/UserContext';

WebBrowser.maybeCompleteAuthSession();

const { width } = Dimensions.get('window');
const LOGO_SIZE = 100;

const SignupScreen = ({ navigation }) => {
  const { signIn } = useUser();
  const headerFade = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-20)).current;
  const cardSlide = useRef(new Animated.Value(60)).current;
  const cardFade = useRef(new Animated.Value(0)).current;

  // New state for form handling
  const [isEmailView, setIsEmailView] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // OAuth Google 
  const [requestGoogle, responseGoogle, promptAsyncGoogle] = Google.useIdTokenAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
    // Forces the use of https://auth.expo.io proxy
    useProxy: true,
    redirectUri: AuthSession.makeRedirectUri({
      useProxy: true,
    }),
  });

  // OAuth Facebook
  const [requestFacebook, responseFacebook, promptAsyncFacebook] = Facebook.useAuthRequest({
    clientId: process.env.EXPO_PUBLIC_FACEBOOK_APP_ID,
  });

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(headerFade, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(headerSlide, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(cardFade, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(cardSlide, { toValue: 0, friction: 8, tension: 50, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  // Handle Google Response
  useEffect(() => {
    if (responseGoogle?.type === 'success') {
      const { id_token } = responseGoogle.params;
      handleSocialSignup('google', id_token);
    }
  }, [responseGoogle]);

  // Handle Facebook Response
  useEffect(() => {
    if (responseFacebook?.type === 'success') {
      const { access_token } = responseFacebook.authentication;
      handleSocialSignup('facebook', access_token);
    }
  }, [responseFacebook]);

  const handleSocialSignup = async (provider, token) => {
    setLoading(true);
    setErrorMsg('');
    try {
      let data;
      if (provider === 'google') {
        data = await googleAuth(token);
      } else {
        data = await facebookAuth(token);
      }
      await signIn(data.token, data.user);
      // App.js root navigator will automatically switch to Privacy/Home
    } catch (error) {
      setErrorMsg(`${provider} sign up failed. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignup = async () => {
    if (!name || !email || !password) {
      setErrorMsg('Please fill in all fields');
      return;
    }
    
    setLoading(true);
    setErrorMsg('');
    try {
      const data = await registerUser(name, email, password);
      // Success! Token is saved securely to device
      await signIn(data.token, data.user);
      // App.js root navigator will automatically switch to Privacy/Home
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderButtons = () => (
    <View>
      {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}
      
      <TouchableOpacity 
        style={[styles.socialButton, styles.googleButton]} 
        activeOpacity={0.85}
        disabled={!requestGoogle || loading}
        onPress={() => promptAsyncGoogle()}
      >
        <View style={styles.socialIconBox}>
          <AntDesign name="google" size={20} color="#DB4437" />
        </View>
        <Text style={[styles.socialText, styles.googleText]}>Sign up with Google</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.socialButton, styles.facebookButton]} 
        activeOpacity={0.85}
        disabled={!requestFacebook || loading}
        onPress={() => promptAsyncFacebook()}
      >
        <View style={styles.socialIconBox}>
          <FontAwesome name="facebook" size={20} color="#FFF" />
        </View>
        <Text style={[styles.socialText, styles.facebookText]}>Sign up with Facebook</Text>
      </TouchableOpacity>

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>or</Text>
        <View style={styles.dividerLine} />
      </View>

      <TouchableOpacity 
        style={styles.emailButton} 
        activeOpacity={0.85}
        onPress={() => setIsEmailView(true)}
      >
        <Ionicons name="mail-outline" size={20} color="#5C3318" />
        <Text style={styles.emailButtonText}>Sign up with Email</Text>
      </TouchableOpacity>
      
      {loading && <ActivityIndicator color="#5C3318" style={{ marginTop: 20 }} />}
    </View>
  );

  const renderEmailForm = () => (
    <View style={styles.formContainer}>
      {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Full Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Jane Doe"
          placeholderTextColor="#B5A48E"
          value={name}
          onChangeText={setName}
        />
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Email Address</Text>
        <TextInput
          style={styles.input}
          placeholder="jane@example.com"
          placeholderTextColor="#B5A48E"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          placeholderTextColor="#B5A48E"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
      </View>

      <TouchableOpacity 
        style={styles.submitButton} 
        onPress={handleEmailSignup}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.submitButtonText}>Create Account</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setIsEmailView(false)} style={styles.backToSocial}>
        <Text style={styles.backToSocialText}>Use Social Login Instead</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF6EF" />
      <View style={[styles.decorCircle, styles.decorTop]} />

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
        <View style={styles.backButtonInner}>
          <Ionicons name="chevron-back" size={22} color="#5C3D1A" />
        </View>
      </TouchableOpacity>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{flexGrow: 1}} showsVerticalScrollIndicator={false}>
          <Animated.View style={[styles.headerSection, { opacity: headerFade, transform: [{ translateY: headerSlide }] }]}>
            <View style={styles.logoContainer}>
              <Image source={require('../assets/images/logo.png')} style={styles.logoImage} resizeMode="contain" />
            </View>
            <Text style={styles.appName}>SkinSpectrum</Text>
          </Animated.View>

          <Animated.View style={[styles.bottomCard, { opacity: cardFade, transform: [{ translateY: cardSlide }] }]}>
            <Text style={styles.cardTitle}>Create an account</Text>
            <Text style={styles.cardSubtitle}>Join SkinSpectrum and start your skin health journey</Text>

            {isEmailView ? renderEmailForm() : renderButtons()}

            <View style={styles.signInRow}>
              <Text style={styles.signInText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')} activeOpacity={0.7}>
                <Text style={styles.signInLink}>Sign in</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// ... keep existing styles
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF6EF' },
  decorCircle: { position: 'absolute', width: 250, height: 250, borderRadius: 125, backgroundColor: 'rgba(130, 90, 59, 0.03)' },
  decorTop: { top: -80, right: -60 },
  backButton: { position: 'absolute', top: 55, left: 20, zIndex: 10 },
  backButtonInner: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(130, 90, 59, 0.08)', alignItems: 'center', justifyContent: 'center' },
  headerSection: { alignItems: 'center', justifyContent: 'center', paddingTop: 60, paddingBottom: 20 },
  logoContainer: { width: LOGO_SIZE, height: LOGO_SIZE, borderRadius: LOGO_SIZE / 2, shadowColor: '#825A3B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 4, marginBottom: 14 },
  logoImage: { width: LOGO_SIZE, height: LOGO_SIZE },
  appName: { fontSize: 28, color: '#4A2E12', fontFamily: 'serif', letterSpacing: 1 },
  bottomCard: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 32, borderTopRightRadius: 32, paddingHorizontal: 28, paddingTop: 35, paddingBottom: 45, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.06, shadowRadius: 16, elevation: 8, minHeight: 450 },
  cardTitle: { fontSize: 26, color: '#3E2210', fontWeight: '700', textAlign: 'center', marginBottom: 6 },
  cardSubtitle: { fontSize: 14, color: '#9B8A76', textAlign: 'center', marginBottom: 28 },
  
  // Social buttons
  socialButton: { flexDirection: 'row', alignItems: 'center', width: '100%', paddingVertical: 14, borderRadius: 14, marginBottom: 12, paddingHorizontal: 16 },
  socialIconBox: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  socialText: { flex: 1, textAlign: 'center', fontSize: 15, fontWeight: '600', marginRight: 36 },
  googleButton: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#EDEDED' },
  googleText: { color: '#4A3A28' },
  facebookButton: { backgroundColor: '#6B4830' },
  facebookText: { color: '#FFF' },
  
  // Divider
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 16 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E8E2D9' },
  dividerText: { marginHorizontal: 14, fontSize: 13, color: '#B5A48E', fontWeight: '500' },
  
  // Email button
  emailButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%', paddingVertical: 15, borderRadius: 14, borderWidth: 1.5, borderColor: '#5C3318', gap: 8 },
  emailButtonText: { fontSize: 15, color: '#5C3318', fontWeight: '600' },
  
  // Form Styles
  formContainer: { width: '100%' },
  errorText: { color: '#E74C3C', textAlign: 'center', marginBottom: 15, fontSize: 14 },
  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 13, color: '#5C3D1A', marginBottom: 6, fontWeight: '600' },
  input: { backgroundColor: '#F9F7F4', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: '#3E2210', borderWidth: 1, borderColor: '#E8E2D9' },
  submitButton: { backgroundColor: '#5C3318', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 10 },
  submitButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  backToSocial: { alignItems: 'center', marginTop: 16 },
  backToSocialText: { color: '#8A7A64', fontSize: 14, fontWeight: '600' },

  signInRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  signInText: { color: '#8A7A64', fontSize: 14 },
  signInLink: { color: '#5C3318', fontSize: 14, fontWeight: '700' }
});

export default SignupScreen;
