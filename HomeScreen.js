/** ---------- 화면들 ---------- **/
import { StatusBar } from 'expo-status-bar';
import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import TreeForest from './TreeForest';
import GiftRecommend from './GiftRecommend';

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
});

export default HomeScreen;
