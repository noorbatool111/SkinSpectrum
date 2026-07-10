import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../../constants/color';
import { useGlobalStyle } from '../../hooks/useGlobalStyle';
import { scale, scaleVertical } from '../../helpers/scale';
import PropTypes from 'prop-types';

export const SecondaryButton = ({ title, icon, style, onPress }) => {
  const basicStyles = useGlobalStyle();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        {
          paddingHorizontal: scale(20),
          paddingVertical: scaleVertical(16),
          borderRadius: 30, // Pill shape
          borderWidth: 1.5,
          borderColor: colors.primary,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'transparent',
          marginBottom: scale(10),
        },
        style
      ]}
    >
      <View
        style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}
      >
        <Text
          style={[
            basicStyles.FONT18,
            { color: colors.primary, fontWeight: '600' }
          ]}
        >
          {title}
        </Text>
        {icon}
      </View>
    </TouchableOpacity>
  );
};

SecondaryButton.propTypes = {
  title: PropTypes.string.isRequired,
  style: PropTypes.object,
  onPress: PropTypes.func,
  icon: PropTypes.element,
};
