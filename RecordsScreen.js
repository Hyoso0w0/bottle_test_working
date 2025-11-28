import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Modal } from 'react-native';

// 날짜 형식 변환 함수 (로컬 시간 객체 또는 ISO 문자열 모두 지원)
const formatDate = (completedAt) => {
  // 로컬 시간 객체인 경우
  if (completedAt && typeof completedAt === 'object' && completedAt.year !== undefined) {
    return `${completedAt.year}-${String(completedAt.month + 1).padStart(2, '0')}-${String(
      completedAt.date
    ).padStart(2, '0')}`;
  }
  // ISO 문자열인 경우 (하위 호환성)
  const date = new Date(completedAt);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate()
  ).padStart(2, '0')}`;
};

const formatTime = (completedAt) => {
  // 로컬 시간 객체인 경우
  if (completedAt && typeof completedAt === 'object' && completedAt.hours !== undefined) {
    return `${String(completedAt.hours).padStart(2, '0')}:${String(
      completedAt.minutes
    ).padStart(2, '0')}`;
  }
  // ISO 문자열인 경우 (하위 호환성)
  const date = new Date(completedAt);
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

const timeSlotLabel = (slot) => {
  if (slot === 'morning') return '아침';
  if (slot === 'afternoon') return '오후';
  if (slot === 'evening') return '저녁';
  return '';
};

const RecordsScreen = ({ route }) => {
  const history = route.params?.history ?? [];
  const selectedDateParam = route.params?.selectedDate ?? null; // ← 달력에서 넘어온 날짜(YYYY-MM-DD)
  const [selectedMission, setSelectedMission] = useState(null); // 상세 팝업용

  // ✅ 날짜별로 묶기
  const groupedByDate = history.reduce((acc, record) => {
    const dateKey = formatDate(record.completedAt);
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(record);
    return acc;
  }, {});

  const allDates = Object.keys(groupedByDate).sort((a, b) => (a < b ? 1 : -1));

  // ✅ 선택된 날짜가 있으면 그 날짜만, 없으면 전체 날짜 렌더
  const datesToRender = selectedDateParam
    ? allDates.filter((d) => d === selectedDateParam)
    : allDates;

  return (
    <ScrollView contentContainerStyle={styles.screenContainer}>
      <Text style={styles.title}>
        {selectedDateParam ? `${selectedDateParam} 내 기록` : '내 기록'}
      </Text>

      {history.length === 0 || datesToRender.length === 0 ? (
        <View style={styles.card}>
          <Text style={styles.emptyText}>아직 완료된 미션이 없어요.</Text>
        </View>
      ) : (
        datesToRender.map((date) => (
          <View key={date} style={styles.card}>
            <Text style={styles.dateHeader}>{date}</Text>
            {groupedByDate[date].map((r) => (
              <TouchableOpacity
                key={r.id}
                style={styles.recordItem}
                onPress={() => setSelectedMission(r)} // 클릭 시 팝업
              >
                <Text style={styles.recordTitle}>
                  {r.emoji} {r.mission}
                </Text>
                <Text style={styles.recordDate}>
                  완료 시간: {formatTime(r.completedAt)} ({timeSlotLabel(r.timeSlot)})
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ))
      )}

      {/* ✅ 팝업 모달 */}
      <Modal visible={!!selectedMission} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalBox}>
            {selectedMission && (
              <>
                <Text style={styles.modalTitle}>
                  {selectedMission.emoji} {selectedMission.mission}
                </Text>
                <Text style={styles.modalText}>
                  완료 날짜: {formatDate(selectedMission.completedAt)}
                </Text>
                <Text style={styles.modalText}>
                  완료 시간: {formatTime(selectedMission.completedAt)} (
                  {timeSlotLabel(selectedMission.timeSlot)})
                </Text>
                <Text style={styles.modalText}>나무 종류: {selectedMission.emoji}</Text>
                <TouchableOpacity
                  style={[styles.btn, styles.btnClose]}
                  onPress={() => setSelectedMission(null)}
                >
                  <Text style={styles.btnText}>닫기</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    padding: 20,
    paddingBottom: 60,
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
  dateHeader: {
    fontWeight: '700',
    fontSize: 16,
    color: '#111827',
    marginBottom: 8,
  },
  recordItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  recordTitle: {
    fontWeight: '700',
    fontSize: 16,
  },
  recordDate: {
    color: '#6b7280',
    fontSize: 13,
    marginTop: 2,
  },
  emptyText: {
    color: '#9ca3af',
  },
  /** 모달 **/
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  modalText: {
    color: '#4b5563',
    fontSize: 14,
    marginBottom: 4,
  },
  btn: {
    marginTop: 12,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  btnClose: {
    backgroundColor: '#111827',
  },
  btnText: {
    color: '#fff',
    fontWeight: '700',
  },
});

export default RecordsScreen;
