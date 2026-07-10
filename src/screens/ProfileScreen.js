import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Animated,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useUser } from '../context/UserContext';

const ProfileScreen = ({ navigation }) => {
  const { 
    userName, 
    userData, 
    userGender, 
    userAge, 
    skinType, 
    skinConcerns, 
    syncProfileData, 
    signOut 
  } = useUser();

  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(userName);

  const formatLabel = (key) =>
    key ? key.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : 'Not set';

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to log out of SkinSpectrum?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: () => signOut() },
      ]
    );
  };

  const handleSaveName = async () => {
    if (editedName.trim().length < 2) {
      Alert.alert('Invalid Name', 'Name must be at least 2 characters.');
      return;
    }
    await syncProfileData({ name: editedName.trim() });
    setIsEditingName(false);
  };

  const renderProfileItem = (icon, label, value, onPress, iconLib = 'ionicons') => (
    <TouchableOpacity 
      style={styles.profileItem} 
      onPress={onPress} 
      activeOpacity={0.7}
      disabled={!onPress}
    >
      <View style={styles.itemLeft}>
        <View style={styles.iconBox}>
          {iconLib === 'ionicons' ? (
            <Ionicons name={icon} size={20} color="#825A3B" />
          ) : (
            <MaterialCommunityIcons name={icon} size={20} color="#825A3B" />
          )}
        </View>
        <View>
          <Text style={styles.itemLabel}>{label}</Text>
          <Text style={styles.itemValue}>{value}</Text>
        </View>
      </View>
      {onPress && <Ionicons name="chevron-forward" size={18} color="#B5A48E" />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF6EF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#4A2E12" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Account Settings</Text>
        <TouchableOpacity style={styles.logoutBtnSmall} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="#C47B8E" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Card */}
        <LinearGradient
          colors={['#FF7E5F', '#FEB47B']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.profileCardGradient}
        >
          <View style={styles.avatarSection}>
            <View style={styles.avatarLarge}>
              <Text style={styles.avatarLargeText}>
                {userName ? userName.charAt(0).toUpperCase() : 'U'}
              </Text>
            </View>
            <View style={styles.nameEditSection}>
              {isEditingName ? (
                <View style={styles.nameInputContainer}>
                  <TextInput
                    style={styles.nameInput}
                    value={editedName}
                    onChangeText={setEditedName}
                    autoFocus
                    placeholder="Enter name"
                    placeholderTextColor="rgba(255,255,255,0.5)"
                  />
                  <TouchableOpacity onPress={handleSaveName} style={styles.saveAction}>
                    <Ionicons name="checkmark-circle" size={28} color="#FFF" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setIsEditingName(false)}>
                    <Ionicons name="close-circle" size={28} color="rgba(255,255,255,0.8)" />
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  <Text style={styles.profileName}>{userName}</Text>
                  <TouchableOpacity onPress={() => setIsEditingName(true)}>
                    <Ionicons name="create-outline" size={18} color="#FFF" style={{ marginLeft: 8 }} />
                  </TouchableOpacity>
                </>
              )}
            </View>
            <Text style={styles.profileEmail}>{userData?.email}</Text>
          </View>
        </LinearGradient>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          <View style={styles.itemsCard}>
            {renderProfileItem('person-outline', 'Gender', formatLabel(userGender), () => navigation.navigate('Gender'))}
            <View style={styles.divider} />
            {renderProfileItem('calendar-outline', 'Age Range', userAge || 'Not set', () => navigation.navigate('Age'))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skin Profile</Text>
          <View style={styles.itemsCard}>
            {renderProfileItem('water-outline', 'Skin Type', formatLabel(skinType), () => navigation.navigate('SkinType'))}
            <View style={styles.divider} />
            <View style={styles.multiItem}>
              <View style={styles.itemLeft}>
                <View style={styles.iconBox}>
                  <Ionicons name="bandage-outline" size={20} color="#825A3B" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemLabel}>Primary Concerns</Text>
                  <View style={styles.tagContainer}>
                    {skinConcerns && skinConcerns.length > 0 ? (
                      skinConcerns.map((c, i) => (
                        <View key={i} style={styles.tag}>
                          <Text style={styles.tagText}>{formatLabel(c)}</Text>
                        </View>
                      ))
                    ) : (
                      <Text style={styles.itemValue}>None selected</Text>
                    )}
                  </View>
                </View>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('SkinType')}>
                <Ionicons name="chevron-forward" size={18} color="#B5A48E" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Global Actions */}
        <View style={[styles.section, { marginBottom: 40 }]}>
          <TouchableOpacity 
            style={styles.logoutBtnWrapper} 
            onPress={handleLogout}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#FF416C', '#FF4B2B']}
              start={{x:0, y:0}} end={{x:1, y:0}}
              style={styles.logoutFullBtn}
            >
              <Ionicons name="log-out" size={22} color="#FFF" style={{ marginRight: 8 }} />
              <Text style={styles.logoutText}>Logout from Account</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <Text style={styles.versionText}>SkinSpectrum v1.0.0 Alpha</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF6EF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1D2B64',
  },
  logoutBtnSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  profileCardGradient: {
    borderRadius: 24,
    padding: 28,
    marginBottom: 30,
    alignItems: 'center',
    shadowColor: '#FF7E5F',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  avatarSection: {
    alignItems: 'center',
  },
  avatarLarge: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarLargeText: {
    fontSize: 36,
    color: '#FFF',
    fontWeight: '800',
  },
  nameEditSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFF',
  },
  profileEmail: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
  nameInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    paddingRight: 8,
  },
  nameInput: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 150,
  },
  saveAction: {
    marginRight: 4,
  },

  // Sections
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1D2B64',
    marginBottom: 12,
    marginLeft: 4,
  },
  itemsCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  multiItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FAF6EF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  itemLabel: {
    fontSize: 13,
    color: '#8A7A64',
    fontWeight: '600',
    marginBottom: 2,
  },
  itemValue: {
    fontSize: 16,
    color: '#4A2E12',
    fontWeight: '800',
  },
  divider: {
    height: 1,
    backgroundColor: '#F5F5F5',
    marginLeft: 80,
  },

  // Tags
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 8,
  },
  tag: {
    backgroundColor: 'rgba(255, 126, 95, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  tagText: {
    fontSize: 12,
    color: '#FF7E5F',
    fontWeight: '700',
  },

  // Logout
  logoutBtnWrapper: {
    width: '100%',
    shadowColor: '#FF416C',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 20,
  },
  logoutFullBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 24,
  },
  logoutText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
  },
  versionText: {
    textAlign: 'center',
    fontSize: 13,
    color: '#A89E90',
    fontWeight: '600',
  },
});

export default ProfileScreen;
