import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PushNotificationProps {
  isVisible: boolean;
  onClose: () => void;
  icon: string;
  title: string;
  message: string;
  time: string;
}

export default function PushNotification({
  isVisible,
  onClose,
  icon,
  title,
  message,
  time,
}: PushNotificationProps) {
  // 애니메이션 값들
  const slideAnim = useRef(new Animated.Value(-200)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      // 나타날 때
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 300,
          friction: 20,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // 5초 후 자동 닫기
      const timer = setTimeout(() => {
        onClose();
      }, 5000);

      return () => clearTimeout(timer);
    } else {
      // 사라질 때
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -200,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible, onClose, opacityAnim, slideAnim]);

  if (!isVisible) return null;

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <View style={styles.card}>
        {/* App Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.appIcon}>
              <Text style={styles.appIconText}>🌱</Text>
            </View>
            <Text style={styles.appName}>보들이 제로웨이스트</Text>
          </View>
          <Text style={styles.time}>{time}</Text>
        </View>

        {/* Notification Content */}
        <View style={styles.content}>
          <Text style={styles.icon}>{icon}</Text>
          <View style={styles.textContainer}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={16} color="#374151" />
          </TouchableOpacity>
        </View>

        {/* Action Button */}
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>앱 열기</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 16,
    left: '5%',
    right: '5%',
    zIndex: 1000,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appIcon: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: '#4ade80',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8, // gap 대체
  },
  appIconText: {
    fontSize: 12,
    color: '#ffffff',
  },
  appName: {
    fontSize: 10,
    color: '#4b5563',
  },
  time: {
    fontSize: 10,
    color: '#9ca3af',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
  },
  icon: {
    fontSize: 32,
    marginRight: 12, // gap 대체
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
    marginBottom: 4,
  },
  message: {
    fontSize: 12,
    color: '#4b5563',
    lineHeight: 18,
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButton: {
    backgroundColor: '#4ade80',
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});
