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
  setTemperatureUnit: (unit: TemperatureUnit) => void;
  setNewsCategories: (categories: NewsCategory[]) => void;
  refreshData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const WEATHER_API_KEY = 'bef5f06b24a0a04c792b4954c624f4fd';
const NEWS_API_KEY = '5b7b5a1907254b90ad71243b60bc9953';

// Countries supported by NewsAPI for top-headlines endpoint
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

  // Get news query based on temperature
  const getNewsQuery = (temp: number, unit: TemperatureUnit): string => {
    const tempCelsius = unit === 'celsius' ? temp : ((temp - 32) * 5) / 9;

    if (tempCelsius < 10) {
      return 'crisis';
    } else if (tempCelsius > 25) {
      return 'warning';
    } else {
      return 'success';
    }
  };

  // Fetch all data
  const fetchAllData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Step 1: Get Location
      console.log('Getting location...');
      const hasPermission = await requestLocationPermission();
      const coords = await getCurrentLocation(hasPermission);
      console.log('Location:', coords);

      // Step 2: Fetch Weather
      console.log('Fetching weather...');
      const weatherData = await fetchWeatherData(coords.lat, coords.lon);
      console.log('Weather:', weatherData.location, weatherData.temp);
      setWeather(weatherData);

      // Step 3: Fetch News based on weather
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

  // Request location permission
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

  // Get current location
  const getCurrentLocation = (
    hasPermission: boolean,
  ): Promise<{ lat: number; lon: number }> => {
    return new Promise(resolve => {
      if (!hasPermission) {
        resolve({ lat: 13.0827, lon: 80.2707 }); // Chennai
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
          resolve({ lat: 13.0827, lon: 80.2707 }); // Chennai fallback
        },
        { timeout: 10000, maximumAge: 300000, enableHighAccuracy: false },
      );
    });
  };

  // Fetch weather data
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

  // Fetch news data
  const fetchNewsData = async (
    temp: number,
    country: string,
  ): Promise<NewsArticle[]> => {
    const query = getNewsQuery(temp, temperatureUnit);
    const category = newsCategories[0] || 'general';
    const countryLower = country.toLowerCase();

    console.log(
      'News query:',
      query,
      'Category:',
      category,
      'Country:',
      countryLower,
    );

    // Check if country is supported
    const useCountry = SUPPORTED_COUNTRIES.includes(countryLower);

    // Method 1: Try with country if supported
    if (useCountry) {
      try {
        const url = `https://newsapi.org/v2/top-headlines?country=${countryLower}&category=${category}&pageSize=20&apiKey=${NEWS_API_KEY}`;
        console.log('Trying country-specific news...');

        const response = await fetch(url);
        const data = await response.json();

        console.log('Country news response:', response.status, data.status);

        if (response.ok && data.articles && data.articles.length > 0) {
          return processArticles(data.articles);
        }
      } catch (err) {
        console.log('Country-specific news failed, trying global...');
      }
    }

    // Method 2: Try with query (weather-based)
    try {
      const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=en&sortBy=publishedAt&pageSize=20&apiKey=${NEWS_API_KEY}`;
      console.log('Trying everything endpoint with query...');

      const response = await fetch(url);
      const data = await response.json();

      console.log('Everything news response:', response.status, data.status);

      if (response.ok && data.articles && data.articles.length > 0) {
        return processArticles(data.articles);
      }
    } catch (err) {
      console.log('Query news failed, trying category...');
    }

    // Method 3: Fallback to US general news
    try {
      const url = `https://newsapi.org/v2/top-headlines?country=us&category=${category}&pageSize=20&apiKey=${NEWS_API_KEY}`;
      console.log('Trying US fallback...');

      const response = await fetch(url);
      const data = await response.json();

      console.log('US fallback response:', response.status, data.status);

      if (response.ok && data.articles && data.articles.length > 0) {
        return processArticles(data.articles);
      }
    } catch (err) {
      console.error('All news methods failed');
    }

    return [];
  };

  // Process articles
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

  // Refresh data
  const refreshData = () => {
    fetchAllData();
  };

  // Initial load
  useEffect(() => {
    fetchAllData();
  }, []);

  // Reload when temperature unit changes
  useEffect(() => {
    if (weather) {
      fetchAllData();
    }
  }, [temperatureUnit]);

  // Reload when news categories change
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
  }, [newsCategories]);

  return (
    <AppContext.Provider
      value={{
        weather,
        news,
        loading,
        error,
        temperatureUnit,
        newsCategories,
        setTemperatureUnit,
        setNewsCategories,
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