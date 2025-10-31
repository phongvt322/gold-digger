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
    // Use proxy API to avoid CORS issues
    const response = await fetch('/api/sjc');
    if (!response.ok) throw new Error('SJC API failed');

    const json = await response.json();
    if (!json.success) throw new Error('SJC API returned error');

    const text = json.data;

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
 * Parse chart data from giavang.doji.vn JavaScript
 */
const fetchDOJIPrices = async (): Promise<VietnamGoldPrice[]> => {
  try {
    console.log('DOJI: Fetching via API proxy');
    const response = await fetch('/api/doji');

    if (!response.ok) {
      console.error('DOJI: API failed with status:', response.status);
      throw new Error(`DOJI API failed with status ${response.status}`);
    }

    const json = await response.json();
    if (!json.success) {
      console.error('DOJI: API returned error:', json.error);
      throw new Error('DOJI API returned error');
    }

    const html = json.html;
    console.log('DOJI: Got HTML from API, length:', html.length);

    const prices: VietnamGoldPrice[] = [];

    // Extract gold price from chart title which shows the format: "SJC (nghìn/lượng): 144,600/146,600"
    // This gives us the current buy/sell prices in thousands per lượng
    const chartTitleRegex = /text\s*:\s*'([^']+)\s+\(nghìn\/lượng\):\s*([0-9,]+)\/([0-9,]+)'/g;
    let match;

    while ((match = chartTitleRegex.exec(html)) !== null) {
      const name = match[1].trim();
      const buyPriceThousands = parseFloat(match[2].replace(/,/g, ''));
      const sellPriceThousands = parseFloat(match[3].replace(/,/g, ''));

      if (name && !isNaN(buyPriceThousands) && !isNaN(sellPriceThousands)) {
        // Convert from thousands to VND: multiply by 1,000
        const buyPrice = buyPriceThousands * 1000;
        const sellPrice = sellPriceThousands * 1000;

        prices.push({
          company: 'DOJI',
          buyPrice: buyPrice,
          sellPrice: sellPrice,
          unit: 'lượng',
          type: name,
          lastUpdate: new Date().toISOString(),
        });

        console.log(`DOJI: Parsed from chart - ${name}: Buy ${buyPrice}, Sell ${sellPrice}`);
      }
    }

    // Also parse the main table for additional gold types
    const tableRegex = /<table class="goldprice-view[^"]*">[\s\S]*?<\/table>/g;
    const tables = html.match(tableRegex);

    if (tables && tables.length > 0) {
      const firstTable = tables[0];
      const rowRegex = /<tr[^>]*>[\s\S]*?<\/tr>/g;
      const rows = firstTable.match(rowRegex);

      if (rows) {
        for (const row of rows) {
          // Skip header rows and SJC row (already parsed from chart)
          if (row.includes('<thead>') || row.includes('<th') || row.includes('SJC') || row.includes('AVPL')) continue;

          // Extract gold type name
          const nameMatch = row.match(/<span class="title[^"]*">([^<]+)<\/span>/);
          const name = nameMatch ? nameMatch[1].trim() : null;

          // Extract buy/sell prices (in nghìn/chỉ - thousands per chỉ)
          const buyMatch = row.match(/<td class="goldprice-td goldprice-td-0"[^>]*><div[^>]*>([0-9,]+)<\/div><\/td>/);
          const sellMatch = row.match(/<td class="goldprice-td goldprice-td-1"[^>]*><div[^>]*>([0-9,]+)<\/div><\/td>/);

          if (name && buyMatch && sellMatch) {
            const buyPriceChiThousands = parseFloat(buyMatch[1].replace(/,/g, ''));
            const sellPriceChiThousands = parseFloat(sellMatch[1].replace(/,/g, ''));

            // Convert from nghìn/chỉ to VND/lượng
            // 1 lượng = 10 chỉ
            // Price × 10 (chỉ to lượng) × 1000 (thousands to VND)
            const buyPrice = buyPriceChiThousands * 10 * 1000;
            const sellPrice = sellPriceChiThousands * 10 * 1000;

            prices.push({
              company: 'DOJI',
              buyPrice: buyPrice,
              sellPrice: sellPrice,
              unit: 'lượng',
              type: name,
              lastUpdate: new Date().toISOString(),
            });

            console.log(`DOJI: Parsed from table - ${name}: Buy ${buyPrice}, Sell ${sellPrice}`);
          }
        }
      }
    }

    console.log(`DOJI: Successfully parsed ${prices.length} prices from HTML`);

    if (prices.length === 0) {
      console.warn('DOJI: Could not parse any prices from HTML');
      throw new Error('Could not parse DOJI prices');
    }

    return prices;
  } catch (error) {
    console.error('DOJI: Error parsing HTML:', error);
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
