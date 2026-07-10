import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { BaseScreen } from '../components/common/BaseScreen';
import { useGlobalStyle } from '../hooks/useGlobalStyle';
import { scaleVertical } from '../helpers/scale';
import { PrimaryButton } from '../components/button/PrimaryButton';
import { SecondaryButton } from '../components/button/SecondaryButton';
import { ProgressStepBar } from '../components/ProgressStepBar';
import { WelcomeSvg } from '../constants/svg';
import { Ionicons } from '@expo/vector-icons';
import { useContext, useEffect, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import PermissionsContext from '../context/PermissionsContext';
import ImageContext from '../context/ImageContext';
import FormContext from '../context/FormContext';
import { colors } from '../constants/color';

const ScanPhotoScreen = ({ navigation }) => {
  const basicStyles = useGlobalStyle();

  const { permissions, lastPressed, setLastPressed } =
    useContext(PermissionsContext);

  const { questionnaireScore } = useContext(FormContext);

  const { captureImage } = useContext(ImageContext);

  const promptUser = () => {
    let prompt;

    if (!permissions.camera == true && lastPressed == 'camera') {
      prompt = 'Please make sure that you granted the app camera rights';
    } else if (!permissions.gallery == true && lastPressed == 'gallery') {
      prompt =
        'Please make sure to grant the app access to the photos of your gallery';
    } else {
      prompt =
        'Upload a picture of your mole from the gallery, or take a picture of it with your camera';
    }
    return prompt;
  };

  return (
    <BaseScreen>
      <ScrollView 
        contentContainerStyle={{ paddingHorizontal: scaleVertical(20), paddingBottom: 50, flexGrow: 1, alignItems: 'center' }} 
        style={{ backgroundColor: '#FAF6EF' }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ width: '100%' }}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={20} color={colors.textHeading} />
            <Text style={styles.backBtnText}>Back</Text>
          </TouchableOpacity>
        </View>

        <Image 
          source={require('../../../assets/illustration.png')} 
          style={styles.heroIllustration}
          resizeMode="contain"
        />

        <Text style={styles.pageTitle}>Let's scan your mole</Text>
        <Text style={styles.pageSubtitle}>Follow these tips for an accurate AI analysis.</Text>

        {/* Photo Upload Tips (Premium Card) */}
        <View style={styles.tipsCard}>
          <View style={styles.tipItem}>
            <View style={styles.tipIconBg}>
              <Ionicons name="sunny" size={20} color="#FF9800" />
            </View>
            <Text style={styles.tipText}>Ensure good, even lighting</Text>
          </View>
          <View style={styles.tipItem}>
            <View style={styles.tipIconBg}>
              <Ionicons name="scan" size={20} color="#4CAF50" />
            </View>
            <Text style={styles.tipText}>Keep the camera steady and in focus</Text>
          </View>
          <View style={[styles.tipItem, { marginBottom: 0 }]}>
            <View style={styles.tipIconBg}>
              <Ionicons name="eye" size={20} color="#2196F3" />
            </View>
            <Text style={styles.tipText}>Make sure the mole is centered</Text>
          </View>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            activeOpacity={0.85} 
            onPress={async () => {
              const success = await captureImage(true);
              setLastPressed('camera');
              if (success) navigation.navigate('Questionnaire');
            }}
            style={styles.actionBtnWrapper}
          >
            <LinearGradient
              colors={['#FF416C', '#FF4B2B']}
              start={{x:0, y:0}} end={{x:1, y:0}}
              style={styles.actionBtnGradient}
            >
              <Ionicons name="camera" size={24} color="#FFF" />
              <Text style={styles.actionBtnText}>Take a Photo</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            activeOpacity={0.85} 
            onPress={async () => {
              const success = await captureImage(false);
              setLastPressed('gallery');
              if (success) navigation.navigate('Questionnaire');
            }}
            style={styles.secondaryBtnWrapper}
          >
            <View style={styles.secondaryBtnInner}>
              <Ionicons name="image" size={22} color="#4776E6" />
              <Text style={styles.secondaryBtnText}>Upload from Gallery</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={{ marginTop: 'auto', paddingTop: 30, width: '100%' }}>
          <ProgressStepBar currentStepIndex={3} stepSize={5} />
        </View>

      </ScrollView>
    </BaseScreen>
  );
};
const styles = StyleSheet.create({
  backBtn: {
    marginTop: 15,
    marginBottom: 10,
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
  heroIllustration: {
    width: 220,
    height: 220,
    marginTop: 10,
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1D2B64',
    marginBottom: 8,
    textAlign: 'center',
  },
  pageSubtitle: {
    fontSize: 15,
    color: colors.textSub,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  tipsCard: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 30,
    shadowColor: '#4776E6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(71, 118, 230, 0.1)',
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  tipIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FAF6EF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipText: {
    flex: 1,
    fontSize: 15,
    color: colors.textHeading,
    fontWeight: '600',
  },
  actionsContainer: {
    width: '100%',
    gap: 16,
  },
  actionBtnWrapper: {
    width: '100%',
    shadowColor: '#FF416C',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
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
  secondaryBtnWrapper: {
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  secondaryBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 24,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: 'rgba(71, 118, 230, 0.2)',
    gap: 10,
  },
  secondaryBtnText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#4776E6',
  },
});

export default ScanPhotoScreen;
