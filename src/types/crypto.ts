export interface Currency {
  id: string;
  name: string;
  symbol: string;
}

export interface CryptoPrice {
  id: string;
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number;
  last_updated: string;
}

export interface ConversionResult {
  fromAmount: number;
  toAmount: number;
  fromCurrency: Currency;
  toCurrency: Currency;
  rate: number;
  timestamp: string;
}

export interface HistoricalData {
  prices: [number, number][]; // [timestamp, price]
  market_caps: [number, number][];
  total_volumes: [number, number][];
}

export type TimeRange = '1d' | '7d' | '30d' | '90d' | '1y';

export type TimeFrame = '1D' | '7D' | '30D' | '90D' | '1Y';

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
  }[];
} 