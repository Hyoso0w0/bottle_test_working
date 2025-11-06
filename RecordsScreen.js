import { StyleSheet, Text, View, ScrollView } from 'react-native';

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

const styles = StyleSheet.create({
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
});

export default RecordsScreen;
