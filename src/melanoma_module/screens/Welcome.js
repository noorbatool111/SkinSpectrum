import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { BaseScreen } from '../components/common/BaseScreen';
import { SecondaryButton } from '../components/button/SecondaryButton';
import { PrimaryButton } from '../components/button/PrimaryButton';
import { useGlobalStyle } from '../hooks/useGlobalStyle';
import { scale, scaleVertical } from '../helpers/scale';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { colors } from '../constants/color';
import { LinearGradient } from 'expo-linear-gradient';

import FormContext from '../context/FormContext';
import { useContext, useEffect } from 'react';

let Location = null;
try {
  Location = require('expo-location');
} catch (e) {}

const WelcomeScreen = ({ navigation }) => {
  const basicStyles = useGlobalStyle();
  const { questionnaireScore, resetData } = useContext(FormContext);

  useEffect(() => {
    (async () => {
      if (!Location) return;
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.log('Location permission denied');
        }
      } catch (e) {
        console.log('Location error:', e);
      }
    })();
  }, []);

  const handleAnalyzeMole = () => {
    navigation.navigate('ScanPhoto');
  };

  const handleStartQuestionnaire = () => {
    resetData(); // Clear previous results for fresh analysis
    navigation.navigate('Questionnaire');
  };

  return (
    <BaseScreen>
      <Header />
      <ScrollView contentContainerStyle={{ paddingHorizontal: scale(20), paddingBottom: 50 }} style={{ backgroundColor: '#FAF6EF' }}>
        
        <TouchableOpacity 
          onPress={() => navigation.navigate('Home')}
          style={styles.backBtn}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={20} color={colors.textHeading} />
          <Text style={styles.backBtnText}>Back</Text>
        </TouchableOpacity>

        <LinearGradient 
          colors={['#4776E6', '#8E54E9']} 
          start={{x:0, y:0}} end={{x:1, y:1}} 
          style={styles.heroGradient}
        >
          <View style={styles.heroIconBox}>
            <Ionicons name="shield-checkmark" size={32} color="#4776E6" />
          </View>
          <Text style={styles.heroTitle}>
            Melanoma Risk Profiling
          </Text>
          <Text style={styles.heroSubtitle}>
            AI-powered mole analysis and personalized prevention guidance.
          </Text>
        </LinearGradient>

        {/* Action Buttons */}
        <View style={{ gap: 15, alignItems: 'center' }}>
          <TouchableOpacity 
            activeOpacity={0.85} 
            onPress={handleAnalyzeMole}
            style={styles.actionBtnWrapper}
          >
            <LinearGradient
              colors={['#FF416C', '#FF4B2B']}
              start={{x:0, y:0}} end={{x:1, y:0}}
              style={styles.actionBtnGradient}
            >
              <Ionicons name="camera" size={24} color="#FFF" />
              <Text style={styles.actionBtnText}>Analyze a Mole</Text>
              <Ionicons name="arrow-forward" size={20} color="#FFF" />
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.actionHint}>
            Take a picture and answer a few quick questions to get an instant AI skin analysis.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.infoLink}
          onPress={() => navigation.navigate('AboutMelanoma')}
          activeOpacity={0.8}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, flex: 1 }}>
            <View style={styles.infoIconBg}>
              <Ionicons name="book" size={24} color="#4776E6" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.infoLinkTitle}>First time here?</Text>
              <Text style={styles.infoLinkSubtitle}>Learn about Melanoma awareness</Text>
            </View>
          </View>
          <View style={styles.chevronBg}>
            <Ionicons name="chevron-forward" size={20} color="#4776E6" />
          </View>
        </TouchableOpacity>

        {/* Medical Disclaimer Card */}
        <View style={styles.disclaimerCard}>
          <View style={styles.disclaimerIconBg}>
            <Ionicons name="warning" size={24} color={colors.accentDanger} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.disclaimerTitle}>
              Medical Disclaimer
            </Text>
            <Text style={styles.disclaimerText}>
              This AI tool does not provide medical diagnosis. Please consult a certified dermatologist for professional advice.
            </Text>
          </View>
        </View>

      </ScrollView>
      <Footer />
    </BaseScreen>
  );
};

const styles = StyleSheet.create({
  backBtn: {
    marginTop: 15,
    marginBottom: 5,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  backBtnText: {
    marginLeft: 6,
    fontSize: 15,
    color: colors.textHeading,
    fontWeight: '700'
  },
  heroGradient: {
    borderRadius: 30,
    padding: 28,
    marginTop: 20,
    marginBottom: 32,
    alignItems: 'flex-start',
    shadowColor: '#4776E6',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
  },
  heroIconBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 8,
    lineHeight: 34,
  },
  heroSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 22,
    fontWeight: '500',
  },
  actionBtnWrapper: {
    width: '100%',
    shadowColor: '#FF416C',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  actionBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 24,
    gap: 10,
  },
  actionBtnText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFF',
  },
  actionHint: {
    fontSize: 14,
    color: colors.textSub,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 10,
    marginTop: 6,
  },
  infoLink: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 16,
    marginTop: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#4776E6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(71, 118, 230, 0.1)',
  },
  infoIconBg: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(71, 118, 230, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoLinkTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1D2B64',
  },
  infoLinkSubtitle: {
    fontSize: 13,
    color: colors.textSub,
    marginTop: 4,
    fontWeight: '500',
  },
  chevronBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(71, 118, 230, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  disclaimerCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 20,
    marginTop: 24,
    borderWidth: 1,
    borderColor: 'rgba(211, 47, 47, 0.15)',
    flexDirection: 'row',
    gap: 16,
    shadowColor: '#D32F2F',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  disclaimerIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(211, 47, 47, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disclaimerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.accentDanger,
    marginBottom: 4,
  },
  disclaimerText: {
    fontSize: 13,
    color: colors.textSub,
    lineHeight: 20,
    fontWeight: '500',
  },
});

export default WelcomeScreen;
