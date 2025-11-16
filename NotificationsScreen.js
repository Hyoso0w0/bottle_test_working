import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, TextInput, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Notifications from 'expo-notifications';

const NotificationsScreen = () => {
  // 초기 AM/PM 기준 시간 설정
  const now = new Date();
  const init24 = now.getHours();
  const init12 = ((init24 % 12) || 12);
  const initAmPm = init24 >= 12 ? 'PM' : 'AM';

  const [enabled, setEnabled] = useState(true);
  const [hour, setHour] = useState(init12);       // 1..12
  const [minute, setMinute] = useState(now.getMinutes());
  const [ampm, setAmPm] = useState(initAmPm);
  const [message, setMessage] = useState('작은 한 걸음, 지금 시작해요!');
  const [repeatDaily, setRepeatDaily] = useState(true); // true: 매일 반복, false: 특정 날짜 한 번
  // 타임존 보정을 위해 연/월/일을 별도 보관
  const [selectedYMD, setSelectedYMD] = useState({
    year: now.getFullYear(),
    month: now.getMonth(), // 0-based
    day: now.getDate(),
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  // 권한/채널/핸들러 설정
  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    (async () => {
      const perm = await Notifications.getPermissionsAsync();
      if (perm.status !== 'granted') {
        await Notifications.requestPermissionsAsync();
      }
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Default',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          sound: 'default',
          lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        });
      }
    })();
  }, []);

  // 12시간/60분 기본 목록
  const hours12 = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), []);
  const minutes60 = useMemo(() => Array.from({ length: 60 }, (_, i) => i), []);

  // 무한 스크롤 느낌을 위한 반복 블록
  const REPEAT = 5; // 홀수 권장
  const hoursLoop = useMemo(() => Array.from({ length: REPEAT }).flatMap(() => hours12), [hours12]);
  const minutesLoop = useMemo(() => Array.from({ length: REPEAT }).flatMap(() => minutes60), [minutes60]);
  const MID_BLOCK = Math.floor(REPEAT / 2);

  const H_ITEM_H = 40;
  const M_ITEM_H = 40;
  const VISIBLE_ROWS = 5;
  const WHEEL_H = VISIBLE_ROWS * H_ITEM_H; // 시/분 동일 높이

  const hourRef = useRef(null);
  const minuteRef = useRef(null);
  const [hourLoopIndex, setHourLoopIndex] = useState(startHourIndex);
  const [minuteLoopIndex, setMinuteLoopIndex] = useState(startMinuteIndex);

  // 가운데 블록 기준 초기 위치
  const startHourIndex = MID_BLOCK * hours12.length + (hour - 1);
  const startMinuteIndex = MID_BLOCK * minutes60.length + minute;

  // 초기 위치로 스크롤
  useEffect(() => {
    setTimeout(() => {
      hourRef.current?.scrollTo({ y: startHourIndex * H_ITEM_H, animated: false });
      minuteRef.current?.scrollTo({ y: startMinuteIndex * M_ITEM_H, animated: false });
    }, 0);
  }, []);

  const snapToNearest = (y, itemH) => Math.round(y / itemH);

  // 공통: 루프 유지 점프
  const ensureMiddleBlock = (idx, baseLen, totalLen) => {
    const within = ((idx % baseLen) + baseLen) % baseLen; // 0..baseLen-1
    const nearEdge = idx <= baseLen || idx >= totalLen - baseLen;
    const middleIdx = Math.floor(REPEAT / 2) * baseLen + within;
    return { within, nearEdge, middleIdx };
  };

  const onHourScrollEnd = (e) => {
    const y = e.nativeEvent.contentOffset.y;
    let idx = snapToNearest(y, H_ITEM_H);

    const baseLen = hours12.length;
    const totalLen = hoursLoop.length;
    const { within, nearEdge, middleIdx } = ensureMiddleBlock(idx, baseLen, totalLen);
    const val = within + 1; // 1..12
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
    do {
      if (idx < 0) { idx = 0; break; }
    } while (false);
    const totalLen = minutesLoop.length;
    const { within, nearEdge, middleIdx } = ensureMiddleBlock(idx, baseLen, totalLen);
    const val = within; // 0..59
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

  const pad2 = (n) => String(n).padStart(2, '0');
  const toggleAmPm = (next) => setAmPm(next);

  // 12시간 -> 24시간 변환
  const as24h = (h12, meridiem) => {
    if (meridiem === 'AM') return h12 % 12;       // 12 AM -> 0
    return (h12 % 12) + 12;                       // 12 PM -> 12
  };

  const applySchedule = async () => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      if (!enabled) return;

      const hour24 = as24h(hour, ampm);
      const content = {
        title: '보들보틀 🌱',
        body: message || `${ampm} ${pad2(hour)}:${pad2(minute)} 알림이에요.`,
        data: { screen: 'Home' },
      };

      if (repeatDaily) {
        await Notifications.scheduleNotificationAsync({
          content,
          trigger: { hour: hour24, minute, repeats: true },
        });
      } else {
        // 특정 날짜 한 번: 선택한 연/월/일 + 선택 시간으로 Date 구성 (로컬)
        const when = new Date(selectedYMD.year, selectedYMD.month, selectedYMD.day, hour24, minute, 0, 0);
        await Notifications.scheduleNotificationAsync({
          content,
          trigger: { date: when },
        });
      }
    } catch (e) {
      console.warn('알림 예약 오류:', e);
    }
  };

  const sendTestNow = async () => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '보들보틀 🌱',
          body: message || '테스트 알림입니다. 이 알림이 보이면 로컬 알림이 정상 동작합니다.',
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

        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder="알림 내용 입력"
          style={styles.input}
          maxLength={80}
        />
        <View style={{ height: 8 }} />

        {/* 반복 방식 토글 */}
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
                  // Android는 취소 시 date가 undefined로 옴
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
          {/* AM/PM 토글 (앞) */}
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

          {/* 시 (무한 스크롤) */}
          <View style={styles.wheel}>
            <ScrollView
              ref={hourRef}
              showsVerticalScrollIndicator={false}
              onMomentumScrollEnd={onHourScrollEnd}
              snapToInterval={H_ITEM_H}
              decelerationRate="fast"
            >
              {/* 상단 여백: 중앙 정렬용 */}
              <View style={{ height: 2 * H_ITEM_H }} />
              {hoursLoop.map((h, i) => (
                <View key={`h-${i}`} style={[styles.wheelItem, { height: H_ITEM_H }]}>
                  <Text style={i === hourLoopIndex ? styles.wheelTextActive : styles.wheelText}>{pad2(h)}</Text>
                </View>
              ))}
              {/* 하단 여백: 중앙 정렬용 */}
              <View style={{ height: 2 * H_ITEM_H }} />
            </ScrollView>
          </View>

          <Text style={styles.wheelColon}>:</Text>

          {/* 분 (무한 스크롤) */}
          <View style={styles.wheel}>
            <ScrollView
              ref={minuteRef}
              showsVerticalScrollIndicator={false}
              onMomentumScrollEnd={onMinuteScrollEnd}
              snapToInterval={M_ITEM_H}
              decelerationRate="fast"
            >
              {/* 상단 여백: 중앙 정렬용 */}
              <View style={{ height: 2 * M_ITEM_H }} />
              {minutesLoop.map((m, i) => (
                <View key={`m-${i}`} style={[styles.wheelItem, { height: M_ITEM_H }]}>
                  <Text style={i === minuteLoopIndex ? styles.wheelTextActive : styles.wheelText}>{pad2(m)}</Text>
                </View>
              ))}
              {/* 하단 여백: 중앙 정렬용 */}
              <View style={{ height: 2 * M_ITEM_H }} />
            </ScrollView>
          </View>

          {/* 가운데 선택선 */}
          <View pointerEvents="none" style={styles.selectorBar} />
        </View>

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
          {repeatDaily
            ? `매일 ${ampm} ${pad2(hour)}:${pad2(minute)}에 알림이 전송됩니다.`
            : `${selectedYMD.year}-${pad2(selectedYMD.month + 1)}-${pad2(selectedYMD.day)} ${ampm} ${pad2(hour)}:${pad2(minute)}에 한 번 전송됩니다.`}
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
    backgroundColor: '#111827',
    borderColor: '#111827',
  },
  switchText: {
    color: '#111827',
    fontWeight: '700',
  },
  switchTextActive: {
    color: '#fff',
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
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#111827',
  },
  // 시간 휠
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
    left: 0,
    right: 0,
    top: 40 * 2, // 5행 기준 중앙 라인
    height: 40,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
    opacity: 0.6,
  },
  // AM/PM
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
    backgroundColor: '#111827',
    borderColor: '#111827',
  },
  ampmText: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '600',
  },
  ampmTextActive: {
    color: '#fff',
  },
});


export default NotificationsScreen;
