import React, { useEffect, useMemo, useState } from 'react';
import * as Notifications from 'expo-notifications';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  Switch,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AlarmSetting from './AlarmSetting';
import { ensureLocalNotificationsReady, LOCAL_NOTIFICATION_CHANNEL_ID } from './localNotifications';

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
};

// Request notification permissions and configure channel for local reminders
const useLocalNotificationSetup = () => {
  useEffect(() => {
    ensureLocalNotificationsReady({ showAlertOnDeny: true });
  }, []);
};

const scheduleReminderNotifications = async ({ title, time, days }) => {
  try {
    const [hour, minute] = time.split(':').map(Number);
    //const targets = days && days.length > 0 ? days : DAY_OPTIONS;
    const createdIds = [];

    for (const day of days) {
      const weekday = DAY_TO_WEEKDAY[day];
      const next = new Date();
      next.setHours(hour, minute, 0, 0);

      while ((next.getDay() === 0 ? 7 : next.getDay()) !== weekday) {
        next.setDate(next.getDate() + 1);
      }

      if (next <= new Date()) {
        next.setDate(next.getDate() + 7);
      }

      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: '보들보틀 🌱',
          body: title,
          sound: 'default',
        },
        trigger: {
          date: next,
          repeats: true,
        }
      });
      createdIds.push(id);
    }
    return createdIds;
  } catch (error) {
    console.error('Failed to schedule notification:', error);
    return [];
  }
};

const cancelReminderNotifications = async (notificationIds = []) => {
  try {
    await Promise.all(
      notificationIds.map(async (id) => {
        if (id) {
          await Notifications.cancelScheduledNotificationAsync(id);
        }
      }),
    );
  } catch (error) {
    console.error('Failed to cancel notifications:', error);
  }
};

const NotificationsScreen = () => {
  useLocalNotificationSetup();

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
  useEffect(() => {
    if (isAdding || editingId !== null) {
      setTimeout(() => {
        hourRef.current?.scrollTo({ y: startHourIndex * H_ITEM_H, animated: false });
        minuteRef.current?.scrollTo({ y: startMinuteIndex * M_ITEM_H, animated: false });
        setHourLoopIndex(startHourIndex);
        setMinuteLoopIndex(startMinuteIndex);
      }, 100);
    }
  }, [hour, minute, isAdding, editingId]);

  const snapToNearest = (y, itemH) => Math.round(y / itemH);

  const ensureMiddleBlock = (idx, baseLen, totalLen) => {
    const within = ((idx % baseLen) + baseLen) % baseLen;
    const nearEdge = idx <= baseLen || idx >= totalLen - baseLen;
    const middleIdx = MID_BLOCK * baseLen + within;
    return { within, nearEdge, middleIdx };
  };

  const onHourScrollEnd = (e) => {
    const y = e.nativeEvent.contentOffset.y;
    let idx = snapToNearest(y, H_ITEM_H);

    const baseLen = hours12.length;
    const totalLen = hoursLoop.length;
    const { within, nearEdge, middleIdx } = ensureMiddleBlock(idx, baseLen, totalLen);
    const val = within + 1;
    setHour(val);
    setHourLoopIndex(nearEdge ? middleIdx : idx);

    if (nearEdge) {
      requestAnimationFrame(() => {
        hourRef.current?.scrollTo({ y: middleIdx * H_ITEM_H, animated: false });
      });
      return;
    }
    hourRef.current?.scrollTo({ y: idx * H_ITEM_H, animated: true });
  };

  const onMinuteScrollEnd = (e) => {
    const y = e.nativeEvent.contentOffset.y;
    let idx = snapToNearest(y, M_ITEM_H);

    const baseLen = minutes60.length;
    const totalLen = minutesLoop.length;
    const { within, nearEdge, middleIdx } = ensureMiddleBlock(idx, baseLen, totalLen);
    const val = within;
    setMinute(val);
    setMinuteLoopIndex(nearEdge ? middleIdx : idx);

    if (nearEdge) {
      requestAnimationFrame(() => {
        minuteRef.current?.scrollTo({ y: middleIdx * M_ITEM_H, animated: false });
      });
      return;
    }
    minuteRef.current?.scrollTo({ y: idx * M_ITEM_H, animated: true });
  };

  const toggleAmPm = (next) => setAmPm(next);

  // 알림 저장
  const saveAlarm = async () => {
    // 시간 데이터 명시적으로 저장 (hour, minute, ampm)
    const newAlarm = {
      id: editingId || Date.now().toString(),
      hour: hour,        // 시 (1-12)
      minute: minute,    // 분 (0-59)
      ampm: ampm,        // AM/PM
      message: message || '작은 한 걸음, 지금 시작해요!',
      repeatDaily: repeatDaily,
      selectedYMD: repeatDaily ? null : { ...selectedYMD },
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

  const sendTestNow = async () => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '보들보틀 🌱',
          body: message || '테스트 알림입니다.',
          data: { screen: 'Home' },
        },
        trigger: null,
      });
    } catch (e) {
      console.warn('즉시 알림 오류:', e);
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
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <View>
            <Text style={styles.heroTitle}>제로 웨이스트 루틴</Text>
            <Text style={styles.heroSubtitle}>매일 작은 실천으로 지구를 지켜요</Text>
          </View>
          <TouchableOpacity style={styles.addButton} onPress={openNewForm}>
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>나의 알림</Text>
          <Text style={styles.sectionCount}>{alarms.length}개</Text>
        </View>

        {formattedAlarms.length === 0 ? (
          <EmptyState />
        ) : (
          formattedAlarms.map((alarm) => (
            <View key={alarm.id} style={styles.reminderCard}>
              <TouchableOpacity
                style={styles.emojiBubble}
                onPress={() => {
                  setEditingAlarm(alarm);
                  setFormVisible(true);
                }}
              >
                <Text style={styles.emojiText}>{alarm.emoji}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.reminderInfo}
                onPress={() => {
                  setEditingAlarm(alarm);
                  setFormVisible(true);
                }}
              >
                <Text style={styles.reminderTitle}>{alarm.title}</Text>
                <Text style={styles.reminderMeta}>
                  {alarm.time} · {formatDays(alarm.days)}
                </Text>
              </TouchableOpacity>

              <Switch
                value={alarm.enabled}
                onValueChange={() => handleToggle(alarm)}
                trackColor={{ false: '#cbd5f5', true: '#8bd672' }}
                thumbColor="#fff"
              />

              <TouchableOpacity style={styles.deleteButton} onPress={() => confirmDelete(alarm)}>
                <Text style={styles.deleteButtonText}>×</Text>
              </TouchableOpacity>
            </View>
          ))
        )}

        <View style={styles.recommendCard}>
          <View style={styles.recommendHeader}>
            <Text style={styles.recommendTitle}>추천 알림</Text>
            <TouchableOpacity onPress={() => setRecommendedVisible(true)}>
              <Text style={styles.moreButton}>더 보기</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.recommendBody}>
            <View style={styles.emojiBubbleSecondary}>
              <Text style={styles.emojiText}>{featuredPreset.emoji}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.recommendItemTitle}>{featuredPreset.title}</Text>
              <Text style={styles.recommendItemMeta}>
                {featuredPreset.time} · {formatDays(featuredPreset.days)}
              </Text>
              <Text style={styles.recommendDescription}>{featuredPreset.description}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.recommendAddButton}
            onPress={() => handleAddPreset(featuredPreset)}
          >
            <Text style={styles.recommendAddText}>추가</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <AlarmSetting
        visible={formVisible}
        initialValues={editingAlarm}
        onCancel={() => {
          setFormVisible(false);
          setEditingAlarm(null);
        }}
        onSave={handleSaveReminder}
      />

      <Modal
        visible={recommendedVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setRecommendedVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>추천 알림 목록</Text>
              <TouchableOpacity onPress={() => setRecommendedVisible(false)}>
                <Text style={styles.modalClose}>닫기</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {PRESET_REMINDERS.map((preset) => (
                <View key={preset.id} style={styles.modalItem}>
                  <View style={styles.modalItemEmoji}>
                    <Text style={styles.emojiText}>{preset.emoji}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalItemTitle}>{preset.title}</Text>
                    <Text style={styles.modalItemMeta}>
                      {preset.time} · {formatDays(preset.days)}
                    </Text>
                    <Text style={styles.modalItemDesc}>{preset.description}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.modalAddButton}
                    onPress={() => handleAddPreset(preset)}
                  >
                    <Text style={styles.modalAddText}>추가</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f7f1',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
    gap: 18,
  },
  heroCard: {
    backgroundColor: '#313c2f',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  heroTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
  },
  heroSubtitle: {
    color: '#c0d2bf',
    marginTop: 4,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#9ed26b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#1e2a1c',
    fontSize: 32,
    fontWeight: '700',
    marginTop: -4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2a1d',
  },
  sectionCount: {
    color: '#7c8b7a',
    fontWeight: '600',
  },
  reminderCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    marginBottom: 12,
  },
  emojiBubble: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#f2f6ec',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  emojiBubbleSecondary: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: '#f0f4e4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  emojiText: {
    fontSize: 24,
  },
  reminderInfo: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2a1d',
  },
  reminderMeta: {
    marginTop: 4,
    color: '#6f7e6b',
  },
  deleteButton: {
    marginLeft: 8,
    padding: 8,
  },
  deleteButtonText: {
    fontSize: 24,
    color: '#d36a6a',
    fontWeight: '700',
  },
  emptyState: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2a1d',
  },
  emptySub: {
    color: '#7c8b7a',
    marginTop: 6,
  },
  recommendCard: {
    backgroundColor: '#fff7e8',
    borderRadius: 20,
    padding: 18,
    gap: 12,
  },
  recommendHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recommendTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#5e421c',
  },
  moreButton: {
    color: '#d28d3c',
    fontWeight: '700',
  },
  recommendBody: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recommendItemTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3f2c0b',
  },
  recommendItemMeta: {
    color: '#8f6a33',
    marginVertical: 4,
  },
  recommendDescription: {
    color: '#5e421c',
  },
  recommendAddButton: {
    backgroundColor: '#f3a952',
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  recommendAddText: {
    color: '#3f2c0b',
    fontWeight: '700',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2a1d',
  },
  modalClose: {
    color: '#6f7e6b',
    fontWeight: '600',
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#edf0ea',
  },
  modalItemEmoji: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#f2f6ec',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalItemTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2a1d',
  },
  modalItemMeta: {
    color: '#6f7e6b',
    marginVertical: 4,
  },
  modalItemDesc: {
    color: '#7c8b7a',
  },
  modalAddButton: {
    backgroundColor: '#f0f4e4',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalAddText: {
    color: '#4b5b49',
    fontWeight: '700',
  },
});

export default NotificationsScreen;
