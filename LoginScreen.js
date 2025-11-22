// LoginScreen.js
import { useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from "firebase/auth";
import { auth } from "./firebase";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, pw);
      // 로그인 성공 → App.js에서 user 감지됨
    } catch (e) {
      setError("로그인 실패: " + e.message);
    }
  };

  const handleSignup = async () => {
    setError("");
    try {
      await createUserWithEmailAndPassword(auth, email, pw);
      // 회원가입 → 자동로그인됨
    } catch (e) {
      setError("회원가입 실패: " + e.message);
    }
  };

  return (
    <View style={{ flex: 1, padding: 24, justifyContent: "center", gap: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: "700", textAlign: "center" }}>
        {isSignup ? "회원가입" : "로그인"}
      </Text>

      {error !== "" && (
        <Text style={{ color: "red", textAlign: "center", marginVertical: 8 }}>
          {error}
        </Text>
      )}

      <TextInput
        placeholder="이메일"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          padding: 12,
          borderRadius: 8,
        }}
      />

      <TextInput
        placeholder="비밀번호"
        value={pw}
        onChangeText={setPw}
        secureTextEntry
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          padding: 12,
          borderRadius: 8,
        }}
      />

      {isSignup ? (
        <Pressable
          onPress={handleSignup}
          style={{
            backgroundColor: "#000",
            padding: 14,
            borderRadius: 8,
            marginTop: 12,
          }}
        >
          <Text style={{ color: "white", textAlign: "center" }}>회원가입</Text>
        </Pressable>
      ) : (
        <Pressable
          onPress={handleLogin}
          style={{
            backgroundColor: "#000",
            padding: 14,
            borderRadius: 8,
            marginTop: 12,
          }}
        >
          <Text style={{ color: "white", textAlign: "center" }}>로그인</Text>
        </Pressable>
      )}

      <Pressable onPress={() => setIsSignup(!isSignup)}>
        <Text
          style={{
            marginTop: 16,
            color: "blue",
            textAlign: "center",
            fontSize: 14,
          }}
        >
          {isSignup ? "로그인 화면으로" : "계정이 없나요? 회원가입"}
        </Text>
      </Pressable>
    </View>
  );
}
