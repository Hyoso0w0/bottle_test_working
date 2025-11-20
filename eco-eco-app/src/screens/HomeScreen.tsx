// src/screens/HomeScreen.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Screen, Notification } from '../../App';

interface HomeScreenProps {
  onNavigate: (screen: Screen) => void;
  notifications: Notification[];
  cookies: number;
  onAddCookies: (amount: number) => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigate,
  notifications,
  cookies,
  onAddCookies,
}) => {
  const getDayOfWeekInKorean = () => {
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    return days[new Date().getDay()];
  };

  const todayNotifications = notifications.filter(
    n => n.enabled && n.days.includes(getDayOfWeekInKorean()),
  );

  return (
    <View style={styles.container}>
      {/* 상단 헤더 */}
      <View style={styles.header}>
        <Text style={styles.title}>에코 알림</Text>
        <TouchableOpacity
          onPress={() => onNavigate('mypage')}
          style={styles.profileButton}
        >
          <Text style={styles.profileText}>MY</Text>
        </TouchableOpacity>
      </View>

      {/* 쿠키(보상) 영역 */}
      <View style={styles.cookieBox}>
        <Text style={styles.cookieLabel}>오늘 모은 쿠키</Text>
        <Text style={styles.cookieValue}>{cookies} 🍪</Text>
        <TouchableOpacity
          style={styles.cookieButton}
          onPress={() => onAddCookies(1)}
        >
          <Text style={styles.cookieButtonText}>미션 완료하기 (쿠키 +1)</Text>
        </TouchableOpacity>
      </View>

      {/* 오늘의 알림 목록 */}
      <Text style={styles.sectionTitle}>오늘의 알림</Text>
      <ScrollView style={styles.list}>
        {todayNotifications.length === 0 ? (
          <Text style={styles.emptyText}>오늘 설정된 알림이 없어요.</Text>
        ) : (
          todayNotifications.map(notif => (
            <View key={notif.id} style={styles.card}>
              <Text style={styles.cardIcon}>{notif.icon}</Text>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{notif.title}</Text>
                <Text style={styles.cardTime}>{notif.time}</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* 하단 탭 네비게이션 */}
      <View style={styles.bottomNav}>
        <TouchableOpacity onPress={() => onNavigate('home')}>
          <Text style={styles.navItemActive}>홈</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onNavigate('notifications')}>
          <Text style={styles.navItem}>알림</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onNavigate('calendar')}>
          <Text style={styles.navItem}>캘린더</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onNavigate('report')}>
          <Text style={styles.navItem}>리포트</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onNavigate('settings')}>
          <Text style={styles.navItem}>설정</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingBottom: 8, backgroundColor: '#f5fef4' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { fontSize: 24, fontWeight: '700' },
  profileButton: {
    backgroundColor: '#bbf7d0',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  profileText: { fontWeight: '600' },
  cookieBox: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#ecfccb',
    borderRadius: 16,
  },
  cookieLabel: { fontSize: 14, color: '#4b5563' },
  cookieValue: { fontSize: 28, fontWeight: '700', marginTop: 4 },
  cookieButton: {
    marginTop: 12,
    backgroundColor: '#22c55e',
    borderRadius: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  cookieButtonText: { color: 'white', fontWeight: '600' },
  sectionTitle: { marginTop: 24, fontSize: 18, fontWeight: '700' },
  list: { marginTop: 8, flex: 1 },
  emptyText: { marginTop: 16, color: '#6b7280' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 8,
  },
  cardIcon: { fontSize: 24, marginRight: 8 },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '600' },
  cardTime: { fontSize: 14, color: '#6b7280', marginTop: 2 },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e5e7eb',
    marginBottom: 20, 
  },
  navItem: { fontSize: 12, color: '#6b7280' },
  navItemActive: { fontSize: 12, fontWeight: '700', color: '#16a34a' },
});
