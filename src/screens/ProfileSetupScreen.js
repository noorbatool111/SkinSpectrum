import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  StatusBar,
  TouchableOpacity,
  Dimensions,
  Image,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useUser } from '../context/UserContext';

const { width } = Dimensions.get('window');
const AVATAR_SIZE = 100;

const ProfileSetupScreen = ({ navigation }) => {
  const {
    userName,
    userGender,
    userAge,
    skinType,
    skinConcerns,
    facialAreas,
    userChallenges,
    syncProfileData,
  } = useUser();

  const [avatarUri, setAvatarUri] = useState(null);

  const headerFade = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-20)).current;
  const cardSlide = useRef(new Animated.Value(60)).current;
  const cardFade = useRef(new Animated.Value(0)).current;
  const avatarScale = useRef(new Animated.Value(0.8)).current;
  const avatarFade = useRef(new Animated.Value(0)).current;

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
        Animated.timing(avatarFade, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(avatarScale, {
          toValue: 1,
          friction: 6,
          tension: 40,
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
    ]).start();
  }, []);

  const displayName = userName || 'Friend';

  const formatLabel = (key) =>
    key
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());

  const profileSummary = [
    {
      icon: 'person-outline',
      lib: 'ionicons',
      label: 'Name',
      value: displayName,
    },
    {
      icon: 'male-female',
      lib: 'ionicons',
      label: 'Gender',
      value: userGender ? formatLabel(userGender) : 'Not set',
    },
    {
      icon: 'calendar-outline',
      lib: 'ionicons',
      label: 'Age Range',
      value: userAge || 'Not set',
    },
    {
      icon: 'water-outline',
      lib: 'ionicons',
      label: 'Skin Type',
      value: skinType ? formatLabel(skinType) : 'Not set',
    },
  ];

  const handleAddPhoto = () => {
    // Placeholder for image picker
    console.log('Open image picker');
  };

  const handleFinish = async () => {
    await syncProfileData({ isOnboardingComplete: true });
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF6EF" />

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
        <Text style={styles.titleSmall}>Almost done!</Text>
        <Text style={styles.title}>Your profile</Text>
      </Animated.View>

      {/* Avatar */}
      <Animated.View
        style={[
          styles.avatarSection,
          {
            opacity: avatarFade,
            transform: [{ scale: avatarScale }],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.avatarWrapper}
          onPress={handleAddPhoto}
          activeOpacity={0.85}
        >
          {avatarUri ? (
            <Image
              source={{ uri: avatarUri }}
              style={styles.avatarImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitial}>
                {displayName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <View style={styles.cameraButton}>
            <Ionicons name="camera" size={16} color="#FFF" />
          </View>
        </TouchableOpacity>
        <Text style={styles.avatarName}>{displayName}</Text>
        <Text style={styles.avatarHint}>Tap to add a photo</Text>
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
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Profile Summary */}
          <Text style={styles.sectionLabel}>Profile Summary</Text>

          {profileSummary.map((item, index) => (
            <View
              key={index}
              style={[
                styles.summaryRow,
                index === profileSummary.length - 1 && { borderBottomWidth: 0 },
              ]}
            >
              <View style={styles.summaryIconBox}>
                <Ionicons name={item.icon} size={18} color="#825A3B" />
              </View>
              <Text style={styles.summaryLabel}>{item.label}</Text>
              <Text style={styles.summaryValue}>{item.value}</Text>
            </View>
          ))}

          {/* Skin Concerns Tags */}
          {skinConcerns && skinConcerns.length > 0 && (
            <View style={styles.tagSection}>
              <Text style={styles.tagTitle}>Skin Concerns</Text>
              <View style={styles.tagGrid}>
                {skinConcerns.map((concern, i) => (
                  <View key={i} style={styles.tag}>
                    <Text style={styles.tagText}>{formatLabel(concern)}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Facial Areas Tags */}
          {facialAreas && facialAreas.length > 0 && (
            <View style={styles.tagSection}>
              <Text style={styles.tagTitle}>Focus Areas</Text>
              <View style={styles.tagGrid}>
                {facialAreas.map((area, i) => (
                  <View key={i} style={[styles.tag, styles.tagAlt]}>
                    <Text style={[styles.tagText, styles.tagTextAlt]}>
                      {formatLabel(area)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Challenges Tags */}
          {userChallenges && userChallenges.length > 0 && (
            <View style={styles.tagSection}>
              <Text style={styles.tagTitle}>Your Challenges</Text>
              <View style={styles.tagGrid}>
                {userChallenges.map((ch, i) => (
                  <View key={i} style={[styles.tag, styles.tagDark]}>
                    <Text style={[styles.tagText, styles.tagTextDark]}>
                      {formatLabel(ch)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </ScrollView>

        {/* Finish Button */}
        <TouchableOpacity
          style={styles.finishButton}
          onPress={handleFinish}
          activeOpacity={0.85}
        >
          <Text style={styles.finishButtonText}>Complete Setup</Text>
          <View style={styles.finishArrow}>
            <Ionicons name="checkmark" size={20} color="#FFF" />
          </View>
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
  decorCircle: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(130, 90, 59, 0.03)',
  },
  decorTop: { top: -60, right: -50 },
  decorBottom: { bottom: 100, left: -80 },

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
    paddingTop: 65,
    paddingBottom: 6,
  },
  titleSmall: {
    fontSize: 14,
    color: '#825A3B',
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    color: '#4A2E12',
    fontFamily: 'serif',
    letterSpacing: 0.5,
  },

  // Avatar
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 10,
  },
  avatarImage: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
  },
  avatarPlaceholder: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: '#825A3B',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#825A3B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 14,
    elevation: 6,
  },
  avatarInitial: {
    fontSize: 40,
    color: '#FFF',
    fontWeight: '700',
    fontFamily: 'serif',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#5C3318',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FAF6EF',
  },
  avatarName: {
    fontSize: 20,
    color: '#4A2E12',
    fontWeight: '700',
  },
  avatarHint: {
    fontSize: 12,
    color: '#B5A48E',
    marginTop: 2,
  },

  // Bottom Card
  bottomCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 22,
    paddingBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 8,
  },
  scrollContent: {
    paddingBottom: 10,
  },

  // Section label
  sectionLabel: {
    fontSize: 16,
    color: '#4A2E12',
    fontWeight: '700',
    marginBottom: 14,
  },

  // Summary rows
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0EBE4',
  },
  summaryIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(130, 90, 59, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  summaryLabel: {
    flex: 1,
    fontSize: 14,
    color: '#8A7A64',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 14,
    color: '#4A2E12',
    fontWeight: '700',
  },

  // Tag sections
  tagSection: {
    marginTop: 18,
  },
  tagTitle: {
    fontSize: 14,
    color: '#4A2E12',
    fontWeight: '700',
    marginBottom: 10,
  },
  tagGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: 'rgba(130, 90, 59, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
  },
  tagText: {
    fontSize: 12,
    color: '#825A3B',
    fontWeight: '600',
  },
  tagAlt: {
    backgroundColor: 'rgba(91, 141, 190, 0.1)',
  },
  tagTextAlt: {
    color: '#5B8DBE',
  },
  tagDark: {
    backgroundColor: '#5C3318',
  },
  tagTextDark: {
    color: '#FFF',
  },

  // Finish button
  finishButton: {
    backgroundColor: '#5C3318',
    width: '100%',
    paddingVertical: 17,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 14,
    shadowColor: '#3A1E0A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  finishButtonText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  finishArrow: {
    marginLeft: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ProfileSetupScreen;
