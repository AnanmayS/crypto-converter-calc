import { useState, useEffect, useRef } from 'react';
import { TimeFrame } from '../types/crypto';
import { fetchKlines, initializeBinanceWebSocket, getBinanceSymbol, BinanceKline } from '../services/binanceService';

interface UseBinancePriceResult {
  historicalData: { timestamp: number; price: number }[];
  latestPrice: number | null;
  isLoading: boolean;
  error: string | null;
}

export const useBinancePrice = (
  cryptoSymbol: string,
  fiatSymbol: string = 'USD',
  timeFrame: TimeFrame
): UseBinancePriceResult => {
  const [historicalData, setHistoricalData] = useState<{ timestamp: number; price: number }[]>([]);
  const [latestPrice, setLatestPrice] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let isSubscribed = true;

    const fetchHistoricalData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Always fetch USDT pair data from Binance
        const symbol = getBinanceSymbol(cryptoSymbol);
        const klines = await fetchKlines(symbol, timeFrame);
        
        if (isSubscribed) {
          const formattedData = klines.map((kline: BinanceKline) => ({
            timestamp: kline.openTime,
            // If the target currency is not USD/USDT, we keep the USDT price
            // The actual conversion will be handled by the CryptoConverter component
            price: parseFloat(kline.close)
          }));
          
          setHistoricalData(formattedData);
          setLatestPrice(formattedData[formattedData.length - 1]?.price || null);
        }
      } catch (err) {
        if (isSubscribed) {
          setError(err instanceof Error ? err.message : 'Failed to fetch price data');
          setHistoricalData([]);
          setLatestPrice(null);
        }
      } finally {
        if (isSubscribed) {
          setIsLoading(false);
        }
      }
    };

    const initializeWebSocket = () => {
      try {
        // Close existing WebSocket if any
        if (wsRef.current) {
          wsRef.current.close();
        }

        const symbol = getBinanceSymbol(cryptoSymbol);
        wsRef.current = initializeBinanceWebSocket(symbol, (price: number) => {
          if (isSubscribed) {
            setLatestPrice(price);
            setHistoricalData(prev => {
              const now = Date.now();
              const newData = [...prev, { timestamp: now, price }];
              
              // Keep only the last N data points based on timeFrame
              const maxPoints = timeFrame === '1D' ? 24 : 
                              timeFrame === '7D' ? 42 :
                              timeFrame === '30D' ? 30 :
                              timeFrame === '90D' ? 90 : 52;
              
              return newData.slice(-maxPoints);
            });
          }
        });
      } catch (err) {
        if (isSubscribed) {
          console.error('WebSocket initialization error:', err);
          setError(err instanceof Error ? err.message : 'Failed to initialize real-time updates');
        }
      }
    };

    fetchHistoricalData();
    initializeWebSocket();

    // Cleanup function
    return () => {
      isSubscribed = false;
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [cryptoSymbol, timeFrame]); // Removed fiatSymbol dependency since we always use USDT

  return {
    historicalData,
    latestPrice,
    isLoading,
    error
  };
}; 