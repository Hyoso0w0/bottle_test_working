// src/screens/EditNotificationScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { EditNotificationData } from '../../App';

interface Props {
  notification: EditNotificationData | null;
  onSave: (updated: EditNotificationData) => void;
  onBack: () => void;
}

const weekdays = ['월', '화', '수', '목', '금', '토', '일'];

const EditNotificationScreen: React.FC<Props> = ({
  notification,
  onSave,
  onBack,
}) => {
  const [state, setState] = useState<EditNotificationData | null>(notification);

  useEffect(() => {
    setState(notification);
  }, [notification]);

  if (!state) {
    return (
      <View style={styles.container}>
        <Text>편집할 알림이 없습니다.</Text>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backText}>뒤로가기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const toggleDay = (day: string) => {
    setState(prev =>
      prev
        ? {
            ...prev,
            days: prev.days.includes(day)
              ? prev.days.filter(d => d !== day)
              : [...prev.days, day],
          }
        : prev,
    );
  };

  const handleSave = () => {
    if (state) {
      onSave(state);
    }
  };

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backText}>{'‹'} 알림</Text>
        </TouchableOpacity>
        <Text style={styles.title}>알림 수정</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* 제목 */}
      <Text style={styles.label}>알림 제목</Text>
      <TextInput
        value={state.title}
        onChangeText={text =>
          setState(prev => (prev ? { ...prev, title: text } : prev))
        }
        style={styles.input}
        placeholder="알림 이름을 입력하세요"
      />

      {/* 시간 */}
      <Text style={styles.label}>시간 (예: 08:30)</Text>
      <TextInput
        value={state.time}
        onChangeText={text =>
          setState(prev => (prev ? { ...prev, time: text } : prev))
        }
        style={styles.input}
        placeholder="HH:MM"
      />

      {/* 요일 */}
      <Text style={styles.label}>반복 요일</Text>
      <View style={styles.dayRow}>
        {weekdays.map(day => {
          const selected = state.days.includes(day);
          return (
            <TouchableOpacity
              key={day}
              style={[styles.dayChip, selected && styles.dayChipSelected]}
              onPress={() => toggleDay(day)}
            >
              <Text
                style={[
                  styles.dayChipText,
                  selected && styles.dayChipTextSelected,
                ]}
              >
                {day}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>저장하기</Text>
      </TouchableOpacity>
    </View>
  );
};

export default EditNotificationScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f9fafb' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backText: { color: '#16a34a', fontSize: 14 },
  title: { fontSize: 18, fontWeight: '700' },
  label: { marginTop: 16, marginBottom: 4, fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#ffffff',
  },
  dayRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  dayChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginRight: 8,
    marginBottom: 8,
  },
  dayChipSelected: {
    backgroundColor: '#bbf7d0',
    borderColor: '#22c55e',
  },
  dayChipText: {
    fontSize: 12,
    color: '#4b5563',
  },
  dayChipTextSelected: {
    color: '#065f46',
    fontWeight: '700',
  },
  saveButton: {
    marginTop: 32,
    backgroundColor: '#22c55e',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveButtonText: { color: 'white', fontWeight: '700' },
});
