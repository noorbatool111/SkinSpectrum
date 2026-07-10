import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/color';
import { scale, scaleVertical } from '../helpers/scale';

const Header = () => {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <Image 
          source={require('../../../assets/logo.png')} 
          style={styles.logoImage}
          resizeMode="contain"
        />
        <Text style={styles.logoText}>SkinSpectrum</Text>
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: scaleVertical(60),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(20),
    backgroundColor: 'transparent',
    marginTop: scaleVertical(10),
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoImage: {
    width: 35,
    height: 35,
  },
  logoText: {
    fontSize: 19,
    fontWeight: '800',
    color: colors.textHeading,
    letterSpacing: -0.5,
  },
  right: {
    padding: 5,
  },
});

export default Header;
