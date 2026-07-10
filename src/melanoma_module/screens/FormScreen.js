import { View, Text, Image, ScrollView } from 'react-native';
import { BaseScreen } from '../components/common/BaseScreen';
import { useContext, useState } from 'react';
import PermissionsContext from '../context/PermissionsContext';
import ImageContext from '../context/ImageContext';
import FormContext from '../context/FormContext';

import { PrimaryButton } from '../components/button/PrimaryButton';
import { SecondaryButton } from '../components/button/SecondaryButton';
import { Ionicons } from '@expo/vector-icons';
import { useGlobalStyle } from '../hooks/useGlobalStyle';
import { scaleImage } from '../helpers/scale';
import { colors } from '../constants/color';

import Input from '../components/input/Input';
import LocationGrid from '../components/input/LocationGrid';

const FormScreen = ({ navigation }) => {
  const basicStyles = useGlobalStyle();
  const { lastPressed, setLastPressed } = useContext(PermissionsContext);
  const { imgUri, image } = useContext(ImageContext);
  const { location, setLocation, 
  sendData, locVal, setLocVal, loading } =
    useContext(FormContext);

  console.log(lastPressed);

  const { width: scaledWidth, height: scaledHeight } = scaleImage(
    100,
    100,
    340,
  );

  return (
    <BaseScreen>
      <ScrollView showsVerticalScrollIndicator={false} style={{ margin: 4 }}>
        <Image
          style={{
            width: scaledWidth,
            height: scaledHeight,
            backgroundColor: 'black',
            marginTop: 20,
            marginBottom: 20,
            borderRadius: 20,
          }}
          source={{ uri: imgUri }}
        />
        <View>
          <Text
            style={[
              basicStyles.FONTPRIMARY,
              basicStyles.FONT28,
              { marginBottom: 10 },
            ]}
          >
            Almost there!
          </Text>
          <View style={{ display: 'flex' }}>
            <LocationGrid
              items={location} 
              locVal={locVal} 
              setLocVal={setLocVal} 
            />
            
            <PrimaryButton
              title={loading ? 'Analyzing...' : 'Analyze'}
              onPress={async () => {
                if (loading) return;
                if (!locVal) {
                  alert("Please select the mole location first.");
                  return;
                }
                const success = await sendData();
                if (success) {
                  navigation.navigate('Diagnosis');
                } else {
                  alert("Analysis failed. Returning to scan screen.");
                  navigation.navigate('ScanPhoto');
                }
              }}
            />
          </View>
        </View>
        
        <View style={{ marginTop: 25, width: '100%', marginBottom: 30 }}>
          <Text style={[basicStyles.FONTPRIMARY, basicStyles.FONT14, { color: colors.textSub, textAlign: 'center' }]}>
            *Selecting the correct body part helps our AI model give more accurate results.
          </Text>
        </View>
      </ScrollView>
    </BaseScreen>
  );
};

export default FormScreen;