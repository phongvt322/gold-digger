export interface VietnamGoldPrice {
  company: string;
  buyPrice: number;  // Giá mua vào
  sellPrice: number; // Giá bán ra
  unit: string;      // Usually "chỉ" (tael) or "lượng"
  type: string;      // Type of gold (SJC, 9999, etc.)
  lastUpdate: string;
}

export interface VietnamGoldResponse {
  prices: VietnamGoldPrice[];
  timestamp: string;
}

/**
 * Fetches gold prices from Vietnamese sources
 * Sources: DOJI, SJC, PNJ, Bảo Tín Minh Châu, Mi Hồng
 */
export const fetchVietnamGoldPrices = async (): Promise<VietnamGoldResponse> => {
  try {
    // Try to fetch from a Vietnamese gold price aggregator API
    // Option 1: Try sjc.com.vn API
    const sjcPrices = await fetchSJCPrices().catch(() => null);

    // Option 2: Try DOJI API
    const dojiPrices = await fetchDOJIPrices().catch(() => null);

    // Option 3: Try PNJ API
    const pnjPrices = await fetchPNJPrices().catch(() => null);

    // Option 4: Try Bảo Tín Minh Châu API
    const btmcPrices = await fetchBTMCPrices().catch(() => null);

    const allPrices: VietnamGoldPrice[] = [
      ...(sjcPrices || []),
      ...(dojiPrices || []),
      ...(pnjPrices || []),
      ...(btmcPrices || []),
    ];

    if (allPrices.length > 0) {
      return {
        prices: allPrices,
        timestamp: new Date().toISOString(),
      };
    }

    // Fallback to mock data if all APIs fail
    return getMockVietnamPrices();
  } catch (error) {
    console.error('Error fetching Vietnam gold prices:', error);
    return getMockVietnamPrices();
  }
};

/**
 * Fetch prices from SJC (Saigon Jewelry Company)
 * SJC is the official gold bar standard in Vietnam
 */
const fetchSJCPrices = async (): Promise<VietnamGoldPrice[]> => {
  try {
    // SJC provides a public API endpoint
    const response = await fetch('https://sjc.com.vn/xml/tygiavang.xml');
    if (!response.ok) throw new Error('SJC API failed');

    const text = await response.text();

    // Parse XML response (simplified - you may need a proper XML parser)
    const prices: VietnamGoldPrice[] = [];

    // Extract SJC gold bar prices
    const sjcMatch = text.match(/<city name="Hồ Chí Minh">[\s\S]*?<item type="SJC"[\s\S]*?buy="(\d+)"[\s\S]*?sell="(\d+)"/);
    if (sjcMatch) {
      prices.push({
        company: 'SJC',
        buyPrice: parseFloat(sjcMatch[1]),
        sellPrice: parseFloat(sjcMatch[2]),
        unit: 'lượng',
        type: 'Vàng SJC',
        lastUpdate: new Date().toISOString(),
      });
    }

    return prices;
  } catch (error) {
    console.warn('SJC API failed:', error);
    throw error;
  }
};

/**
 * Fetch prices from DOJI
 * Using real DOJI API endpoint
 */
const fetchDOJIPrices = async (): Promise<VietnamGoldPrice[]> => {
  try {
    // Use environment variable if available, otherwise use default API key
    const dojiApiKey = import.meta.env.VITE_DOJI_API_KEY || '258fbd2a72ce8481089d88c678e9fe4f';
    const response = await fetch(`https://giavang.doji.vn/api/giavang/?api_key=${dojiApiKey}`);

    console.log('DOJI API Response Status:', response.status);

    if (!response.ok) {
      console.error('DOJI API failed with status:', response.status);
      throw new Error(`DOJI API failed with status ${response.status}`);
    }

    const data = await response.json();
    console.log('DOJI API Full Response:', JSON.stringify(data, null, 2));

    const prices: VietnamGoldPrice[] = [];

    // Helper function to extract price from various formats
    const extractPrice = (value: any): number => {
      if (!value) return 0;
      // Remove all non-numeric characters except dots and commas
      const cleaned = String(value).replace(/[^\d.,]/g, '');
      // Replace comma with dot for decimal
      const normalized = cleaned.replace(',', '.');
      const parsed = parseFloat(normalized);
      return isNaN(parsed) ? 0 : parsed;
    };

    // Try multiple parsing strategies

    // Strategy 1: data.DataList.Data structure
    if (data && data.DataList && data.DataList.Data) {
      console.log('DOJI: Trying Strategy 1 - DataList.Data');
      const goldData = data.DataList.Data;

      Object.keys(goldData).forEach((key) => {
        const items = goldData[key];
        if (Array.isArray(items)) {
          items.forEach((item: any) => {
            console.log('DOJI Item:', item);

            const buyPrice = extractPrice(item._buy || item.buy || item.Buy || item.mua_vao);
            const sellPrice = extractPrice(item._sell || item.sell || item.Sell || item.ban_ra);
            const name = item._name || item.name || item.Name || 'Vàng DOJI';

            if (buyPrice > 0 && sellPrice > 0) {
              prices.push({
                company: 'DOJI',
                buyPrice: buyPrice * 1000000, // Convert to VND
                sellPrice: sellPrice * 1000000,
                unit: 'lượng',
                type: name,
                lastUpdate: new Date().toISOString(),
              });
              console.log('DOJI: Added price:', name, buyPrice, sellPrice);
            }
          });
        }
      });
    }

    // Strategy 2: Direct array
    if (prices.length === 0 && Array.isArray(data)) {
      console.log('DOJI: Trying Strategy 2 - Direct Array');
      data.forEach((item: any) => {
        const buyPrice = extractPrice(item._buy || item.buy || item.Buy || item.mua_vao);
        const sellPrice = extractPrice(item._sell || item.sell || item.Sell || item.ban_ra);
        const name = item._name || item.name || item.Name || 'Vàng DOJI';

        if (buyPrice > 0 && sellPrice > 0) {
          prices.push({
            company: 'DOJI',
            buyPrice: buyPrice * 1000000,
            sellPrice: sellPrice * 1000000,
            unit: 'lượng',
            type: name,
            lastUpdate: new Date().toISOString(),
          });
        }
      });
    }

    // Strategy 3: data.data or data.items
    if (prices.length === 0 && data) {
      console.log('DOJI: Trying Strategy 3 - data.data or data.items');
      const items = data.data || data.items || data.prices;
      if (Array.isArray(items)) {
        items.forEach((item: any) => {
          const buyPrice = extractPrice(item._buy || item.buy || item.Buy || item.mua_vao);
          const sellPrice = extractPrice(item._sell || item.sell || item.Sell || item.ban_ra);
          const name = item._name || item.name || item.Name || 'Vàng DOJI';

          if (buyPrice > 0 && sellPrice > 0) {
            prices.push({
              company: 'DOJI',
              buyPrice: buyPrice * 1000000,
              sellPrice: sellPrice * 1000000,
              unit: 'lượng',
              type: name,
              lastUpdate: new Date().toISOString(),
            });
          }
        });
      }
    }

    console.log(`DOJI: Successfully parsed ${prices.length} prices`);

    if (prices.length === 0) {
      console.warn('DOJI: Could not parse any prices from response. Please check console logs for response structure.');
    }

    return prices;
  } catch (error) {
    console.error('DOJI API error:', error);
    throw error;
  }
};

/**
 * Fetch prices from PNJ (Phu Nhuan Jewelry)
 */
const fetchPNJPrices = async (): Promise<VietnamGoldPrice[]> => {
  try {
    const response = await fetch('https://www.pnj.com.vn/blog/gia-vang/');
    if (!response.ok) throw new Error('PNJ API failed');

    // PNJ might require web scraping - for now return empty
    // In production, you'd need to parse their HTML or find their API
    return [];
  } catch (error) {
    console.warn('PNJ API failed:', error);
    throw error;
  }
};

/**
 * Fetch prices from Bảo Tín Minh Châu (BTMC)
 * BTMC is a major gold and jewelry retailer in Vietnam
 */
const fetchBTMCPrices = async (): Promise<VietnamGoldPrice[]> => {
  try {
    // Try BTMC API endpoint
    // BTMC might have an API at their website or require scraping
    const response = await fetch('https://www.btmcgoldgroup.com/api/gold-price');
    if (!response.ok) throw new Error('BTMC API failed');

    const data = await response.json();
    const prices: VietnamGoldPrice[] = [];

    // Parse BTMC response if available
    if (data && Array.isArray(data)) {
      data.forEach((item: any) => {
        const buyPrice = parseFloat(String(item.buy || item.mua_vao || '').replace(/[,\s]/g, ''));
        const sellPrice = parseFloat(String(item.sell || item.ban_ra || '').replace(/[,\s]/g, ''));

        if (buyPrice && sellPrice) {
          prices.push({
            company: 'Bảo Tín Minh Châu',
            buyPrice: buyPrice,
            sellPrice: sellPrice,
            unit: 'lượng',
            type: item.name || item.type || 'Vàng BTMC',
            lastUpdate: new Date().toISOString(),
          });
        }
      });
    }

    return prices;
  } catch (error) {
    console.warn('Bảo Tín Minh Châu API failed:', error);
    throw error;
  }
};

/**
 * Generate mock Vietnam gold prices for fallback
 */
const getMockVietnamPrices = (): VietnamGoldResponse => {
  const basePrice = 75000000; // ~75 million VND per lượng (approximate current price)
  const spread = 500000; // 500k VND spread between buy and sell

  return {
    prices: [
      {
        company: 'SJC',
        buyPrice: basePrice - spread,
        sellPrice: basePrice + spread,
        unit: 'lượng',
        type: 'Vàng SJC 9999',
        lastUpdate: new Date().toISOString(),
      },
      {
        company: 'DOJI',
        buyPrice: basePrice - 600000,
        sellPrice: basePrice + 400000,
        unit: 'lượng',
        type: 'Vàng DOJI 9999',
        lastUpdate: new Date().toISOString(),
      },
      {
        company: 'PNJ',
        buyPrice: basePrice - 700000,
        sellPrice: basePrice + 300000,
        unit: 'lượng',
        type: 'Vàng PNJ 9999',
        lastUpdate: new Date().toISOString(),
      },
      {
        company: 'Mi Hồng',
        buyPrice: basePrice - 800000,
        sellPrice: basePrice + 200000,
        unit: 'lượng',
        type: 'Vàng 9999',
        lastUpdate: new Date().toISOString(),
      },
      {
        company: 'Bảo Tín Minh Châu',
        buyPrice: basePrice - 550000,
        sellPrice: basePrice + 450000,
        unit: 'lượng',
        type: 'Vàng BTMC 9999',
        lastUpdate: new Date().toISOString(),
      },
    ],
    timestamp: new Date().toISOString(),
  };
};

/**
 * Convert lượng (tael) to grams
 * 1 lượng = 37.5 grams in Vietnam
 */
export const convertLuongToGrams = (luong: number): number => {
  return luong * 37.5;
};

/**
 * Convert price per lượng to price per gram
 */
export const convertPricePerLuongToGram = (pricePerLuong: number): number => {
  return pricePerLuong / 37.5;
};

/**
 * Format Vietnamese currency
 */
export const formatVND = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};
