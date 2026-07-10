import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import { useGlobalStyle } from '../../hooks/useGlobalStyle';
import { colors } from '../../constants/color';

const Checkbox = ({ gender, setGender }) => {
  const basicStyles = useGlobalStyle();

  const handleGenderChange = (newGender) => {
    // If clicking the one already selected, keep it selected (Radio Button behavior)
    setGender({ male: newGender === 'male', female: newGender === 'female' });
  };

  return (
    <View>
      <Text style={[basicStyles.FONT16, { fontSize: 18, marginBottom: 15 }]}>
        Choose your gender:
      </Text>
      <View style={{ flexDirection: 'row', gap: 20, marginBottom: 10 }}>
        <View style={styles.row}>
          <BouncyCheckbox
            disableBuiltInState
            isChecked={gender.male}
            onPress={() => handleGenderChange('male')}
            fillColor={colors.primary}
            unfillColor="#FFFFFF"
            iconStyle={{ borderColor: colors.primary }}
          />
          <TouchableOpacity onPress={() => handleGenderChange('male')}>
            <Text style={[basicStyles.FONT16, { fontWeight: gender.male ? '700' : '400', color: 'black' }]}>
              Male
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.row}>
          <BouncyCheckbox
            disableBuiltInState
            isChecked={gender.female}
            onPress={() => handleGenderChange('female')}
            fillColor={colors.primary}
            unfillColor="#FFFFFF"
            iconStyle={{ borderColor: colors.primary }}
          />
          <TouchableOpacity onPress={() => handleGenderChange('female')}>
            <Text style={[basicStyles.FONT16, { fontWeight: gender.female ? '700' : '400', color: 'black' }]}>
              Female
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
});

export default Checkbox;
