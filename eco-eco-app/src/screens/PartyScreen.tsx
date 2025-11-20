// src/screens/PartyScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Screen } from '../../App';

interface Props {
  onNavigate: (screen: Screen) => void;
}

const PartyScreen: React.FC<Props> = ({ onNavigate }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>파티(함께하기)</Text>
      <Text style={styles.text}>친구들과 함께 미션을 공유하는 공간으로 확장할 수 있어요.</Text>
      <TouchableOpacity onPress={() => onNavigate('home')}>
        <Text style={styles.back}>홈으로</Text>
      </TouchableOpacity>
    </View>
  );
};

export default PartyScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  text: { color: '#6b7280', textAlign: 'center', marginBottom: 16 },
  back: { color: '#16a34a', fontWeight: '600' },
});
