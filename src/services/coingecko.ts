import axios from 'axios';

const BASE_URL = 'https://api.coingecko.com/api/v3';

// Create axios instance with base configuration
const coingeckoApi = axios.create({
  baseURL: BASE_URL,
  timeout: 15000, // Increased timeout
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  }
});

// Rate limiting configuration
let lastCallTime = 0;
const MIN_TIME_BETWEEN_CALLS = 3000; // Increased to 3 seconds to be more conservative
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000;

// Add rate limiting interceptor
coingeckoApi.interceptors.request.use(async (config) => {
  const now = Date.now();
  const timeSinceLastCall = now - lastCallTime;
  
  if (timeSinceLastCall < MIN_TIME_BETWEEN_CALLS) {
    await new Promise(resolve => setTimeout(resolve, MIN_TIME_BETWEEN_CALLS - timeSinceLastCall));
  }
  
  lastCallTime = Date.now();
  return config;
});

// Helper function for exponential backoff
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Retry helper function with exponential backoff
const retryWithBackoff = async <T>(
  operation: () => Promise<T>,
  retries: number = MAX_RETRIES,
  delay: number = INITIAL_RETRY_DELAY,
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    if (retries > 0) {
      await wait(delay);
      return retryWithBackoff(operation, retries - 1, delay * 2);
    }
    throw error;
  }
};

export interface CoinPrice {
  current_price: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  last_updated: string;
}

export const handleApiError = (error: any): never => {
  console.error('CoinGecko API Error:', error);
  
  if (axios.isAxiosError(error)) {
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timed out. Please try again in a moment.');
    }
    if (error.response?.status === 429) {
      throw new Error('Rate limit exceeded. Please wait a few seconds and try again.');
    }
    if (error.response?.status === 404) {
      throw new Error('Cryptocurrency not found. Please try another one.');
    }
    if (error.response?.status === 500) {
      throw new Error('CoinGecko service is experiencing issues. Please try again in a moment.');
    }
    if (error.message === 'Network Error') {
      throw new Error('Unable to reach CoinGecko. Please try again in a moment.');
    }
    if (error.response?.data?.error) {
      throw new Error(`CoinGecko API Error: ${error.response.data.error}`);
    }
    throw new Error('Failed to fetch data from CoinGecko. Please try again in a moment.');
  }
  
  if (error instanceof Error) {
    throw error;
  }
  
  throw new Error('An unexpected error occurred while fetching data.');
};

export const getPrice = async (cryptoId: string, vsCurrency: string = 'usd'): Promise<CoinPrice> => {
  return retryWithBackoff(async () => {
    const response = await coingeckoApi.get('/simple/price', {
      params: {
        ids: cryptoId,
        vs_currencies: vsCurrency,
        include_24hr_change: true,
        include_last_updated_at: true
      },
    });

    const data = response.data[cryptoId];
    if (!data || !data[vsCurrency]) {
      throw new Error('No price data available for this currency pair.');
    }

    return {
      current_price: data[vsCurrency],
      price_change_24h: data[`${vsCurrency}_24h_change`] || 0,
      price_change_percentage_24h: data[`${vsCurrency}_24h_change`] || 0,
      last_updated: new Date().toISOString()
    };
  }).catch(handleApiError);
};

export const getHistoricalData = async (
  cryptoId: string,
  vsCurrency: string = 'usd',
  days: number = 30
) => {
  return retryWithBackoff(async () => {
    const response = await coingeckoApi.get(`/coins/${cryptoId}/market_chart`, {
      params: {
        vs_currency: vsCurrency,
        days: days,
        interval: days <= 1 ? 'hourly' : 'daily'
      }
    });

    if (!response.data?.prices) {
      throw new Error('Invalid response format from CoinGecko');
    }

    return response.data;
  }).catch(handleApiError);
};

export const getSupportedVsCurrencies = async () => {
  return retryWithBackoff(async () => {
    const response = await coingeckoApi.get('/simple/supported_vs_currencies');
    return response.data;
  }).catch(handleApiError);
}; 