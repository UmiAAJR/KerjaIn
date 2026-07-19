/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react';

const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
  const [location, setLocationState] = useState(() => {
    const saved = localStorage.getItem('user_location');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error loading location from localStorage", e);
      }
    }
    return {
      lat: -7.2575,
      lng: 112.7521,
      name: 'Surabaya, Jawa Timur'
    };
  });

  const updateLocation = (lat, lng, name) => {
    const newLoc = { lat, lng, name };
    setLocationState(newLoc);
    localStorage.setItem('user_location', JSON.stringify(newLoc));
  };

  return (
    <LocationContext.Provider value={{ location, updateLocation }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
