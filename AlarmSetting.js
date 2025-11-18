import React, { useEffect, useMemo, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  Pressable,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

const HOURS = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  value: i.toString().padStart(2, '0'),
}));

const MINUTES = Array.from({ length: 60 }, (_, i) => ({
  id: i,
  value: i.toString().padStart(2, '0'),
}));

const EMOJI_OPTIONS = ['🌱', '🛍️', '☕', '🧽', '♻️', '🍳', '🥤', '🧺'];
const DAY_OPTIONS = ['월', '화', '수', '목', '금', '토', '일'];

const AlarmSetting = ({ visible, initialValues, onSave, onCancel }) => {
  const [title, setTitle] = useState('');
  const [emoji, setEmoji] = useState('🌱');
  const [selectedDays, setSelectedDays] = useState(['월', '화', '수', '목', '금']);
  const [hour, setHour] = useState(9);
  const [minute, setMinute] = useState(0);
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    if (!visible) return;
    const fallbackDays =
      initialValues?.days && initialValues.days.length > 0
        ? initialValues.days
        : ['월', '화', '수', '목', '금'];
    const initialTime = initialValues?.time ?? '09:00';
    const [h, m] = initialTime.split(':').map((n) => parseInt(n, 10));

    setTitle(initialValues?.title ?? '');
    setEmoji(initialValues?.emoji ?? '🌱');
    setSelectedDays(fallbackDays);
    setHour(Number.isNaN(h) ? 9 : h);
    setMinute(Number.isNaN(m) ? 0 : m);
    setEnabled(typeof initialValues?.enabled === 'boolean' ? initialValues.enabled : true);
  }, [visible, initialValues]);

  const toggleDay = (day) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((item) => item !== day) : [...prev, day],
    );
  };

  const handleSelectHour = (value) => setHour(value);
  const handleSelectMinute = (value) => setMinute(value);

  const previewTime = useMemo(
    () => `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
    [hour, minute],
  );

  const previewDays = useMemo(() => {
    if (!selectedDays.length || selectedDays.length === 7) return '매일';
    return [...selectedDays]
      .sort((a, b) => DAY_OPTIONS.indexOf(a) - DAY_OPTIONS.indexOf(b))
      .join(' · ');
  }, [selectedDays]);

  const handleSave = () => {
    const payload = {
      title: title.trim() || '새 알림',
      emoji,
      days:
        selectedDays.length > 0
          ? [...selectedDays].sort((a, b) => DAY_OPTIONS.indexOf(a) - DAY_OPTIONS.indexOf(b))
          : ['월', '화', '수', '목', '금'],
      time: previewTime,
      enabled,
    };
    onSave?.(payload);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.sheetWrapper}
        >
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>알림 커스터마이징</Text>
              <Text style={styles.sheetSubtitle}>이모지, 요일, 시간까지 직접 설정해요</Text>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.content}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.field}>
                <Text style={styles.label}>이모지 선택</Text>
                <View style={styles.emojiGrid}>
                  {EMOJI_OPTIONS.map((item) => {
                    const selected = emoji === item;
                    return (
                      <Pressable
                        key={item}
                        style={[styles.emojiOption, selected && styles.emojiOptionSelected]}
                        onPress={() => setEmoji(item)}
                      >
                        <Text style={styles.emojiOptionText}>{item}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>알림 제목</Text>
                <TextInput
                  style={styles.input}
                  placeholder="예: 출근 전 텀블러 챙기기"
                  value={title}
                  onChangeText={setTitle}
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>반복 요일</Text>
                <View style={styles.daysRow}>
                  {DAY_OPTIONS.map((day) => {
                    const active = selectedDays.includes(day);
                    return (
                      <TouchableOpacity
                        key={day}
                        style={[styles.dayChip, active && styles.dayChipActive]}
                        onPress={() => toggleDay(day)}
                      >
                        <Text style={[styles.dayChipText, active && styles.dayChipTextActive]}>
                          {day}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>시간 설정</Text>
                <View style={styles.selectorContainer}>
                  <View style={styles.column}>
                    <Text style={styles.selectorLabel}>시</Text>
                    <ScrollView style={styles.scrollContainer}>
                      {HOURS.map((h) => (
                        <Pressable
                          key={h.id}
                          style={[styles.item, hour === h.id && styles.itemSelected]}
                          onPress={() => handleSelectHour(h.id)}
                        >
                          <Text
                            style={[
                              styles.itemText,
                              hour === h.id && styles.itemTextSelected,
                            ]}
                          >
                            {h.value}
                          </Text>
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>

                  <View style={styles.column}>
                    <Text style={styles.selectorLabel}>분</Text>
                    <ScrollView style={styles.scrollContainer}>
                      {MINUTES.map((m) => (
                        <Pressable
                          key={m.id}
                          style={[styles.item, minute === m.id && styles.itemSelected]}
                          onPress={() => handleSelectMinute(m.id)}
                        >
                          <Text
                            style={[
                              styles.itemText,
                              minute === m.id && styles.itemTextSelected,
                            ]}
                          >
                            {m.value}
                          </Text>
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>
                </View>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>알림음</Text>
                <View style={styles.soundBox}>
                  <Text style={styles.soundLabel}>기본 알림음</Text>
                  <Text style={styles.soundBadge}>준비중</Text>
                </View>
              </View>

              <View style={styles.field}>
                <View style={styles.toggleRow}>
                  <View>
                    <Text style={styles.label}>알림 사용</Text>
                    <Text style={styles.helperText}>필요할 때 바로 껐다 켤 수 있어요</Text>
                  </View>
                  <Switch
                    value={enabled}
                    onValueChange={setEnabled}
                    trackColor={{ false: '#e0e5db', true: '#9cd46b' }}
                    thumbColor="#fff"
                  />
                </View>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>미리보기</Text>
                <View style={styles.previewCard}>
                  <View style={styles.previewEmoji}>
                    <Text style={styles.previewEmojiText}>{emoji}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.previewTitle}>{title.trim() || '새 알림'}</Text>
                    <Text style={styles.previewMeta}>
                      {previewTime} · {previewDays}
                    </Text>
                  </View>
                </View>
              </View>
            </ScrollView>

            <View style={styles.footer}>
              <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
                <Text style={styles.cancelButtonText}>취소하기</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>알림 추가하기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  sheetWrapper: {
    width: '100%',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingBottom: 24,
    maxHeight: '95%',
  },
  sheetHeader: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 12,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2a1d',
  },
  sheetSubtitle: {
    marginTop: 4,
    color: '#829180',
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 12,
    gap: 18,
  },
  field: {
    gap: 12,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1f2a1d',
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  emojiOption: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#f0f4e4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiOptionSelected: {
    backgroundColor: '#c9ec9d',
  },
  emojiOptionText: {
    fontSize: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: '#dbe2d2',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  daysRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  dayChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#eff3ea',
  },
  dayChipActive: {
    backgroundColor: '#9ed26b',
  },
  dayChipText: {
    color: '#6f7e6b',
    fontWeight: '600',
  },
  dayChipTextActive: {
    color: '#1f2a1d',
  },
  selectorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  column: {
    alignItems: 'center',
    flex: 1,
  },
  selectorLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#6f7e6b',
  },
  scrollContainer: {
    maxHeight: 200,
    width: '100%',
  },
  item: {
    paddingVertical: 10,
    marginVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  itemSelected: {
    backgroundColor: '#9ed26b33',
    borderColor: '#9ed26b',
  },
  itemText: {
    fontSize: 18,
    color: '#1f2a1d',
  },
  itemTextSelected: {
    fontWeight: '700',
    color: '#1f2a1d',
  },
  soundBox: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f4d8ac',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff7e8',
  },
  soundLabel: {
    fontWeight: '600',
    color: '#5e421c',
  },
  soundBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#f3a952',
    color: '#3f2c0b',
    fontWeight: '700',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  helperText: {
    color: '#829180',
    marginTop: 4,
  },
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f4e4',
    padding: 16,
    borderRadius: 18,
    gap: 12,
  },
  previewEmoji: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewEmojiText: {
    fontSize: 28,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2a1d',
  },
  previewMeta: {
    marginTop: 4,
    color: '#6f7e6b',
  },
  footer: {
    paddingHorizontal: 24,
    gap: 10,
    marginTop: 12,
  },
  cancelButton: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#dbe2d2',
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#6f7e6b',
    fontWeight: '700',
  },
  saveButton: {
    borderRadius: 16,
    backgroundColor: '#1f2a1d',
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});

export default AlarmSetting;
