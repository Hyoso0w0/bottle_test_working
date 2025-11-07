import { StyleSheet, Text, View } from 'react-native';

/** ---------- 나무 숲(성과) 컴포넌트 ---------- **/
const TreeForest = ({ trees = [] }) => {
  const maxTrees = 30;
  const limitedTrees = trees.slice(0, maxTrees);

  const items = limitedTrees.map((tree, i) => (
    <View key={tree.id ?? i} style={styles.treeCell}>
      <View
        style={[
          styles.treeBubble,
          { backgroundColor: tree.color || '#22c55e' }, // 미션별 색
        ]}
      >
        <Text style={styles.treeEmoji}>🌳</Text>
      </View>
    </View>
  ));

  return (
    <View>
      <View style={styles.forestGrid}>{items}</View>
      <Text style={styles.forestCaption}>
        심은 나무: {limitedTrees.length}그루
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  forestGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  treeCell: {
    width: '10%',
    paddingVertical: 4,
    alignItems: 'center',
  },
  // 🔹 나무 배경 동그라미 (색 달라지는 부분)
  treeBubble: {
    width: 28,
    height: 28,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  treeEmoji: {
    fontSize: 18,
  },
  forestCaption: {
    marginTop: 8,
    color: '#6b7280',
  },
});

export default TreeForest;