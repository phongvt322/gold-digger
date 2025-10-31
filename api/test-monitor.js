/**
 * Test endpoint to manually trigger price monitoring
 * Visit /api/test-monitor to test the price monitoring system
 */

module.exports = async function handler(req, res) {
  try {
    // Forward to the monitor-price endpoint
    const baseUrl = getBaseUrl(req);
    const response = await fetch(`${baseUrl}/api/monitor-price`, {
      method: 'GET',
      headers: {
        'authorization': `Bearer ${process.env.CRON_SECRET || 'test'}`,
      },
    });

    const result = await response.json();

    // Return HTML page with results
    const html = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Test Price Monitoring</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 800px;
      margin: 50px auto;
      padding: 20px;
      background: #f5f5f5;
    }
    .container {
      background: white;
      padding: 30px;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    h1 { color: #333; }
    .status {
      padding: 15px;
      border-radius: 5px;
      margin: 20px 0;
    }
    .success { background: #d4edda; color: #155724; }
    .error { background: #f8d7da; color: #721c24; }
    .info { background: #d1ecf1; color: #0c5460; }
    pre {
      background: #f4f4f4;
      padding: 15px;
      border-radius: 5px;
      overflow-x: auto;
    }
    .price-info {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin: 15px 0;
    }
    .price-card {
      padding: 15px;
      background: #f8f9fa;
      border-radius: 5px;
      border-left: 4px solid #007bff;
    }
    button {
      background: #007bff;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 5px;
      cursor: pointer;
      font-size: 16px;
    }
    button:hover {
      background: #0056b3;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🔔 Test Price Monitoring</h1>

    <div class="status ${result.success ? 'success' : 'error'}">
      ${result.success ? '✅ Monitoring system is working!' : '❌ Error occurred'}
    </div>

    ${result.priceChanged ? `
      <div class="status info">
        🚨 <strong>Price Change Detected!</strong>
      </div>

      <h2>Price Comparison</h2>
      <div class="price-info">
        <div class="price-card">
          <h3>Old Price</h3>
          <p><strong>Buy:</strong> ${formatVND(result.oldPrice.buyPrice)}</p>
          <p><strong>Sell:</strong> ${formatVND(result.oldPrice.sellPrice)}</p>
        </div>
        <div class="price-card">
          <h3>New Price</h3>
          <p><strong>Buy:</strong> ${formatVND(result.newPrice.buyPrice)}</p>
          <p><strong>Sell:</strong> ${formatVND(result.newPrice.sellPrice)}</p>
        </div>
      </div>

      ${result.notificationSent ?
        '<p class="success">✅ Zalo notification sent successfully!</p>' :
        '<p class="error">❌ Zalo notification failed (check configuration)</p>'
      }
    ` : `
      <div class="status info">
        ℹ️ ${result.message || 'No price change detected'}
      </div>

      ${result.currentPrice ? `
        <h2>Current Price: ${result.currentPrice.type}</h2>
        <div class="price-card">
          <p><strong>Buy:</strong> ${formatVND(result.currentPrice.buyPrice)}</p>
          <p><strong>Sell:</strong> ${formatVND(result.currentPrice.sellPrice)}</p>
        </div>
      ` : ''}
    `}

    <h2>Full Response</h2>
    <pre>${JSON.stringify(result, null, 2)}</pre>

    <h2>Configuration</h2>
    <div class="status info">
      <p><strong>Monitored Gold Type:</strong> NHẪN TRÒN 9999 (HƯNG THỊNH VƯỢNG - BÁN LẺ)</p>
      <p><strong>Check Interval:</strong> Every 1 minute (Vercel Cron)</p>
      <p><strong>Zalo Configured:</strong> ${process.env.ZALO_WEBHOOK_URL || process.env.ZALO_ACCESS_TOKEN ? '✅ Yes' : '❌ No'}</p>
    </div>

    ${!(process.env.ZALO_WEBHOOK_URL || process.env.ZALO_ACCESS_TOKEN) ? `
      <div class="status error">
        <h3>⚠️ Zalo Not Configured</h3>
        <p>To enable Zalo notifications, set one of these environment variables in Vercel:</p>
        <ul>
          <li><code>ZALO_WEBHOOK_URL</code> - Webhook URL for Zalo group</li>
          <li>OR <code>ZALO_ACCESS_TOKEN</code> + <code>ZALO_GROUP_ID</code> - Zalo OA API credentials</li>
        </ul>
      </div>
    ` : ''}

    <button onclick="window.location.reload()">🔄 Run Test Again</button>
    <button onclick="window.location.href='/'">🏠 Back to Dashboard</button>
  </div>
</body>
</html>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

function formatVND(amount) {
  if (typeof amount !== 'number') return 'N/A';
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
