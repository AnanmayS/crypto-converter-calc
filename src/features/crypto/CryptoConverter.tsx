import React, { useState, useContext, useEffect, useCallback, useMemo } from 'react';
import {
  Container,
  Paper,
  TextField,
  MenuItem,
  Grid,
  Typography,
  Box,
  IconButton,
  useTheme,
  InputAdornment,
  Button,
  SelectChangeEvent,
  Menu,
  CircularProgress,
} from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { ColorModeContext } from '../../App';
import { usePrice } from '../../hooks/usePrice';
import { useHistoricalPrice } from '../../hooks/useHistoricalPrice';
import { TimeFrame } from '../../types/crypto';
import Particles from 'react-tsparticles';
import { loadSlim } from 'tsparticles-slim';
import { Engine } from 'tsparticles-engine';

interface Currency {
  id: string;
  name: string;
  symbol: string;
}

const timeFrames: TimeFrame[] = ['1D', '7D', '30D', '90D', '1Y'];

const cryptocurrencies: Currency[] = [
  { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC' },
  { id: 'ethereum', name: 'Ethereum', symbol: 'ETH' },
  { id: 'dogecoin', name: 'Dogecoin', symbol: 'DOGE' },
  { id: 'cardano', name: 'Cardano', symbol: 'ADA' },
  { id: 'solana', name: 'Solana', symbol: 'SOL' },
  { id: 'ripple', name: 'Ripple', symbol: 'XRP' },
  { id: 'polkadot', name: 'Polkadot', symbol: 'DOT' },
  { id: 'binancecoin', name: 'Binance Coin', symbol: 'BNB' },
  { id: 'avalanche-2', name: 'Avalanche', symbol: 'AVAX' },
  { id: 'chainlink', name: 'Chainlink', symbol: 'LINK' },
  { id: 'polygon', name: 'Polygon', symbol: 'MATIC' },
  { id: 'uniswap', name: 'Uniswap', symbol: 'UNI' },
  { id: 'litecoin', name: 'Litecoin', symbol: 'LTC' },
  { id: 'stellar', name: 'Stellar', symbol: 'XLM' },
  { id: 'monero', name: 'Monero', symbol: 'XMR' }
];

const fiatCurrencies: Currency[] = [
  { id: 'usd', name: 'US Dollar', symbol: 'USD' },
  { id: 'eur', name: 'Euro', symbol: 'EUR' },
  { id: 'gbp', name: 'British Pound', symbol: 'GBP' },
  { id: 'jpy', name: 'Japanese Yen', symbol: 'JPY' },
  { id: 'inr', name: 'Indian Rupee', symbol: 'INR' },
  { id: 'aud', name: 'Australian Dollar', symbol: 'AUD' },
  { id: 'cad', name: 'Canadian Dollar', symbol: 'CAD' },
  { id: 'chf', name: 'Swiss Franc', symbol: 'CHF' },
  { id: 'cny', name: 'Chinese Yuan', symbol: 'CNY' },
  { id: 'hkd', name: 'Hong Kong Dollar', symbol: 'HKD' },
  { id: 'sgd', name: 'Singapore Dollar', symbol: 'SGD' },
  { id: 'nzd', name: 'New Zealand Dollar', symbol: 'NZD' },
  { id: 'krw', name: 'South Korean Won', symbol: 'KRW' },
  { id: 'aed', name: 'UAE Dirham', symbol: 'AED' },
  { id: 'brl', name: 'Brazilian Real', symbol: 'BRL' }
];

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export const CryptoConverter: React.FC = () => {
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);
  const [fromAmount, setFromAmount] = useState<string>('1');
  const [toAmount, setToAmount] = useState<string>('');
  const [lastEdited, setLastEdited] = useState<'from' | 'to'>('from');
  const [selectedFromCurrency, setSelectedFromCurrency] = useState<Currency | null>(cryptocurrencies[0]);
  const [selectedToCurrency, setSelectedToCurrency] = useState<Currency | null>(fiatCurrencies[0]);
  const [fromAnchorEl, setFromAnchorEl] = useState<null | HTMLElement>(null);
  const [toAnchorEl, setToAnchorEl] = useState<null | HTMLElement>(null);
  const [chartData, setChartData] = useState<any>(null);
  const [selectedTimeFrame, setSelectedTimeFrame] = useState<TimeFrame>('30D');

  const {
    historicalData,
    isLoading: isLoadingHistory,
    error: historyError
  } = useHistoricalPrice(
    selectedFromCurrency?.id || 'bitcoin',
    selectedToCurrency?.id || 'usd',
    selectedTimeFrame
  );

  const {
    price: currentPrice,
    isLoading: isLoadingPrice,
    error: priceError
  } = usePrice(
    selectedFromCurrency?.id || 'bitcoin',
    selectedToCurrency?.id || 'usd'
  );

  const handleFromAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newAmount = event.target.value;
    const isFromCrypto = cryptocurrencies.some(c => c.id === selectedFromCurrency?.id);
    
    // If input is empty, clear both fields
    if (!newAmount) {
      setFromAmount('');
      setToAmount('');
      return;
    }
    
    // Validate decimal places
    const parts = newAmount.split('.');
    if (parts.length > 1) {
      const decimals = parts[1];
      if ((isFromCrypto && decimals.length > 8) || (!isFromCrypto && decimals.length > 2)) {
        return;
      }
    }
    
    setFromAmount(newAmount);
    setLastEdited('from');
    
    if (currentPrice && !isLoadingPrice) {
      const convertedAmount = parseFloat(newAmount) * currentPrice;
      const roundedAmount = Math.round(convertedAmount * 100) / 100;
      setToAmount(roundedAmount.toString());
    }
  };

  const handleToAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newAmount = event.target.value;
    const isToCrypto = cryptocurrencies.some(c => c.id === selectedToCurrency?.id);
    
    // If input is empty, clear both fields
    if (!newAmount) {
      setFromAmount('');
      setToAmount('');
      return;
    }
    
    // Validate decimal places
    const parts = newAmount.split('.');
    if (parts.length > 1) {
      const decimals = parts[1];
      if ((isToCrypto && decimals.length > 8) || (!isToCrypto && decimals.length > 2)) {
        return;
      }
    }
    
    setToAmount(newAmount);
    setLastEdited('to');
    
    if (currentPrice && !isLoadingPrice) {
      const convertedAmount = parseFloat(newAmount) / currentPrice;
      const isFromCrypto = cryptocurrencies.some(c => c.id === selectedFromCurrency?.id);
      const roundedAmount = isFromCrypto ? convertedAmount : Math.round(convertedAmount * 100) / 100;
      setFromAmount(roundedAmount.toString());
    }
  };

  const handleSwap = () => {
    const tempFrom = selectedFromCurrency;
    setSelectedFromCurrency(selectedToCurrency);
    setSelectedToCurrency(tempFrom);
  };

  const handleFromMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setFromAnchorEl(event.currentTarget);
  };

  const handleToMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setToAnchorEl(event.currentTarget);
  };

  const handleFromMenuClose = () => {
    setFromAnchorEl(null);
  };

  const handleToMenuClose = () => {
    setToAnchorEl(null);
  };

  const handleFromCurrencySelect = (currencyId: string) => {
    const currencyList = cryptocurrencies;
    const selected = currencyList.find((c) => c.id === currencyId);
    if (selected) {
      setSelectedFromCurrency(selected);
    }
    handleFromMenuClose();
  };

  const handleToCurrencySelect = (currencyId: string) => {
    const currencyList = fiatCurrencies;
    const selected = currencyList.find((c) => c.id === currencyId);
    if (selected) {
      setSelectedToCurrency(selected);
    }
    handleToMenuClose();
  };

  // Update conversion when price changes
  useEffect(() => {
    if (currentPrice && !isLoadingPrice) {
      if (lastEdited === 'from' && fromAmount) {
        const convertedAmount = parseFloat(fromAmount) * currentPrice;
        const roundedAmount = Math.round(convertedAmount * 100) / 100;
        setToAmount(roundedAmount.toString());
      } else if (lastEdited === 'to' && toAmount) {
        const convertedAmount = parseFloat(toAmount) / currentPrice;
        const roundedAmount = Math.round(convertedAmount * 100) / 100;
        setFromAmount(roundedAmount.toString());
      }
    }
  }, [currentPrice, isLoadingPrice, lastEdited, fromAmount, toAmount]);

  const formatAmount = (amount: number, isCrypto: boolean) => {
    if (isNaN(amount)) return '0';
    return amount.toLocaleString(undefined, {
      minimumFractionDigits: isCrypto ? 8 : 2,
      maximumFractionDigits: isCrypto ? 8 : 2,
      useGrouping: true
    });
  };

  const getMaxTicksForTimeFrame = (timeFrame: TimeFrame): number => {
    switch (timeFrame) {
      case '1D': return 6;
      case '7D': return 7;
      case '30D': return 8;
      case '90D': return 10;
      case '1Y': return 12;
      default: return 8;
    }
  };

  const graphData = useMemo(() => {
    if (!historicalData?.length) return [];
    
    return historicalData.map(({ timestamp, price }) => ({
      time: new Date(timestamp).toISOString(),
      value: price
    }));
  }, [historicalData]);

  const isLoading = isLoadingHistory || isLoadingPrice;
  const error = historyError || priceError;

  const getChartData = useCallback(() => {
    if (selectedFromCurrency && historicalData?.length > 0) {
      const labels = historicalData.map(data => {
        const d = new Date(data.timestamp);
        if (selectedTimeFrame === '1D') {
          return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        } else if (selectedTimeFrame === '1Y') {
          return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        } else if (selectedTimeFrame === '90D' || selectedTimeFrame === '30D') {
          return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
        return d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
      });

      const prices = historicalData.map(data => data.price);

      setChartData({
        labels,
        datasets: [
          {
            label: `${selectedFromCurrency.symbol.toUpperCase()} Price`,
            data: prices,
            borderColor: theme.palette.primary.main,
            backgroundColor: ({ chart }: { chart: { ctx: CanvasRenderingContext2D; height: number } }) => {
              const ctx = chart.ctx;
              const gradient = ctx.createLinearGradient(0, 0, 0, chart.height);
              gradient.addColorStop(0, theme.palette.primary.main + '40');
              gradient.addColorStop(1, theme.palette.primary.main + '00');
              return gradient;
            },
            fill: true,
            tension: 0.4,
            pointRadius: selectedTimeFrame === '1D' ? 2 : 0,
            pointHoverRadius: 4,
            borderWidth: 2,
          },
        ],
      });
    } else {
      setChartData(null);
    }
  }, [selectedFromCurrency, historicalData, selectedTimeFrame, theme.palette.primary.main]);

  useEffect(() => {
    getChartData();
  }, [selectedFromCurrency, historicalData, selectedTimeFrame, theme.palette.primary.main, getChartData]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: theme.palette.mode === 'dark' 
          ? 'rgba(30, 41, 59, 0.9)'
          : 'rgba(255, 255, 255, 0.9)',
        titleColor: theme.palette.text.primary,
        bodyColor: theme.palette.text.primary,
        borderColor: theme.palette.mode === 'dark'
          ? 'rgba(255, 255, 255, 0.1)'
          : 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1,
        padding: 12,
        boxPadding: 4,
        usePointStyle: true,
        titleFont: {
          size: 14,
          weight: 600,
        },
        bodyFont: {
          size: 13,
        },
        callbacks: {
          title: (tooltipItems: any) => {
            const item = tooltipItems[0];
            if (!item) return '';
            if (selectedTimeFrame === '1D') {
              return item.label;
            }
            const date = new Date(item.label);
            return date.toLocaleDateString('en-US', { 
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            });
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          maxRotation: selectedTimeFrame === '1Y' ? 45 : 0,
          autoSkip: true,
          maxTicksLimit: getMaxTicksForTimeFrame(selectedTimeFrame),
          color: theme.palette.text.secondary,
        },
        border: {
          display: false,
        },
      },
      y: {
        grid: {
          color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
          drawBorder: false,
        },
        border: {
          display: false,
        },
        ticks: {
          callback: (value: any) => {
            return selectedToCurrency?.symbol.toUpperCase() + ' ' + value.toLocaleString();
          },
          color: theme.palette.text.secondary,
          padding: 8,
        },
        beginAtZero: false,
      },
    },
    layout: {
      padding: {
        left: 10,
        right: 10,
        top: 10,
        bottom: 20
      }
    }
  };

  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
        px: 2,
        position: 'relative',
        background: theme.palette.mode === 'dark'
          ? 'linear-gradient(to bottom right, #0f172a, #1e293b)'
          : 'linear-gradient(to bottom right, #f8fafc, #f1f5f9)',
      }}
    >
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          background: {
            opacity: 0,
          },
          fpsLimit: 60,
          particles: {
            color: {
              value: theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
            },
            links: {
              color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
              distance: 150,
              enable: true,
              opacity: 0.1,
              width: 1,
            },
            move: {
              enable: true,
              speed: 0.5,
            },
            number: {
              density: {
                enable: true,
                area: 800,
              },
              value: 50,
            },
            opacity: {
              value: 0.1,
            },
            shape: {
              type: 'circle',
            },
            size: {
              value: { min: 1, max: 3 },
            },
          },
          detectRetina: true,
        }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
        }}
      />
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Paper 
          elevation={0} 
          sx={{ 
            p: { xs: 3, md: 4 }, 
            position: 'relative',
            backdropFilter: 'blur(20px)',
            backgroundColor: theme.palette.mode === 'dark'
              ? 'rgba(30, 41, 59, 0.7)'
              : 'rgba(255, 255, 255, 0.7)',
            transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: theme.palette.mode === 'dark'
                ? '0 20px 40px -15px rgba(0, 0, 0, 0.3)'
                : '0 20px 40px -15px rgba(0, 0, 0, 0.1)',
            },
          }}
        >
          <Box sx={{ 
            position: 'absolute', 
            top: 16, 
            right: 16,
            display: 'flex',
            gap: 1,
          }}>
            <IconButton 
              onClick={colorMode.toggleColorMode} 
              sx={{ 
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': {
                  bgcolor: 'primary.dark',
                },
                width: 40,
                height: 40,
              }}
            >
              {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Box>

          <Typography 
            variant="h4" 
            align="center" 
            sx={{ 
              mb: 4,
              background: 'linear-gradient(45deg, #6366f1, #10b981)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' },
              textShadow: theme.palette.mode === 'dark' 
                ? '0 0 30px rgba(99, 102, 241, 0.2)'
                : '0 0 30px rgba(99, 102, 241, 0.1)',
            }}
          >
            Cryptocurrency Converter Calculator
          </Typography>

          <Grid container spacing={3} alignItems="center" justifyContent="center">
            <Grid item xs={12} md={5}>
              <Box sx={{ position: 'relative' }}>
                <TextField
                  fullWidth
                  type="number"
                  value={fromAmount}
                  onChange={handleFromAmountChange}
                  InputProps={{
                    inputProps: { 
                      min: 0, 
                      step: cryptocurrencies.some(c => c.id === selectedFromCurrency?.id) ? "0.00000001" : "0.01",
                      style: {
                        MozAppearance: 'textfield',
                        fontSize: '1.1rem',
                      }
                    },
                    endAdornment: (
                      <InputAdornment position="end">
                        <Button
                          onClick={handleFromMenuClick}
                          sx={{
                            minWidth: 'auto',
                            px: 2,
                            py: 1,
                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
                            '&:hover': {
                              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
                            },
                            color: 'text.primary',
                          }}
                        >
                          {selectedFromCurrency?.symbol.toUpperCase()}
                          <KeyboardArrowDownIcon sx={{ ml: 0.5 }} />
                        </Button>
                      </InputAdornment>
                    ),
                    sx: {
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                      },
                      '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
                        WebkitAppearance: 'none',
                        margin: 0,
                      },
                    }
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                    },
                  }}
                />
                <Menu
                  anchorEl={fromAnchorEl}
                  open={Boolean(fromAnchorEl)}
                  onClose={handleFromMenuClose}
                  PaperProps={{
                    sx: {
                      mt: 1,
                      maxHeight: '400px',
                      width: '250px',
                      overflowY: 'auto',
                      boxShadow: theme.palette.mode === 'dark'
                        ? '0 0 0 1px rgba(255, 255, 255, 0.1), 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                        : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                      '&::-webkit-scrollbar': {
                        width: '8px',
                      },
                      '&::-webkit-scrollbar-track': {
                        background: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                        borderRadius: '4px',
                      },
                      '&::-webkit-scrollbar-thumb': {
                        background: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                        borderRadius: '4px',
                        '&:hover': {
                          background: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
                        },
                      },
                    }
                  }}
                >
                  {cryptocurrencies.map((currency) => (
                    <MenuItem 
                      key={currency.id} 
                      value={currency.id}
                      onClick={() => handleFromCurrencySelect(currency.id)}
                      selected={currency.id === selectedFromCurrency?.id}
                      sx={{
                        py: 1.5,
                        px: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        '&.Mui-selected': {
                          bgcolor: theme.palette.mode === 'dark' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(99, 102, 241, 0.1)',
                          '&:hover': {
                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(99, 102, 241, 0.25)' : 'rgba(99, 102, 241, 0.2)',
                          },
                        },
                      }}
                    >
                      <Box sx={{ 
                        width: '24px', 
                        height: '24px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        color: theme.palette.primary.main,
                        fontWeight: 600,
                        fontSize: '0.75rem',
                      }}>
                        {currency.symbol}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        {currency.name}
                        <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
                          {currency.symbol}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Menu>
              </Box>
            </Grid>

            <Grid item xs={12} md={2} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography 
                variant="h5" 
                sx={{ 
                  color: 'primary.main',
                  fontWeight: 600,
                }}
              >
                =
              </Typography>
            </Grid>

            <Grid item xs={12} md={5}>
              <Box sx={{ position: 'relative' }}>
                <TextField
                  fullWidth
                  type="number"
                  value={toAmount}
                  onChange={handleToAmountChange}
                  InputProps={{
                    inputProps: { 
                      min: 0, 
                      step: cryptocurrencies.some(c => c.id === selectedToCurrency?.id) ? "0.00000001" : "0.01",
                      style: {
                        MozAppearance: 'textfield',
                        fontSize: '1.1rem',
                      }
                    },
                    endAdornment: (
                      <InputAdornment position="end">
                        <Button
                          onClick={handleToMenuClick}
                          sx={{
                            minWidth: 'auto',
                            px: 2,
                            py: 1,
                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
                            '&:hover': {
                              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
                            },
                            color: 'text.primary',
                          }}
                        >
                          {selectedToCurrency?.symbol.toUpperCase()}
                          <KeyboardArrowDownIcon sx={{ ml: 0.5 }} />
                        </Button>
                      </InputAdornment>
                    ),
                    sx: {
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                      },
                      '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
                        WebkitAppearance: 'none',
                        margin: 0,
                      },
                    }
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                    },
                  }}
                />
                <Menu
                  anchorEl={toAnchorEl}
                  open={Boolean(toAnchorEl)}
                  onClose={handleToMenuClose}
                  PaperProps={{
                    sx: {
                      mt: 1,
                      maxHeight: '400px',
                      width: '250px',
                      overflowY: 'auto',
                      boxShadow: theme.palette.mode === 'dark'
                        ? '0 0 0 1px rgba(255, 255, 255, 0.1), 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                        : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                      '&::-webkit-scrollbar': {
                        width: '8px',
                      },
                      '&::-webkit-scrollbar-track': {
                        background: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                        borderRadius: '4px',
                      },
                      '&::-webkit-scrollbar-thumb': {
                        background: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                        borderRadius: '4px',
                        '&:hover': {
                          background: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
                        },
                      },
                    }
                  }}
                >
                  {fiatCurrencies.map((currency) => (
                    <MenuItem 
                      key={currency.id} 
                      value={currency.id}
                      onClick={() => handleToCurrencySelect(currency.id)}
                      selected={currency.id === selectedToCurrency?.id}
                      sx={{
                        py: 1.5,
                        px: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        '&.Mui-selected': {
                          bgcolor: theme.palette.mode === 'dark' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(99, 102, 241, 0.1)',
                          '&:hover': {
                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(99, 102, 241, 0.25)' : 'rgba(99, 102, 241, 0.2)',
                          },
                        },
                      }}
                    >
                      <Box sx={{ 
                        width: '24px', 
                        height: '24px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        color: theme.palette.primary.main,
                        fontWeight: 600,
                        fontSize: '0.75rem',
                      }}>
                        {currency.symbol}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        {currency.name}
                        <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
                          {currency.symbol}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Menu>
              </Box>
            </Grid>
          </Grid>

          <Box sx={{ 
            mt: 4, 
            p: 2, 
            borderRadius: 2,
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
            transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: theme.palette.mode === 'dark'
                ? '0 8px 16px -4px rgba(0, 0, 0, 0.2)'
                : '0 8px 16px -4px rgba(0, 0, 0, 0.1)',
            },
          }}>
            <Typography 
              variant="body1" 
              align="center" 
              sx={{ 
                color: 'text.secondary',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
              }}
            >
              {isLoading ? (
                <CircularProgress size={20} />
              ) : error ? (
                <span style={{ color: theme.palette.error.main }}>{error}</span>
              ) : (
                <>
                  1 {selectedFromCurrency?.symbol.toUpperCase()} = {' '}
                  {formatAmount(currentPrice || 0, false)}{' '}
                  {selectedToCurrency?.symbol.toUpperCase()}
                </>
              )}
            </Typography>
          </Box>

          {chartData && cryptocurrencies.some(c => c.id === selectedFromCurrency?.id) && (
            <Box sx={{ 
              mt: 6, 
              height: 400,
              pb: 4,
              p: 3,
              borderRadius: 2,
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
              display: 'flex',
              flexDirection: 'column',
              transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: theme.palette.mode === 'dark'
                  ? '0 8px 16px -4px rgba(0, 0, 0, 0.2)'
                  : '0 8px 16px -4px rgba(0, 0, 0, 0.1)',
              },
            }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 4,
                flexWrap: 'wrap',
                gap: 2,
              }}>
                <Typography 
                  variant="h6" 
                  sx={{
                    color: 'text.primary',
                    fontSize: '1.25rem',
                  }}
                >
                  {selectedFromCurrency?.symbol.toUpperCase()} Price History
                </Typography>
              </Box>
              <Box sx={{ 
                display: 'flex', 
                gap: 1,
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                borderRadius: 3,
                p: 0.75,
              }}>
                {timeFrames.map((timeFrame) => (
                  <Button
                    key={timeFrame}
                    onClick={() => setSelectedTimeFrame(timeFrame)}
                    variant={selectedTimeFrame === timeFrame ? "contained" : "text"}
                    size="small"
                    sx={{
                      minWidth: '52px',
                      px: 2,
                      py: 0.75,
                      fontSize: '0.9rem',
                      color: selectedTimeFrame === timeFrame ? 'white' : 'text.secondary',
                      bgcolor: selectedTimeFrame === timeFrame ? 'primary.main' : 'transparent',
                      '&:hover': {
                        bgcolor: selectedTimeFrame === timeFrame 
                          ? 'primary.dark'
                          : theme.palette.mode === 'dark' 
                          ? 'rgba(255, 255, 255, 0.1)' 
                          : 'rgba(0, 0, 0, 0.05)',
                      },
                    }}
                  >
                    {timeFrame}
                  </Button>
                ))}
              </Box>
              {error ? (
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  color: 'error.main',
                  textAlign: 'center',
                  p: 3,
                }}>
                  <Typography>
                    {error}
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ flex: 1, minHeight: 0 }}>
                  <Line data={chartData} options={{
                    ...chartOptions,
                    layout: {
                      padding: {
                        left: 20,
                        right: 30,
                        top: 20,
                        bottom: 20
                      }
                    },
                    scales: {
                      ...chartOptions.scales,
                      y: {
                        ...chartOptions.scales.y,
                        ticks: {
                          ...chartOptions.scales.y.ticks,
                          font: {
                            size: 12,
                          },
                          padding: 12,
                        },
                      },
                      x: {
                        ...chartOptions.scales.x,
                        ticks: {
                          ...chartOptions.scales.x.ticks,
                          font: {
                            size: 12,
                          },
                          padding: 8,
                          maxTicksLimit: getMaxTicksForTimeFrame(selectedTimeFrame) * 1.5,
                        },
                      },
                    },
                    plugins: {
                      ...chartOptions.plugins,
                      tooltip: {
                        ...chartOptions.plugins.tooltip,
                        titleFont: {
                          size: 14,
                          weight: 600,
                        },
                        bodyFont: {
                          size: 13,
                        },
                        padding: 16,
                      },
                    },
                  }} />
                </Box>
              )}
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
}; 