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
        <View style={styles.profileCard}>
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
                  />
                  <TouchableOpacity onPress={handleSaveName} style={styles.saveAction}>
                    <Ionicons name="checkmark-circle" size={28} color="#7B9E6B" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setIsEditingName(false)}>
                    <Ionicons name="close-circle" size={28} color="#C47B8E" />
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  <Text style={styles.profileName}>{userName}</Text>
                  <TouchableOpacity onPress={() => setIsEditingName(true)}>
                    <Ionicons name="create-outline" size={18} color="#825A3B" style={{ marginLeft: 8 }} />
                  </TouchableOpacity>
                </>
              )}
            </View>
            <Text style={styles.profileEmail}>{userData?.email}</Text>
          </View>
        </View>

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
            style={styles.logoutFullBtn} 
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Ionicons name="log-out" size={20} color="#FFF" style={{ marginRight: 8 }} />
            <Text style={styles.logoutText}>Logout from Account</Text>
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(130, 90, 59, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4A2E12',
    fontFamily: 'serif',
  },
  logoutBtnSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  avatarLarge: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#825A3B',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#825A3B',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  avatarLargeText: {
    fontSize: 36,
    color: '#FFF',
    fontWeight: '800',
  },
  nameEditSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  profileName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#4A2E12',
  },
  profileEmail: {
    fontSize: 14,
    color: '#8A7A64',
    fontWeight: '500',
  },
  nameInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF7F2',
    borderRadius: 12,
    paddingRight: 8,
  },
  nameInput: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4A2E12',
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 150,
  },
  saveAction: {
    marginRight: 4,
  },

  // Sections
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#825A3B',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    marginLeft: 4,
  },
  itemsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  multiItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(130, 90, 59, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  itemLabel: {
    fontSize: 12,
    color: '#8A7A64',
    fontWeight: '600',
    marginBottom: 2,
  },
  itemValue: {
    fontSize: 15,
    color: '#4A2E12',
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#FAF6EF',
    marginLeft: 72,
  },

  // Tags
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
    gap: 6,
  },
  tag: {
    backgroundColor: 'rgba(130, 90, 59, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 11,
    color: '#825A3B',
    fontWeight: '700',
  },

  // Logout
  logoutFullBtn: {
    backgroundColor: '#C47B8E',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#C47B8E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  logoutText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#B5A48E',
    fontWeight: '500',
  },
});

export default ProfileScreen;
