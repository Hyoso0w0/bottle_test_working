// App.tsx
import React, { useState } from 'react';
import { SafeAreaView, View, StyleSheet } from 'react-native';
import HomeScreen from './src/screens/HomeScreen';
import NotificationSettingsScreen from './src/screens/NotificationSettingsScreen';
import EditNotificationScreen from './src/screens/EditNotificationScreen';
import MyPageScreen from './src/screens/MyPageScreen';
import PartyScreen from './src/screens/PartyScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import ReportScreen from './src/screens/ReportScreen';
import SettingsScreen from './src/screens/SettingsScreen';

export type Screen =
  | 'home'
  | 'notifications'
  | 'edit-notification'
  | 'mypage'
  | 'party'
  | 'calendar'
  | 'report'
  | 'settings';

export interface EditNotificationData {
  id: number;
  title: string;
  days: string[];
  time: string;
  sound: string;
}

export interface Notification {
  id: number;
  title: string;
  type: string;
  icon: string;
  time: string;
  days: string[];
  enabled: boolean;
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [editingNotification, setEditingNotification] =
    useState<EditNotificationData | null>(null);
  const [cookies, setCookies] = useState<number>(0);

  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      title: '출근 전 플러그 뽑기',
      type: 'time',
      icon: '🔌',
      time: '08:30',
      days: ['월', '화', '수', '목', '금'],
      enabled: true,
    },
    {
      id: 2,
      title: '멀티탭 전원 끄기',
      type: 'time',
      icon: '⚡',
      time: '09:00',
      days: ['월', '화', '수', '목', '금'],
      enabled: true,
    },
    {
      id: 3,
      title: '점심시간 일회용품 거절',
      type: 'time',
      icon: '🍱',
      time: '12:00',
      days: ['월', '화', '수', '목', '금', '토', '일'],
      enabled: false,
    },
    {
      id: 4,
      title: '취침 전 분리수거 체크',
      type: 'time',
      icon: '♻️',
      time: '22:00',
      days: ['일'],
      enabled: true,
    },
  ]);

  const navigateTo = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  const handleEditNotification = (notification: EditNotificationData) => {
    setEditingNotification(notification);
    setCurrentScreen('edit-notification');
  };

  const handleSaveNotification = (updated: EditNotificationData) => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === updated.id
          ? {
              ...n,
              title: updated.title,
              time: updated.time,
              days: updated.days,
            }
          : n,
      ),
    );
    setCurrentScreen('notifications');
  };

  const addCookies = (amount: number) => {
    setCookies(prev => prev + amount);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.phoneFrame}>
        {currentScreen === 'home' && (
          <HomeScreen
            onNavigate={navigateTo}
            notifications={notifications}
            cookies={cookies}
            onAddCookies={addCookies}
          />
        )}

        {currentScreen === 'notifications' && (
          <NotificationSettingsScreen
            onNavigate={navigateTo}
            onEdit={handleEditNotification}
            notifications={notifications}
            setNotifications={setNotifications}
          />
        )}

        {currentScreen === 'edit-notification' && (
          <EditNotificationScreen
            notification={editingNotification}
            onSave={handleSaveNotification}
            onBack={() => setCurrentScreen('notifications')}
          />
        )}

        {currentScreen === 'mypage' && (
          <MyPageScreen onNavigate={navigateTo} />
        )}

        {currentScreen === 'party' && (
          <PartyScreen onNavigate={navigateTo} />
        )}

        {currentScreen === 'calendar' && (
          <CalendarScreen onNavigate={navigateTo} />
        )}

        {currentScreen === 'report' && (
          <ReportScreen onNavigate={navigateTo} />
        )}

        {currentScreen === 'settings' && (
          <SettingsScreen onNavigate={navigateTo} />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#d9f99d', // bg-lime-200 비슷
    alignItems: 'center',
    justifyContent: 'center',
  },
  phoneFrame: {
    width: 390,
    height: 844,
    backgroundColor: '#ffffff',
    borderRadius: 40,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
    overflow: 'hidden',
    paddingBottom: 24, // ← 이 줄만 새로 추가된 거!
  },
});
