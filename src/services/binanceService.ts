import { TimeFrame } from '../types/crypto';

const BINANCE_REST_URL = 'https://api.binance.com/api/v3';

export interface BinanceKline {
  openTime: number;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
  closeTime: number;
  quoteVolume: string;
  trades: number;
  takerBaseVolume: string;
  takerQuoteVolume: string;
  ignore: string;
}

const getKlineInterval = (timeFrame: TimeFrame) => {
  switch (timeFrame) {
    case '1D': return '1h';    // 1 hour intervals for 1 day
    case '7D': return '4h';    // 4 hour intervals for 1 week
    case '30D': return '1d';   // 1 day intervals for 1 month
    case '90D': return '1d';   // 1 day intervals for 3 months
    case '1Y': return '1w';    // 1 week intervals for 1 year
    default: return '1d';
  }
};

const getLimit = (timeFrame: TimeFrame) => {
  switch (timeFrame) {
    case '1D': return 24;    // 24 points for 1 day (hourly)
    case '7D': return 42;    // 42 points for 1 week (4-hourly)
    case '30D': return 30;   // 30 points for 1 month (daily)
    case '90D': return 90;   // 90 points for 3 months (daily)
    case '1Y': return 52;    // 52 points for 1 year (weekly)
    default: return 30;
  }
};

// Add mapping for Binance-specific symbols and valid trading pairs
const BINANCE_SYMBOL_MAP: { [key: string]: string } = {
  'BTC': 'BTC',
  'ETH': 'ETH',
  'DOGE': 'DOGE',
  'ADA': 'ADA',
  'SOL': 'SOL',
};

// Define valid quote currencies (trading pairs)
const VALID_QUOTE_CURRENCIES = ['USDT', 'BUSD'];

export const getBinanceSymbol = (cryptoSymbol: string, fiatSymbol: string = 'USDT'): string => {
  const baseSymbol = BINANCE_SYMBOL_MAP[cryptoSymbol.toUpperCase()];
  if (!baseSymbol) {
    throw new Error(`Cryptocurrency ${cryptoSymbol} is not supported for real-time data`);
  }

  // Always use USDT for price data as it's the most liquid pair
  return `${baseSymbol}USDT`;
};

export const fetchKlines = async (
  symbol: string,
  timeFrame: TimeFrame
): Promise<BinanceKline[]> => {
  try {
    const interval = getKlineInterval(timeFrame);
    const limit = getLimit(timeFrame);
    
    const url = `${BINANCE_REST_URL}/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
    console.log('Fetching Binance data:', url);
    
    const response = await fetch(url);
    const responseData = await response.json();

    if (!response.ok) {
      console.error('Binance API error:', responseData);
      if (responseData.code === -1121) {
        throw new Error(`Trading pair ${symbol} is not available on Binance. Using USDT price data.`);
      }
      throw new Error(responseData.msg || 'Failed to fetch price data');
    }

    if (!Array.isArray(responseData)) {
      console.error('Unexpected response format:', responseData);
      throw new Error('Invalid response format from Binance API');
    }

    console.log('Received klines data:', responseData.length, 'points');
    
    return responseData.map((item: any[]) => ({
      openTime: item[0],
      open: item[1],
      high: item[2],
      low: item[3],
      close: item[4],
      volume: item[5],
      closeTime: item[6],
      quoteVolume: item[7],
      trades: item[8],
      takerBaseVolume: item[9],
      takerQuoteVolume: item[10],
      ignore: item[11]
    }));
  } catch (error) {
    console.error('Error fetching kline data:', error);
    throw error;
  }
};

export const initializeBinanceWebSocket = (
  symbol: string,
  onMessage: (price: number) => void
): WebSocket => {
  const wsUrl = `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@trade`;
  console.log('Connecting to WebSocket:', wsUrl);
  
  const ws = new WebSocket(wsUrl);
  
  ws.onopen = () => {
    console.log('WebSocket connected');
  };
  
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    onMessage(parseFloat(data.p)); // p is the trade price
  };

  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };

  ws.onclose = () => {
    console.log('WebSocket connection closed');
  };

  return ws;
}; 