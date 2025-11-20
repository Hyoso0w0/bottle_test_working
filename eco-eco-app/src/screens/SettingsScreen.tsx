// src/screens/SettingsScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Screen } from '../../App';

interface Props {
  onNavigate: (screen: Screen) => void;
}

const SettingsScreen: React.FC<Props> = ({ onNavigate }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>설정</Text>
      <Text style={styles.text}>푸시알림, 테마, 계정 등을 설정할 수 있는 화면입니다.</Text>
      <TouchableOpacity onPress={() => onNavigate('home')}>
        <Text style={styles.back}>홈으로</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  text: { color: '#6b7280', textAlign: 'center', marginBottom: 16 },
  back: { color: '#16a34a', fontWeight: '600' },
});
