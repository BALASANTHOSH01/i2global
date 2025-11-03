import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    RefreshControl,
    ActivityIndicator,
    Image,
    TouchableOpacity,
    Linking,
    Modal,
    Pressable,
} from 'react-native';
import { useApp } from '../context/AppContext';

const HomeScreen: React.FC = () => {
    const { weather, news, loading, error, temperatureUnit, refreshData } =
        useApp();
    const [selectedArticle, setSelectedArticle] = useState<any>(null);
    const [modalVisible, setModalVisible] = useState(false);

    const openArticle = (article: any) => {
        setSelectedArticle(article);
        setModalVisible(true);
    };

    const openArticleURL = (url: string) => {
        Linking.openURL(url);
        setModalVisible(false);
    };

    if (loading && !weather) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-50">
                <ActivityIndicator size="large" color="#8b5cf6" />
                <Text className="mt-4 text-gray-500 text-base">
                    Loading weather and news...
                </Text>
            </View>
        );
    }

    if (error) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-50 px-4">
                <Text className="text-5xl mb-4">⚠️</Text>
                <Text className="text-red-500 text-xl font-bold mb-3 text-center">
                    Oops! Something went wrong
                </Text>
                <Text className="text-gray-600 text-center mb-6 text-sm leading-5">
                    {error}
                </Text>
                <TouchableOpacity
                    onPress={refreshData}
                    className="bg-purple-600 px-8 py-3.5 rounded-xl"
                >
                    <Text className="text-white font-semibold text-base">Try Again</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const getWeatherEmoji = (condition: string) => {
        const conditions: { [key: string]: string } = {
            Clear: '☀️',
            Clouds: '☁️',
            Rain: '🌧️',
            Drizzle: '🌦️',
            Thunderstorm: '⛈️',
            Thunder: '⛈️',
            Snow: '❄️',
            Mist: '🌫️',
            Fog: '🌫️',

        };
        return conditions[condition] || '🌤️';
    };

    return (
      <View className="flex-1 bg-gray-50">
        <ScrollView
          className="flex-1"
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={refreshData}
              colors={['#8b5cf6']}
              tintColor="#8b5cf6"
            />
          }
        >
          <View className="text-black mt-3 p-4 px-6">
            <Text className='text-2xl font-semibold '>Hello Santhosh</Text>
            <Text className='text-2xl font-semibold '>Discover the weather</Text>
          </View>

          {/* Modern Weather Card Section */}
          {weather && (
            <View className="p-4 pt-2">
              {/* Main Weather Card */}
              <View className="bg-purple-600 rounded-3xl p-6 shadow-lg">
                {/* Header */}
                <View className="mb-6">
                  <Text className="text-white/80 text-sm mb-1">
                    Current location
                  </Text>
                  <Text className="text-white text-3xl font-bold">
                    {weather.location}
                  </Text>
                </View>

                {/* Weather Info Row */}
                <View className="flex-row justify-between items-center">
                  <View className="flex-1">
                    <Text className="text-white text-lg capitalize mb-2">
                      {weather.description}
                    </Text>
                    <Text className="text-white text-5xl font-bold">
                      {weather.temp}°{temperatureUnit === 'celsius' ? 'C' : 'F'}
                    </Text>
                  </View>

                  {/* Weather Icon */}
                  <View className="items-center justify-center">
                    <Text className="text-7xl">
                      {getWeatherEmoji(weather.condition)}
                    </Text>
                  </View>
                </View>

                {/* Additional Info */}
                <View className="flex-row mt-6 pt-4 border-t border-white/20">
                  <View className="flex-1">
                    <Text className="text-white/70 text-xs mb-1">Humidity</Text>
                    <Text className="text-white text-base font-semibold">
                      {weather.humidity}%
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-white/70 text-xs mb-1">
                      Wind Speed
                    </Text>
                    <Text className="text-white text-base font-semibold">
                      {weather.windSpeed}{' '}
                      {temperatureUnit === 'celsius' ? 'm/s' : 'mph'}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-white/70 text-xs mb-1">
                      Feels Like
                    </Text>
                    <Text className="text-white text-base font-semibold">
                      {Math.round(weather.temp - 2)}°
                    </Text>
                  </View>
                </View>
              </View>

              {/* Horizontal Scrolling Forecast Cards */}
              <View className="mt-4">
                <Text className="text-gray-900 text-lg font-bold mb-3 px-1">
                  5-Day Forecast
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 4 }}
                  className="pb-2"
                >
                  {weather.forecast.map((day, index) => (
                    <View
                      key={index}
                      className="bg-white rounded-2xl p-2 mr-3 shadow-sm items-center min-w-[100px]"
                      style={{
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 8,
                        elevation: 3,
                      }}
                    >
                      <Text className="text-gray-600 text-sm font-medium mb-2">
                        {day.date}
                      </Text>
                      <Text className="text-4xl my-2">
                        {getWeatherEmoji(day.condition)}
                      </Text>
                      <Text className="text-gray-900 font-bold text-lg">
                        {day.temp}°
                      </Text>
                      <Text className="text-gray-500 text-xs mt-1 capitalize">
                        {day.condition}
                      </Text>
                    </View>
                  ))}
                </ScrollView>
              </View>
            </View>
          )}

          {/* News Section */}
          <View className="p-4">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-2xl font-bold text-gray-900">
                News Headlines
              </Text>

            </View>

            {news.length === 0 ? (
              <View className="items-center py-12">
                <Text className="text-5xl mb-3">📰</Text>
                <Text className="text-gray-500 text-center text-base">
                  No news available
                </Text>
                <Text className="text-gray-400 text-center text-sm mt-2">
                  Pull down to refresh
                </Text>
              </View>
            ) : (
              news.map((article, index) => (
                <Pressable
                  key={index}
                  onPress={() => openArticle(article)}
                  className="bg-white rounded-2xl mb-4 overflow-hidden shadow-sm active:opacity-80"
                >
                  {article.urlToImage && (
                    <Image
                      source={{ uri: article.urlToImage }}
                      className="w-full h-48"
                      resizeMode="cover"
                    />
                  )}
                  <View className="p-4">
                    <Text className="text-purple-600 text-xs font-semibold mb-1.5">
                      {article.source}
                    </Text>
                    <Text
                      className="text-gray-900 text-base font-bold mb-2 leading-5"
                      numberOfLines={2}
                    >
                      {article.title}
                    </Text>
                    {article.description && (
                      <Text
                        className="text-gray-600 text-sm mb-3 leading-5"
                        numberOfLines={2}
                      >
                        {article.description}
                      </Text>
                    )}
                    <View className="flex-row justify-between items-center">
                      <Text className="text-gray-400 text-xs">
                        {new Date(article.publishedAt).toLocaleDateString(
                          'en-US',
                          {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          },
                        )}
                      </Text>
                      <View className="flex-row items-center">
                        <Text className="text-purple-600 text-sm font-semibold mr-1">
                          Read more
                        </Text>
                        <Text className="text-purple-600 text-base">→</Text>
                      </View>
                    </View>
                  </View>
                </Pressable>
              ))
            )}
          </View>
        </ScrollView>

        {/* News Article Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
          statusBarTranslucent={true}
        >
          <Pressable
            className="flex-1 bg-black/60 justify-end"
            onPress={() => setModalVisible(false)}
          >
            <Pressable
              className="bg-white rounded-t-3xl"
              onPress={e => e.stopPropagation()}
            >
              {/* Header */}
              <View className="flex-row justify-between items-center px-5 py-4 border-b border-gray-100">
                <Text className="text-xl font-bold text-gray-900">
                  Article Details
                </Text>
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center active:bg-gray-200"
                >
                  <Text className="text-gray-700 text-lg font-bold">✕</Text>
                </TouchableOpacity>
              </View>

              {/* Content */}
              <ScrollView className="max-h-[75vh]">
                {selectedArticle && (
                  <View className="p-6">
                    {selectedArticle.urlToImage ? (
                      <Image
                        source={{ uri: selectedArticle.urlToImage }}
                        className="w-full h-56 rounded-2xl mb-5"
                        resizeMode="cover"
                      />
                    ) : null}

                    <Text className="text-purple-600 text-sm font-semibold mb-2">
                      {selectedArticle.source}
                    </Text>

                    <Text className="text-2xl font-bold text-gray-900 mb-3 leading-8">
                      {selectedArticle.title}
                    </Text>

                    {selectedArticle.description && (
                      <Text className="text-gray-600 mb-4 text-base leading-6">
                        {selectedArticle.description}
                      </Text>
                    )}

                    <Text className="text-gray-400 text-xs mb-6">
                      {new Date(selectedArticle.publishedAt).toLocaleDateString(
                        'en-US',
                        {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        },
                      )}
                    </Text>

                    <TouchableOpacity
                      onPress={() => openArticleURL(selectedArticle.url)}
                      className="bg-purple-600 py-4 rounded-xl items-center mb-5 active:bg-purple-700"
                    >
                      <Text className="text-white font-semibold text-base">
                        Read Full Article
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </ScrollView>
            </Pressable>
          </Pressable>
        </Modal>
      </View>
    );
};

export default HomeScreen;