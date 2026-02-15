import React from 'react';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';

type StarProps = {
  filled: number; // 0 to 1 (0 = empty, 0.5 = half, 1 = full)
  size?: number;
  color?: string;
  emptyColor?: string;
};

export default function Star({ 
  filled, 
  size = 24, 
  color = '#f59e0b',
  emptyColor = '#d1d5db' 
}: StarProps) {
  const starPath = "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z";
  
  // Create unique gradient ID for this star instance
  const gradientId = `starGradient${Math.random().toString(36).substr(2, 9)}`;

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Defs>
        <LinearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset={`${filled * 100}%`} stopColor={color} stopOpacity="1" />
          <Stop offset={`${filled * 100}%`} stopColor={emptyColor} stopOpacity="1" />
        </LinearGradient>
      </Defs>
      <Path
        d={starPath}
        fill={`url(#${gradientId})`}
        stroke={color}
        strokeWidth="1"
      />
    </Svg>
  );
}