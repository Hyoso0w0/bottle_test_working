// src/screens/NotificationSettingsScreen.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import { Screen, Notification, EditNotificationData } from '../../App';

interface Props {
  onNavigate: (screen: Screen) => void;
  onEdit: (notification: EditNotificationData) => void;
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
}

const NotificationSettingsScreen: React.FC<Props> = ({
  onNavigate,
  onEdit,
  notifications,
  setNotifications,
}) => {
  const toggleNotification = (id: number, value: boolean) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, enabled: value } : n)),
    );
  };

  const handleEditPress = (n: Notification) => {
    const editable: EditNotificationData = {
      id: n.id,
      title: n.title,
      days: n.days,
      time: n.time,
      sound: 'default',
    };
    onEdit(editable);
  };

  return (
    <View style={styles.container}>
      {/* 상단 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => onNavigate('home')}>
          <Text style={styles.backText}>{'‹'} 홈</Text>
        </TouchableOpacity>
        <Text style={styles.title}>알림 설정</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.list}>
        {notifications.map(n => (
          <View key={n.id} style={styles.card}>
            <View style={styles.cardLeft}>
              <Text style={styles.icon}>{n.icon}</Text>
              <View>
                <Text style={styles.cardTitle}>{n.title}</Text>
                <Text style={styles.cardSub}>
                  {n.time} · {n.days.join(', ')}
                </Text>
              </View>
            </View>
            <View style={styles.cardRight}>
              <Switch
                value={n.enabled}
                onValueChange={v => toggleNotification(n.id, v)}
              />
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => handleEditPress(n)}
              >
                <Text style={styles.editText}>수정</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default NotificationSettingsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f9fafb' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backText: { color: '#16a34a', fontSize: 14 },
  title: { fontSize: 18, fontWeight: '700' },
  list: { marginTop: 16 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    justifyContent: 'space-between',
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: { fontSize: 24, marginRight: 8 },
  cardTitle: { fontSize: 16, fontWeight: '600' },
  cardSub: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  cardRight: { alignItems: 'flex-end' },
  editButton: {
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1fae5',
  },
  editText: { fontSize: 12, color: '#16a34a' },
});
