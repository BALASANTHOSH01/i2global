import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppProvider, useApp } from './src/context/AppContext';
import HomeScreen from './src/screens/HomeScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import SplashScreen from './src/screens/SplashScreen';
import './global.css';

type TabName = 'Home' | 'Settings';

const ErrorDisplay: React.FC = () => {
  const { error, loading } = useApp();
  if (loading)
    return <Text className="text-center p-4 text-gray-600">Loading...</Text>;
  if (error)
    return (
      <Text className="text-red-500 text-center p-4 font-medium">{error}</Text>
    );
  return null;
};

const TabButton: React.FC<{
  icon: string;
  label: string;
  isActive: boolean;
  onPress: () => void;
}> = ({ icon, label, isActive, onPress }) => {
  const [scale] = useState(new Animated.Value(1));

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.7}
      className="flex-1"
    >
      <Animated.View
        style={{ transform: [{ scale }] }}
        className={`items-center py-2 mx-2 rounded-2xl transition-all flex flex-row gap-3 justify-center ${isActive ? 'bg-blue-100' : ''
          }`}
      >
        <View
          className={`w-12 h-12 rounded-full items-center justify-center mb-1 ${isActive ? 'bg-blue-500' : 'bg-gray-100'
            }`}
        >
          <Text className="text-2xl">{icon}</Text>
        </View>
        <Text
          className={`text-xs font-medium ${isActive ? 'text-blue-600' : 'text-gray-500'
            }`}
        >
          {label}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

const Content: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabName>('Home');
  const [fadeAnim] = useState(new Animated.Value(1));

  const switchTab = (tab: TabName) => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
    setActiveTab(tab);
  };

  return (
    <View className="flex-1 bg-gray-50 flex-col">
      <ErrorDisplay />

      {/* Animated Content - Takes remaining space above nav */}
      <Animated.View
        style={{
          flex: 1,
          opacity: fadeAnim,
          paddingBottom: 80,
        }}
      >
        {activeTab === 'Home' ? <HomeScreen /> : <SettingsScreen />}
      </Animated.View>

      {/* Enhanced Bottom Navigation */}
      <View
        className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 pb-2 pt-1 shadow-lg z-10"
        style={{ elevation: 5 }}
      >
        <View className="flex-row justify-center">
          <TabButton
            icon="🏠"
            label="Home"
            isActive={activeTab === 'Home'}
            onPress={() => switchTab('Home')}
          />
          <TabButton
            icon="⚙️"
            label="Settings"
            isActive={activeTab === 'Settings'}
            onPress={() => switchTab('Settings')}
          />
        </View>
      </View>
    </View>
  );
};

const MainApp: React.FC = () => {
  const { loading: dataLoading } = useApp();
  const [showSplash, setShowSplash] = useState<boolean | null>(null);

  useEffect(() => {
    const checkSplashSeen = async () => {
      try {
        const hasSeen = await AsyncStorage.getItem('hasSeenSplash');
        setShowSplash(!!hasSeen);
      } catch (error) {
        console.error('Error checking splash storage:', error);
        setShowSplash(false);
      }
    };
    checkSplashSeen();
  }, []);

  if (showSplash === null) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-gray-600">Loading...</Text>
      </View>
    );
  }

  if (showSplash === false || dataLoading) {
    return (
      <SplashScreen
        onComplete={() => {
          setShowSplash(true);
        }}
      />
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Content />
    </SafeAreaView>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
};

export default App;
