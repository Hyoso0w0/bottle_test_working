// HomeScreen.js
import { StatusBar } from 'expo-status-bar';
import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import TreeForest from './TreeForest';
import GiftRecommend from './GiftRecommend';
import * as Notifications from 'expo-notifications';

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

// 🔔 즉시 알림 테스트용 함수
const sendTestNotification = async () => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '보들보틀 🌱',
      body: '지금 물 1컵 마실 시간이에요!',
      data: { screen: 'Home' },
    },
    trigger: null, // null이면 즉시 발송
  });
};

const HomeScreen = ({ navigation }) => {
  const [selectedMission, setSelectedMission] = useState('물 1컵 마시기'); // 🔹 key와 맞추기
  const [completed, setCompleted] = useState(0);

  // 🌳 나무 배열 상태
  const [forestTrees, setForestTrees] = useState([]);
  // 📝 완료 미션 기록
  const [missionHistory, setMissionHistory] = useState([]);

  const timeSlot = getTimeSlot();
  const [recommendVisible, setRecommendVisible] = useState(false);
  const recommendedMission = useMemo(
    () => pickRandom(recommendedByTime[timeSlot]),
    [timeSlot]
  );

  // ✅ 미션별 나무/식물 아이콘 정의 (통일감 있게)
  const missionConfigs = {
    '물 1컵 마시기': {
      trees: 1,
      emoji: '🌱',
    },
    '가벼운 스트레칭 5분': {
      trees: 2,
      emoji: '🌲',
    },
    '감사 3줄 적기': {
      trees: 1,
      emoji: '🌼',
    },
    '가볍게 산책 10분': {
      trees: 2,
      emoji: '🌳',
    },
    '눈 휴식 3분': {
      trees: 1,
      emoji: '🌾',
    },
    '책 5쪽 읽기': {
      trees: 2,
      emoji: '🌿',
    },
    '하루 회고 3줄': {
      trees: 1,
      emoji: '🍂',
    },
    '방 정리 5분': {
      trees: 2,
      emoji: '🪴',
    },
    '명상 3분': {
      trees: 1,
      emoji: '🪷',
    },
  };

  // ✅ 미션 완료 시: 기록 + 나무 추가
  const completeMission = () => {
    setCompleted((c) => c + 1);

    const config = missionConfigs[selectedMission] || {
      trees: 1,
      emoji: '🌳',
    };

    // 나무 추가
    setForestTrees((prev) => {
      const maxTrees = 30;
      const remainingSlots = maxTrees - prev.length;
      if (remainingSlots <= 0) return prev;

      const treeCountToAdd = Math.min(config.trees, remainingSlots);

      const newTrees = Array.from({ length: treeCountToAdd }).map((_, idx) => ({
        id: `${Date.now()}-${idx}`,
        emoji: config.emoji || '🌳',
      }));

      return [...prev, ...newTrees];
    });

    // 🔹 미션 기록 추가
    const now = new Date();
    setMissionHistory((prev) => [
      {
        id: `${now.getTime()}-${Math.random().toString(36).slice(2, 7)}`,
        mission: selectedMission,
        completedAt: now.toISOString(),
        timeSlot,
        emoji: config.emoji || '🌳',
      },
      ...prev,
    ]);

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

      {/* 나무 숲 (내 성과) */}
      <View style={styles.card}>
        <Text style={styles.cardHeader}>나의 숲(성과)</Text>
        <TreeForest trees={forestTrees} />
        <Text style={styles.expText}>
          완료 미션: {completed}개 / 심은 나무: {forestTrees.length}그루
        </Text>
      </View>

      {/* 이동 버튼들 */}
      <View style={styles.navBtns}>
        <TouchableOpacity
          style={[styles.btn, styles.btnPrimary, { flex: 1 }]}
          onPress={() => navigation.navigate('Records', { history: missionHistory })}
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

      {/* 캘린더 버튼 */}
      <View style={{ marginTop: 16 }}>
        <TouchableOpacity
          style={[styles.btn, styles.btnOutline]}
          onPress={() => navigation.navigate('Calendar', { history: missionHistory })}
        >
          <Text style={styles.btnOutlineText}>📅 캘린더 보기</Text>
        </TouchableOpacity>
      </View>

      {/* 🔔 알림 테스트 버튼 */}
      <View style={{ marginTop: 16 }}>
        <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={sendTestNotification}>
          <Text style={styles.btnPrimaryText}>알림 테스트 보내기</Text>
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

const styles = StyleSheet.create({
  container: {
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
  expText: {
    marginTop: 4,
    color: '#4b5563',
    fontSize: 12,
  },
});

export default HomeScreen;
