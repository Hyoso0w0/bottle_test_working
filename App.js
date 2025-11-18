// App.js
import React, { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Notifications from 'expo-notifications';
import { ensureLocalNotificationsReady } from './localNotifications';

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

  // 알림 스케줄링 헬퍼 함수
  const scheduleAlarms = async (alarmsList) => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();

      const pad2 = (n) => String(n).padStart(2, '0');
      const as24h = (h12, meridiem) => {
        if (meridiem === 'AM') return h12 % 12;
        return (h12 % 12) + 12;
      };

      for (const alarm of alarmsList) {
        const hour24 = as24h(alarm.hour, alarm.ampm);
        const content = {
          title: '보들보틀 🌱',
          body: alarm.message || `${alarm.ampm} ${pad2(alarm.hour)}:${pad2(alarm.minute)} 알림이에요.`,
          data: { screen: 'Home', alarmId: alarm.id },
        };

        if (alarm.repeatDaily) {
          // 매일 반복: 첫 알림 시간을 명시적으로 미래로 설정
          const now = new Date();
          const todayAtTime = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            hour24,
            alarm.minute,
            0,
            0
          );
          
          // 오늘 시간이 이미 지났다면 내일로 설정 (즉시 알림 방지)
          let firstNotificationTime = todayAtTime;
          if (todayAtTime <= now) {
            // 내일 같은 시간으로 설정
            firstNotificationTime = new Date(todayAtTime.getTime() + 24 * 60 * 60 * 1000);
          }
          
          // 최소 1분 후로 설정 (즉시 알림 완전 방지)
          const minDelay = 60 * 1000; // 1분
          if (firstNotificationTime.getTime() - now.getTime() < minDelay) {
            firstNotificationTime = new Date(now.getTime() + minDelay);
          }
          
          try {
            const notificationId = await Notifications.scheduleNotificationAsync({
              content,
              trigger: { 
                date: firstNotificationTime,
                repeats: true 
              },
            });
            console.log(`알림 스케줄링 완료: ${alarm.ampm} ${pad2(alarm.hour)}:${pad2(alarm.minute)} (첫 알림: ${firstNotificationTime.toLocaleString()}, ID: ${notificationId})`);
          } catch (e) {
            console.warn(`알림 스케줄링 실패: ${alarm.ampm} ${pad2(alarm.hour)}:${pad2(alarm.minute)}`, e);
          }
        } else if (alarm.selectedYMD) {
          const when = new Date(
            alarm.selectedYMD.year,
            alarm.selectedYMD.month,
            alarm.selectedYMD.day,
            hour24,
            alarm.minute,
            0,
            0
          );
          if (when > new Date()) {
            await Notifications.scheduleNotificationAsync({
              content,
              trigger: { date: when },
            });
          }
        }
      }
    } catch (e) {
      console.warn('알림 예약 오류:', e);
    }
  };

  useEffect(() => {
    // 1) 로컬 알림 채널 & 권한 준비
    (async () => {
      await ensureLocalNotificationsReady();
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
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
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
