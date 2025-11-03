import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { Platform, PermissionsAndroid } from 'react-native';
import Geolocation from '@react-native-community/geolocation';

export type TemperatureUnit = 'celsius' | 'fahrenheit';
export type NewsCategory =
  | 'general'
  | 'business'
  | 'technology'
  | 'sports'
  | 'entertainment'
  | 'health'
  | 'science';

export type NewsFilterMode = 'weather-based' | 'all' | 'custom';

interface WeatherData {
  temp: number;
  condition: string;
  description: string;
  humidity: number;
  windSpeed: number;
  icon: string;
  location: string;
  country: string;
  forecast: ForecastDay[];
}

interface ForecastDay {
  date: string;
  temp: number;
  condition: string;
  icon: string;
}

interface NewsArticle {
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  source: string;
}

interface AppContextType {
  weather: WeatherData | null;
  news: NewsArticle[];
  loading: boolean;
  error: string | null;
  temperatureUnit: TemperatureUnit;
  newsCategories: NewsCategory[];
  newsFilterMode: NewsFilterMode;
  setTemperatureUnit: (unit: TemperatureUnit) => void;
  setNewsCategories: (categories: NewsCategory[]) => void;
  setNewsFilterMode: (mode: NewsFilterMode) => void;
  refreshData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const WEATHER_API_KEY = 'bef5f06b24a0a04c792b4954c624f4fd';
const NEWS_API_KEY = '5b7b5a1907254b90ad71243b60bc9953';

const SUPPORTED_COUNTRIES = [
  'ae',
  'ar',
  'at',
  'au',
  'be',
  'bg',
  'br',
  'ca',
  'ch',
  'cn',
  'co',
  'cu',
  'cz',
  'de',
  'eg',
  'fr',
  'gb',
  'gr',
  'hk',
  'hu',
  'id',
  'ie',
  'il',
  'in',
  'it',
  'jp',
  'kr',
  'lt',
  'lv',
  'ma',
  'mx',
  'my',
  'ng',
  'nl',
  'no',
  'nz',
  'ph',
  'pl',
  'pt',
  'ro',
  'rs',
  'ru',
  'sa',
  'se',
  'sg',
  'si',
  'sk',
  'th',
  'tr',
  'tw',
  'ua',
  'us',
  've',
  'za',
];

export const AppProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [temperatureUnit, setTemperatureUnit] =
    useState<TemperatureUnit>('celsius');
  const [newsCategories, setNewsCategories] = useState<NewsCategory[]>([
    'general',
  ]);
  const [newsFilterMode, setNewsFilterMode] =
    useState<NewsFilterMode>('weather-based');

  // Get news query based on temperature and filter mode
  const getNewsQuery = (
    temp: number,
    unit: TemperatureUnit,
    mode: NewsFilterMode,
  ): string => {
    if (mode !== 'weather-based') {
      return ''; // No weather filtering
    }

    const tempCelsius = unit === 'celsius' ? temp : ((temp - 32) * 5) / 9;

    if (tempCelsius < 10) {
      // Cold weather - depressing news
      return 'crisis OR tragedy OR disaster OR recession OR depression';
    } else if (tempCelsius > 25) {
      // Hot weather - fear-related news
      return 'warning OR danger OR threat OR emergency OR alert';
    } else {
      // Cool weather - positive news
      return 'success OR victory OR achievement OR celebration OR breakthrough';
    }
  };

  // Get weather mood description
  const getWeatherMood = (temp: number, unit: TemperatureUnit): string => {
    const tempCelsius = unit === 'celsius' ? temp : ((temp - 32) * 5) / 9;

    if (tempCelsius < 10) return 'Cold & Gloomy';
    if (tempCelsius > 25) return 'Hot & Intense';
    return 'Cool & Pleasant';
  };

  // Fetch all data
  const fetchAllData = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('Getting location...');
      const hasPermission = await requestLocationPermission();
      const coords = await getCurrentLocation(hasPermission);
      console.log('Location:', coords);

      console.log('Fetching weather...');
      const weatherData = await fetchWeatherData(coords.lat, coords.lon);
      console.log('Weather:', weatherData.location, weatherData.temp);
      setWeather(weatherData);

      console.log('Fetching news...');
      const newsData = await fetchNewsData(
        weatherData.temp,
        weatherData.country,
      );
      console.log('News articles:', newsData.length);
      setNews(newsData);

      setLoading(false);
    } catch (err: any) {
      console.error('Error:', err);
      setError(err.message || 'Something went wrong');
      setLoading(false);
    }
  };

  const requestLocationPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'ios') {
      return true;
    }

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'We need your location to show local weather',
          buttonPositive: 'OK',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch {
      return false;
    }
  };

  const getCurrentLocation = (
    hasPermission: boolean,
  ): Promise<{ lat: number; lon: number }> => {
    return new Promise(resolve => {
      if (!hasPermission) {
        resolve({ lat: 13.0827, lon: 80.2707 });
        return;
      }

      Geolocation.getCurrentPosition(
        position => {
          resolve({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        error => {
          console.log('Geolocation error:', error);
          resolve({ lat: 13.0827, lon: 80.2707 });
        },
        { timeout: 10000, maximumAge: 300000, enableHighAccuracy: false },
      );
    });
  };

  const fetchWeatherData = async (
    lat: number,
    lon: number,
  ): Promise<WeatherData> => {
    const units = temperatureUnit === 'celsius' ? 'metric' : 'imperial';

    const weatherRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${units}&appid=${WEATHER_API_KEY}`,
    );

    if (!weatherRes.ok) {
      const errorText = await weatherRes.text();
      console.error('Weather API error:', weatherRes.status, errorText);
      throw new Error('Failed to fetch weather');
    }

    const weatherData = await weatherRes.json();

    const forecastRes = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${units}&appid=${WEATHER_API_KEY}`,
    );

    if (!forecastRes.ok) {
      console.error('Forecast API error:', forecastRes.status);
      throw new Error('Failed to fetch forecast');
    }

    const forecastData = await forecastRes.json();

    const forecast: ForecastDay[] = forecastData.list
      .filter((_: any, i: number) => i % 8 === 0)
      .slice(0, 5)
      .map((day: any) => ({
        date: new Date(day.dt * 1000).toLocaleDateString('en-US', {
          weekday: 'short',
        }),
        temp: Math.round(day.main.temp),
        condition: day.weather[0].main,
        icon: day.weather[0].icon,
      }));

    return {
      temp: Math.round(weatherData.main.temp),
      condition: weatherData.weather[0].main,
      description: weatherData.weather[0].description,
      humidity: weatherData.main.humidity,
      windSpeed: Math.round(weatherData.wind.speed),
      icon: weatherData.weather[0].icon,
      location: weatherData.name,
      country: weatherData.sys.country,
      forecast,
    };
  };

  const fetchNewsData = async (
    temp: number,
    country: string,
  ): Promise<NewsArticle[]> => {
    const query = getNewsQuery(temp, temperatureUnit, newsFilterMode);
    const category = newsCategories[0] || 'general';
    const countryLower = country.toLowerCase();

    console.log('News filter mode:', newsFilterMode);
    console.log('Weather query:', query || 'None (showing all news)');
    console.log('Category:', category, 'Country:', countryLower);

    const useCountry = SUPPORTED_COUNTRIES.includes(countryLower);

    // Weather-based filtering
    if (newsFilterMode === 'weather-based' && query) {
      try {
        const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=en&sortBy=publishedAt&pageSize=20&apiKey=${NEWS_API_KEY}`;
        console.log('Fetching weather-based news...');

        const response = await fetch(url);
        const data = await response.json();

        if (response.ok && data.articles && data.articles.length > 0) {
          return processArticles(data.articles);
        }
      } catch (err) {
        console.log('Weather-based news failed, falling back...');
      }
    }

    // All news or fallback
    if (useCountry) {
      try {
        const url = `https://newsapi.org/v2/top-headlines?country=${countryLower}&category=${category}&pageSize=20&apiKey=${NEWS_API_KEY}`;
        console.log('Fetching country-specific news...');

        const response = await fetch(url);
        const data = await response.json();

        if (response.ok && data.articles && data.articles.length > 0) {
          return processArticles(data.articles);
        }
      } catch (err) {
        console.log('Country news failed...');
      }
    }

    // Final fallback to US news
    try {
      const url = `https://newsapi.org/v2/top-headlines?country=us&category=${category}&pageSize=20&apiKey=${NEWS_API_KEY}`;
      console.log('Using US fallback...');

      const response = await fetch(url);
      const data = await response.json();

      if (response.ok && data.articles && data.articles.length > 0) {
        return processArticles(data.articles);
      }
    } catch (err) {
      console.error('All news methods failed');
    }

    return [];
  };

  const processArticles = (articles: any[]): NewsArticle[] => {
    return articles
      .filter(
        (a: any) => a.title && a.title !== '[Removed]' && a.url && a.source,
      )
      .slice(0, 15)
      .map((a: any) => ({
        title: a.title,
        description: a.description || 'No description available',
        url: a.url,
        urlToImage: a.urlToImage || '',
        publishedAt: a.publishedAt,
        source: a.source.name,
      }));
  };

  const refreshData = () => {
    fetchAllData();
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    if (weather) {
      fetchAllData();
    }
  }, [temperatureUnit]);

  useEffect(() => {
    if (weather) {
      const loadNews = async () => {
        try {
          const newsData = await fetchNewsData(weather.temp, weather.country);
          setNews(newsData);
        } catch (err) {
          console.error('News reload error:', err);
        }
      };
      loadNews();
    }
  }, [newsCategories, newsFilterMode]);

  return (
    <AppContext.Provider
      value={{
        weather,
        news,
        loading,
        error,
        temperatureUnit,
        newsCategories,
        newsFilterMode,
        setTemperatureUnit,
        setNewsCategories,
        setNewsFilterMode,
        refreshData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
