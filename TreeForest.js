import { StyleSheet, Text, View } from 'react-native';

/** ---------- 나무 숲(성과) 컴포넌트 ---------- **/
const TreeForest = ({ completedCount = 0 }) => {
  // 완료 개수에 따라 나무 이모지 빽빽하게 보여주기 (최대 30 그리드)
  const maxTrees = 30;
  const trees = Math.min(completedCount, maxTrees);
  const items = Array.from({ length: maxTrees }).map((_, i) => (
    <View key={i} style={styles.treeCell}>
      <Text style={{ fontSize: 18, opacity: i < trees ? 1 : 0.15 }}>
        🌳
      </Text>
    </View>
  ));
  return (
    <View>
      <View style={styles.forestGrid}>{items}</View>
      <Text style={styles.forestCaption}>완료 미션: {completedCount}개</Text>
    </View>
  );
};

const styles = StyleSheet.create ({
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
})

export default TreeForest;
