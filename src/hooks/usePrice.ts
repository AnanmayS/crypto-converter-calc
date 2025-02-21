import { useState, useEffect, useCallback } from 'react';
import { getPrice, handleApiError } from '../services/coingecko';

interface PriceHookResult {
  price: number | null;
  priceChangePercentage24h: number | null;
  isLoading: boolean;
  error: string | null;
}

export const usePrice = (
  cryptoId: string,
  vsCurrency: string = 'usd',
  refreshInterval: number = 30000 // 30 seconds default
): PriceHookResult => {
  const [price, setPrice] = useState<number | null>(null);
  const [priceChangePercentage24h, setPriceChangePercentage24h] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrice = useCallback(async () => {
    if (!cryptoId || !vsCurrency) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const data = await getPrice(cryptoId, vsCurrency);
      setPrice(data.current_price);
      setPriceChangePercentage24h(data.price_change_percentage_24h);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setIsLoading(false);
    }
  }, [cryptoId, vsCurrency]);

  useEffect(() => {
    fetchPrice();
    
    // Set up polling interval
    const intervalId = setInterval(fetchPrice, refreshInterval);

    // Cleanup on unmount or when dependencies change
    return () => clearInterval(intervalId);
  }, [fetchPrice, refreshInterval]);

  return { 
    price, 
    priceChangePercentage24h,
    isLoading, 
    error 
  };
}; 