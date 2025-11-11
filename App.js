// App.js
import React, { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Notifications from 'expo-notifications';

import HomeScreen from './HomeScreen';
import RecordsScreen from './RecordsScreen';
import NotificationsScreen from './NotificationsScreen';
import CalendarScreen from './CalendarScreen';

// 알림 핸들러 설정 (앱이 foreground일 때 어떻게 보일지)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/** ---------- 네비게이션 ---------- **/
const Stack = createNativeStackNavigator();

export default function App() {
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    // 1) 권한 요청
    (async () => {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        await Notifications.requestPermissionsAsync();
      }
    })();

    // 2) 알림 수신 리스너(앱 열려 있을 때)
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log('알림 도착!', notification);
      });

    // 3) 알림 클릭 리스너
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log('알림 눌렀다!', response);
        // TODO: 여기서 특정 화면으로 이동하고 싶으면
        // navigation ref를 만들어서 navigate 호출 가능
      });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerTitleAlign: 'center',
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: '첫 화면' }} />
        <Stack.Screen name="Records" component={RecordsScreen} options={{ title: '내 기록' }} />
        <Stack.Screen
          name="Notifications"
          component={NotificationsScreen}
          options={{ title: '알림 설정' }}
        />
        <Stack.Screen name="Calendar" component={CalendarScreen} options={{ title: '캘린더' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
