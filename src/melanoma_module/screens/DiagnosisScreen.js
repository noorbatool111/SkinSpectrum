import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { BaseScreen } from '../components/common/BaseScreen';
import { useContext, useEffect, useState } from 'react';
import { PrimaryButton } from '../components/button/PrimaryButton';
import { Ionicons } from '@expo/vector-icons';
import ImageContext from '../context/ImageContext';
import { useGlobalStyle } from '../hooks/useGlobalStyle';
import FormContext from '../context/FormContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { colors } from '../constants/color';

let Location = null;
try {
  Location = require('expo-location');
} catch (e) {
  console.log('expo-location not available');
}

import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const DiagnosisScreen = ({ navigation }) => {
  const { imgUri } = useContext(ImageContext);
  const { prediction, confidence, resultMessage, questionnaireScore, uvIndex, setUvIndex, uvRisk, setUvRisk } = useContext(FormContext);
  const riskScore = questionnaireScore || 0;
  const basicStyles = useGlobalStyle();
  const [locName, setLocName] = useState('Fetching...');
  const [address, setAddress] = useState('');

  useEffect(() => {
    (async () => {
      let lat, lon;

      // Try GPS first
      if (Location && Location.requestForegroundPermissionsAsync) {
        try {
          let { status } = await Location.requestForegroundPermissionsAsync();
          if (status === 'granted') {
            let location = null;
            if (Location.getLastKnownPositionAsync) {
              location = await Location.getLastKnownPositionAsync({});
            }
            if (!location && Location.getCurrentPositionAsync) {
              location = await Location.getCurrentPositionAsync({ accuracy: 2 }); // Balanced
            }
            
            if (location) {
              lat = location.coords.latitude;
              lon = location.coords.longitude;
              setLocName(`GPS Active`);
              
              if (Location.reverseGeocodeAsync) {
                try {
                  const reverseGeocode = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lon });
                  if (reverseGeocode && reverseGeocode.length > 0) {
                    const item = reverseGeocode[0];
                    const city = item.district || item.city || item.subregion || 'Unknown City';
                    setAddress(`${city}, ${item.region || item.country || ''}`);
                  }
                } catch (geoErr) {
                  console.log('Geocode error:', geoErr);
                }
              }
            }
          }
        } catch (e) {
          console.log('GPS Error:', e);
        }
      }

      // Fallback to IP-based location if GPS failed
      if (!lat || !lon) {
        try {
          console.log('Using IP-based location fallback...');
          const ipRes = await axios.get('https://ipapi.co/json/');
          console.log('IP Location Response:', ipRes.data);
          if (ipRes.data && ipRes.data.latitude) {
            lat = ipRes.data.latitude;
            lon = ipRes.data.longitude;
            setAddress(`${ipRes.data.city}, ${ipRes.data.region}`);
            setLocName('IP Location');
            console.log('Coordinates from IP:', lat, lon);
          }
        } catch (ipErr) {
          console.log('IP Location Error (ipapi.co):', ipErr.message);
          // Try another provider
          try {
            console.log('Trying secondary IP location fallback (ip-api.com)...');
            const ipRes2 = await axios.get('http://ip-api.com/json/');
            if (ipRes2.data && ipRes2.data.status === 'success') {
              lat = ipRes2.data.lat;
              lon = ipRes2.data.lon;
              setAddress(`${ipRes2.data.city}, ${ipRes2.data.regionName}`);
              setLocName('IP Location (v2)');
              console.log('Coordinates from Secondary IP:', lat, lon);
            }
          } catch (ipErr2) {
            console.log('Secondary IP Location Error:', ipErr2.message);
          }
        }
      }

      // Get UV Index if we have coordinates
      if (lat && lon) {
        try {
          console.log(`Fetching UV for: ${lat}, ${lon}`);
          const uvRes = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=uv_index&forecast_days=1`);
          console.log('UV Response:', uvRes.data);
          const currentUv = uvRes.data.current.uv_index || 0;
          
          setUvIndex(currentUv.toFixed(1));
          console.log('UV Index set to:', currentUv);
          
          if (currentUv >= 11) setUvRisk('Extreme');
          else if (currentUv >= 8) setUvRisk('Very High');
          else if (currentUv >= 6) setUvRisk('High');
          else if (currentUv >= 3) setUvRisk('Moderate');
          else setUvRisk('Low');
        } catch (uvErr) {
          console.log('UV fetch error:', uvErr.message);
          setUvIndex('5.0');
          setUvRisk('Moderate');
        }
      } else {
        console.log('No coordinates found for UV fetch');
        setLocName('Location Unavailable');
        setUvIndex('N/A');
      }
    })();
  }, []);

  // Calculate AI Risk (confidence is 0-100 from server)
  const aiRisk = prediction === 'malignant' ? (confidence / 10) : 0;
  const totalRisk = Math.min(100, (aiRisk * 6) + (riskScore * 2));
  
  let riskLevel = 'Low Risk';
  let riskColors = ['#4CAF50', '#81C784']; // Green gradient
  let riskDesc = "Your skin appears healthy based on current analysis. Maintain regular checkups.";

  if (totalRisk > 70) {
    riskLevel = 'High Risk';
    riskColors = ['#FF416C', '#FF4B2B']; // Red gradient
    riskDesc = "We recommend consulting a dermatologist as soon as possible for a professional exam.";
  } else if (totalRisk > 35) {
    riskLevel = 'Moderate Risk';
    riskColors = ['#F2C94C', '#F2994A']; // Orange gradient
    riskDesc = "Some concerns detected. Monitor the area for changes and consider a professional consult.";
  }

  return (
    <BaseScreen>
      <Header />
      <ScrollView contentContainerStyle={styles.container}>
        
        <View style={styles.topSection}>
          <Text style={styles.mainTitle}>Analysis Results</Text>
          <Text style={styles.dateText}>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</Text>
        </View>

        <LinearGradient 
          colors={riskColors} 
          start={{x:0, y:0}} 
          end={{x:1, y:1}} 
          style={styles.gaugeCard}
        >
          <View style={styles.gaugeWrapper}>
            <View style={[styles.simpleGauge, { borderColor: 'rgba(255,255,255,0.4)' }]}>
              <Text style={[styles.percentageText, { color: '#FFF' }]}>{totalRisk.toFixed(0)}%</Text>
              <Text style={styles.scoreLabel}>Total Risk</Text>
            </View>
          </View>

          <View style={styles.riskInfo}>
            <Text style={[styles.riskTitle, { color: '#FFF' }]}>{riskLevel}</Text>
            <Text style={styles.riskDescription}>{riskDesc}</Text>
          </View>
        </LinearGradient>

        <View style={styles.detailCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="scan" size={20} color={colors.primary} />
            <Text style={styles.cardHeaderTitle}>AI Mole Scan</Text>
          </View>
          
          <View style={styles.aiRow}>
            {imgUri && <Image source={{ uri: imgUri }} style={styles.moleImage} />}
            <View style={styles.aiResultInfo}>
              <Text style={styles.predictionLabel}>Prediction:</Text>
              <Text style={[styles.predictionValue, { color: prediction === 'malignant' ? colors.accentDanger : colors.accentSafe }]}>
                {prediction ? prediction.charAt(0).toUpperCase() + prediction.slice(1) : 'N/A'}
              </Text>
              <Text style={styles.confidenceText}>
                Confidence: {confidence ? confidence.toFixed(1) + '%' : 'N/A'}
              </Text>
            </View>
          </View>
          {resultMessage && <Text style={styles.aiMessage}>"{resultMessage}"</Text>}
        </View>

        <View style={styles.uvCard}>
          <View style={styles.uvHeader}>
            <View style={styles.uvIconBg}>
              <Ionicons name="sunny" size={24} color="#FF9800" />
            </View>
            <View>
              <Text style={styles.uvTitle}>UV Risk Index</Text>
              <Text style={styles.uvAddress}>{address || 'Locating...'}</Text>
            </View>
          </View>
          <View style={styles.uvStats}>
            <View style={styles.uvStatItem}>
              <Text style={styles.uvValue}>{uvIndex || '--'}</Text>
              <Text style={styles.uvLabel}>Index</Text>
            </View>
            <View style={styles.uvDivider} />
            <View style={styles.uvStatItem}>
              <Text style={[styles.uvValue, { 
                color: uvRisk === 'Extreme' ? '#673AB7' : 
                      (uvRisk === 'High' || uvRisk === 'Very High' ? colors.accentDanger : '#4CAF50') 
              }]}>{uvRisk || '--'}</Text>
              <Text style={styles.uvLabel}>Risk Level</Text>
            </View>
          </View>
          {uvIndex === '0.0' && <Text style={styles.nightNote}>Note: UV index is 0.0 because it's evening/night.</Text>}
          <Text style={styles.coordText}>{locName}</Text>
        </View>

        <View style={styles.actions}>
          <PrimaryButton title="View Detailed Report" onPress={() => navigation.navigate('FullReport')} />
          <TouchableOpacity style={styles.homeBtn} onPress={() => navigation.navigate('MelanomaWelcome')}>
            <Text style={styles.homeBtnText}>Back to Dashboard</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.disclaimer}>
          Disclaimer: This is not a professional diagnosis. Always consult a doctor for medical concerns.
        </Text>

      </ScrollView>
      <Footer />
    </BaseScreen>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 40 },
  topSection: { marginBottom: 20 },
  mainTitle: { fontSize: 26, fontWeight: '800', color: colors.textHeading },
  dateText: { fontSize: 14, color: colors.textSub, marginTop: 4 },
  gaugeCard: { borderRadius: 24, padding: 25, alignItems: 'center', marginBottom: 24, elevation: 8, shadowColor: '#000', shadowOffset: {width: 0, height: 6}, shadowOpacity: 0.2, shadowRadius: 12 },
  gaugeWrapper: { alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  simpleGauge: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  percentageText: { fontSize: 36, fontWeight: '800' },
  scoreLabel: { fontSize: 12, color: 'rgba(255,255,255,0.9)', textTransform: 'uppercase', letterSpacing: 1 },
  riskInfo: { alignItems: 'center' },
  riskTitle: { fontSize: 24, fontWeight: '800', marginBottom: 8 },
  riskDescription: { textAlign: 'center', fontSize: 15, color: 'rgba(255,255,255,0.95)', lineHeight: 22 },
  detailCard: { backgroundColor: colors.white, borderRadius: 20, padding: 20, marginBottom: 24, shadowColor: '#000', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 15 },
  cardHeaderTitle: { fontSize: 16, fontWeight: '700', color: colors.textHeading },
  aiRow: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  moleImage: { width: 80, height: 80, borderRadius: 16, backgroundColor: '#F5F5F5' },
  aiResultInfo: { flex: 1 },
  predictionLabel: { fontSize: 12, color: colors.textSub, marginBottom: 2 },
  predictionValue: { fontSize: 22, fontWeight: '800', marginBottom: 4 },
  confidenceText: { fontSize: 14, color: colors.textSub, fontWeight: '500' },
  aiMessage: { marginTop: 15, fontSize: 13, fontStyle: 'italic', color: colors.textSub, padding: 12, backgroundColor: '#F9F9F9', borderRadius: 12 },
  uvCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, marginBottom: 25, borderLeftWidth: 6, borderLeftColor: '#FF9800', shadowColor: '#FF9800', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.15, shadowRadius: 12, elevation: 4 },
  uvHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 15 },
  uvIconBg: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#FFF3E0', alignItems: 'center', justifyContent: 'center' },
  uvTitle: { fontSize: 17, fontWeight: '700', color: colors.textHeading },
  uvAddress: { fontSize: 13, color: colors.textSub },
  uvStats: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingVertical: 10 },
  uvStatItem: { alignItems: 'center' },
  uvValue: { fontSize: 22, fontWeight: '800', color: colors.textHeading },
  uvLabel: { fontSize: 12, color: colors.textSub, marginTop: 2 },
  uvDivider: { width: 1, height: 30, backgroundColor: '#EEE' },
  nightNote: { fontSize: 11, color: colors.textSub, textAlign: 'center', fontStyle: 'italic', marginTop: 5 },
  coordText: { fontSize: 10, color: colors.textSub, opacity: 0.5, textAlign: 'center', marginTop: 10 },
  actions: { gap: 12, marginBottom: 20 },
  homeBtn: { alignItems: 'center', padding: 15 },
  homeBtnText: { color: colors.primary, fontWeight: '600', fontSize: 16 },
  disclaimer: { fontSize: 11, color: colors.textSub, textAlign: 'center', opacity: 0.6, lineHeight: 16 },
});

export default DiagnosisScreen;