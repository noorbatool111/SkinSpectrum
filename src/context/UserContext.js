import React, { createContext, useState, useContext } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userName, setUserName] = useState('');
  const [userGender, setUserGender] = useState('');
  const [userAge, setUserAge] = useState('');
  const [skinType, setSkinType] = useState('');
  const [skinConcerns, setSkinConcerns] = useState([]);
  const [facialAreas, setFacialAreas] = useState([]);
  const [userChallenges, setUserChallenges] = useState([]);

  return (
    <UserContext.Provider value={{
      userName, setUserName,
      userGender, setUserGender,
      userAge, setUserAge,
      skinType, setSkinType,
      skinConcerns, setSkinConcerns,
      facialAreas, setFacialAreas,
      userChallenges, setUserChallenges,
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export default UserContext;
