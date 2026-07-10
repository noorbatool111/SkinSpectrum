import ImageContext from './ImageContext';
import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import { createContext, useContext, useState } from 'react';
import { API_BASE_URL } from '../constants/api';


const FormContext = createContext();

export const FormProvider = ({ children }) => {
  const { image, imgUri, setImage, setImgUri } = useContext(ImageContext);

  const [age, setAge] = useState();
  const [gender, setGender] = useState({ male: false, female: false });
  const [locVal, setLocVal] = useState(null);
  const [location, setLocation] = useState([
    { label: 'Face', value: 'face' },
    { label: 'Head / Scalp', value: 'head' },
    { label: 'Neck', value: 'neck' },
    { label: 'Chest', value: 'chest' },
    { label: 'Stomach / Abdomen', value: 'stomach' },
    { label: 'Back', value: 'back' },
    { label: 'Arms', value: 'arms' },
    { label: 'Hands', value: 'hands' },
    { label: 'Legs', value: 'legs' },
    { label: 'Feet', value: 'feet' },
    { label: 'Other', value: 'other' },
  ]);
  const [prediction, setPrediction] = useState(null);
  const [confidence, setConfidence] = useState(null);
  const [resultMessage, setResultMessage] = useState(null);
  const [questionnaireScore, setQuestionnaireScore] = useState(null);
  const [uvIndex, setUvIndex] = useState(null);
  const [uvRisk, setUvRisk] = useState(null);
  const [loading, setLoading] = useState(false);


  const sendData = async () => {
    try {
      setLoading(true);
      const formData = new FormData();
      const date = new Date();

      formData.append('location', locVal);

      formData.append('image', {
        uri: imgUri,
        type: 'image/jpeg',
        name: 'userImg.jpg',
      });

      console.log('Sending analysis request to:', `${API_BASE_URL}/analyze-melanoma`);
      console.log('Image URI:', imgUri);
      console.log('Location:', locVal);

      const res = await axios.post(
        `${API_BASE_URL}/analyze-melanoma`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 30000, // 30s timeout
        },
      );

      console.log('Server Response:', res.data);
      if (res.data.status === 'success') {
        setPrediction(res.data.prediction);
        setConfidence(res.data.confidence);
        setResultMessage(res.data.message);
        return true;
      } else if (res.data.status === 'invalid_image') {
        alert(res.data.message);
        return false;
      }
      return false;
    } catch (err) {
      console.log('Error sending data: ', err);
      if (err.response) {
        console.log('Server Error Detail:', err.response.data);
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  const resetData = () => {
    setPrediction(null);
    setConfidence(null);
    setResultMessage(null);
    setQuestionnaireScore(null);
    setImgUri('');
    setAge(undefined);
    setGender({ male: false, female: false });
    setLocVal(null);
  };

  return (
    <FormContext.Provider
      value={{
        age,
        setAge,
        gender,
        setGender,
        location,
        setLocation,
        sendData,
        resetData,
        locVal,
        setLocVal,
        prediction,
        confidence,
        resultMessage,
        questionnaireScore,
        setQuestionnaireScore,
        uvIndex,
        setUvIndex,
        uvRisk,
        setUvRisk,
        loading
      }}
    >

      {children}
    </FormContext.Provider>
  );
};

export default FormContext;
