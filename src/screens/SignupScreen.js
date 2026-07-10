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
import { LinearGradient } from 'expo-linear-gradient';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { LoginManager, AccessToken } from 'react-native-fbsdk-next';
import { registerUser, googleAuth, facebookAuth } from '../services/api';
import { useUser } from '../context/UserContext';



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
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Configure Google Sign-In
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
      offlineAccess: true,
    });
  }, []);

  const handleGoogleSignup = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo.data?.idToken;

      if (idToken) {
        const response = await googleAuth(idToken);
        await signIn(response.token, response.user);
        // App.js RootNavigator will automatically switch to Home/Privacy
      } else {
        throw new Error('No ID Token received');
      }
    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // user cancelled
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // progress
      } else {
        console.error('Google Native Signup Error:', error);
        setErrorMsg('Google signup failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Facebook Signup — Native SDK (Works only in Development Builds)
  const handleFacebookSignup = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      // Attempt login with permissions
      const result = await LoginManager.logInWithPermissions(['public_profile']);

      if (result.isCancelled) {
        setLoading(false);
        return;
      }

      // Get the access token
      const data = await AccessToken.getCurrentAccessToken();
      if (!data) {
        setErrorMsg('Something went wrong obtaining the access token');
        setLoading(false);
        return;
      }

      // Send token to our backend
      handleSocialSignup('facebook', data.accessToken.toString());
    } catch (error) {
      console.error('FB Native Signup Error:', error);
      setErrorMsg('Facebook sign up failed. Please make sure you are using the Development Build.');
    } finally {
      setLoading(false);
    }
  };

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
    } catch (error) {
      setErrorMsg(`${provider} sign up failed. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignup = async () => {
    if (!name || !email || !password || !confirmPassword) {
      setErrorMsg('Please fill in all fields');
      return;
    }

    // Password Complexity Check
    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{12,})/;
    if (!passwordRegex.test(password)) {
      setErrorMsg('Password must be at least 12 characters long and contain at least one number and one special character (!@#$%^&*)');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }
    
    setLoading(true);
    setErrorMsg('');
    try {
      const data = await registerUser(name, email, password);
      await signIn(data.token, data.user);
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
        disabled={loading}
        onPress={handleGoogleSignup}
      >
        <View style={styles.socialIconBox}>
          <AntDesign name="google" size={20} color="#DB4437" />
        </View>
        <Text style={[styles.socialText, styles.googleText]}>Sign up with Google</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.socialButton, styles.facebookButton]} 
        activeOpacity={0.85}
        disabled={loading}
        onPress={() => handleFacebookSignup()}
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
        style={styles.emailButtonWrapper} 
        activeOpacity={0.85}
        onPress={() => setIsEmailView(true)}
      >
        <LinearGradient
          colors={['#FF7E5F', '#FEB47B']}
          start={{x:0, y:0}} end={{x:1, y:0}}
          style={styles.emailButtonGradient}
        >
          <Ionicons name="mail-outline" size={20} color="#FFF" />
          <Text style={styles.emailButtonText}>Sign up with Email</Text>
        </LinearGradient>
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
        <View style={styles.passwordInputWrapper}>
          <TextInput
            style={styles.innerInput}
            placeholder="••••••••"
            placeholderTextColor="#B5A48E"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity 
            style={styles.eyeIcon} 
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons 
              name={showPassword ? "eye-off-outline" : "eye-outline"} 
              size={22} 
              color="#B5A48E" 
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Confirm Password</Text>
        <View style={styles.passwordInputWrapper}>
          <TextInput
            style={styles.innerInput}
            placeholder="••••••••"
            placeholderTextColor="#B5A48E"
            secureTextEntry={!showConfirmPassword}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <TouchableOpacity 
            style={styles.eyeIcon} 
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            <Ionicons 
              name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
              size={22} 
              color="#B5A48E" 
            />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.submitButtonWrapper} 
        onPress={handleEmailSignup}
        disabled={loading}
        activeOpacity={0.85}
      >
        <LinearGradient
          colors={['#FF416C', '#FF4B2B']}
          start={{x:0, y:0}} end={{x:1, y:0}}
          style={styles.submitButtonGradient}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.submitButtonText}>Create Account</Text>
          )}
        </LinearGradient>
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
  decorCircle: { position: 'absolute', width: 250, height: 250, borderRadius: 125, backgroundColor: 'rgba(255, 126, 95, 0.05)' },
  decorTop: { top: -80, right: -60 },
  backButton: { position: 'absolute', top: 55, left: 20, zIndex: 10 },
  backButtonInner: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  headerSection: { alignItems: 'center', justifyContent: 'center', paddingTop: 60, paddingBottom: 20 },
  logoContainer: { width: LOGO_SIZE, height: LOGO_SIZE, borderRadius: LOGO_SIZE / 2, shadowColor: '#FF7E5F', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 4, marginBottom: 14, backgroundColor: '#FFF' },
  logoImage: { width: LOGO_SIZE, height: LOGO_SIZE },
  appName: { fontSize: 28, color: '#1D2B64', fontFamily: 'serif', letterSpacing: 1, fontWeight: '800' },
  bottomCard: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 36, borderTopRightRadius: 36, paddingHorizontal: 28, paddingTop: 35, paddingBottom: 45, shadowColor: '#000', shadowOffset: { width: 0, height: -6 }, shadowOpacity: 0.08, shadowRadius: 20, elevation: 8, minHeight: 450 },
  cardTitle: { fontSize: 26, color: '#1D2B64', fontWeight: '800', textAlign: 'center', marginBottom: 6 },
  cardSubtitle: { fontSize: 14, color: '#888', textAlign: 'center', marginBottom: 28 },
  
  // Social buttons
  socialButton: { flexDirection: 'row', alignItems: 'center', width: '100%', paddingVertical: 14, borderRadius: 14, marginBottom: 12, paddingHorizontal: 16 },
  socialIconBox: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  socialText: { flex: 1, textAlign: 'center', fontSize: 15, fontWeight: '600', marginRight: 36 },
  googleButton: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#F0F0F0', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  googleText: { color: '#333' },
  facebookButton: { backgroundColor: '#1877F2' },
  facebookText: { color: '#FFF' },
  
  // Divider
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 16 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E8E2D9' },
  dividerText: { marginHorizontal: 14, fontSize: 13, color: '#B5A48E', fontWeight: '500' },
  
  // Email button
  emailButtonWrapper: { width: '100%', shadowColor: '#FF7E5F', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  emailButtonGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%', paddingVertical: 16, borderRadius: 16, gap: 8 },
  emailButtonText: { fontSize: 16, color: '#FFF', fontWeight: '700' },
  
  // Form Styles
  formContainer: { width: '100%' },
  errorText: { color: '#E74C3C', textAlign: 'center', marginBottom: 15, fontSize: 14 },
  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 14, color: '#1D2B64', marginBottom: 8, fontWeight: '700' },
  passwordInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,126,95,0.03)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,126,95,0.2)',
  },
  input: { backgroundColor: 'rgba(255,126,95,0.03)', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 16, fontSize: 16, color: '#333', borderWidth: 1, borderColor: 'rgba(255,126,95,0.2)' },
  innerInput: { flex: 1, paddingHorizontal: 16, paddingVertical: 16, fontSize: 16, color: '#333' },
  eyeIcon: { paddingHorizontal: 16 },
  submitButtonWrapper: { marginTop: 10, shadowColor: '#FF416C', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6 },
  submitButtonGradient: { borderRadius: 16, paddingVertical: 18, alignItems: 'center' },
  submitButtonText: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  backToSocial: { alignItems: 'center', marginTop: 20 },
  backToSocialText: { color: '#888', fontSize: 14, fontWeight: '600' },

  signInRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 28 },
  signInText: { color: '#888', fontSize: 15 },
  signInLink: { color: '#FF416C', fontSize: 15, fontWeight: '800' }
});

export default SignupScreen;
