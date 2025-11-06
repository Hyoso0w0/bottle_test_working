import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';

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


export default NotificationsScreen;
