import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { colors } from '../constants/color';
import { scaleVertical } from '../helpers/scale';

function Footer() {
  return (
    <View style={styles.footerContainer}>
      <Text style={styles.textStyle}>SkinSpectrum © 2026</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  footerContainer: {
    width: '100%',
    paddingVertical: scaleVertical(20),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  textStyle: {
    color: colors.textSub,
    fontSize: 12,
    opacity: 0.6,
  },
});

export default Footer;
