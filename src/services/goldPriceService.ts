import axios from 'axios';

export interface GoldPriceData {
  date: string;
  price: number;
}

export interface GoldPriceResponse {
  prices: GoldPriceData[];
  currency: string;
  unit: string;
}

/**
 * Fetches gold price data for the last 30 days
 * Uses a mock data generator for demonstration purposes
 * In production, replace with actual API endpoint
 */
export const fetchGoldPrices = async (): Promise<GoldPriceResponse> => {
  try {
    // For demonstration, we'll generate mock data for the last 30 days
    // In production, replace this with actual API call:
    // const response = await axios.get('https://api.example.com/gold-prices');

    const mockData = generateMockGoldPrices(30);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      prices: mockData,
      currency: 'USD',
      unit: 'troy ounce'
    };
  } catch (error) {
    console.error('Error fetching gold prices:', error);
    throw new Error('Failed to fetch gold price data');
  }
};

/**
 * Generates mock gold price data for the last N days
 * Simulates realistic price fluctuations around a base price
 */
const generateMockGoldPrices = (days: number): GoldPriceData[] => {
  const prices: GoldPriceData[] = [];
  const basePrice = 2050; // Base price around $2050 per troy ounce
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    // Generate realistic price fluctuation (-3% to +3%)
    const fluctuation = (Math.random() - 0.5) * 0.06;
    const trendFactor = Math.sin(i / 5) * 0.02; // Add slight trend
    const price = basePrice * (1 + fluctuation + trendFactor);

    prices.push({
      date: date.toISOString().split('T')[0],
      price: Math.round(price * 100) / 100
    });
  }

  return prices;
};

/**
 * Calculates price statistics from price data
 */
export const calculatePriceStats = (prices: GoldPriceData[]) => {
  if (prices.length === 0) {
    return { min: 0, max: 0, avg: 0, change: 0, changePercent: 0 };
  }

  const priceValues = prices.map(p => p.price);
  const min = Math.min(...priceValues);
  const max = Math.max(...priceValues);
  const avg = priceValues.reduce((a, b) => a + b, 0) / priceValues.length;

  const firstPrice = prices[0].price;
  const lastPrice = prices[prices.length - 1].price;
  const change = lastPrice - firstPrice;
  const changePercent = (change / firstPrice) * 100;

  return {
    min: Math.round(min * 100) / 100,
    max: Math.round(max * 100) / 100,
    avg: Math.round(avg * 100) / 100,
    change: Math.round(change * 100) / 100,
    changePercent: Math.round(changePercent * 100) / 100
  };
};
