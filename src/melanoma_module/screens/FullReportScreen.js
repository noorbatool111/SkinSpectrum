import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { BaseScreen } from '../components/common/BaseScreen';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { colors } from '../constants/color';
import { useGlobalStyle } from '../hooks/useGlobalStyle';
import FormContext from '../context/FormContext';
import ImageContext from '../context/ImageContext';
import React, { useContext } from 'react';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const FullReportScreen = ({ navigation }) => {
  const basicStyles = useGlobalStyle();
  const { prediction, confidence, resultMessage, questionnaireScore, uvIndex, uvRisk } = useContext(FormContext);
  const { imgUri } = useContext(ImageContext);

  const qScore = questionnaireScore || 0;
  const uvVal = parseFloat(uvIndex) || 0;
  
  // Normalized confidence (server sends 0-100)
  const normConf = (confidence || 0) / 100;

  // Dynamic Risk Engine (Refined)
  let aiRiskBase = 0;
  if (prediction === 'malignant') {
    aiRiskBase = 65 + (normConf * 35); // 65-100%
  } else if (prediction === 'unsure') {
    aiRiskBase = 20 + (normConf * 25); // 20-45%
  } else {
    aiRiskBase = (1 - normConf) * 15; // 0-15%
  }

  // Adjusted Weights: AI (75%) + Questionnaire (15%) + UV Factor (10%)
  const totalRisk = Math.min(100, 
    (aiRiskBase * 0.75) + 
    (qScore * 0.8) + 
    (uvVal * 0.6)
  );
  
  let riskLevel = 'Low';
  let riskColors = ['#81C784', '#388E3C']; // Safe gradient
  
  if (totalRisk > 75) {
    riskLevel = 'High';
    riskColors = ['#E57373', '#D32F2F']; // Danger gradient
  } else if (totalRisk > 40) {
    riskLevel = 'Moderate';
    riskColors = ['#FFB74D', '#F57C00']; // Warning gradient
  }

  const KPICard = ({ icon, title, value, subtext, highlightColor, iconLib = "Ionicons" }) => (
    <View style={styles.kpiCard}>
      <View style={styles.kpiHeader}>
        {iconLib === "MaterialCommunityIcons" ? (
          <MaterialCommunityIcons name={icon} size={20} color={highlightColor || colors.primary} />
        ) : (
          <Ionicons name={icon} size={20} color={highlightColor || colors.primary} />
        )}
        <Text style={styles.kpiTitle} numberOfLines={1}>{title}</Text>
      </View>
      <Text style={[styles.kpiValue, { color: highlightColor || colors.textHeading }]} adjustsFontSizeToFit numberOfLines={1}>
        {value}
      </Text>
      {subtext && <Text style={styles.kpiSubtext} numberOfLines={2}>{subtext}</Text>}
    </View>
  );

  return (
    <BaseScreen>
      <Header />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={colors.textHeading} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detailed Analysis</Text>
        </View>

        {/* Hero Card */}
        <LinearGradient
          colors={riskColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroInner}>
            <Text style={styles.heroLabel}>Overall Risk Assessment</Text>
            <Text style={styles.heroValue}>{riskLevel} Risk</Text>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${totalRisk}%` }]} />
            </View>
            <Text style={styles.heroSub}>Combined Severity Score: {totalRisk.toFixed(0)}/100</Text>
          </View>
        </LinearGradient>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Analysis Overview</Text>
        </View>

        {imgUri && (
          <View style={styles.imageContainer}>
            <Image source={{ uri: imgUri }} style={styles.scannedImage} />
            <View style={styles.imageOverlay}>
              <Text style={styles.imageLabel}>Scanned Mole</Text>
            </View>
          </View>
        )}

        {/* KPI Grid */}
        <View style={styles.kpiGrid}>
          <KPICard 
            icon="scan-outline" 
            title="Visual AI" 
            value={prediction ? prediction.toUpperCase() : 'N/A'} 
            subtext={`Confidence: ${confidence ? confidence.toFixed(1) + '%' : 'N/A'}`}
            highlightColor={prediction === 'malignant' ? colors.accentDanger : colors.accentSafe}
          />
          <KPICard 
            icon="clipboard-outline" 
            title="Questionnaire" 
            value={`${qScore} pts`} 
            subtext="Personal risk profile"
          />
          <KPICard 
            icon="partly-sunny-outline" 
            title="UV Index" 
            value={uvIndex !== null ? String(uvIndex) : 'N/A'} 
            subtext="Local sun intensity"
          />
          <KPICard 
            icon="shield-alert-outline" 
            iconLib="MaterialCommunityIcons"
            title="Exposure Risk" 
            value={uvRisk || 'N/A'} 
            subtext="Environmental factor"
            highlightColor={uvRisk === 'High' || uvRisk === 'Very High' ? colors.accentDanger : colors.textHeading}
          />
        </View>

        {resultMessage && (
          <View style={styles.noteBox}>
            <Ionicons name="information-circle" size={24} color={colors.primary} />
            <Text style={styles.noteText}>{resultMessage}</Text>
          </View>
        )}

        {/* Personalized Action Plan */}
        <View style={styles.planSection}>
          <Text style={styles.planTitle}>Recommended Action Plan</Text>
          
          <View style={styles.planItem}>
            <View style={styles.bullet}><Text style={styles.bulletText}>1</Text></View>
            <View style={styles.planContent}>
              <Text style={styles.planItemTitle}>Monitor Changes</Text>
              <Text style={styles.planItemDesc}>Use the ABCDE rule to check for any changes in size, shape, or color monthly.</Text>
            </View>
          </View>

          <View style={styles.planItem}>
            <View style={styles.bullet}><Text style={styles.bulletText}>2</Text></View>
            <View style={styles.planContent}>
              <Text style={styles.planItemTitle}>Sun Protection</Text>
              <Text style={styles.planItemDesc}>Apply broad-spectrum SPF 50+ even on cloudy days and wear protective clothing.</Text>
            </View>
          </View>

          <View style={styles.planItem}>
            <View style={styles.bullet}><Text style={styles.bulletText}>3</Text></View>
            <View style={styles.planContent}>
              <Text style={styles.planItemTitle}>Professional Consult</Text>
              <Text style={styles.planItemDesc}>
                {totalRisk > 35 
                  ? "Highly recommended to see a dermatologist for a professional skin mapping." 
                  : "Include a skin check in your next regular physical exam."}
              </Text>
            </View>
          </View>
        </View>
        
        {/* Alerts / Reminders */}
        <View style={styles.alertSection}>
          <View style={styles.alertSectionHeader}>
            <Ionicons name="notifications" size={20} color={colors.accentWarning} />
            <Text style={styles.alertSectionTitle}>Reminders</Text>
          </View>
          <View style={styles.alertItem}>
            <View style={styles.alertIconBg}>
              <Ionicons name="time-outline" size={16} color={colors.accentWarning} />
            </View>
            <Text style={styles.alertText}>Re-check this mole after 30 days for any changes.</Text>
          </View>
          <View style={styles.alertItem}>
            <View style={styles.alertIconBg}>
              <Ionicons name="calendar-outline" size={16} color={colors.accentWarning} />
            </View>
            <Text style={styles.alertText}>Schedule your annual dermatologist skin mapping.</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.doneBtn}
          onPress={() => navigation.navigate('MelanomaWelcome')}
        >
          <Text style={styles.doneBtnText}>Back to Dashboard</Text>
          <Ionicons name="arrow-forward" size={20} color={colors.white} />
        </TouchableOpacity>

      </ScrollView>
      <Footer />
    </BaseScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: '#FAF6EF', // Standard app background color
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  backBtn: {
    padding: 8,
    marginRight: 15,
    backgroundColor: '#FFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textHeading,
  },
  heroCard: {
    borderRadius: 24,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 8,
  },
  heroInner: {
    padding: 30,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 24,
  },
  heroLabel: {
    fontSize: 13,
    color: '#FFF',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 10,
    fontWeight: '700',
    opacity: 0.9,
  },
  heroValue: {
    fontSize: 46,
    fontWeight: '900',
    color: '#FFF',
    marginBottom: 25,
    textShadowColor: 'rgba(0, 0, 0, 0.15)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  progressBarBg: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 15,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FFF',
    borderRadius: 4,
  },
  heroSub: {
    fontSize: 15,
    color: '#FFF',
    fontWeight: '600',
    opacity: 0.9,
  },
  sectionHeader: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textHeading,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
    backgroundColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  scannedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 15,
    left: 15,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  imageLabel: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  kpiCard: {
    width: '48%', 
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  kpiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  kpiTitle: {
    fontSize: 13,
    color: colors.textSub,
    fontWeight: '700',
    flexShrink: 1,
  },
  kpiValue: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 6,
  },
  kpiSubtext: {
    fontSize: 12,
    color: '#999',
    lineHeight: 16,
    fontWeight: '500',
  },
  noteBox: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#FFF',
    padding: 18,
    borderRadius: 16,
    marginBottom: 30,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    alignItems: 'flex-start',
  },
  noteText: {
    flex: 1,
    fontSize: 14,
    color: colors.textSub,
    lineHeight: 22,
    fontWeight: '500',
  },
  planSection: {
    marginBottom: 30,
  },
  planTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textHeading,
    marginBottom: 20,
  },
  planItem: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
    backgroundColor: '#FFF',
    padding: 18,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  bullet: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bulletText: {
    color: colors.primary,
    fontWeight: '800',
    fontSize: 15,
  },
  planContent: {
    flex: 1,
  },
  planItemTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textHeading,
    marginBottom: 6,
  },
  planItemDesc: {
    fontSize: 14,
    color: colors.textSub,
    lineHeight: 22,
  },
  alertSection: {
    backgroundColor: '#FFFBEB',
    borderRadius: 20,
    padding: 20,
    marginBottom: 35,
    borderWidth: 1,
    borderColor: '#FEF3C7',
    shadowColor: '#F4B400',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 2,
  },
  alertSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 15,
  },
  alertSectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#8C6B00',
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
    backgroundColor: '#FFF',
    padding: 14,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  alertIconBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFBEB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertText: {
    fontSize: 14,
    color: '#5C4A00',
    flex: 1,
    fontWeight: '600',
    lineHeight: 20,
  },
  doneBtn: {
    backgroundColor: colors.primary,
    borderRadius: 18,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  doneBtnText: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '800',
  },
});

export default FullReportScreen;