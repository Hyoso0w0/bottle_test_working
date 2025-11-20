import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DogCharacter from './DogCharacter';
import PushNotification from './PushNotification';
import { Screen } from '../../App'; 

// 화면 높이 관련 상수 (지금은 애니메이션 높이만 사용)
const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const COLLAPSED_HEIGHT = 280;
const EXPANDED_HEIGHT = 560;

// App.tsx에서 수동 네비게이션을 쓰고 있으니까
// 여기서는 onNavigate, notifications, cookies, onAddCookies 를 props로 받도록 수정
type HomeScreenProps = {
  onNavigate: (screen: Screen) => void; 
  notifications: {
    id: number;
    title: string;
    type: string;
    icon: string;
    time: string;
    days: string[];
    enabled: boolean;
  }[];
  cookies: number;
  onAddCookies: (amount: number) => void;
};

export default function HomeScreen({
  onNavigate,
  notifications: allNotifications,
  cookies,
  onAddCookies,
}: HomeScreenProps) {
  const [missions, setMissions] = useState([
    {
      id: 1,
      icon: '🛍️',
      title: '일회용 비닐봉투 거절하기',
      description:
        '마트나 편의점에서 장바구니를 사용해보세요!\n비닐봉투 1장을 거절하면 약 6g의 플라스틱 쓰레기를 줄일 수 있어요.',
      points: 6,
      completed: false,
    },
    {
      id: 2,
      icon: '🪴',
      title: '음식물 쓰레기 줄이기',
      description:
        '냉장고 속 재료로 요리하고, 남기지 말아요.\n한 끼 식사에서 남은 음식 1인분을 줄이면 약 150g의 음식물 쓰레기를 절약할 수 있어요.',
      points: 150,
      completed: false,
    },
    {
      id: 3,
      icon: '🪥',
      title: '대나무 칫솔 사용하기',
      description:
        '플라스틱 칫솔 대신 대나무 칫솔을 사용해보세요.\n1개 교체로 약 20g의 플라스틱 쓰레기를 절약할 수 있습니다.',
      points: 20,
      completed: false,
    },
  ]);

  const getDayOfWeekInKorean = () => {
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    return days[new Date().getDay()];
  };

  // App.tsx에서 내려온 전체 알림(allNotifications)에서
  // 오늘 + enabled 된 것만 골라서 HomeScreen용 상태로 변환
  const todayNotificationsData = allNotifications
    .filter(
      notif => notif.enabled && notif.days.includes(getDayOfWeekInKorean()),
    )
    .map(notif => ({
      id: notif.id,
      icon: notif.icon,
      text: notif.title,
      time: notif.time,
      completed: false,
    }));

  const [notifications, setNotifications] =
    useState<typeof todayNotificationsData>(todayNotificationsData);

  const [totalPoints, setTotalPoints] = useState(45);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPushNotification, setShowPushNotification] = useState(false);
  const sheetHeight = useState(new Animated.Value(COLLAPSED_HEIGHT))[0];

  // 앱 열리면 1초 뒤 PushNotification 띄우기
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPushNotification(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // bottom sheet 확장/축소 애니메이션
  useEffect(() => {
    Animated.spring(sheetHeight, {
      toValue: isExpanded ? EXPANDED_HEIGHT : COLLAPSED_HEIGHT,
      useNativeDriver: false,
      tension: 300,
      friction: 30,
    }).start();
  }, [isExpanded, sheetHeight]);

  const handleMissionComplete = (missionId: number) => {
    setMissions(prevMissions =>
      prevMissions.map(mission => {
        if (mission.id === missionId && !mission.completed) {
          setTotalPoints(prev => prev + mission.points);
          return { ...mission, completed: true };
        }
        return mission;
      }),
    );
  };

  const handleNotificationComplete = (notificationId: number) => {
    setNotifications(prevNotifications =>
      prevNotifications.map(notif => {
        if (notif.id === notificationId && !notif.completed) {
          setTotalPoints(prev => prev + 5);
          // 전역 cookies는 App.tsx가 들고 있으니까, props로 받은 onAddCookies 사용
          onAddCookies(10);
          return { ...notif, completed: true };
        }
        return notif;
      }),
    );
  };

  const completedMissionsCount = missions.filter(m => m.completed).length;
  const completedNotificationsCount = notifications.filter(
    n => n.completed,
  ).length;
  const totalCompleted = completedMissionsCount + completedNotificationsCount;
  const totalTasks = missions.length + notifications.length;
  const progress = totalTasks === 0 ? 0 : (totalCompleted / totalTasks) * 100;

  const getMood = () => {
    if (totalCompleted >= 5) return 'excited';
    if (totalCompleted >= 3) return 'happy';
    if (totalCompleted >= 1) return 'normal';
    return 'sleepy';
  };

  return (
    <View style={styles.container}>
      <PushNotification
        isVisible={showPushNotification}
        onClose={() => setShowPushNotification(false)}
        icon="☕"
        title="출근 전 텀블러 챙기기"
        message="오늘도 일회용 컵 대신 텀블러를 챙겨보세요!"
        time="지금"
      />

      {/* Header 영역 */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.cookieText}>🍪 쿠키 : {cookies}개</Text>
          <View style={styles.streakBadge}>
            <Text style={styles.streakText}>🔥 7일 연속</Text>
          </View>
        </View>

        {/* 요약 카드 */}
        <View style={styles.statsCard}>
          <View style={styles.statsLeft}>
            <Text style={styles.emoji}>
              {totalCompleted === 0 && '🌰'}
              {totalCompleted === 1 && '🌱'}
              {totalCompleted === 2 && '🪴'}
              {totalCompleted >= 3 && totalCompleted < 5 && '🌳'}
              {totalCompleted >= 5 && '🌲'}
            </Text>
            <View>
              <Text style={styles.statsLabel}>나의 환경 기여도</Text>
              <View style={styles.pointsRow}>
                <Text style={styles.pointsValue}>{totalPoints}</Text>
                <Text style={styles.pointsUnit}>점</Text>
              </View>
            </View>
          </View>
          <View style={styles.statsRight}>
            <View style={styles.statItem}>
              <Ionicons name="water" size={12} color="#84cc16" />
              <Text style={styles.statText}>{totalPoints * 200}L</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="leaf" size={12} color="#84cc16" />
              <Text style={styles.statText}>나무 {totalPoints}그루</Text>
            </View>
          </View>
        </View>

        {/* 진행도 바 */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>
            오늘의 미션 {totalCompleted}/{totalTasks} 완료!
          </Text>
        </View>
      </View>

      {/* 강아지 캐릭터 */}
      <View style={styles.characterContainer}>
        <DogCharacter mood={getMood()} size={160} />
      </View>

      {/* Bottom Sheet */}
      <Animated.View style={[styles.bottomSheet, { height: sheetHeight }]}>
        <TouchableOpacity
          style={styles.handleBar}
          onPress={() => setIsExpanded(!isExpanded)}
        >
          <View style={styles.handle} />
        </TouchableOpacity>

        <ScrollView
          style={styles.sheetContent}
          showsVerticalScrollIndicator={false}
        >
          {/* 오늘의 미션 */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="sparkles" size={20} color="#059669" />
              <Text style={styles.sectionTitle}>오늘의 미션</Text>
            </View>
            {missions.map(mission => (
              <View
                key={mission.id}
                style={[
                  styles.missionCard,
                  mission.completed
                    ? styles.missionCardCompleted
                    : styles.missionCardActive,
                ]}
              >
                <View style={styles.missionHeader}>
                  <Text style={styles.missionIcon}>{mission.icon}</Text>
                  <View style={styles.missionContent}>
                    <Text
                      style={[
                        styles.missionTitle,
                        mission.completed && styles.missionTitleCompleted,
                      ]}
                    >
                      {mission.title}
                    </Text>
                    <Text
                      style={[
                        styles.missionDescription,
                        mission.completed &&
                          styles.missionDescriptionCompleted,
                      ]}
                    >
                      {mission.description}
                    </Text>
                    <View style={styles.missionTags}>
                      <View style={styles.tag}>
                        <Text style={styles.tagText}>
                          쓰레기 {mission.points}g
                        </Text>
                      </View>
                      <View style={[styles.tag, styles.tagBlue]}>
                        <Text style={styles.tagTextBlue}>물 0.5L</Text>
                      </View>
                      <View style={[styles.tag, styles.tagPurple]}>
                        <Text style={styles.tagTextPurple}>탄소 110g</Text>
                      </View>
                    </View>
                  </View>
                </View>
                {!mission.completed ? (
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleMissionComplete(mission.id)}
                  >
                    <Text style={styles.actionButtonText}>실천하기</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.completedBadge}>
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color="#84cc16"
                    />
                    <Text style={styles.completedText}>
                      완료! +{mission.points}g 획득
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>

          {/* 오늘의 알림 */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="notifications" size={20} color="#84cc16" />
              <Text style={styles.sectionTitle}>오늘의 알림</Text>
            </View>
            {notifications.map(notification => (
              <View
                key={notification.id}
                style={[
                  styles.notificationCard,
                  notification.completed && styles.notificationCardCompleted,
                ]}
              >
                <Text style={styles.notificationIcon}>{notification.icon}</Text>
                <View style={styles.notificationContent}>
                  <Text
                    style={[
                      styles.notificationText,
                      notification.completed &&
                        styles.notificationTextCompleted,
                    ]}
                  >
                    {notification.text}
                  </Text>
                  <Text style={styles.notificationTime}>
                    ⏰ {notification.time}
                  </Text>
                </View>
                {!notification.completed ? (
                  <TouchableOpacity
                    style={styles.notificationButton}
                    onPress={() =>
                      handleNotificationComplete(notification.id)
                    }
                  >
                    <Text style={styles.notificationButtonText}>실천 완료</Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.cookieBadge}>🍪 10</Text>
                )}
              </View>
            ))}
          </View>
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0fdf4',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cookieText: {
    fontSize: 16,
    color: '#365314',
    fontWeight: '600',
  },
  streakBadge: {
    backgroundColor: '#d9f99d',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  streakText: {
    color: '#365314',
    fontSize: 12,
    fontWeight: '600',
  },
  statsCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  statsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  emoji: {
    fontSize: 24,
  },
  statsLabel: {
    fontSize: 10,
    color: '#365314',
  },
  pointsRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  pointsValue: {
    fontSize: 16,
    color: '#365314',
    fontWeight: '600',
  },
  pointsUnit: {
    fontSize: 10,
    color: '#84cc16',
    marginBottom: 2,
  },
  statsRight: {
    gap: 4,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 10,
    color: '#84cc16',
  },
  progressContainer: {
    marginTop: 12,
  },
  progressBar: {
    backgroundColor: '#d9f99d',
    borderRadius: 999,
    height: 8,
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: '#84cc16',
    height: '100%',
    borderRadius: 999,
  },
  progressText: {
    fontSize: 10,
    color: '#84cc16',
    textAlign: 'center',
    marginTop: 4,
  },
  characterContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 256,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  handleBar: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
  },
  handle: {
    width: 48,
    height: 6,
    backgroundColor: '#d1d5db',
    borderRadius: 999,
  },
  sheetContent: {
    paddingHorizontal: 24,
    paddingBottom: 96,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    color: '#065f46',
    fontWeight: '600',
  },
  missionCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#d9f99d',
  },
  missionCardActive: {
    backgroundColor: '#fefce8',
  },
  missionCardCompleted: {
    backgroundColor: '#f0fdf4',
  },
  missionHeader: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  missionIcon: {
    fontSize: 24,
  },
  missionContent: {
    flex: 1,
  },
  missionTitle: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '600',
    marginBottom: 4,
  },
  missionTitleCompleted: {
    color: '#365314',
  },
  missionDescription: {
    fontSize: 11,
    color: '#4b5563',
    marginBottom: 8,
    lineHeight: 16,
  },
  missionDescriptionCompleted: {
    color: '#84cc16',
  },
  missionTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  tagBlue: {
    backgroundColor: '#dbeafe',
  },
  tagPurple: {
    backgroundColor: '#e9d5ff',
  },
  tagText: {
    fontSize: 10,
    color: '#374151',
  },
  tagTextBlue: {
    color: '#1e40af',
  },
  tagTextPurple: {
    color: '#6b21a8',
  },
  actionButton: {
    backgroundColor: '#84cc16',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignSelf: 'flex-end',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-end',
  },
  completedText: {
    fontSize: 12,
    color: '#84cc16',
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#d9f99d',
    backgroundColor: '#ffffff',
  },
  notificationCardCompleted: {
    backgroundColor: '#f0fdf4',
  },
  notificationIcon: {
    fontSize: 24,
  },
  notificationContent: {
    flex: 1,
  },
  notificationText: {
    fontSize: 12,
    color: '#1f2937',
    marginBottom: 4,
  },
  notificationTextCompleted: {
    color: '#365314',
  },
  notificationTime: {
    fontSize: 10,
    color: '#9ca3af',
  },
  notificationButton: {
    borderWidth: 1,
    borderColor: '#d9f99d',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  notificationButtonText: {
    color: '#84cc16',
    fontSize: 11,
    fontWeight: '600',
  },
  cookieBadge: {
    fontSize: 10,
    color: '#84cc16',
  },
});
