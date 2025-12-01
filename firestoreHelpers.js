// firestoreHelpers.js
import { auth, db } from "./firebase";
import {
  collection,
  doc,
  addDoc,
  setDoc,
  increment,
  serverTimestamp,
} from "firebase/firestore";


/**
 * 미션 완료 기록 + 누적 통계 업데이트
 * mission: { id, name, water, waste, co2, ... }
 * localTime: HomeScreen에서 이미 만들고 있는 {year, month, date, ...} 객체
 * timeSlot: morning/afternoon/evening
 */
export const saveMissionCompletion = async (mission, localTime, timeSlot) => {
  const user = auth.currentUser;
  if (!user) return; // 로그인 안 됐으면 그냥 로컬에만 저장

  const userRef = doc(db, "users", user.uid);
  const completedRef = collection(userRef, "completedMissions");

  // 1) 완료 기록 하나 추가
  await addDoc(completedRef, {
    missionId: mission.id,
    missionName: mission.name,
    water: mission.water,
    waste: mission.waste,
    co2: mission.co2,
    completedAt: localTime,      // 네가 쓰던 로컬 시간 객체 그대로 저장
    timeSlot,
    createdAt: serverTimestamp() // Firestore 서버 타임스탬프
  });

  // 2) 누적 통계 stats 업데이트
  const statsRef = doc(userRef, "stats", "env");
  await setDoc(
    statsRef,
    {
      totalWater: increment(mission.water || 0),
      totalWaste: increment(mission.waste || 0),
      totalCO2: increment(mission.co2 || 0),
      totalCompleted: increment(1),
    },
    { merge: true }
  );
};

import { getDoc } from "firebase/firestore";

// 알림 저장
export const saveAlarmsForUser = async (alarmsList) => {
  const user = auth.currentUser;
  if (!user) return;

  const userRef = doc(db, "users", user.uid);
  const alarmsDocRef = doc(userRef, "meta", "alarms");

  await setDoc(
    alarmsDocRef,
    {
      alarms: alarmsList,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
};

// 알림 불러오기
export const loadAlarmsForUser = async () => {
  const user = auth.currentUser;
  if (!user) return null;

  const userRef = doc(db, "users", user.uid);
  const alarmsDocRef = doc(userRef, "meta", "alarms");
  const snap = await getDoc(alarmsDocRef);
  if (!snap.exists()) return null;
  return snap.data().alarms || [];
};