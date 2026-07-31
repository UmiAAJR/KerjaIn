import { createContext, useContext, useState } from 'react';
import { clientApi } from '../services/api';

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

  const updateLocation = async (lat, lng, name) => {
    const numericLat = Number(lat);
    const numericLng = Number(lng);
    const newLoc = { lat: numericLat, lng: numericLng, name };
    
    setLocationState(newLoc);
    localStorage.setItem('user_location', JSON.stringify(newLoc));

    // Update ki_user in localStorage if logged in
    const cachedUser = localStorage.getItem('ki_user');
    if (cachedUser) {
      try {
        const userObj = JSON.parse(cachedUser);
        userObj.address = name;
        userObj.latitude = numericLat;
        userObj.longitude = numericLng;
        localStorage.setItem('ki_user', JSON.stringify(userObj));
      } catch (err) {
        console.error("Error updating ki_user in localStorage:", err);
      }
    }

    // Sync to backend database if token exists
    if (localStorage.getItem('ki_token')) {
      try {
        await clientApi.updateProfile({
          address: name,
          latitude: numericLat,
          longitude: numericLng
        });
      } catch (err) {
        console.error("Gagal menyinkronkan lokasi ke server database:", err);
      }
    }
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
