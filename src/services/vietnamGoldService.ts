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
 * Parse HTML from giavang.doji.vn
 */
const fetchDOJIPrices = async (): Promise<VietnamGoldPrice[]> => {
  try {
    console.log('DOJI: Fetching from https://giavang.doji.vn/');
    const response = await fetch('https://giavang.doji.vn/');

    if (!response.ok) {
      console.error('DOJI: Failed with status:', response.status);
      throw new Error(`DOJI fetch failed with status ${response.status}`);
    }

    const html = await response.text();
    console.log('DOJI: Got HTML, length:', html.length);

    const prices: VietnamGoldPrice[] = [];

    // Parse HTML to extract gold prices from tables
    // The HTML has tables with class "goldprice-view" containing prices

    // Extract main price table (first one with "Giá vàng trong nước")
    const tableRegex = /<table class="goldprice-view[^"]*">[\s\S]*?<\/table>/g;
    const tables = html.match(tableRegex);

    if (!tables || tables.length === 0) {
      console.error('DOJI: No price tables found in HTML');
      throw new Error('No DOJI price tables found');
    }

    console.log(`DOJI: Found ${tables.length} price tables`);

    // Parse the first table (main prices)
    const firstTable = tables[0];

    // Extract rows - looking for patterns like:
    // <tr class="odd"><td class="first"><span class="title...">AVPL/SJC - BÁN LẺ</span>...
    // <td class="goldprice-td goldprice-td-0"><div class="item-relative">14,460</div></td>
    // <td class="goldprice-td goldprice-td-1"><div class="item-relative">14,660</div></td>

    const rowRegex = /<tr[^>]*>[\s\S]*?<\/tr>/g;
    const rows = firstTable.match(rowRegex);

    if (rows) {
      for (const row of rows) {
        // Skip header rows
        if (row.includes('<thead>') || row.includes('<th')) continue;

        // Extract gold type name
        const nameMatch = row.match(/<span class="title[^"]*">([^<]+)<\/span>/);
        const name = nameMatch ? nameMatch[1].trim() : null;

        // Extract buy price (first goldprice-td)
        const buyMatch = row.match(/<td class="goldprice-td goldprice-td-0"[^>]*><div[^>]*>([0-9,]+)<\/div><\/td>/);
        // Extract sell price (second goldprice-td)
        const sellMatch = row.match(/<td class="goldprice-td goldprice-td-1"[^>]*><div[^>]*>([0-9,]+)<\/div><\/td>/);

        if (name && buyMatch && sellMatch) {
          // Remove commas and parse
          const buyPriceChiThousands = parseFloat(buyMatch[1].replace(/,/g, ''));
          const sellPriceChiThousands = parseFloat(sellMatch[1].replace(/,/g, ''));

          // Convert from nghìn/chỉ to VND/lượng
          // 1 lượng = 10 chỉ
          // Price is in thousands, so: price * 10 (chỉ to lượng) * 1000 (thousands to VND)
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

          console.log(`DOJI: Parsed ${name}: Buy ${buyPrice}, Sell ${sellPrice}`);
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
