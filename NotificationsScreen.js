import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, TextInput, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Notifications from 'expo-notifications';
import WeekDaySelect from './WeekDaySelect';
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { AppContext } from "./AppContext";

const getNextTriggerDate = (hour, minute, ampm) => {
  const h24 = ampm === "PM" ? (hour % 12) + 12 : hour % 12;

  const now = new Date();
  const next = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    h24,
    minute,
    0,
    0
  );

  // 이미 지났으면 다음날
  if (next <= now) {
    next.setDate(next.getDate() + 1);
  }

  return next;
};

const scheduleDailyAlarm = async (alarm) => {
  const nextTime = getNextTriggerDate(
    alarm.hour,
    alarm.minute,
    alarm.ampm
  );

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: "보들보틀 🌱",
      body: alarm.message,
      data: { alarmId: alarm.id },
    },
    trigger:  { type: 'date', date: nextTime },  // 🔥 repeats 없음 → 즉시 발송 방지 핵심
  });

  return notificationId;
};
const scheduleOneTimeAlarm = async (alarm) => {
  const { year, month, day } = alarm.selectedYMD;
  const h24 = alarm.ampm === "PM" ? (alarm.hour % 12) + 12 : alarm.hour % 12;

  const date = new Date(year, month, day, h24, alarm.minute, 0, 0);
  const now = new Date();

  if (date <= now) return null;

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: "보들보틀 🌱",
      body: alarm.message,
      data: { alarmId: alarm.id },
    },
    trigger: {
      type: 'date',
      date: date,
    },
  });

  return notificationId;
};

const scheduleWeeklyAlarm = async (alarm) => {
  const notificationIds = [];

  const now = new Date();

  for (const dayOfWeek of alarm.repeatDays) {
    let next = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      alarm.ampm === 'PM' ? (alarm.hour % 12) + 12 : alarm.hour % 12,
      alarm.minute,
      0,
      0
    );

    // Move to the correct day of the week
    const deltaDays = (dayOfWeek + 7 - next.getDay()) % 7;
    if (deltaDays === 0 && next <= now) next.setDate(next.getDate() + 7);
    else next.setDate(next.getDate() + deltaDays);

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: '보들보틀 🌱',
        body: alarm.message,
        data: { alarmId: alarm.id },
      },
      trigger: {
        type: 'weekly',
        weekday: dayOfWeek + 1, // 1=Sun, 2=Mon, ... 7=Sat
        hour: alarm.ampm === 'PM' ? (alarm.hour % 12) + 12 : alarm.hour % 12,
        minute: alarm.minute,
      },
    });

    notificationIds.push(id);
  }

  return notificationIds;
};


// AsyncStorage 안전하게 import
let AsyncStorage;
try {
  const AsyncStorageModule = require('@react-native-async-storage/async-storage');
  AsyncStorage = AsyncStorageModule.default || AsyncStorageModule;
  // null 체크
  if (!AsyncStorage || AsyncStorage === null) {
    throw new Error('AsyncStorage is null');
  }
} catch (e) {
  console.warn('AsyncStorage를 로드할 수 없습니다:', e);
  // 폴백: 메모리 저장소 (앱 재시작 시 데이터는 사라짐)
  const memoryStorage = {};
  AsyncStorage = {
    _storage: memoryStorage,
    async getItem(key) {
      return this._storage[key] || null;
    },
    async setItem(key, value) {
      this._storage[key] = value;
    },
    async removeItem(key) {
      delete this._storage[key];
    },
  };
}

const NotificationsScreen = ({ navigation }) => {
  // 알림 목록 관리
  const [alarms, setAlarms] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);

   // 🔥🔥🔥 여기 아래 넣으면 정확하게 맞음
  useEffect(() => {
    (async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      console.log("알림 권한 상태:", status);

      // Android는 알림 채널도 필요
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.HIGH,
        });
      }
    })();
  }, []);
  // 🔥🔥🔥 여기까지
  
  // 초기 AM/PM 기준 시간 설정
  const now = new Date();
  const init24 = now.getHours();
  const init12 = ((init24 % 12) || 12);
  const initAmPm = init24 >= 12 ? 'PM' : 'AM';

  // 시간 설정 상태 (추가/수정 모드에서 사용)
  const [hour, setHour] = useState(init12);
  const [minute, setMinute] = useState(now.getMinutes());
  const [ampm, setAmPm] = useState(initAmPm);
  const [message, setMessage] = useState('작은 한 걸음, 지금 시작해요!');
  const [repeatDaily, setRepeatDaily] = useState(true);
  const [selectedYMD, setSelectedYMD] = useState({
    year: now.getFullYear(),
    month: now.getMonth(),
    day: now.getDate(),
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [repeatDays, setRepeatDays] = useState([]);

  // AsyncStorage 키
  const STORAGE_KEY = '@bottle_alarms';

  // AsyncStorage null 체크 헬퍼
  const isAsyncStorageAvailable = () => {
    return AsyncStorage !== null && AsyncStorage !== undefined;
  };

  // 알림 목록 저장
  const saveAlarmsToStorage = async (alarmsList) => {
    try {
      if (!isAsyncStorageAvailable()) {
        console.warn('AsyncStorage를 사용할 수 없습니다.');
        return;
      }
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(alarmsList));
    } catch (e) {
      console.warn('알림 저장 오류:', e);
    }
  };

  const pad2 = (n) => String(n).padStart(2, '0');
  const as24h = (h12, meridiem) => {
    if (meridiem === 'AM') return h12 % 12;
    return (h12 % 12) + 12;
  };

  const applyAllSchedulesSafely = async (alarmsList) => {
  await Notifications.cancelAllScheduledNotificationsAsync();

  for (const alarm of alarmsList) {
    if (alarm.repeatDaily) {
      await scheduleDailyAlarm(alarm);
    } else if (alarm.repeatDays?.length) {
      await scheduleWeeklyAlarm(alarm);
    } else {
      await scheduleOneTimeAlarm(alarm);
    }
  }
};


  // 모든 알림 스케줄링 (앱 시작 시 사용)
  const applyAllSchedules = applyAllSchedulesSafely;

  // 저장된 알림 불러오기 (스케줄링은 하지 않음 - 이미 스케줄링되어 있음)
  const loadAlarms = async () => {
    try {
      if (!isAsyncStorageAvailable()) {
        console.warn('AsyncStorage를 사용할 수 없습니다.');
        return;
      }
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedAlarms = JSON.parse(stored);
        setAlarms(parsedAlarms);
        // 스케줄링은 하지 않음 - 알림은 이미 시스템에 등록되어 있음
        // 저장/수정/삭제 시에만 스케줄링을 업데이트함
      }
    } catch (e) {
      console.warn('알림 불러오기 오류:', e);
    }
  };

  // 저장된 알림 불러오기 (화면 진입 시 - 스케줄링 안 함)
  useEffect(() => {
    loadAlarms();
    // 화면 진입 시에는 스케줄링하지 않음 (알림 발송 안 함)
  }, []);

  // 12시간/60분 기본 목록
  const hours12 = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), []);
  const minutes60 = useMemo(() => Array.from({ length: 60 }, (_, i) => i), []);

  // 무한 스크롤 느낌을 위한 반복 블록
  const REPEAT = 5;
  const hoursLoop = useMemo(() => Array.from({ length: REPEAT }).flatMap(() => hours12), [hours12]);
  const minutesLoop = useMemo(() => Array.from({ length: REPEAT }).flatMap(() => minutes60), [minutes60]);
  const MID_BLOCK = Math.floor(REPEAT / 2);

  const H_ITEM_H = 40;
  const M_ITEM_H = 40;
  const VISIBLE_ROWS = 5;
  const WHEEL_H = VISIBLE_ROWS * H_ITEM_H;

  const hourRef = useRef(null);
  const minuteRef = useRef(null);
  const [hourLoopIndex, setHourLoopIndex] = useState(0);
  const [minuteLoopIndex, setMinuteLoopIndex] = useState(0);

  // 수정 모드일 때 기존 알림 값으로 초기화
  useEffect(() => {
    if (editingId !== null) {
      const alarm = alarms.find(a => a.id === editingId);
      if (alarm) {
        setHour(alarm.hour);
        setMinute(alarm.minute);
        setAmPm(alarm.ampm);
        setMessage(alarm.message || '작은 한 걸음, 지금 시작해요!');
        setRepeatDaily(alarm.repeatDaily);
        if (alarm.selectedYMD) {
          setSelectedYMD(alarm.selectedYMD);
        }
      }
    } else if (isAdding) {
      // 새로 추가할 때는 현재 시간으로 초기화
      const now = new Date();
      const init24 = now.getHours();
      const init12 = ((init24 % 12) || 12);
      const initAmPm = init24 >= 12 ? 'PM' : 'AM';
      setHour(init12);
      setMinute(now.getMinutes());
      setAmPm(initAmPm);
      setMessage('작은 한 걸음, 지금 시작해요!');
      setRepeatDaily(true);
      setSelectedYMD({
        year: now.getFullYear(),
        month: now.getMonth(),
        day: now.getDate(),
      });
    }
  }, [editingId, isAdding, alarms]);

  // 가운데 블록 기준 초기 위치
  const startHourIndex = MID_BLOCK * hours12.length + (hour - 1);
  const startMinuteIndex = MID_BLOCK * minutes60.length + minute;

  // 초기 위치로 스크롤 (시간 변경 시)
 // Track whether initial scroll has been applied
const hasScrolledToInitial = useRef(false);

useEffect(() => {
  if ((isAdding || editingId !== null) && !hasScrolledToInitial.current) {
    setTimeout(() => {
      hourRef.current?.scrollTo({ y: startHourIndex * H_ITEM_H, animated: false });
      minuteRef.current?.scrollTo({ y: startMinuteIndex * M_ITEM_H, animated: false });
      setHourLoopIndex(startHourIndex);
      setMinuteLoopIndex(startMinuteIndex);
      hasScrolledToInitial.current = true;
    }, 100);
  }
}, [isAdding, editingId]);


  const snapToNearest = (y, itemH) => Math.round(y / itemH);

  const ensureMiddleBlock = (idx, baseLen, totalLen) => {
    const within = ((idx % baseLen) + baseLen) % baseLen;
    const nearEdge = idx <= baseLen || idx >= totalLen - baseLen;
    const middleIdx = MID_BLOCK * baseLen + within;
    return { within, nearEdge, middleIdx };
  };

  const isScrollingProgrammatically = useRef(false);

  const onHourScrollEnd = (e) => {
    if (isScrollingProgrammatically.current) {
      isScrollingProgrammatically.current = false;
      return;
    }
    const y = e.nativeEvent.contentOffset.y;
    let idx = snapToNearest(y, H_ITEM_H);

    const baseLen = hours12.length;
    const totalLen = hoursLoop.length;
    const { within, nearEdge, middleIdx } = ensureMiddleBlock(idx, baseLen, totalLen);
    const val = within + 1;
    setHour(val);
    setHourLoopIndex(nearEdge ? middleIdx : idx);

    if (nearEdge) {
      isScrollingProgrammatically.current = true;
      
        hourRef.current?.scrollTo({ y: middleIdx * H_ITEM_H, animated: false });
      
      return;
    }
    hourRef.current?.scrollTo({ y: idx * H_ITEM_H, animated: true });
  };

  const onMinuteScrollEnd = (e) => {
    if (isScrollingProgrammatically.current) {
      isScrollingProgrammatically.current = false;
      return;
    }
    const y = e.nativeEvent.contentOffset.y;
    let idx = snapToNearest(y, M_ITEM_H);

    const baseLen = minutes60.length;
    const totalLen = minutesLoop.length;
    const { within, nearEdge, middleIdx } = ensureMiddleBlock(idx, baseLen, totalLen);
    const val = within;
    setMinute(val);
    setMinuteLoopIndex(nearEdge ? middleIdx : idx);

    if (nearEdge) {
      isScrollingProgrammatically.current = true;
      
        minuteRef.current?.scrollTo({ y: middleIdx * M_ITEM_H, animated: false });
      
      return;
    }
    minuteRef.current?.scrollTo({ y: idx * M_ITEM_H, animated: true });
  };

  const toggleAmPm = (next) => setAmPm(next);

  //알람 on/off 버튼
  const toggleAlarm = async (id) => {
  const updated = alarms.map(a =>
    a.id === id ? { ...a, enabled: !a.enabled } : a
  );

  setAlarms(updated);
  await saveAlarmsToStorage(updated);

  // 🔥 If toggled ON → schedule it  
  //    If toggled OFF → cancel & reschedule only enabled alarms
  await Notifications.cancelAllScheduledNotificationsAsync();

  for (const alarm of updated) {
    if (alarm.enabled) {
      if (alarm.repeatDaily) {
        await scheduleDailyAlarm(alarm);
      } else {
        await scheduleOneTimeAlarm(alarm);
      }
    }
  }
};


  // 알림 저장
  const saveAlarm = async () => {
    // 시간 데이터 명시적으로 저장 (hour, minute, ampm)
    const newAlarm = {
      id: editingId || Date.now().toString(),
      hour: hour,        // 시 (1-12)
      minute: minute,    // 분 (0-59)
      ampm: ampm,        // AM/PM
      message: message || '작은 한 걸음, 지금 시작해요!',
      repeatDays: repeatDays || [],          // array of weekdays 0-6 (Sun-Sat)
      repeatDaily: repeatDays?.length === 7, // true if all days
      selectedYMD: repeatDaily ? null : { ...selectedYMD },
      enabled: editingId ? alarms.find(a => a.id === editingId)?.enabled : true,
      completedDates: editingId ? alarms.find(a => a.id === editingId)?.completedDates || [] : [],  // ← NEW FIELD
    };

    // 저장할 시간 데이터 확인 로그
    console.log('========================================');
    console.log('[알림 저장] 저장 시작');
    console.log(`  - 지정한 시간: ${ampm} ${pad2(hour)}:${pad2(minute)}`);
    console.log(`  - 저장할 데이터: hour=${hour}, minute=${minute}, ampm=${ampm}`);
    console.log(`  - 매일반복: ${repeatDaily}`);
    console.log(`  - ID: ${newAlarm.id}`);
    
    let updatedAlarms;
    if (editingId) {
      updatedAlarms = alarms.map(a => a.id === editingId ? newAlarm : a);
      setAlarms(updatedAlarms);
      setEditingId(null);
    } else {
      updatedAlarms = [...alarms, newAlarm];
      setAlarms(updatedAlarms);
      setIsAdding(false);
    }

    // 저장된 알림 데이터 검증
    const savedAlarm = updatedAlarms.find(a => a.id === newAlarm.id);
    if (savedAlarm) {
      console.log(`  - 저장된 데이터 확인: hour=${savedAlarm.hour}, minute=${savedAlarm.minute}, ampm=${savedAlarm.ampm}`);
      if (savedAlarm.hour === hour && savedAlarm.minute === minute && savedAlarm.ampm === ampm) {
        console.log(`  ✓ 저장 성공: 지정한 시간이 정확히 저장되었습니다`);
      } else {
        console.warn(`  ✗ 저장 실패: 지정한 시간과 저장된 시간이 일치하지 않습니다!`);
        console.warn(`    지정한 시간: ${ampm} ${pad2(hour)}:${pad2(minute)}`);
        console.warn(`    저장된 시간: ${savedAlarm.ampm} ${pad2(savedAlarm.hour)}:${pad2(savedAlarm.minute)}`);
      }
    }

    // AsyncStorage에 저장 (시간 데이터 포함)
    await saveAlarmsToStorage(updatedAlarms);
    console.log(`  - AsyncStorage 저장 완료: 총 ${updatedAlarms.length}개`);
    console.log('========================================');
    
    // 저장 후 모든 알림을 다시 스케줄링 (중복 방지를 위해 모든 알림 취소 후 재스케줄링)
    // 각 알림은 설정한 시간에 정확히 1개씩만 발송됨
    // 예: 1시 3분에 저장하고 알림 설정에서 1시 30분을 선택했으면 → 매일 1시 30분에 발송
    console.log('저장된 알림 스케줄링 시작...');
    await applyAllSchedulesSafely(updatedAlarms);
    console.log('저장된 알림 스케줄링 완료');
  };

  // 취소
  const cancelEdit = () => {
    setIsAdding(false);
    setEditingId(null);
  };

  // 알림 삭제
  const deleteAlarm = async (id) => {
    const newAlarms = alarms.filter(a => a.id !== id);
    setAlarms(newAlarms);
    // AsyncStorage에 저장
    await saveAlarmsToStorage(newAlarms);
    
    // 삭제 시에는 스케줄링하지 않음 (즉시 알림 완전 방지)
    // 설정한 시간에 알림이 오려면 앱을 재시작해야 함
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (e) {
      console.warn('알림 삭제 오류:', e);
    }
  };


  const clearAllSchedules = async () => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      setAlarms([]);
      // AsyncStorage에서도 삭제
      if (isAsyncStorageAvailable()) {
        await AsyncStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {
      console.warn('알림 해제 오류:', e);
    }
  };

  // 알림이 없고 추가 모드도 아닐 때
  if (alarms.length === 0 && !isAdding) {
  return (
    <View style={{flex: 1}}>
      <ScrollView contentContainerStyle={styles.screenContainer}>
        <Text style={styles.title}>알림 시간 설정</Text>
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>저장된 알림이 없습니다</Text>
            <TouchableOpacity
              style={[styles.btn, styles.btnPrimary]}
              onPress={() => setIsAdding(true)}
            >
              <Text style={styles.btnPrimaryText}>알림 추가하기</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
        {/* Bottom Navigation */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Notifications')}
            style={styles.bottomButton}
          >
            <Feather name="bell" size={22} color="#666" />
            <Text style={styles.bottomLabel}>알림</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Home')}
            style={styles.bottomHome}
          >
            <Feather name="home" size={26} color="#4CAF50" />
            <Text style={[styles.bottomLabel, { color: '#4CAF50'}]}>홈</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Records')}
            style={styles.bottomButton}
          >
            <Feather name="user" size={22} color="#666" />
            <Text style={styles.bottomLabel}>마이</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // 추가/수정 모드
  if (isAdding || editingId !== null) {
    return (
      <ScrollView contentContainerStyle={styles.screenContainer}>
        <Text style={styles.title}>
          {editingId ? '알림 수정' : '알림 추가'}
        </Text>

      <View style={styles.card}>
          <Text style={styles.cardHeader}>알림 설정</Text>

        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder="알림 내용 입력"
          style={styles.input}
          maxLength={80}
        />
        <View style={{ height: 8 }} />

          {/* 반복 방식 토글 */}
          <WeekDaySelect repeatDays={repeatDays} setRepeatDays={setRepeatDays} />
          <View style={styles.rowBetween}>
            <TouchableOpacity
              onPress={() => setRepeatDaily(true)}
              style={[styles.switchBtn, repeatDaily && styles.switchBtnActive]}
            >
              <Text style={[styles.switchText, repeatDaily && styles.switchTextActive]}>매일 반복</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setRepeatDaily(false)}
              style={[styles.switchBtn, !repeatDaily && styles.switchBtnActive]}
            >
              <Text style={[styles.switchText, !repeatDaily && styles.switchTextActive]}>특정 날짜</Text>
            </TouchableOpacity>
          </View>
          {!repeatDaily && (
            <View style={{ marginTop: 8 }}>
              <TouchableOpacity
                style={[styles.btn, styles.btnOutline]}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.btnOutlineText}>
                  {selectedYMD.year}-{pad2(selectedYMD.month + 1)}-{pad2(selectedYMD.day)} 날짜 선택
                </Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={new Date(selectedYMD.year, selectedYMD.month, selectedYMD.day)}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'inline' : 'calendar'}
                  onChange={(event, date) => {
                    if (Platform.OS !== 'ios') setShowDatePicker(false);
                    if (date) {
                      setSelectedYMD({
                        year: date.getFullYear(),
                        month: date.getMonth(),
                        day: date.getDate(),
                      });
                    }
                  }}
                  style={{ alignSelf: 'stretch' }}
                />
              )}
            </View>
          )}

          <View style={[styles.wheelContainer, { height: WHEEL_H }]}>
            {/* AM/PM 토글 */}
            <View style={styles.ampmCol}>
              <TouchableOpacity
                onPress={() => toggleAmPm('AM')}
                style={[styles.ampmBtn, ampm === 'AM' && styles.ampmBtnActive]}
              >
                <Text style={[styles.ampmText, ampm === 'AM' && styles.ampmTextActive]}>AM</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => toggleAmPm('PM')}
                style={[styles.ampmBtn, ampm === 'PM' && styles.ampmBtnActive]}
              >
                <Text style={[styles.ampmText, ampm === 'PM' && styles.ampmTextActive]}>PM</Text>
              </TouchableOpacity>
            </View>

            {/* 시 */}
          <View style={styles.wheel}>
            <ScrollView
              ref={hourRef}
              showsVerticalScrollIndicator={false}
              onMomentumScrollEnd={onHourScrollEnd}
              snapToInterval={H_ITEM_H}
              decelerationRate="fast"
            >
                <View style={{ height: 2 * H_ITEM_H }} />
                {hoursLoop.map((h, i) => (
                  <View key={`h-${i}`} style={[styles.wheelItem, { height: H_ITEM_H }]}>
                    <Text style={i === hourLoopIndex ? styles.wheelTextActive : styles.wheelText}>
                      {pad2(h)}
                    </Text>
                </View>
              ))}
                <View style={{ height: 2 * H_ITEM_H }} />
            </ScrollView>
          </View>

          <Text style={styles.wheelColon}>:</Text>

            {/* 분 */}
          <View style={styles.wheel}>
            <ScrollView
              ref={minuteRef}
              showsVerticalScrollIndicator={false}
              onMomentumScrollEnd={onMinuteScrollEnd}
              snapToInterval={M_ITEM_H}
              decelerationRate="fast"
            >
                <View style={{ height: 2 * M_ITEM_H }} />
                {minutesLoop.map((m, i) => (
                  <View key={`m-${i}`} style={[styles.wheelItem, { height: M_ITEM_H }]}>
                    <Text style={i === minuteLoopIndex ? styles.wheelTextActive : styles.wheelText}>
                      {pad2(m)}
                    </Text>
                </View>
              ))}
                <View style={{ height: 2 * M_ITEM_H }} />
            </ScrollView>
            </View>

            <View pointerEvents="none" style={styles.selectorBar} />
          </View>
        <View style={styles.iosPreviewContainer}>
          <Text style={styles.previewSectionLabel}>🔔 미리보기</Text>
            <View style={styles.iosNotificationCard}>
              <View style={styles.iosRow}>
                <Text style={styles.iosAppName}>보들보틀</Text>
                <Text style={styles.iosAppName}>🌱</Text>
                <Text style={styles.iosTimestamp}>지금</Text>
              </View>
              <Text style={styles.iosMessage} numberOfLines={2}>
                {message || '알림 내용이 여기에 표시됩니다.'}
              </Text>
            </View>
        </View>
        <View style={{ height: 12 }} />
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity
              style={[styles.btn, styles.btnOutline, { flex: 1 }]}
              onPress={cancelEdit}
          >
              <Text style={styles.btnOutlineText}>취소</Text>
          </TouchableOpacity>
          <View style={{ width: 8 }} />
            <TouchableOpacity
              style={[styles.btn, styles.btnPrimary, { flex: 1 }]}
              onPress={saveAlarm}
            >
              <Text style={styles.btnPrimaryText}>저장</Text>
          </TouchableOpacity>
          </View>
          <View style={{ height: 8 }} />
          <Text style={styles.notifyHint}>
            {repeatDaily
              ? `매일 ${ampm} ${pad2(hour)}:${pad2(minute)}에 알림이 전송됩니다.`
              : selectedYMD
               ? `${selectedYMD.year}-${pad2(selectedYMD.month + 1)}-${pad2(selectedYMD.day)} ${ampm} ${pad2(hour)}:${pad2(minute)}에 한 번 전송됩니다.`
                : repeatDays?.length
                 ? `매주 ${repeatDays.map(d => ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d]).join(', ')} 반복`
                  : '한 번 반복'
              }
          </Text>
        </View>
      </ScrollView>
    );
  }

  // 저장된 알림 목록 표시
  return (
    <View style={{flex: 1}}>
      <ScrollView contentContainerStyle={styles.screenContainer}>
      <View style={styles.card}>
        <Text style={styles.cardHeader}>🔔 알림 시간 설정</Text>
        <TouchableOpacity
              style={[styles.btn, styles.btnPrimary]}
              onPress={() => setIsAdding(true)}
            >
              <Text style={styles.btnPrimaryText}>+ 추가</Text>
            </TouchableOpacity>
      </View>

        <View style={styles.card}>
          <View style={styles.listHeader}>
            <Text style={styles.cardHeader}>저장된 알림 ({alarms.length}개)</Text>
          </View>

          {alarms.map((alarm) => (
            <View key={alarm.id} style={styles.alarmItem}>
              <View style={styles.alarmInfo}>
                {alarm.message && (
                  <Text style={styles.alarmMessage}>{alarm.message}</Text>
                )}
                
                <Text style={styles.alarmDesc}>
                  {alarm.repeatDaily
                    ? '매일 반복'
                    : alarm.selectedYMD
                      ? `${alarm.selectedYMD.year}-${pad2(alarm.selectedYMD.month + 1)}-${pad2(alarm.selectedYMD.day)} 한 번`
                      : alarm.repeatDays?.length
                        ? `매주 ${alarm.repeatDays.map(d => ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d]).join(', ')} 반복`
                        : '한 번 반복'}
                </Text>

                <Text style={styles.alarmTime}>
                  {alarm.ampm} {pad2(alarm.hour)}:{pad2(alarm.minute)}
                </Text>
              </View>
              <View style={styles.alarmActions}>
                <TouchableOpacity
                  style={[styles.btn, styles.btnGhost]}
                  onPress={() => setEditingId(alarm.id)}
                >
                  <Text style={styles.btnGhostText}>수정</Text>
                </TouchableOpacity>
                {/* 🔥 NEW: Toggle switch */}
                <TouchableOpacity
                  onPress={() => toggleAlarm(alarm.id)}
                  style={[
                    styles.toggle,
                    alarm.enabled ? styles.toggleOn : styles.toggleOff
                  ]}
                >
                  <View
                    style={[
                      styles.toggleCircle,
                      alarm.enabled ? styles.toggleCircleOn : styles.toggleCircleOff
                    ]}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.btnDelete}
                  onPress={() => deleteAlarm(alarm.id)}
                >
                  <Text style={styles.btnDeleteText}>❌</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}

          <View style={{ height: 12 }} />
          <View style={{ height: 8 }} />
          <TouchableOpacity
            style={[styles.btn, styles.btnOutline]}
            onPress={clearAllSchedules}
          >
            <Text style={styles.btnOutlineText}>모두 해제</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      {/* Bottom Navigation */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Notifications')}
            style={styles.bottomButton}
          >
            <Feather name="bell" size={22} color="#4CAF50" />
            <Text style={[styles.bottomLabel, { color: '#4CAF50'}]}>알림</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Home')}
            style={styles.bottomHome}
          >
            <Feather name="home" size={26} color="#666" />
            <Text style={styles.bottomLabel}>홈</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Records')}
            style={styles.bottomButton}
          >
            <Feather name="user" size={22} color="#666" />
            <Text style={styles.bottomLabel}>마이</Text>
          </TouchableOpacity>
        </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: '#f7faf3',
    minHeight: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 16,
  },
  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    marginBottom: 16,
    borderColor: '#e5e7eb',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderColor: '#e5e7eb',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  cardHeader: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  alarmItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  alarmInfo: {
    flex: 1,
  },
  alarmTime: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4,
  },
  alarmDesc: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  alarmMessage: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginTop: 4,
  },
  alarmActions: {
    flexDirection: 'row',
    gap: 8,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  switchBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  switchBtnActive: {
    backgroundColor: '#3c8c4c',
    borderColor: '#3c8c4c',
  },
  switchText: {
    color: '#111827',
    fontWeight: '700',
  },
  switchTextActive: {
    color: '#fff',
  },
  btn: {
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimary: {
    backgroundColor: '#3c8c4c',
  },
  btnPrimaryText: {
    color: '#fff',
    fontWeight: '700',
  },
  btnSecondary: {
    backgroundColor: '#2563eb22',
    borderWidth: 1,
    borderColor: '#2563eb66',
  },
  btnSecondaryText: {
    color: '#1f2937',
    fontWeight: '700',
  },
  btnGhost: {
    backgroundColor: 'transparent',
  },
  btnGhostText: {
    color: '#4b5563',
    fontWeight: '600',
  },
  btnOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  btnOutlineText: {
    color: '#111827',
    fontWeight: '700',
  },
  btnDelete: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffe1e7ff',
    borderWidth: 1,
    borderColor: '#f78497ff',
  },
  btnDeleteText: {
    color: '#e9576fff',
    fontWeight: '700',
    fontSize: 10,
    lineHeight: 16,
  },
  notifyHint: {
    color: '#6b7280',
    marginTop: 4,
    fontSize: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#111827',
  },
  wheelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 6,
    position: 'relative',
  },
  wheel: {
    width: 100,
    height: 5 * 40,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  wheelItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  wheelText: {
    fontSize: 18,
    color: '#6b7280',
  },
  wheelTextActive: {
    fontSize: 20,
    color: '#111827',
    fontWeight: '700',
  },
  wheelColon: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginHorizontal: 8,
  },
  selectorBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 40 * 2,
    height: 40,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
    opacity: 0.6,
  },
  ampmCol: {
    marginLeft: 8,
    height: 5 * 40,
    justifyContent: 'center',
  },
  ampmBtn: {
    width: 70,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginVertical: 4,
    alignItems: 'center',
  },
  ampmBtnActive: {
    backgroundColor: '#3c8c4c',
    borderColor: '#3c8c4c',
  },
  ampmText: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '600',
  },
  ampmTextActive: {
    color: '#fff',
  },
  toggle: {
  width: 50,
  height: 28,
  borderRadius: 20,
  padding: 3,
  justifyContent: 'center',
},

toggleOn: {
  backgroundColor: '#3c8c4c',
  alignItems: 'flex-end',
},

toggleOff: {
  backgroundColor: '#d1d5db',
  alignItems: 'flex-start',
},

toggleCircle: {
  width: 22,
  height: 22,
  borderRadius: 11,
},

toggleCircleOn: {
  backgroundColor: '#fff',
},

toggleCircleOff: {
  backgroundColor: '#fff',
},
iosPreviewContainer: {
  marginTop: 40,
  marginBottom: 20,
},

previewSectionLabel: {
  fontSize: 16,
  fontWeight: '700',
  color: '#333',
  marginBottom: 10,
},

iosNotificationCard: {
  backgroundColor: '#fff',
  padding: 14,
  borderRadius: 16,
  width: '100%',
  borderWidth: 1,
  borderColor: '#e6e6e6',

  // iOS shadow
  shadowColor: '#000',
  shadowOpacity: 0.08,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 4 },

  elevation: 3,
},

iosRow: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 6,
},

iosAppIcon: {
  width: 20,
  height: 20,
  borderRadius: 4,
  backgroundColor: '#6EC41E', // green icon placeholder (can replace)
  marginRight: 8,
},

iosAppName: {
  fontSize: 14,
  fontWeight: '600',
  color: '#000',
  marginRight: 6,
},

iosTimestamp: {
  fontSize: 13,
  color: '#8e8e93',
  marginLeft: 'auto',
},

iosMessage: {
  fontSize: 15,
  color: '#000',
  lineHeight: 20,
},
 /* Bottom Nav */
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderColor: "#eee",
  },
  bottomButton: { alignItems: "center" },
  bottomLabel: { fontSize: 12, color: "#666", marginTop: 2 },
  bottomHome: { alignItems: "center" },
  statistics_container: {
    padding: 20,
    paddingBottom: 40,
  },
});

export default NotificationsScreen;
