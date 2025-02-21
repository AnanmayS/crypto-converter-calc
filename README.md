# Cryptocurrency Converter & Analytics Dashboard

A modern, responsive web application for real-time cryptocurrency conversions and price tracking, built with React and TypeScript.

<div align="center">
  <h3>✨ Beautiful Interface with Real-time Price Charts ✨</h3>
  
  <details open>
    <summary><strong>🌙 Dark Mode</strong></summary>
    <img src="assets/dark-mode-preview.png" alt="Crypto Converter Dark Mode" width="100%" />
  </details>

  <details open>
    <summary><strong>☀️ Light Mode</strong></summary>
    <img src="assets/light-mode-preview.png" alt="Crypto Converter Light Mode" width="100%" />
  </details>
</div>

## ✨ Features

- Real-time cryptocurrency to fiat currency conversions
- Interactive price charts with multiple timeframes (1D, 7D, 30D, 90D, 1Y)
- Support for 15+ major cryptocurrencies and 15+ fiat currencies
- Beautiful, responsive UI with dark/light mode
- Real-time price updates using CoinGecko API
- Interactive particle background effects
- Fully responsive design for all devices

## 🚀 Live Demo

Experience the app live at: [**Crypto Converter**](https://crypto-converter-calculator.netlify.app/)

Try converting between different cryptocurrencies and fiat currencies, explore price charts, and toggle between dark/light modes!

## Tech Stack

- React
- TypeScript
- Chart.js for data visualization
- React-tsparticles for background effects
- CoinGecko API for price data
- Axios for API requests

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/crypto-converter.git
   ```

2. Install dependencies:
   ```bash
   cd crypto-converter
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Project Structure

```
src/
  ├── components/      # Reusable UI components
  ├── features/        # Feature-specific components
  │   └── crypto/      # Cryptocurrency-related features
  ├── hooks/           # Custom React hooks
  ├── services/        # API services
  ├── types/           # TypeScript type definitions
  └── utils/           # Utility functions
```

## API Integration

This project uses the following APIs:
- CoinGecko API for cryptocurrency price data
- No API key required for basic usage

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

