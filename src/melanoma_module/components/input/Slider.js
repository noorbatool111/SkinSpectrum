import { View } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { useGlobalStyle } from '../../hooks/useGlobalStyle';
import { useState } from 'react';

const Slider = ({ items, setItems, locVal, setLocVal }) => {
  const [open, setOpen] = useState(false);

  const basicStyles = useGlobalStyle();
  return (
    <View style={{ width: '100%' }}>
      <DropDownPicker
        style={[basicStyles.FONTBLACK, { backgroundColor: 'transparent', borderColor: '#ccc' }]}
        dropDownContainerStyle={{ backgroundColor: 'white', borderColor: '#ccc' }}
        open={open}
        value={locVal}
        items={items}
        setOpen={setOpen}
        setValue={setLocVal}
        setItems={setItems}
        placeholder={'Choose the location of the mole'}
        listMode="MODAL"
        modalProps={{
          animationType: "slide"
        }}
        modalTitle="Select Location"
      />
    </View>
  );
};

export default Slider;
