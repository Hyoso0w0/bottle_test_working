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

const STORAGE_KEY = 'user_alarms';
const DAY_OPTIONS = ['월', '화', '수', '목', '금', '토', '일'];
const DAY_TO_WEEKDAY = {
  일: 1,
  월: 2,
  화: 3,
  수: 4,
  목: 5,
  금: 6,
  토: 7,
};

const PRESET_REMINDERS = [
  {
    id: 'preset-1',
    emoji: '🛍️',
    title: '장바구니 챙기기',
    time: '07:30',
    days: ['월', '화', '수', '목', '금'],
    description: '출근 전에 장바구니 확인하기',
  },
  {
    id: 'preset-2',
    emoji: '☕',
    title: '출근 전 텀블러 챙기기',
    time: '08:45',
    days: ['월', '화', '수', '목', '금'],
    description: '텀블러와 보틀을 들고 출근 준비',
  },
  {
    id: 'preset-3',
    emoji: '🧽',
    title: '자기 전 텀블러 씻기',
    time: '21:30',
    days: ['월', '화', '수', '목', '금'],
    description: '다음 날을 위해 깨끗하게 세척하기',
  },
  {
    id: 'preset-4',
    emoji: '♻️',
    title: '취침 전 분리수거 체크',
    time: '22:00',
    days: ['월', '수', '금'],
    description: '분리수거 배출일 다시 확인',
  },
  {
    id: 'preset-5',
    emoji: '🍳',
    title: '외식 대신 집에서 저녁 먹기',
    time: '18:00',
    days: ['화', '목', '토'],
    description: '집밥으로 쓰레기 줄이기',
  },
];

const migrateAlarm = (alarm, idx) => {
  const safeTime = alarm.time ?? '09:00';
  const safeDays =
    Array.isArray(alarm.days) && alarm.days.length > 0 ? alarm.days : ['월', '화', '수', '목', '금'];

  return {
    id: alarm.id ?? Date.now() + idx,
    title: alarm.title ?? alarm.label ?? '새 알림',
    emoji: alarm.emoji ?? '🌱',
    time: safeTime,
    days: safeDays,
    enabled: typeof alarm.enabled === 'boolean' ? alarm.enabled : true,
    notificationIds: alarm.notificationIds ?? (alarm.notificationId ? [alarm.notificationId] : []),
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

  const [alarms, setAlarms] = useState([]);
  const [formVisible, setFormVisible] = useState(false);
  const [editingAlarm, setEditingAlarm] = useState(null);
  const [recommendedVisible, setRecommendedVisible] = useState(false);

  useEffect(() => {
    const loadAlarms = async () => {
      try {

        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        let parsed = stored ? JSON.parse(stored) : [];

        if (!Array.isArray(parsed) || parsed.length === 0) {
          parsed = PRESET_REMINDERS.slice(0, 2).map((preset, idx) =>
            migrateAlarm({ ...preset, id: idx + 1 }, idx),
          );
        } else {
          parsed = parsed.map(migrateAlarm);
        }

        setAlarms(parsed);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      } catch (error) {
        console.error('Failed to load alarms:', error);
      }
    };

    loadAlarms();
  }, []);

  useEffect(() => {
    const persist = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(alarms));
      } catch (error) {
        console.error('Failed to save alarms:', error);
      }
    };

    if (alarms.length >= 0) {
      persist();
    }
  }, [alarms]);

  const featuredPreset = PRESET_REMINDERS[0];

  const formattedAlarms = useMemo(
    () =>
      [...alarms].sort((a, b) => {
        if (a.enabled !== b.enabled) {
          return a.enabled ? -1 : 1;
        }
        return a.time.localeCompare(b.time);
      }),
    [alarms],
  );

  const openNewForm = () => {
    setEditingAlarm(null);
    setFormVisible(true);
  };

  const handleSaveReminder = async (formValues) => {
    const base = editingAlarm ?? {};
    const reminder = {
      id: base.id ?? Date.now(),
      title: formValues.title,
      emoji: formValues.emoji,
      time: formValues.time,
      days: formValues.days,
      enabled: formValues.enabled,
      notificationIds: [],
    };

    if (base.notificationIds?.length) {
      await cancelReminderNotifications(base.notificationIds);
    }

    if (reminder.enabled) {
      reminder.notificationIds = await scheduleReminderNotifications(reminder);
    }

    setAlarms((prev) => {
      if (base.id) {
        return prev.map((item) => (item.id === base.id ? reminder : item));
      }
      return [...prev, reminder];
    });

    setFormVisible(false);
    setEditingAlarm(null);
  };

  const handleToggle = async (target) => {
    if (!target) return;

    if (target.enabled) {
      await cancelReminderNotifications(target.notificationIds);
    }

    let notificationIds = [];
    if (!target.enabled) {
      notificationIds = await scheduleReminderNotifications(target);
    }

    setAlarms((prev) =>
      prev.map((alarm) =>
        alarm.id === target.id
          ? { ...alarm, enabled: !target.enabled, notificationIds }
          : alarm,
      ),
    );
  };

  const confirmDelete = (alarm) => {
    Alert.alert('알림 삭제', `'${alarm.title}' 알림을 삭제할까요?`, [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          await cancelReminderNotifications(alarm.notificationIds);
          setAlarms((prev) => prev.filter((item) => item.id !== alarm.id));
        },
      },
    ]);
  };

  const handleAddPreset = async (preset) => {
    const reminder = {
      id: Date.now(),
      title: preset.title,
      emoji: preset.emoji,
      time: preset.time,
      days: preset.days,
      enabled: true,
      notificationIds: [],
    };

    reminder.notificationIds = await scheduleReminderNotifications(reminder);
    setAlarms((prev) => [...prev, reminder]);
    Alert.alert('추가 완료', `'${preset.title}' 알림이 추가되었어요!`);
  };

  const formatDays = (days) => {
    if (!days || days.length === 0 || days.length === 7) return '매일';
    return days.join(' · ');
  };

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>아직 등록한 알림이 없어요</Text>
      <Text style={styles.emptySub}>상단의 + 버튼을 눌러 첫 번째 알림을 만들어요.</Text>
    </View>
  );

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
