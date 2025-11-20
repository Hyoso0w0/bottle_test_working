import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Ellipse, Circle, Path, G } from 'react-native-svg';

type DogMood =
  | 'happy'
  | 'excited'
  | 'normal'
  | 'sleepy'
  | 'sad'
  | 'crying'
  | 'jumping'
  | 'playing';

interface DogCharacterProps {
  mood?: DogMood;
  size?: number;
  fullBody?: boolean; // 지금은 안 쓰이지만, 나중 확장용으로 남겨둠
}

const DogCharacter: React.FC<DogCharacterProps> = ({
  mood = 'happy',
  size = 200,
  fullBody = false,
}) => {
  const getEyes = () => {
    switch (mood) {
      case 'excited':
      case 'jumping':
      case 'playing':
        return (
          <>
            <Circle cx="75" cy="95" r="12" fill="#2D3748" />
            <Circle cx="72" cy="92" r="4" fill="#FFFFFF" />
            <Circle cx="79" cy="98" r="2" fill="#FFFFFF" opacity={0.7} />
            <Circle cx="125" cy="95" r="12" fill="#2D3748" />
            <Circle cx="122" cy="92" r="4" fill="#FFFFFF" />
            <Circle cx="129" cy="98" r="2" fill="#FFFFFF" opacity={0.7} />
          </>
        );
      case 'sleepy':
        return (
          <>
            <Path
              d="M 65 95 Q 75 100 85 95"
              stroke="#2D3748"
              strokeWidth={3}
              fill="none"
              strokeLinecap="round"
            />
            <Path
              d="M 115 95 Q 125 100 135 95"
              stroke="#2D3748"
              strokeWidth={3}
              fill="none"
              strokeLinecap="round"
            />
          </>
        );
      case 'sad':
        return (
          <>
            <Circle cx="75" cy="95" r="9" fill="#2D3748" />
            <Circle cx="73" cy="92" r="2.5" fill="#FFFFFF" />
            <Path
              d="M 65 88 Q 75 85 85 88"
              stroke="#2D3748"
              strokeWidth={2}
              fill="none"
              strokeLinecap="round"
            />
            <Circle cx="125" cy="95" r="9" fill="#2D3748" />
            <Circle cx="123" cy="92" r="2.5" fill="#FFFFFF" />
            <Path
              d="M 115 88 Q 125 85 135 88"
              stroke="#2D3748"
              strokeWidth={2}
              fill="none"
              strokeLinecap="round"
            />
          </>
        );
      case 'normal':
        return (
          <>
            <Circle cx="75" cy="95" r="10" fill="#2D3748" />
            <Circle cx="72" cy="92" r="3" fill="#FFFFFF" />
            <Circle cx="125" cy="95" r="10" fill="#2D3748" />
            <Circle cx="122" cy="92" r="3" fill="#FFFFFF" />
          </>
        );
      case 'happy':
      default:
        return (
          <>
            <Path
              d="M 65 92 Q 75 100 85 92"
              stroke="#2D3748"
              strokeWidth={3}
              fill="none"
              strokeLinecap="round"
            />
            <Circle cx="75" cy="95" r="10" fill="#2D3748" />
            <Circle cx="72" cy="92" r="3" fill="#FFFFFF" />
            <Path
              d="M 115 92 Q 125 100 135 92"
              stroke="#2D3748"
              strokeWidth={3}
              fill="none"
              strokeLinecap="round"
            />
            <Circle cx="125" cy="95" r="10" fill="#2D3748" />
            <Circle cx="122" cy="92" r="3" fill="#FFFFFF" />
          </>
        );
    }
  };

  const getMouth = () => {
    switch (mood) {
      case 'excited':
      case 'jumping':
      case 'playing':
        return (
          <>
            <Path
              d="M 85 125 Q 100 140 115 125"
              stroke="#2D3748"
              strokeWidth={3}
              fill="none"
              strokeLinecap="round"
            />
            <Ellipse
              cx="100"
              cy="135"
              rx="8"
              ry="10"
              fill="#FF6B9D"
              opacity={0.8}
            />
          </>
        );
      case 'sleepy':
        return <Circle cx="100" cy="125" r="4" fill="#2D3748" />;
      case 'sad':
        return (
          <Path
            d="M 85 130 Q 100 125 115 130"
            stroke="#2D3748"
            strokeWidth={3}
            fill="none"
            strokeLinecap="round"
          />
        );
      case 'normal':
        return (
          <Path
            d="M 85 125 Q 100 132 115 125"
            stroke="#2D3748"
            strokeWidth={3}
            fill="none"
            strokeLinecap="round"
          />
        );
      case 'happy':
      default:
        return (
          <>
            <Path
              d="M 80 120 Q 100 135 120 120"
              stroke="#2D3748"
              strokeWidth={3}
              fill="none"
              strokeLinecap="round"
            />
            <Path
              d="M 95 128 L 95 133"
              stroke="#FF6B9D"
              strokeWidth={2}
              strokeLinecap="round"
            />
          </>
        );
    }
  };

  return (
    <View style={styles.wrapper}>
      <Svg width={size} height={size} viewBox="0 0 200 200">
        {/* 얼굴 */}
        <Ellipse cx="100" cy="110" rx="70" ry="75" fill="#F5DEB3" />

        {/* 왼쪽 귀 */}
        <G transform="rotate(-25 55 70)">
          <Ellipse cx="55" cy="70" rx="25" ry="45" fill="#DEB887" />
        </G>

        {/* 오른쪽 귀 */}
        <G transform="rotate(25 145 70)">
          <Ellipse cx="145" cy="70" rx="25" ry="45" fill="#DEB887" />
        </G>

        {/* 귀 안쪽 */}
        <G transform="rotate(-25 55 75)">
          <Ellipse cx="55" cy="75" rx="12" ry="25" fill="#F5DEB3" />
        </G>
        <G transform="rotate(25 145 75)">
          <Ellipse cx="145" cy="75" rx="12" ry="25" fill="#F5DEB3" />
        </G>

        {/* 주둥이 */}
        <Ellipse cx="100" cy="120" rx="35" ry="30" fill="#FAEBD7" />

        {/* 코 */}
        <Ellipse cx="100" cy="110" rx="12" ry="10" fill="#2D3748" />

        {/* 눈 */}
        {getEyes()}

        {/* 입 */}
        {getMouth()}

        {/* 볼 */}
        <Ellipse
          cx="50"
          cy="115"
          rx="15"
          ry="10"
          fill="#FFB6C1"
          opacity={0.4}
        />
        <Ellipse
          cx="150"
          cy="115"
          rx="15"
          ry="10"
          fill="#FFB6C1"
          opacity={0.4}
        />

        {/* 머리 얼룩 */}
        <Ellipse
          cx="120"
          cy="65"
          rx="18"
          ry="15"
          fill="#DEB887"
          opacity={0.6}
        />

        {/* 초록 잎 악세서리 */}
        {(mood === 'happy' || mood === 'playing') && (
          <G transform="translate(140, 50)">
            <Path d="M 0 0 Q 8 -5 10 -10 Q 5 -5 0 0 Z" fill="#10B981" />
            <Path d="M 0 0 Q -5 -8 -10 -10 Q -5 -5 0 0 Z" fill="#10B981" />
            <Circle cx="0" cy="0" r="3" fill="#059669" />
          </G>
        )}
      </Svg>
    </View>
  );
};

export default DogCharacter;

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
