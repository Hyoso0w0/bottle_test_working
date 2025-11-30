// AppContext.js
import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const AppContext = createContext();

export default function AppProvider ({ children }) {
  const [completedMissions, setCompletedMissions] = useState([]);

  const [stats, setStats] = useState({
    totalWater: 0,
    totalWaste: 0,
    totalCO2: 0,
  });

  const addCompletedMission = (mission) => {
    setCompletedMissions((prev) => [...prev, mission]);

    const water = Number(mission.water || 0);
    const waste = Number(mission.waste || 0);
    const co2 = Number(mission.co2 || 0);

    setStats((prev) => ({
      totalWater: prev.totalWater + water,
      totalWaste: prev.totalWaste + waste,
      totalCO2: prev.totalCO2 + co2,
    }));
  };


  //alarm state

  const [alarms, setAlarms] = useState([]);

  useEffect(() => {
    const loadAlarms = async () => {
      try {
        const stored = await AsyncStorage.getItem("@bottle_alarms");
        if(stored) {
          setAlarms(JSON.parse(stored));
        }
      } catch (err) {
        console.log("Failed to load alarms: ", err);
      }
    };
    loadAlarms();
  }, []);

  useEffect(() => {
    const saveAlarms = async () => {
      try {
        await AsyncStorage.setItem("@bottle_alarms", JSON.stringify(alarms));
      } catch (err) {
        console.log("Failed to save alarms: ", err);
      }
    };
    saveAlarms();
  }, [alarms]);

  //cookies
  const [cookieStats, setCookieStats] = useState({totalCookies: 0,});

  const addCompletedAlarms = (alarm) => {
    setCookieStats((prev) => ({
      totalCookies: prev.totalCookies + 10,
  }));
  };

  useEffect(() => {
    const loadCookies = async () => {
      const stored = await AsyncStorage.getItem("@cookies");
      if (stored) {
        setCookieStats(JSON.parse(stored));
      }
    };
    loadCookies();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem("@cookies", JSON.stringify(cookieStats));
  }, [cookieStats]);


  return (
    <AppContext.Provider 
      value={{ 
        completedMissions, 
        setCompletedMissions, 
        stats, 
        addCompletedMission,
        alarms,
        setAlarms,
        cookieStats,
        addCompletedAlarms,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

