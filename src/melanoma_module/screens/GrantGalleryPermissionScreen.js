import { View, Text } from 'react-native';
import { useContext } from 'react';
import PermissionsContext from '../context/PermissionsContext';
import { AllowGallery } from '../constants/svg';
import { useGlobalStyle } from '../hooks/useGlobalStyle';
import { PrimaryButton } from '../components/button/PrimaryButton';
import { SecondaryButton } from '../components/button/SecondaryButton';
import { scaleVertical } from '../helpers/scale';
import { BaseScreen } from '../components/common/BaseScreen';
import { ProgressStepBar } from '../components/ProgressStepBar';

const GrantGalleryPermissionScreen = ({ navigation }) => {
  const basicStyles = useGlobalStyle();
  const { grantPermission } = useContext(PermissionsContext);

  return (
    <BaseScreen>
      <View
        style={[
          basicStyles.CENTER_COL,
          { flex: 1, paddingVertical: scaleVertical(30) },
        ]}
      >
        <View
          style={{
            width: '100%',
            height: '70%',
            transform: [{ translateX: 35 }, { translateY: 50 }],
          }}
        >
          <AllowGallery width={'100%'} height={'60%'} />
        </View>
        <Text
          style={[
            basicStyles.FONTPRIMARY,
            { fontSize: 34, textAlign: 'center', marginTop: -130 },
          ]}
        >
          Grant gallery access
        </Text>
        <View
          style={[basicStyles.CENTER_COL, { width: '80%', flex: 1, gap: 70 }]}
        >
          <Text style={[basicStyles.FONT16]}>
            We need an image of your mole. Please grant us the permission to
            access your gallery in order to get the image.
          </Text>
          <View style={{ width: '100%' }}>
            <PrimaryButton
              title={'Grant Access'}
              onPress={async () => {
                await grantPermission(false);
                navigation.navigate('ScanPhoto');
              }}
            />
            <SecondaryButton
              style={{ marginLeft: 12 }}
              title={'Not now'}
              onPress={() => navigation.navigate('ScanPhoto')}
            />
          </View>
        </View>
        <ProgressStepBar stepSize={5} currentStepIndex={2} />
      </View>
    </BaseScreen>
  );
};

export default GrantGalleryPermissionScreen;
