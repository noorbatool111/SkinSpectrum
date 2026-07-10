import { TouchableOpacity, Text, View } from 'react-native';
import PropTypes from 'prop-types';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../constants/color';
import { useGlobalStyle } from '../../hooks/useGlobalStyle';
import { scale, scaleVertical } from '../../helpers/scale';

export const PrimaryButton = ({ title, style, onPress, icon }) => {
  const basicStyles = useGlobalStyle();

  return (
    <TouchableOpacity 
      activeOpacity={0.8}
      style={[
        { 
          width: '100%',
          backgroundColor: colors.primary,
          borderRadius: 30, // Pill shape
          paddingVertical: scaleVertical(16),
          paddingHorizontal: scale(20),
          marginBottom: scale(10),
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }, 
        style
      ]} 
      onPress={onPress}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 }}>
        <Text style={[basicStyles.FONT18, { color: colors.white, fontWeight: '600' }]}>
          {title}
        </Text>
        {icon}
      </View>
    </TouchableOpacity>
  );
};

PrimaryButton.propTypes = {
  title: PropTypes.string.isRequired,
  style: PropTypes.object,
  onPress: PropTypes.func,
  icon: PropTypes.element,
};

PrimaryButton.propTypes = {
  title: PropTypes.string.isRequired,
  style: PropTypes.object,
  onPress: PropTypes.func,
  icon: PropTypes.element,
};
