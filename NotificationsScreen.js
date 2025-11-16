import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import * as Notifications from 'expo-notifications';

const NotificationsScreen = () => {
  // 단일 알림 시간 선택 (스크롤 휠)
  const [enabled, setEnabled] = useState(true);
  const [hour, setHour] = useState(new Date().getHours());
  const [minute, setMinute] = useState(new Date().getMinutes());

  const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => i), []);
  const minutes = useMemo(() => Array.from({ length: 60 }, (_, i) => i), []);

  const H_ITEM_H = 40;
  const M_ITEM_H = 40;
  const hourRef = useRef(null);
  const minuteRef = useRef(null);

  // 초기 위치로 스크롤
  useEffect(() => {
    setTimeout(() => {
      if (hourRef.current) {
        hourRef.current.scrollTo({ y: hour * H_ITEM_H, animated: false });
      }
      if (minuteRef.current) {
        minuteRef.current.scrollTo({ y: minute * M_ITEM_H, animated: false });
      }
    }, 0);
  }, []);

  const snapToNearest = (y, itemH, max) => {
    let idx = Math.round(y / itemH);
    if (idx < 0) idx = 0;
    if (idx > max) idx = max;
    return idx;
  };

  const onHourScrollEnd = (e) => {
    const y = e.nativeEvent.contentOffset.y;
    const idx = snapToNearest(y, H_ITEM_H, hours.length - 1);
    setHour(hours[idx]);
    // 스냅 위치로 정렬
    hourRef.current?.scrollTo({ y: idx * H_ITEM_H, animated: true });
  };
  const onMinuteScrollEnd = (e) => {
    const y = e.nativeEvent.contentOffset.y;
    const idx = snapToNearest(y, M_ITEM_H, minutes.length - 1);
    setMinute(minutes[idx]);
    minuteRef.current?.scrollTo({ y: idx * M_ITEM_H, animated: true });
  };

  const pad2 = (n) => String(n).padStart(2, '0');

  const applySchedule = async () => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      if (!enabled) return;
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '보들보틀 🌱',
          body: `${pad2(hour)}:${pad2(minute)} 알림이에요. 오늘의 작은 한 걸음!`,
          data: { screen: 'Home' },
        },
        trigger: { hour, minute, repeats: true },
      });
    } catch (e) {
      console.warn('알림 예약 오류:', e);
    }
  };

  const sendTestNow = async () => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '보들보틀 🌱',
          body: '테스트 알림입니다. 이 알림이 보이면 로컬 알림이 정상 동작합니다.',
          data: { screen: 'Home' },
        },
        trigger: null, // 즉시
      });
    } catch (e) {
      console.warn('즉시 알림 오류:', e);
    }
  };

  const clearSchedule = async () => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (e) {
      console.warn('알림 해제 오류:', e);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.screenContainer}>
      <Text style={styles.title}>알림 시간 설정</Text>

      <View style={styles.card}>
        <Text style={styles.cardHeader}>매일 특정 시간에 알림</Text>

        <View style={styles.wheelContainer}>
          <View style={styles.wheel}>
            <ScrollView
              ref={hourRef}
              showsVerticalScrollIndicator={false}
              onMomentumScrollEnd={onHourScrollEnd}
              snapToInterval={H_ITEM_H}
              decelerationRate="fast"
            >
              {hours.map((h) => (
                <View key={`h-${h}`} style={[styles.wheelItem, { height: H_ITEM_H }]}>
                  <Text style={h === hour ? styles.wheelTextActive : styles.wheelText}>{pad2(h)}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
          <Text style={styles.wheelColon}>:</Text>
          <View style={styles.wheel}>
            <ScrollView
              ref={minuteRef}
              showsVerticalScrollIndicator={false}
              onMomentumScrollEnd={onMinuteScrollEnd}
              snapToInterval={M_ITEM_H}
              decelerationRate="fast"
            >
              {minutes.map((m) => (
                <View key={`m-${m}`} style={[styles.wheelItem, { height: M_ITEM_H }]}>
                  <Text style={m === minute ? styles.wheelTextActive : styles.wheelText}>{pad2(m)}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>

        <View style={styles.selectorBar} pointerEvents="none" />

        <View style={{ height: 12 }} />
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity
            style={[styles.btn, enabled ? styles.btnPrimary : styles.btnOutline, { flex: 1 }]}
            onPress={() => setEnabled((v) => !v)}
          >
            <Text style={enabled ? styles.btnPrimaryText : styles.btnOutlineText}>
              {enabled ? 'ON' : 'OFF'}
            </Text>
          </TouchableOpacity>
          <View style={{ width: 8 }} />
          <TouchableOpacity style={[styles.btn, styles.btnSecondary, { flex: 1 }]} onPress={applySchedule}>
            <Text style={styles.btnSecondaryText}>알림 적용</Text>
          </TouchableOpacity>
          <View style={{ width: 8 }} />
          <TouchableOpacity style={[styles.btn, styles.btnOutline, { flex: 1 }]} onPress={clearSchedule}>
            <Text style={styles.btnOutlineText}>모두 해제</Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: 8 }} />
        <TouchableOpacity style={[styles.btn, styles.btnGhost]} onPress={sendTestNow}>
          <Text style={styles.btnGhostText}>지금 테스트</Text>
        </TouchableOpacity>
        <View style={{ height: 8 }} />
        <Text style={styles.notifyHint}>
          매일 {pad2(hour)}:{pad2(minute)}에 알림이 전송됩니다.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  screenContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 16,
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
  /** 버튼 공통 **/
  btn: {
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimary: {
    backgroundColor: '#111827',
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
  notifyHint: {
    color: '#6b7280',
    marginTop: 4,
  },
  // 시간 휠
  wheelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 6,
  },
  wheel: {
    width: 100,
    height: 5 * 40, // 표시 행 5개 기준
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
    left: 16,
    right: 16,
    top: 16 + 16 + 40 * 2, // 카드 패딩(16) + 헤더 높이 대략(16) + 2행
    height: 40,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
    opacity: 0.6,
  },
});


export default NotificationsScreen;
