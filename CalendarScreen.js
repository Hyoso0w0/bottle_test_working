// CalendarScreen.js
import React, { useState, useContext, useCallback } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { AppContext } from './AppContext'

// 날짜 유틸리티 함수들
const getDaysInMonth = (date) => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
};

const getFirstDayOfMonth = (date) => {
  return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
};

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  return `${year}년 ${month}월`;
};

const isSameDay = (date1, date2) => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

const isToday = (date) => {
  return isSameDay(date, new Date());
};

const CalendarScreen = ({ navigation, route }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  // 미션 기록 가져오기 (route.params에서)
  //const missionHistory = route.params?.history || [];
  const { completedMissions } = useContext(AppContext)

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);

  // 특정 날짜에 완료한 미션 수 계산
  const getMissionCountForDate = useCallback((date) => {
    const targetYear = date.getFullYear();
    const targetMonth = date.getMonth();
    const targetDay = date.getDate();
    
    return completedMissions.filter((mission) => {
      const completedAt = mission.completedAt;
      // 로컬 시간 객체인 경우
      if (completedAt && typeof completedAt === 'object' && completedAt.year !== undefined) {
        return (
          completedAt.year === targetYear &&
          completedAt.month === targetMonth &&
          completedAt.date === targetDay
        );
      }
      // ISO 문자열인 경우 (하위 호환성)
      const missionDate = new Date(completedAt);
      return (
        missionDate.getFullYear() === targetYear &&
        missionDate.getMonth() === targetMonth &&
        missionDate.getDate() === targetDay
      );
    }).length;
  }, [completedMissions] );

  // 미션 수에 따른 초록색 배경색 계산 (0개 = 연한색, 많을수록 진하게)
  const getGreenBackgroundColor = (missionCount) => {
    if (missionCount === 0) return null; // 배경색 없음
    
    // 최대 미션 수를 5개로 가정 (더 많으면 진한 초록색)
    const maxMissions = 5;
    const intensity = Math.min(missionCount / maxMissions, 1);
    
    // 연한 초록색(#dcfce7)에서 진한 초록색(#16a34a)까지
    // RGB 값으로 계산
    const lightGreen = { r: 220, g: 252, b: 231 }; // #dcfce7
    const darkGreen = { r: 22, g: 163, b: 74 }; // #16a34a
    
    const r = Math.round(lightGreen.r + (darkGreen.r - lightGreen.r) * intensity);
    const g = Math.round(lightGreen.g + (darkGreen.g - lightGreen.g) * intensity);
    const b = Math.round(lightGreen.b + (darkGreen.b - lightGreen.b) * intensity);
    
    return `rgb(${r}, ${g}, ${b})`;
  };

  // 이전 달로 이동
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  // 다음 달로 이동
  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // 오늘로 이동
  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  // 날짜 선택
  const handleDateSelect = (day) => {
    const newDate = new Date(year, month, day);
    setSelectedDate(newDate);
  };

  // 캘린더 그리드 생성
  const renderCalendarDays = () => {
    const days = [];
    const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

    // 요일 헤더
    const weekDayHeaders = weekDays.map((day, index) => (
      <View key={`header-${index}`} style={styles.weekDayHeader}>
        <Text style={[styles.weekDayText, index === 0 && styles.sundayText, index === 6 && styles.saturdayText]}>
          {day}
        </Text>
      </View>
    ));

    // 빈 칸 (첫 주의 시작 부분)
    const emptyDays = [];
    for (let i = 0; i < firstDay; i++) {
      emptyDays.push(
        <View key={`empty-${i}`} style={styles.dayCell}>
          <Text style={styles.emptyDayText}></Text>
        </View>
      );
    }

    // 실제 날짜들
    const dateCells = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isSelected = isSameDay(date, selectedDate);
      const isTodayDate = isToday(date);
      const missionCount = getMissionCountForDate(date);
      const greenBackgroundColor = getGreenBackgroundColor(missionCount);

      dateCells.push(
        <TouchableOpacity
          key={`day-${day}`}
          style={[
            styles.dayCell,
            isSelected && styles.selectedDayCell,
            isTodayDate && !isSelected && styles.todayCell,
            !isSelected && greenBackgroundColor && { backgroundColor: greenBackgroundColor },
          ]}
          onPress={() => handleDateSelect(day)}
        >
          <Text
            style={[
              styles.dayText,
              isSelected && styles.selectedDayText,
              isTodayDate && !isSelected && styles.todayText,
              (firstDay + day - 1) % 7 === 0 && styles.sundayText,
              (firstDay + day - 1) % 7 === 6 && styles.saturdayText,
            ]}
          >
            {day}
          </Text>
        </TouchableOpacity>
      );
    }

    // 모든 날짜를 7일 단위로 그룹화
    const allDays = [...emptyDays, ...dateCells];
    
    // 마지막 주에도 7개가 되도록 빈 칸 추가
    const totalCells = allDays.length;
    const remainingCells = totalCells % 7;
    if (remainingCells > 0) {
      const emptyCellsNeeded = 7 - remainingCells;
      for (let i = 0; i < emptyCellsNeeded; i++) {
        allDays.push(
          <View key={`empty-end-${i}`} style={styles.dayCell}>
            <Text style={styles.emptyDayText}></Text>
          </View>
        );
      }
    }
    
    const weeks = [];
    for (let i = 0; i < allDays.length; i += 7) {
      weeks.push(
        <View key={`week-${i}`} style={styles.weekRow}>
          {allDays.slice(i, i + 7)}
        </View>
      );
    }

    return (
      <View style={styles.calendarContainer}>
        <View style={styles.weekDayRow}>{weekDayHeaders}</View>
        {weeks}
      </View>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StatusBar style="auto" />

      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goToPreviousMonth} style={styles.navButton}>
          <Text style={styles.navButtonText}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.monthYearText}>{formatDate(currentDate)}</Text>
          <TouchableOpacity onPress={goToToday} style={styles.todayButton}>
            <Text style={styles.todayButtonText}>오늘</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
          <Text style={styles.navButtonText}>›</Text>
        </TouchableOpacity>
      </View>

      {/* 캘린더 */}
      <View style={styles.card}>
        {renderCalendarDays()}
      </View>

      {/* 선택된 날짜 정보 */}
      <View style={styles.card}>
        <Text style={styles.cardHeader}>선택된 날짜</Text>
        <Text style={styles.selectedDateText}>
          {selectedDate.getFullYear()}년 {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일
        </Text>
        <Text style={styles.selectedDateSubtext}>
          {['일', '월', '화', '수', '목', '금', '토'][selectedDate.getDay()]}요일
        </Text>
        <Text style={styles.missionCountText}>
          완료한 미션: {getMissionCountForDate(selectedDate)}개
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 40,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  navButtonText: {
    fontSize: 24,
    color: '#111827',
    fontWeight: '600',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  monthYearText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  todayButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#111827',
  },
  todayButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderColor: '#e5e7eb',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  calendarContainer: {
    width: '100%',
  },
  weekDayRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekDayHeader: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  weekDayText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  dayCell: {
    flex: 1,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    margin: 2,
  },
  selectedDayCell: {
    backgroundColor: '#111827',
  },
  todayCell: {
    backgroundColor: '#f3f4f6',
  },
  dayText: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  selectedDayText: {
    color: '#fff',
    fontWeight: '700',
  },
  todayText: {
    color: '#111827',
    fontWeight: '700',
  },
  sundayText: {
    color: '#ef4444',
  },
  saturdayText: {
    color: '#3b82f6',
  },
  emptyDayText: {
    color: 'transparent',
  },
  cardHeader: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
    color: '#111827',
  },
  selectedDateText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  selectedDateSubtext: {
    fontSize: 16,
    color: '#6b7280',
  },
  missionCountText: {
    fontSize: 14,
    color: '#16a34a',
    fontWeight: '600',
    marginTop: 8,
  },
});

export default CalendarScreen;

