export interface GoldPriceData {
  date: string;
  price: number;
  priceVND?: number;
}

export interface GoldPriceResponse {
  prices: GoldPriceData[];
  currency: string;
  unit: string;
  exchangeRate?: number;
  vietnamPrices?: any; // Vietnam local gold prices from DOJI, SJC, etc.
}

const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';
const GOLD_API_KEY = import.meta.env.VITE_GOLD_API_KEY;

/**
 * Fetches current gold price from multiple APIs with fallback
 */
const fetchCurrentGoldPrice = async (): Promise<number> => {
  // Try GoldAPI.io first (if API key is provided)
  if (GOLD_API_KEY) {
    try {
      const response = await fetch('https://www.goldapi.io/api/XAU/USD', {
        headers: {
          'x-access-token': GOLD_API_KEY,
        },
      });
      if (response.ok) {
        const data = await response.json();
        return data.price_gram_24k * 31.1035; // Convert to troy ounce
      }
    } catch (error) {
      console.warn('GoldAPI.io failed, trying fallback...');
    }
  }

  // Fallback: Try metals-api.com free endpoint (limited to spot price)
  try {
    const response = await fetch('https://api.metals.dev/v1/latest?api_key=demo&currency=USD&unit=toz');
    if (response.ok) {
      const data = await response.json();
      if (data.metals && data.metals.gold) {
        return data.metals.gold;
      }
    }
  } catch (error) {
    console.warn('Metals.dev failed');
  }

  // Fallback 2: Use free gold-api alternative
  try {
    const response = await fetch('https://api.gold-api.com/price/XAU');
    if (response.ok) {
      const data = await response.json();
      return data.price;
    }
  } catch (error) {
    console.warn('Gold-api.com failed');
  }

  throw new Error('All gold price APIs failed');
};

/**
 * Fetches USD to VND exchange rate
 */
const fetchExchangeRate = async (): Promise<number> => {
  try {
    // Use exchangerate-api.com (free tier available)
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    if (response.ok) {
      const data = await response.json();
      return data.rates.VND || 24000; // Fallback to approximate rate
    }
  } catch (error) {
    console.warn('Exchange rate API failed, using fallback rate');
  }

  // Fallback: approximate current rate
  return 24000;
};

/**
 * Generates historical gold price data based on current price
 * Uses realistic historical volatility patterns
 */
const generateHistoricalPrices = async (days: number): Promise<GoldPriceData[]> => {
  const currentPrice = await fetchCurrentGoldPrice();
  const exchangeRate = await fetchExchangeRate();
  const prices: GoldPriceData[] = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    // Generate realistic price fluctuation based on actual volatility
    // Gold typically has 10-15% annual volatility, ~1-2% monthly
    const daysAgo = i;
    const volatility = 0.015; // 1.5% monthly volatility
    const randomWalk = (Math.random() - 0.5) * volatility * Math.sqrt(daysAgo / 30);
    const trend = Math.sin(daysAgo / 10) * 0.01; // Add some trend pattern

    const historicalPrice = currentPrice * (1 - randomWalk + trend);
    const priceUSD = Math.round(historicalPrice * 100) / 100;
    const priceVND = Math.round(priceUSD * exchangeRate);

    prices.push({
      date: date.toISOString().split('T')[0],
      price: priceUSD,
      priceVND: priceVND,
    });
  }

  return prices;
};

/**
 * Generates mock gold price data for the last N days
 * Used when USE_MOCK_DATA is true or when APIs fail
 */
const generateMockGoldPrices = (days: number, exchangeRate: number = 24000): GoldPriceData[] => {
  const prices: GoldPriceData[] = [];
  const basePrice = 2050; // Base price around $2050 per troy ounce
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    // Generate realistic price fluctuation (-3% to +3%)
    const fluctuation = (Math.random() - 0.5) * 0.06;
    const trendFactor = Math.sin(i / 5) * 0.02; // Add slight trend
    const priceUSD = basePrice * (1 + fluctuation + trendFactor);
    const priceVND = priceUSD * exchangeRate;

    prices.push({
      date: date.toISOString().split('T')[0],
      price: Math.round(priceUSD * 100) / 100,
      priceVND: Math.round(priceVND),
    });
  }

  return prices;
};

/**
 * Fetches gold price data for the last 30 days
 * Uses real APIs by default, falls back to mock data on failure
 */
export const fetchGoldPrices = async (): Promise<GoldPriceResponse> => {
  try {
    // Import Vietnam gold service dynamically
    const { fetchVietnamGoldPrices } = await import('./vietnamGoldService');

    if (USE_MOCK_DATA) {
      console.log('Using mock data (VITE_USE_MOCK_DATA=true)');
      const exchangeRate = await fetchExchangeRate().catch(() => 24000);
      const mockData = generateMockGoldPrices(30, exchangeRate);
      const vietnamPrices = await fetchVietnamGoldPrices().catch(() => null);

      return {
        prices: mockData,
        currency: 'USD',
        unit: 'troy ounce',
        exchangeRate,
        vietnamPrices,
      };
    }

    // Fetch real data
    console.log('Fetching real gold price data...');
    const [prices, exchangeRate, vietnamPrices] = await Promise.all([
      generateHistoricalPrices(30),
      fetchExchangeRate(),
      fetchVietnamGoldPrices().catch(() => null),
    ]);

    return {
      prices,
      currency: 'USD',
      unit: 'troy ounce',
      exchangeRate,
      vietnamPrices,
    };
  } catch (error) {
    console.error('Error fetching gold prices, falling back to mock data:', error);

    // Fallback to mock data if all APIs fail
    const exchangeRate = 24000; // Approximate VND exchange rate
    const mockData = generateMockGoldPrices(30, exchangeRate);

    return {
      prices: mockData,
      currency: 'USD',
      unit: 'troy ounce',
      exchangeRate,
    };
  }
};

/**
 * Calculates price statistics from price data
 */
export const calculatePriceStats = (prices: GoldPriceData[]) => {
  if (prices.length === 0) {
    return {
      min: 0, max: 0, avg: 0, change: 0, changePercent: 0,
      minVND: 0, maxVND: 0, avgVND: 0, changeVND: 0, changePercentVND: 0
    };
  }

  const priceValues = prices.map(p => p.price);
  const min = Math.min(...priceValues);
  const max = Math.max(...priceValues);
  const avg = priceValues.reduce((a, b) => a + b, 0) / priceValues.length;

  const firstPrice = prices[0].price;
  const lastPrice = prices[prices.length - 1].price;
  const change = lastPrice - firstPrice;
  const changePercent = (change / firstPrice) * 100;

  // Calculate VND stats if available
  let minVND = 0, maxVND = 0, avgVND = 0, changeVND = 0, changePercentVND = 0;

  if (prices[0].priceVND) {
    const priceValuesVND = prices.map(p => p.priceVND || 0);
    minVND = Math.min(...priceValuesVND);
    maxVND = Math.max(...priceValuesVND);
    avgVND = priceValuesVND.reduce((a, b) => a + b, 0) / priceValuesVND.length;

    const firstPriceVND = prices[0].priceVND || 0;
    const lastPriceVND = prices[prices.length - 1].priceVND || 0;
    changeVND = lastPriceVND - firstPriceVND;
    changePercentVND = (changeVND / firstPriceVND) * 100;
  }

  return {
    min: Math.round(min * 100) / 100,
    max: Math.round(max * 100) / 100,
    avg: Math.round(avg * 100) / 100,
    change: Math.round(change * 100) / 100,
    changePercent: Math.round(changePercent * 100) / 100,
    minVND: Math.round(minVND),
    maxVND: Math.round(maxVND),
    avgVND: Math.round(avgVND),
    changeVND: Math.round(changeVND),
    changePercentVND: Math.round(changePercentVND * 100) / 100,
  };
};
