/**
 * Vercel Cron Job to monitor DOJI gold prices
 * Runs every minute and sends Zalo notifications on price changes
 */

// Simple in-memory cache (will reset on cold starts)
// In production, use Vercel KV, Redis, or a database
let priceCache = null;

module.exports = async function handler(req, res) {
  // Verify this is a cron request (optional security)
  const authHeader = req.headers.authorization;
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    console.log('Unauthorized cron request');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    console.log('Price monitoring cron job started');

    // Fetch current DOJI prices
    const dojiResponse = await fetch(`${getBaseUrl(req)}/api/doji`);

    if (!dojiResponse.ok) {
      throw new Error('Failed to fetch DOJI prices');
    }

    const dojiData = await dojiResponse.json();

    if (!dojiData.success) {
      throw new Error('DOJI API returned error');
    }

    const html = dojiData.html;

    // Parse prices from HTML
    const currentPrices = parseDojiPrices(html);

    // Find the target gold type
    const targetGoldType = 'NHẪN TRÒN 9999 (HƯNG THỊNH VƯỢNG - BÁN LẺ)';
    const currentPrice = currentPrices.find(p => p.type === targetGoldType);

    if (!currentPrice) {
      console.log(`Target gold type "${targetGoldType}" not found`);
      return res.status(200).json({
        success: true,
        message: 'Target gold type not found',
        availableTypes: currentPrices.map(p => p.type)
      });
    }

    console.log(`Current price for ${targetGoldType}:`, currentPrice);

    // Check if price has changed
    if (priceCache && priceCache.type === targetGoldType) {
      const buyChanged = priceCache.buyPrice !== currentPrice.buyPrice;
      const sellChanged = priceCache.sellPrice !== currentPrice.sellPrice;

      if (buyChanged || sellChanged) {
        console.log('Price change detected!');
        console.log('Old:', priceCache);
        console.log('New:', currentPrice);

        // Send Zalo notification
        const notificationSent = await sendZaloNotification({
          goldType: targetGoldType,
          oldBuyPrice: priceCache.buyPrice,
          newBuyPrice: currentPrice.buyPrice,
          oldSellPrice: priceCache.sellPrice,
          newSellPrice: currentPrice.sellPrice,
          timestamp: new Date().toISOString(),
        });

        // Update cache
        priceCache = currentPrice;

        return res.status(200).json({
          success: true,
          priceChanged: true,
          notificationSent,
          oldPrice: priceCache,
          newPrice: currentPrice,
        });
      } else {
        console.log('No price change detected');
      }
    } else {
      console.log('First run or cache reset, storing initial price');
      priceCache = currentPrice;
    }

    return res.status(200).json({
      success: true,
      priceChanged: false,
      currentPrice: currentPrice,
      message: 'Monitoring active',
    });

  } catch (error) {
    console.error('Error in price monitoring:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Parse DOJI prices from HTML (same logic as frontend)
 */
function parseDojiPrices(html) {
  const prices = [];

  // Extract from chart data (nghìn/lượng format)
  const chartTitleRegex = /text\s*:\s*'([^']+)\s+\(nghìn\/lượng\):\s*([0-9,]+)\/([0-9,]+)'/g;
  let match;

  while ((match = chartTitleRegex.exec(html)) !== null) {
    const name = match[1].trim();
    const buyPriceThousands = parseFloat(match[2].replace(/,/g, ''));
    const sellPriceThousands = parseFloat(match[3].replace(/,/g, ''));

    if (name && !isNaN(buyPriceThousands) && !isNaN(sellPriceThousands)) {
      prices.push({
        type: name,
        buyPrice: buyPriceThousands * 1000,
        sellPrice: sellPriceThousands * 1000,
      });
    }
  }

  // Parse table data (nghìn/chỉ format)
  const tableRegex = /<table class="goldprice-view[^"]*">[\s\S]*?<\/table>/g;
  const tables = html.match(tableRegex);

  if (tables && tables.length > 0) {
    const firstTable = tables[0];
    const rowRegex = /<tr[^>]*>[\s\S]*?<\/tr>/g;
    const rows = firstTable.match(rowRegex);

    if (rows) {
      for (const row of rows) {
        if (row.includes('<thead>') || row.includes('<th') || row.includes('SJC') || row.includes('AVPL')) continue;

        const nameMatch = row.match(/<span class="title[^"]*">([^<]+)<\/span>/);
        const name = nameMatch ? nameMatch[1].trim() : null;

        const buyMatch = row.match(/<td class="goldprice-td goldprice-td-0"[^>]*><div[^>]*>([0-9,]+)<\/div><\/td>/);
        const sellMatch = row.match(/<td class="goldprice-td goldprice-td-1"[^>]*><div[^>]*>([0-9,]+)<\/div><\/td>/);

        if (name && buyMatch && sellMatch) {
          const buyPriceChiThousands = parseFloat(buyMatch[1].replace(/,/g, ''));
          const sellPriceChiThousands = parseFloat(sellMatch[1].replace(/,/g, ''));

          prices.push({
            type: name,
            buyPrice: buyPriceChiThousands * 10 * 1000,
            sellPrice: sellPriceChiThousands * 10 * 1000,
          });
        }
      }
    }
  }

  return prices;
}

/**
 * Send Zalo notification
 */
async function sendZaloNotification(data) {
  try {
    const webhookUrl = process.env.ZALO_WEBHOOK_URL;
    const accessToken = process.env.ZALO_ACCESS_TOKEN;

    if (!webhookUrl && !accessToken) {
      console.log('Zalo credentials not configured, skipping notification');
      console.log('Set ZALO_WEBHOOK_URL or ZALO_ACCESS_TOKEN in environment variables');
      return false;
    }

    const buyChange = data.newBuyPrice - data.oldBuyPrice;
    const sellChange = data.newSellPrice - data.oldSellPrice;
    const buyDirection = buyChange > 0 ? '📈 Tăng' : '📉 Giảm';
    const sellDirection = sellChange > 0 ? '📈 Tăng' : '📉 Giảm';

    const messageText = `🔔 THÔNG BÁO THAY ĐỔI GIÁ VÀNG

📊 Loại: ${data.goldType}

💰 Giá Mua:
   Cũ: ${formatVND(data.oldBuyPrice)}
   Mới: ${formatVND(data.newBuyPrice)}
   ${buyDirection}: ${formatVND(Math.abs(buyChange))}

💵 Giá Bán:
   Cũ: ${formatVND(data.oldSellPrice)}
   Mới: ${formatVND(data.newSellPrice)}
   ${sellDirection}: ${formatVND(Math.abs(sellChange))}

🕒 ${new Date(data.timestamp).toLocaleString('vi-VN')}

Nguồn: DOJI - giavang.doji.vn`;

    // Try webhook first (simpler)
    if (webhookUrl) {
      console.log('Sending Zalo notification via webhook');
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: messageText }),
      });

      if (response.ok) {
        console.log('Zalo webhook notification sent successfully');
        return true;
      } else {
        console.error('Zalo webhook failed:', await response.text());
      }
    }

    // Try OA API as fallback
    if (accessToken) {
      console.log('Sending Zalo notification via OA API');
      const groupId = process.env.ZALO_GROUP_ID;

      const response = await fetch('https://openapi.zalo.me/v2.0/oa/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'access_token': accessToken,
        },
        body: JSON.stringify({
          recipient: { user_id: groupId },
          message: { text: messageText },
        }),
      });

      const result = await response.json();
      if (result.error === 0) {
        console.log('Zalo OA notification sent successfully');
        return true;
      } else {
        console.error('Zalo OA API error:', result);
      }
    }

    return false;
  } catch (error) {
    console.error('Error sending Zalo notification:', error);
    return false;
  }
}

function formatVND(amount) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

function getBaseUrl(req) {
  const host = req.headers.host;
  const protocol = host.includes('localhost') ? 'http' : 'https';
  return `${protocol}://${host}`;
}
