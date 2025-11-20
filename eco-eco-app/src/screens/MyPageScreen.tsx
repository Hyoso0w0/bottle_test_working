// src/screens/MyPageScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Screen } from '../../App';

interface Props {
  onNavigate: (screen: Screen) => void;
}

const MyPageScreen: React.FC<Props> = ({ onNavigate }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>마이페이지</Text>
      <Text style={styles.text}>여기에 프로필, 통계 등을 넣을 수 있어요.</Text>
      <TouchableOpacity onPress={() => onNavigate('home')}>
        <Text style={styles.back}>홈으로</Text>
      </TouchableOpacity>
    </View>
  );
};

export default MyPageScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  text: { color: '#6b7280', textAlign: 'center', marginBottom: 16 },
  back: { color: '#16a34a', fontWeight: '600' },
});
