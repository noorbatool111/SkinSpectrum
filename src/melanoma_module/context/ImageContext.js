import { createContext, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import PermissionsContext from '../context/PermissionsContext';
import { useContext } from 'react';

const ImageContext = createContext();

export const ImageProvider = ({ children }) => {
  const [image, setImage] = useState('');
  const [imgUri, setImgUri] = useState('');
  const { permissions } = useContext(PermissionsContext);

  const captureImage = async (isCamera) => {
    try {
      console.log('CaptureImage started, isCamera:', isCamera);
      
      const options = {
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      };

      let result;
      if (isCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          alert('Camera access is required to take a photo. Please enable it in your phone settings.');
          return false;
        }
        result = await ImagePicker.launchCameraAsync(options);
      } else {
        // Direct request for gallery (Media Library)
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          alert('Photos/Gallery access is required to upload an image. Please enable "Photos and Videos" permission in your App Settings.');
          return false;
        }
        result = await ImagePicker.launchImageLibraryAsync(options);
      }

      if (result.canceled) {
        console.log('User cancelled image picker');
        return false;
      }

      if (result.assets && result.assets.length > 0) {
        const selectedUri = result.assets[0].uri;
        console.log('Image captured successfully:', selectedUri);
        setImgUri(selectedUri);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error in captureImage:', error);
      alert('Could not open camera/gallery. Please check permissions.');
      return false;
    }
  };

  const sendImage = async (base64Image) => {
    try {
      const formData = new FormData();
      formData.append('photo', { base64: base64Image });

      const res = await axios.post(
        'http://192.168.100.139:8001/predict',
        {
          image: formData,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      // console.log(res);
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  return (
    <ImageContext.Provider
      value={{
        image,
        setImage,
        captureImage,
        imgUri,
        setImgUri,
      }}
    >
      {children}
    </ImageContext.Provider>
  );
};

export default ImageContext;
