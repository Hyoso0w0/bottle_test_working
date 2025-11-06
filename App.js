import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import RecordsScreen from './RecordsScreen';
import HomeScreen from './HomeScreen';
import NotificationsScreen from './NotificationsScreen';

/** ---------- 네비게이션 ---------- **/
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerTitleAlign: 'center',
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: '첫 화면' }} />
        <Stack.Screen name="Records" component={RecordsScreen} options={{ title: '내 기록' }} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: '알림 설정' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
