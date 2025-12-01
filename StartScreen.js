// StartScreen.js
import React from "react";
import { View, Text, Pressable } from "react-native";

export default function StartScreen({ navigation }) {
  const goToLogin = () => {
    navigation.navigate("Login"); // App.js에서 Stack.Screen name="Login" 기준
  };

  return (
    <View
      style={{
        flex: 1,
        padding: 24,
        justifyContent: "center",
        alignItems: "center",
        gap: 24,
      }}
    >
      <Text style={{ fontSize: 28, fontWeight: "800", textAlign: "center" }}>
        보들보틀
      </Text>

      <Text
        style={{
          fontSize: 16,
          textAlign: "center",
          color: "#555",
          lineHeight: 22,
        }}
      >
       하루의 제로웨이스트
      </Text>

      <Pressable
        onPress={goToLogin}
        style={{
          backgroundColor: "#000",
          paddingVertical: 14,
          paddingHorizontal: 40,
          borderRadius: 999,
          marginTop: 12,
        }}
      >
        <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>
          시작하기
        </Text>
      </Pressable>
    </View>
  );
}
