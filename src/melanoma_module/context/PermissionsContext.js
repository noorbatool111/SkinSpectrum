import { createContext, useState, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';

let Location = null;
try {
  Location = require('expo-location');
} catch (e) {
  console.log('expo-location not available, location features disabled');
}

const PermissionsContext = createContext();

export const PermissionProvider = ({ children }) => {
  const [lastPressed, setLastPressed] = useState('none');

  const [permissions, setPermissions] = useState({
    camera: false,
    gallery: false,
    location: false
  });

  const checkAllPermissions = useCallback(async () => {
    const cam = await ImagePicker.getCameraPermissionsAsync();
    const gal = await ImagePicker.getMediaLibraryPermissionsAsync();
    const loc = Location ? await Location.getForegroundPermissionsAsync() : { status: 'undetermined' };

    const newPerms = {
      camera: cam.status === 'granted',
      gallery: gal.status === 'granted',
      location: loc.status === 'granted'
    };
    
    setPermissions(newPerms);
    return newPerms;
  }, []);

  const requestPermission = async (type) => {
    let result;
    if (type === 'camera') {
      result = await ImagePicker.requestCameraPermissionsAsync();
    } else if (type === 'gallery') {
      result = await ImagePicker.requestMediaLibraryPermissionsAsync();
    } else if (type === 'location' && Location) {
      result = await Location.requestForegroundPermissionsAsync();
    }

    const granted = result?.status === 'granted';
    setPermissions(prev => ({ ...prev, [type]: granted }));
    return granted;
  };

  // Legacy helper used by GrantCameraPermissionScreen / GrantGalleryPermissionScreen
  const grantPermission = async (isCamera) => {
    return requestPermission(isCamera ? 'camera' : 'gallery');
  };

  return (
    <PermissionsContext.Provider
      value={{
        permissions,
        setPermissions,
        checkAllPermissions,
        requestPermission,
        grantPermission,
        lastPressed,
        setLastPressed,
      }}
    >
      {children}
    </PermissionsContext.Provider>
  );
};

export default PermissionsContext;
