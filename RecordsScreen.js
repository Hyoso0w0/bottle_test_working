import React, { useState, useContext } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { AppContext } from "./AppContext";
import LevelSection from "./LevelSection";
import { levelStages } from "./data/levels"



const RecordsScreen = ({ navigation }) => {
  const { completedMissions, stats, cookieStats } = useContext(AppContext);
  const [showCompleted, setShowCompleted] = useState(false);

  return (
    <View style={styles.container}>
      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={{ paddingBottom: 140 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.replace('Home')}
            style={styles.backButton}
          >
            <Feather name="chevron-left" size={22} color="#444" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>🌿 나의 대시보드</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileRow}>
            <View style={styles.profileImage}>
              <Image
                  source={{ uri: "https://via.placeholder.com/80" }} 
                  style={{ width: 64, height: 64, borderRadius: 32 }}
                />
            </View>

            <View style={styles.userInfo}>
              <View style={styles.badge}>
                <Text style={styles.badgeIcon}>🌈</Text>
                <Text style={styles.badgeText}>환경 지킴이</Text>
              </View>
              <Text style={styles.username}>이그린님</Text>
            </View>

            {/* Settings */}
            <TouchableOpacity
              onPress={() => onNavigate("settings")}
              style={styles.settingsButton}
            >
              <Feather name="settings" size={18} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Progress */}
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <View style={styles.progressLeft}>
                <Text style={styles.progressIcon}>🎯</Text>
                <Text style={styles.progressLabel}>이번 달 실천율</Text>
              </View>

              <View style={styles.progressPercentBox}>
                <Text style={styles.progressPercent}>75%</Text>
              </View>
            </View>

            <View style={styles.progressBarBackground}>
              <View style={[styles.progressBarFill, { width: "75%" }]} />
            </View>
          </View>

            {/* Cookies */}
          <View style={styles.cookieCard}>
            <Text style={styles.cookieText}>🍪 모은 쿠키 개수: {cookieStats.totalCookies} 개</Text>
          </View>

        </View>

        

        {/* Navigation Icons */}
        <View style={styles.navGridCard}>
          <View style={styles.navGrid}>
            <TouchableOpacity
              onPress={() => navigation.navigate('Calendar')}
              style={styles.navButton}
            >
              <View
                style={[styles.navIconCircle, { backgroundColor: "#82C91E" }]}
              >
                <Feather name="calendar" size={28} color="#fff" />
              </View>
              <Text style={styles.navText}>캘린더</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('Report')}
              style={styles.navButton}
            >
              <View
                style={[styles.navIconCircle, { backgroundColor: "#FFC300" }]}
              >
                <Feather name="bar-chart-2" size={28} color="#fff" />
              </View>
              <Text style={styles.navText}>리포트</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statBoxYellow}>
            <Text style={styles.statLabel}>연속 실천</Text>
            <Text style={styles.statValue}>7일 🔥</Text>
          </View>

          <TouchableOpacity
            onPress={() => setShowCompleted(!showCompleted)}
            style={styles.statBoxGreen}
          >
            <Text style={styles.statLabel}>완료한 미션</Text>
            <Text style={styles.statValue}>
              {completedMissions.length}개 ⭐
            </Text>
          </TouchableOpacity>
        </View>

        {/* Completed Missions List (Toggle) */}
        {showCompleted && (
          <View style={styles.completedContainer}>
            <Text style={styles.completedTitle}>🎉 완료한 미션</Text>

            {completedMissions.length === 0 ? (
              <Text style={styles.noMissions}>아직 완료한 미션이 없어요!</Text>
            ) : (
              completedMissions.map((mission, index) => (
                <View key={index} style={styles.completedItem}>
                  <Feather name="check-circle" size={20} color="#4CAF50" />
                  <Text style={styles.completedText}>{mission.mission}</Text>
                </View>
              ))
            )}
          </View>
        )}

        <Text style={styles.statistics_title}>나의 환경 절약 기록</Text>

        <View style={styles.statistics_card}>
          <View style={styles.statistics_card_water}>
            <View
                style={[styles.statistics_circle, { backgroundColor: "#fff", borderColor: "#90e3ffff", borderWidth: 2 }]}
              >
                <Text style={styles.statistics_icon}>💧</Text>
              </View>
            <Text style={styles.statistics_value}> 물 {stats.totalWater} mL 절약</Text>
              <LevelSection
                label="물 절약 미션"
                emoji="💧"
                unit="mL"
                value={stats.totalWater}
                stages={levelStages.water}
              />
          </View>
          <View style={styles.statistics_card_waste}>
            <View
                style={[styles.statistics_circle, { backgroundColor: "#fff", borderColor: "#ff9e61ff", borderWidth: 2 }]}
              >
                <Text style={styles.statistics_icon}>🗑️</Text>
              </View>
          < Text style={styles.statistics_value}>쓰레기 {stats.totalWaste}kg 절약</Text>
            <LevelSection
              label="쓰레기 절감 미션"
              emoji="🗑️"
              unit="kg"
              value={stats.totalWaste}
              stages={levelStages.waste}
            />
          </View>
          <View style={styles.statistics_card_co2}>
            <View
                style={[styles.statistics_circle, { backgroundColor: "#fff", borderColor: "#81f77bff", borderWidth: 2 }]}
              >
                <Text style={styles.statistics_icon}>🌳</Text>
              </View>
            <Text style={styles.statistics_value}>CO₂ {stats.totalCO2} g 절약</Text>
               <LevelSection
                label="탄소 절감 미션"
                emoji="🌳"
                unit="g"
                value={stats.totalCO2}
                stages={levelStages.carbon}
              />
          </View>
        </View> 
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          onPress={() => navigation.navigate('Notifications')}
          style={styles.bottomButton}
        >
          <Feather name="bell" size={22} color="#666" />
          <Text style={styles.bottomLabel}>알림</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('Home')}
          style={styles.bottomHome}
        >
          <Feather name="home" size={26} color="#666" />
          <Text style={styles.bottomLabel}>홈</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('Records')}
          style={styles.bottomButton}
        >
          <Feather name="user" size={22} color="#4CAF50" />
          <Text style={[styles.bottomLabel, { color: "#4CAF50" }]}>마이</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ---------------------------------------- */
/*                 STYLES                  */
/* ---------------------------------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FFF4",
  },
  scrollArea: {
    flex: 1,
  },

  /* Header */
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
  },
  backButton: {
    padding: 6,
    marginRight: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#222",
  },

  /* Profile */
  profileCard: {
    backgroundColor: "white",
    margin: 16,
    padding: 16,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileImage: {
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeIcon: { fontSize: 14 },
  badgeText: { fontSize: 12, marginLeft: 4, color: "#4CAF50" },

  username: { fontSize: 18, fontWeight: "700", marginTop: 4, color: "#222" },

  settingsButton: {
    backgroundColor: "#4CAF50",
    padding: 8,
    borderRadius: 12,
  },

  /* Progress */
  progressCard: { marginTop: 16 },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  progressLeft: { flexDirection: "row", alignItems: "center" },
  progressIcon: { fontSize: 18, marginRight: 6 },
  progressLabel: { fontSize: 16, fontWeight: "600", color: "#444" },

  progressPercentBox: {
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  progressPercent: { color: "#4CAF50", fontWeight: "700" },

  progressBarBackground: {
    backgroundColor: "#E0E0E0",
    height: 12,
    borderRadius: 6,
    overflow: "hidden",
    marginTop: 4,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#4CAF50",
    borderRadius: 6,
  },
  progressEmoji: {
    position: "absolute",
    right: -4,
    top: -18,
    fontSize: 18,
  },

  /* Navigation Grid */
  navGridCard: {
    marginHorizontal: 16,
    marginTop: 6,
  },
  navGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  navButton: {
    alignItems: "center",
    width: "33%",
  },
  navIconCircle: {
    width: 70,
    height: 70,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 35,
    marginBottom: 8,
  },
  navText: { fontSize: 14, color: "#444" },

  /* Stats */
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    margin: 16,
  },
  statBoxYellow: {
    backgroundColor: "#FFF9C4",
    padding: 16,
    width: "48%",
    borderRadius: 16,
  },
  statBoxGreen: {
    backgroundColor: "#E8F5E9",
    padding: 16,
    width: "48%",
    borderRadius: 16,
  },
  statLabel: { fontSize: 14, color: "#555" },
  statValue: { fontSize: 20, fontWeight: "700", marginTop: 8 },

  /* Completed Missions */
  completedContainer: {
    marginHorizontal: 16,
    marginTop: 8,
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  completedTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  completedItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  completedText: {
    marginLeft: 10,
    fontSize: 16,
    color: "#333",
  },
  noMissions: {
    fontSize: 15,
    color: "#777",
    textAlign: "center",
    paddingVertical: 8,
  },

  /* Bottom Nav */
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderColor: "#eee",
  },
  bottomButton: { alignItems: "center" },
  bottomLabel: { fontSize: 12, color: "#666", marginTop: 2 },
  bottomHome: { alignItems: "center" },
  statistics_container: {
    padding: 20,
    paddingBottom: 40,
  },
  statistics_title: { fontSize: 24, fontWeight: "700", marginBottom: 20 },
  statistics_card: {
    marginLeft: 15,
    marginRight: 15,
    borderRadius: 16,
    padding: 20,
    borderColor: "#cdf78d",
    borderWidth: 1,
    backgroundColor: "#fff",
  },
  statistics_card_waste: {
    borderRadius: 10,
    borderColor: "#ff9e61ff",
    borderWidth: 2,
    padding: 10,
    backgroundColor: '#ffefe2ff',
    marginTop: 5,
    marginBottom: 5,
  },
  statistics_card_water: {
    borderRadius: 10,
    borderColor: "#90e3ffff",
    borderWidth: 2,
    padding: 10,
    backgroundColor: '#eafbffff',
    marginTop: 5,
    marginBottom: 5,
  },
  statistics_card_co2: {
    borderRadius: 10,
    borderColor: '#81f77bff',
    borderWidth: 2,
    padding: 10,
    backgroundColor: '#e9ffe7ff',
    marginTop: 5,
    marginBottom: 5,
  },
  statistics_value: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },
  statistics_circle: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 35,
    marginBottom: 8,
  },
  statistics_icon: {
    fontSize: 15,
    fontWeight: "600",
  },
  statistics_mission_text: {
    fontSize: 15,
    fontWeight: 600,
  },
  cookieCard: {
    borderRadius: 10,
    backgroundColor: '#f1d4a5ff',
    marginTop: 10,
    marginBottom: 10,
    padding: 10,
  },
  cookieText: {
    fontWeight: "600",
    fontSize: 15,
    color: '#8b5f36ff',
  },
});

export default RecordsScreen
