import React from 'react';
import { View, Text, ScrollView, Switch, Pressable } from 'react-native';
import { useApp, NewsCategory } from '../context/AppContext';

const SettingsScreen: React.FC = () => {
  const {
    temperatureUnit,
    setTemperatureUnit,
    newsCategories,
    setNewsCategories,
  } = useApp();

  const allCategories: NewsCategory[] = [
    'general',
    'business',
    'technology',
    'sports',
    'entertainment',
    'health',
    'science',
  ];

  const categoryEmojis: { [key in NewsCategory]: string } = {
    general: '📰',
    business: '💼',
    technology: '💻',
    sports: '⚽',
    entertainment: '🎬',
    health: '🏥',
    science: '🔬',
  };

  const categoryDescriptions: { [key in NewsCategory]: string } = {
    general: 'Top stories and breaking news',
    business: 'Markets, finance, and economy',
    technology: 'Tech innovations and updates',
    sports: 'Sports news and scores',
    entertainment: 'Movies, music, and celebrities',
    health: 'Health tips and medical news',
    science: 'Scientific discoveries and research',
  };

  const toggleCategory = (category: NewsCategory) => {
    if (newsCategories.includes(category)) {
      if (newsCategories.length > 1) {
        setNewsCategories(newsCategories.filter(c => c !== category));
      }
    } else {
      setNewsCategories([...newsCategories, category]);
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        <View className="p-5">
          {/* Temperature Unit Section */}
          <View className="bg-white rounded-2xl p-5 mb-5 shadow-sm">
            <Text className="text-xl font-bold text-gray-900 mb-1.5">
              Temperature Unit
            </Text>
            <Text className="text-sm text-gray-600 mb-5">
              Choose your preferred temperature display
            </Text>
            <View className="flex-row gap-3">
              <Pressable
                onPress={() => setTemperatureUnit('celsius')}
                className={`flex-1 py-5 items-center rounded-xl ${
                  temperatureUnit === 'celsius'
                    ? 'bg-purple-600'
                    : 'bg-gray-100'
                }`}
              >
                <Text className="text-2xl mb-1.5">🌡️</Text>
                <Text
                  className={`font-semibold text-base ${
                    temperatureUnit === 'celsius'
                      ? 'text-white'
                      : 'text-gray-700'
                  }`}
                >
                  Celsius
                </Text>
                <Text
                  className={`text-sm mt-1 ${
                    temperatureUnit === 'celsius'
                      ? 'text-white/80'
                      : 'text-gray-400'
                  }`}
                >
                  °C
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setTemperatureUnit('fahrenheit')}
                className={`flex-1 py-5 items-center rounded-xl ${
                  temperatureUnit === 'fahrenheit'
                    ? 'bg-purple-600'
                    : 'bg-gray-100'
                }`}
              >
                <Text className="text-2xl mb-1.5">🌡️</Text>
                <Text
                  className={`font-semibold text-base ${
                    temperatureUnit === 'fahrenheit'
                      ? 'text-white'
                      : 'text-gray-700'
                  }`}
                >
                  Fahrenheit
                </Text>
                <Text
                  className={`text-sm mt-1 ${
                    temperatureUnit === 'fahrenheit'
                      ? 'text-white/80'
                      : 'text-gray-400'
                  }`}
                >
                  °F
                </Text>
              </Pressable>
            </View>
          </View>

          {/* News Categories Section */}
          <View className="bg-white rounded-2xl p-5 mb-5 shadow-sm">
            <Text className="text-xl font-bold text-gray-900 mb-1.5">
              News Categories
            </Text>
            <Text className="text-sm text-gray-600 mb-5">
              Select categories you're interested in ({newsCategories.length}{' '}
              selected)
            </Text>
            {allCategories.map((category, index) => (
              <Pressable
                key={category}
                onPress={() => toggleCategory(category)}
                className={`flex-row justify-between items-center py-3.5 ${
                  index !== allCategories.length - 1
                    ? 'border-b border-gray-100'
                    : ''
                }`}
              >
                <View className="flex-row items-center flex-1">
                  <View
                    className={`w-11 h-11 rounded-full items-center justify-center mr-3 ${
                      newsCategories.includes(category)
                        ? 'bg-purple-100'
                        : 'bg-gray-100'
                    }`}
                  >
                    <Text className="text-xl">{categoryEmojis[category]}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-900 text-base font-semibold capitalize mb-0.5">
                      {category}
                    </Text>
                    <Text className="text-gray-600 text-xs" numberOfLines={1}>
                      {categoryDescriptions[category]}
                    </Text>
                  </View>
                </View>
                <Switch
                  value={newsCategories.includes(category)}
                  onValueChange={() => toggleCategory(category)}
                  trackColor={{ false: '#d1d5db', true: '#c4b5fd' }}
                  thumbColor={
                    newsCategories.includes(category) ? '#8b5cf6' : '#f9fafb'
                  }
                  ios_backgroundColor="#d1d5db"
                />
              </Pressable>
            ))}
          </View>

          {/* Weather-Based News Filtering Info */}
          <View className="bg-purple-600 rounded-2xl p-5 mb-5 shadow-lg">
            <View className="flex-row items-center mb-4">
              <Text className="text-3xl mr-2.5">🎯</Text>
              <Text className="text-xl font-bold text-white">
                Weather-Based News
              </Text>
            </View>
            <Text className="text-white/90 text-base mb-5 leading-5">
              News articles are automatically filtered based on current weather
              conditions to match your mood
            </Text>

            <View className="bg-white/15 rounded-xl p-4 mb-3">
              <View className="flex-row items-start">
                <Text className="text-3xl mr-3.5">❄️</Text>
                <View className="flex-1">
                  <Text className="text-white text-base font-bold mb-1.5">
                    Cold Weather (Below 10°C)
                  </Text>
                  <Text className="text-white/85 text-sm leading-5">
                    Shows depressing news: crisis, tragedy, disaster, recession
                  </Text>
                </View>
              </View>
            </View>

            <View className="bg-white/15 rounded-xl p-4 mb-3">
              <View className="flex-row items-start">
                <Text className="text-3xl mr-3.5">🔥</Text>
                <View className="flex-1">
                  <Text className="text-white text-base font-bold mb-1.5">
                    Hot Weather (Above 25°C)
                  </Text>
                  <Text className="text-white/85 text-sm leading-5">
                    Shows fear-related news: warnings, danger, threats,
                    emergency
                  </Text>
                </View>
              </View>
            </View>

            <View className="bg-white/15 rounded-xl p-4">
              <View className="flex-row items-start">
                <Text className="text-3xl mr-3.5">🌤️</Text>
                <View className="flex-1">
                  <Text className="text-white text-base font-bold mb-1.5">
                    Cool Weather (10-25°C)
                  </Text>
                  <Text className="text-white/85 text-sm leading-5">
                    Shows positive news: success, victory, achievement,
                    celebration
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default SettingsScreen;