# Cryptocurrency Converter & Analytics Dashboard

A modern, responsive web application for real-time cryptocurrency conversions and price tracking, built with React and TypeScript.

## Features

- Real-time cryptocurrency to fiat currency conversions
- Interactive price charts with multiple timeframes (1D, 7D, 30D, 90D, 1Y)
- Support for 15+ major cryptocurrencies and 15+ fiat currencies
- Beautiful, responsive UI with dark/light mode
- Real-time price updates using CoinGecko API
- Interactive particle background effects
- Fully responsive design for all devices

## Live Demo

[[![Netlify Status]](https://app.netlify.com/sites/crypto-converter-calculator/deploys)](https://67b80af79ea6cf00081d495f--crypto-converter-calculator.netlify.app/) <!-- Add your Vercel URL after deployment -->

## Tech Stack

- React 18
- TypeScript
- Material-UI v5
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

