import { useState, useEffect } from 'react';
import { TimeFrame } from '../types/crypto';
import { getHistoricalData } from '../services/coingecko';

interface UseHistoricalPriceResult {
  historicalData: { timestamp: number; price: number }[];
  isLoading: boolean;
  error: string | null;
}

const getDaysFromTimeFrame = (timeFrame: TimeFrame): number => {
  switch (timeFrame) {
    case '1D': return 1;
    case '7D': return 7;
    case '30D': return 30;
    case '90D': return 90;
    case '1Y': return 365;
    default: return 30;
  }
};

export const useHistoricalPrice = (
  cryptoId: string,
  vsCurrency: string = 'usd',
  timeFrame: TimeFrame
): UseHistoricalPriceResult => {
  const [historicalData, setHistoricalData] = useState<{ timestamp: number; price: number }[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isSubscribed = true;

    const fetchData = async () => {
      if (!cryptoId || !vsCurrency) {
        setError('Invalid currency pair');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        setHistoricalData([]); // Clear old data while loading

        const days = getDaysFromTimeFrame(timeFrame);
        const data = await getHistoricalData(cryptoId, vsCurrency.toLowerCase(), days);
        
        if (!isSubscribed) return;

        if (!data?.prices || !Array.isArray(data.prices)) {
          throw new Error('Invalid data format received from API');
        }

        const formattedData = data.prices
          .filter(([timestamp, price]: [number, number]) => 
            timestamp && typeof price === 'number' && !isNaN(price)
          )
          .map(([timestamp, price]: [number, number]) => ({
            timestamp,
            price
          }));

        if (formattedData.length === 0) {
          throw new Error('No valid price data available for this time range');
        }
        
        setHistoricalData(formattedData);
        setError(null);
      } catch (err) {
        if (!isSubscribed) return;
        console.error('Error fetching historical data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch historical data');
        setHistoricalData([]);
      } finally {
        if (isSubscribed) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isSubscribed = false;
    };
  }, [cryptoId, vsCurrency, timeFrame]);

  return {
    historicalData,
    isLoading,
    error
  };
}; 