import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  ImageBackground,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleGetStarted = async () => {
    try {
      await AsyncStorage.setItem('hasSeenSplash', 'true');
    } catch (error) {
      console.error('Error setting splash storage:', error);
    }
    onComplete();
  };

  return (
    <View className="flex-1 bg-purple-600">
      {/* World Map Background Effect */}
      <View className="absolute inset-0 opacity-20">
        <View className="w-full h-full bg-purple-800" />
      </View>

      {/* Weather Icons Floating */}
      <View className="absolute top-20 left-8 bg-purple-400/30 rounded-full p-4">
        <Text className="text-3xl">❄️</Text>
      </View>
      <View className="absolute top-32 right-16 bg-purple-400/30 rounded-full p-4">
        <Text className="text-3xl">🌤️</Text>
      </View>
      <View className="absolute top-64 right-12 bg-purple-400/30 rounded-full p-4">
        <Text className="text-3xl">🌧️</Text>
      </View>
      <View className="absolute top-80 left-16 bg-purple-400/30 rounded-full p-4">
        <Text className="text-3xl">⛈️</Text>
      </View>

      {/* Content Card */}
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        }}
        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[40px] px-8 py-12 items-center"
      >
        {/* Progress Indicator */}
        <View className="flex-row mb-8 space-x-2">
          <View className="w-8 h-1 bg-purple-600 rounded-full" />
          <View className="w-2 h-1 bg-gray-300 rounded-full" />
          <View className="w-2 h-1 bg-gray-300 rounded-full" />
        </View>

        {/* Title */}
        <Text className="text-3xl font-bold text-gray-900 text-center mb-4">
          Explore global map of wind, weather, and ocean conditions
        </Text>

        {/* Description */}
        <Text className="text-base text-gray-500 text-center mb-12 leading-6">
          Planning your trip becomes easier with the ideal weather app. You can
          instantly see the whole world's weather in a few seconds.
        </Text>

        {/* Get Started Button */}
        <TouchableOpacity
          onPress={handleGetStarted}
          className="bg-purple-600 w-full py-5 rounded-full mb-6 shadow-lg"
          activeOpacity={0.8}
        >
          <Text className="text-white text-center text-lg font-semibold">
            Get started
          </Text>
        </TouchableOpacity>

        {/* Login Link */}
        <View className="flex-row items-center space-x-1">
          <Text className="text-gray-600">Already have an account? </Text>
          <TouchableOpacity>
            <Text className="text-purple-600 font-semibold">Log in</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

export default SplashScreen;
