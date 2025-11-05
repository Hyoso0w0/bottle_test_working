import { StatusBar } from 'expo-status-bar';
import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View, Button, TouchableOpacity, Modal, Pressable, ScrollView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

/** ---------- 유틸 ---------- **/
const getTimeSlot = () => {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 18) return 'afternoon';
  return 'evening';
};

const recommendedByTime = {
  morning: ['물 1컵 마시기', '가벼운 스트레칭 5분', '감사 3줄 적기'],
  afternoon: ['가볍게 산책 10분', '눈 휴식 3분', '책 5쪽 읽기'],
  evening: ['하루 회고 3줄', '방 정리 5분', '명상 3분'],
};

const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

/** ---------- 나무 숲(성과) 컴포넌트 ---------- **/
const TreeForest = ({ completedCount = 0 }) => {
  // 완료 개수에 따라 나무 이모지 빽빽하게 보여주기 (최대 30 그리드)
  const maxTrees = 30;
  const trees = Math.min(completedCount, maxTrees);
  const items = Array.from({ length: maxTrees }).map((_, i) => (
    <View key={i} style={styles.treeCell}>
      <Text style={{ fontSize: 18, opacity: i < trees ? 1 : 0.15 }}>
        🌳
      </Text>
    </View>
  ));
  return (
    <View>
      <View style={styles.forestGrid}>{items}</View>
      <Text style={styles.forestCaption}>완료 미션: {completedCount}개</Text>
    </View>
  );
};

/** ---------- 추천 미션(선물 UI) ---------- **/
const GiftRecommend = ({ visible, mission, onAccept, onClose }) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalBackdrop}>
        <View style={styles.giftCard}>
          <Text style={styles.giftEmoji}>🎁</Text>
          <Text style={styles.giftTitle}>오늘의 추천 미션</Text>
          <Text style={styles.giftMission}>{mission}</Text>

          <View style={styles.giftBtns}>
            <Pressable style={[styles.btn, styles.btnPrimary]} onPress={onAccept}>
              <Text style={styles.btnPrimaryText}>수락하기</Text>
            </Pressable>
            <Pressable style={[styles.btn, styles.btnGhost]} onPress={onClose}>
              <Text style={styles.btnGhostText}>다음에</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

/** ---------- 화면들 ---------- **/
const HomeScreen = ({ navigation, route }) => {
  const [selectedMission, setSelectedMission] = useState('물 마시기 1컵');
  const [completed, setCompleted] = useState(0);

  const timeSlot = getTimeSlot();
  const [recommendVisible, setRecommendVisible] = useState(false);
  const recommendedMission = useMemo(
    () => pickRandom(recommendedByTime[timeSlot]),
    // 시간대 바뀌면 새 추천
    [timeSlot]
  );

  const completeMission = () => {
    setCompleted((c) => c + 1);
    // 미션 완료 시 선물 UI(추천) 노출
    setRecommendVisible(true);
  };

  const acceptRecommended = () => {
    setSelectedMission(recommendedMission);
    setRecommendVisible(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>보들보틀</Text>

      {/* 미션 (선택한 미션) */}
      <View style={styles.card}>
        <Text style={styles.cardHeader}>선택한 미션</Text>
        <Text style={styles.missionText}>{selectedMission}</Text>
        <View style={styles.row}>
          <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={completeMission}>
            <Text style={styles.btnPrimaryText}>미션 완료</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btn, styles.btnGhost]}
            onPress={() => setSelectedMission('가벼운 스트레칭 5분')}
          >
            <Text style={styles.btnGhostText}>다른 미션 고르기</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 추천 미션(시간대/게임 선물 UI) */}
      <View style={styles.card}>
        <Text style={styles.cardHeader}>추천 미션</Text>
        <View style={styles.recoRow}>
          <Text style={styles.recoHint}>
            {timeSlot === 'morning' && '아침'}
            {timeSlot === 'afternoon' && '오후'}
            {timeSlot === 'evening' && '저녁'}
            {' 시간대에 딱 맞는 추천이에요.'}
          </Text>
          <TouchableOpacity
            style={[styles.btn, styles.btnOutline]}
            onPress={() => setRecommendVisible(true)}
          >
            <Text style={styles.btnOutlineText}>🎁 선물 열기</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 나무 빽빽한 것 (내 성과) */}
      <View style={styles.card}>
        <Text style={styles.cardHeader}>나의 숲(성과)</Text>
        <TreeForest completedCount={completed} />
      </View>

      {/* 이동 버튼들 */}
      <View style={styles.navBtns}>
        <TouchableOpacity
          style={[styles.btn, styles.btnPrimary, { flex: 1 }]}
          onPress={() => navigation.navigate('Records', { completed })}
        >
          <Text style={styles.btnPrimaryText}>내 기록 보기</Text>
        </TouchableOpacity>
        <View style={{ width: 12 }} />
        <TouchableOpacity
          style={[styles.btn, styles.btnSecondary, { flex: 1 }]}
          onPress={() => navigation.navigate('Notifications')}
        >
          <Text style={styles.btnSecondaryText}>알림 커스터마이징</Text>
        </TouchableOpacity>
      </View>

      <StatusBar style="auto" />

      {/* 추천 미션 선물 모달 */}
      <GiftRecommend
        visible={recommendVisible}
        mission={recommendedMission}
        onAccept={acceptRecommended}
        onClose={() => setRecommendVisible(false)}
      />
    </ScrollView>
  );
};

const RecordsScreen = ({ route }) => {
  const completed = route.params?.completed ?? 0;

  // 간단한 더미 기록: 완료 수 기준으로 리스트 생성
  const records = Array.from({ length: completed }).map((_, i) => ({
    id: i + 1,
    title: `완료 미션 #${i + 1}`,
    date: `2025-11-${String(3 - Math.floor(i / 3)).padStart(2, '0')} 1${i % 10}:00`,
  }));

  return (
    <ScrollView contentContainerStyle={styles.screenContainer}>
      <Text style={styles.title}>내 기록</Text>
      <View style={styles.card}>
        {records.length === 0 ? (
          <Text style={styles.emptyText}>아직 완료된 미션이 없어요.</Text>
        ) : (
          records.map((r) => (
            <View key={r.id} style={styles.recordItem}>
              <Text style={styles.recordTitle}>{r.title}</Text>
              <Text style={styles.recordDate}>{r.date}</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const NotificationsScreen = () => {
  // 아주 간단한 토글/시간 프리셋 (실제 알림 스케줄링은 expo-notifications로 확장 가능)
  const [morningOn, setMorningOn] = useState(true);
  const [afternoonOn, setAfternoonOn] = useState(true);
  const [eveningOn, setEveningOn] = useState(false);

  const [morningTime, setMorningTime] = useState('08:30');
  const [afternoonTime, setAfternoonTime] = useState('14:00');
  const [eveningTime, setEveningTime] = useState('21:00');

  return (
    <ScrollView contentContainerStyle={styles.screenContainer}>
      <Text style={styles.title}>알림 커스터마이징</Text>

      <View style={styles.card}>
        <Text style={styles.cardHeader}>시간대별 알림</Text>

        <View style={styles.notifyRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.notifyLabel}>아침</Text>
            <Text style={styles.notifyTime}>{morningTime}</Text>
          </View>
          <TouchableOpacity
            style={[styles.btn, morningOn ? styles.btnPrimary : styles.btnOutline]}
            onPress={() => setMorningOn((v) => !v)}
          >
            <Text style={morningOn ? styles.btnPrimaryText : styles.btnOutlineText}>
              {morningOn ? 'ON' : 'OFF'}
            </Text>
          </TouchableOpacity>
          <View style={{ width: 8 }} />
          <TouchableOpacity
            style={[styles.btn, styles.btnGhost]}
            onPress={() => setMorningTime(morningTime === '08:30' ? '09:00' : '08:30')}
          >
            <Text style={styles.btnGhostText}>시간 바꾸기</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.notifyRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.notifyLabel}>오후</Text>
            <Text style={styles.notifyTime}>{afternoonTime}</Text>
          </View>
          <TouchableOpacity
            style={[styles.btn, afternoonOn ? styles.btnPrimary : styles.btnOutline]}
            onPress={() => setAfternoonOn((v) => !v)}
          >
            <Text style={afternoonOn ? styles.btnPrimaryText : styles.btnOutlineText}>
              {afternoonOn ? 'ON' : 'OFF'}
            </Text>
          </TouchableOpacity>
          <View style={{ width: 8 }} />
          <TouchableOpacity
            style={[styles.btn, styles.btnGhost]}
            onPress={() => setAfternoonTime(afternoonTime === '14:00' ? '15:00' : '14:00')}
          >
            <Text style={styles.btnGhostText}>시간 바꾸기</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.notifyRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.notifyLabel}>저녁</Text>
            <Text style={styles.notifyTime}>{eveningTime}</Text>
          </View>
          <TouchableOpacity
            style={[styles.btn, eveningOn ? styles.btnPrimary : styles.btnOutline]}
            onPress={() => setEveningOn((v) => !v)}
          >
            <Text style={eveningOn ? styles.btnPrimaryText : styles.btnOutlineText}>
              {eveningOn ? 'ON' : 'OFF'}
            </Text>
          </TouchableOpacity>
          <View style={{ width: 8 }} />
          <TouchableOpacity
            style={[styles.btn, styles.btnGhost]}
            onPress={() => setEveningTime(eveningTime === '21:00' ? '20:30' : '21:00')}
          >
            <Text style={styles.btnGhostText}>시간 바꾸기</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 8 }} />
        <Text style={styles.notifyHint}>
          실제 푸시 알림은 이후에 <Text style={{ fontWeight: 'bold' }}>expo-notifications</Text>로 연결하면 돼요.
        </Text>
      </View>
    </ScrollView>
  );
};

/** ---------- 네비게이션 ---------- **/
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerTitleAlign: 'center',
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: '첫 화면' }} />
        <Stack.Screen name="Records" component={RecordsScreen} options={{ title: '내 기록' }} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: '알림 설정' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

/** ---------- 스타일 ---------- **/
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
  missionText: {
    fontSize: 20,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  recoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'space-between',
  },
  recoHint: {
    flex: 1,
    color: '#4b5563',
  },
  navBtns: {
    flexDirection: 'row',
    marginTop: 6,
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
  /** 숲 **/
  forestGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  treeCell: {
    width: '10%',
    paddingVertical: 4,
    alignItems: 'center',
  },
  forestCaption: {
    marginTop: 8,
    color: '#6b7280',
  },
  /** 기록 **/
  emptyText: {
    color: '#6b7280',
  },
  recordItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  recordTitle: {
    fontWeight: '700',
  },
  recordDate: {
    color: '#6b7280',
    marginTop: 2,
  },
  /** 선물 모달 **/
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,.2)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  giftCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  giftEmoji: {
    fontSize: 36,
  },
  giftTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 8,
  },
  giftMission: {
    fontSize: 20,
    marginVertical: 12,
    textAlign: 'center',
  },
  giftBtns: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  /** 알림 **/
  notifyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  notifyLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  notifyTime: {
    color: '#6b7280',
    marginTop: 2,
  },
  notifyHint: {
    color: '#6b7280',
    marginTop: 4,
  },
});
