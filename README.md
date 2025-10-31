# Gold Digger - Gold Price Trending Dashboard

A real-time dashboard displaying gold price trends over the last 30 days with support for both USD and Vietnamese Dong (VND).

## Features

- 🌍 Real-time gold price visualization from multiple APIs
- 🇻🇳 **Vietnam Local Gold Prices** - Real prices from SJC, DOJI, PNJ, BTMC, and Mi Hồng
- 💰 Buy/Sell prices (Mua vào/Bán ra) from Vietnamese gold companies
- 💱 Real-time USD to VND exchange rate conversion
- 📊 Interactive 30-day price trending charts
- 🔄 Currency toggle between USD and VND
- 📈 Comprehensive price statistics (high, low, average, change)
- 🎯 Multiple API fallback support for reliability
- ⚡ Responsive design for all devices
- 🎨 Dark/light theme support
- 📱 Vietnamese language support for local prices
- 🔔 **Automatic Price Monitoring** - Monitor specific gold types and get Zalo notifications on price changes
- ⏰ **Vercel Cron Jobs** - Automated price checks every minute

## Tech Stack

- React 18
- TypeScript
- Vite
- Recharts (for data visualization)
- Axios (for API calls)

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Visit `http://localhost:3000` to view the dashboard.

### Build

```bash
npm run build
```

## Serverless Deployment

This dashboard is a static React application that can be deployed to serverless platforms **without needing to run a server**!

### Environment Variables (Optional)

Configure these in your deployment platform dashboard for enhanced functionality:

#### Gold Price APIs
- `VITE_GOLD_API_KEY` - API key from [GoldAPI.io](https://www.goldapi.io/) (100 free requests/month)
- `VITE_EXCHANGE_API_KEY` - API key from [ExchangeRate-API](https://www.exchangerate-api.com/) (1,500 free requests/month)
- `VITE_USE_MOCK_DATA` - Set to `true` to use mock data instead of APIs

#### Zalo Notifications (for Price Monitoring)
- `ZALO_WEBHOOK_URL` - Webhook URL for sending messages to Zalo group (recommended method)
- `ZALO_ACCESS_TOKEN` - Zalo OA (Official Account) access token (alternative method)
- `ZALO_GROUP_ID` - Zalo group ID to send notifications to (required with access token)
- `CRON_SECRET` - Optional secret to secure cron endpoints

**Note**: The dashboard works perfectly without any API keys using free fallback endpoints!

### Deploy to Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Push your code to GitHub
2. Import your repository to Vercel
3. Vercel will auto-detect the Vite configuration
4. (Optional) Add environment variables in **Vercel Dashboard → Settings → Environment Variables**
5. Click "Deploy" - Done! ✨

Or use Vercel CLI:
```bash
npm install -g vercel
vercel
```

### Deploy to Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start)

1. Push your code to GitHub
2. Connect your repository to Netlify
3. Build command: `npm run build`
4. Publish directory: `dist`
5. (Optional) Add environment variables in **Netlify Dashboard → Site Settings → Environment Variables**
6. Deploy! ✨

Or use Netlify CLI:
```bash
npm install -g netlify-cli
netlify deploy --prod
```

### Deploy to GitHub Pages

1. Enable GitHub Pages in your repository settings
2. Set source to "GitHub Actions"
3. Push to `main` branch
4. The workflow will automatically build and deploy

### Other Serverless Options

- **AWS Amplify**: Connect your GitHub repo
- **Cloudflare Pages**: Zero-config deployment
- **Firebase Hosting**: `firebase deploy`
- **Azure Static Web Apps**: GitHub integration

All these platforms offer:
- ✅ Free tier available
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ No server management needed

## Data Sources

### Real-Time Gold Prices

The dashboard integrates with multiple gold price APIs for reliability:

1. **GoldAPI.io** (Primary - requires API key)
   - Free tier: 100 requests/month
   - Sign up: https://www.goldapi.io/

2. **Metals.dev** (Fallback #1 - No key required)
   - Free demo API available
   - Limited to spot prices

3. **Gold-API.com** (Fallback #2 - No key required)
   - Free public endpoint

### Exchange Rates

Real-time USD to VND conversion using:
- **ExchangeRate-API.com**
  - Free tier: 1,500 requests/month
  - Sign up: https://www.exchangerate-api.com/

### Mock Data Fallback

If all APIs fail or `VITE_USE_MOCK_DATA=true`, the dashboard automatically falls back to realistic mock data that simulates gold price fluctuations based on historical volatility patterns.

### Vietnam Local Gold Prices (🇻🇳)

The dashboard fetches **real-time local gold prices** from major Vietnamese gold companies:

1. **SJC (Saigon Jewelry Company)**
   - Official SJC gold bar prices via SJC.com.vn API
   - Standard for gold bars in Vietnam
   - Prices per lượng (37.5 grams)

2. **DOJI**
   - Real-time prices from DOJI.vn API
   - Multiple gold types available
   - Buy and sell prices displayed

3. **PNJ (Phú Nhuận Jewelry)**
   - Prices from PNJ.com.vn
   - Popular jewelry chain in Vietnam

4. **Bảo Tín Minh Châu (BTMC)**
   - Major gold retailer in Vietnam
   - Well-known brand with nationwide presence
   - Multiple gold types and jewelry

5. **Mi Hồng**
   - Local gold shop prices
   - Community favorite

**Features:**
- Shows both **Mua vào** (Buy) and **Bán ra** (Sell) prices
- Prices displayed in VND per lượng (Vietnamese tael)
- Automatically updates with latest prices
- Includes Vietnamese language explanations
- Note: 1 lượng = 37.5 grams (Vietnamese standard)

The dashboard also converts international gold prices (USD per troy ounce) to Vietnamese Dong using real-time exchange rates for comparison.

## 🔔 Automatic Price Monitoring & Zalo Notifications

The dashboard includes an **automated price monitoring system** that checks gold prices every minute and sends Zalo notifications when prices change.

### Features

- ⏰ Automatic price checks every 1 minute using Vercel Cron Jobs
- 🎯 Monitors specific gold type: **"NHẪN TRÒN 9999 (HƯNG THỊNH VƯỢNG - BÁN LẺ)"**
- 📱 Sends Zalo group messages when prices change
- 📊 Detailed price change notifications (old vs new, increase/decrease)
- 🔐 Secure cron endpoint with optional secret token

### How It Works

1. **Vercel Cron** triggers `/api/monitor-price` every minute
2. API fetches latest DOJI prices
3. Compares with previous price stored in memory
4. If price changed → Sends formatted message to Zalo group
5. Updates cached price for next comparison

### Setup Instructions

#### Method 1: Zalo Webhook (Recommended - Easiest)

1. Create a webhook integration in your Zalo group
2. Get the webhook URL from Zalo
3. Add to Vercel environment variables:
   ```
   ZALO_WEBHOOK_URL=https://your-webhook-url
   ```

#### Method 2: Zalo Official Account API

1. Register a Zalo Official Account (OA)
2. Get your access token from [Zalo Developers](https://developers.zalo.me/)
3. Get your group ID
4. Add to Vercel environment variables:
   ```
   ZALO_ACCESS_TOKEN=your-access-token
   ZALO_GROUP_ID=your-group-id
   ```

#### Optional: Secure Cron Endpoint

Add a secret to prevent unauthorized access to the cron endpoint:
```
CRON_SECRET=your-random-secret-string
```

### Testing

Visit `/api/test-monitor` in your deployed app to manually test the price monitoring system:

```
https://your-app.vercel.app/api/test-monitor
```

This will:
- ✅ Show current monitoring status
- ✅ Display current price for monitored gold type
- ✅ Test Zalo notification (if price changed)
- ✅ Show configuration status

### Notification Format

When a price change is detected, Zalo group receives:

```
🔔 THÔNG BÁO THAY ĐỔI GIÁ VÀNG

📊 Loại: NHẪN TRÒN 9999 (HƯNG THỊNH VƯỢNG - BÁN LẺ)

💰 Giá Mua:
   Cũ: 14.460.000 ₫
   Mới: 14.500.000 ₫
   📈 Tăng: 40.000 ₫

💵 Giá Bán:
   Cũ: 14.600.000 ₫
   Mới: 14.650.000 ₫
   📈 Tăng: 50.000 ₫

🕒 31/10/2025, 10:30:45

Nguồn: DOJI - giavang.doji.vn
```

### Customizing Monitored Gold Type

To monitor a different gold type, edit `/api/monitor-price.js`:

```javascript
const targetGoldType = 'YOUR GOLD TYPE HERE';
```

Available gold types can be found by visiting `/api/test-monitor`.

### Limitations

- **Vercel Cron**: Free tier has cron job limits (check Vercel docs)
- **Price Storage**: Uses in-memory cache (resets on cold starts)
- **For Production**: Consider using Vercel KV or Redis for persistent storage

### Disabling Monitoring

Remove or comment out the `crons` section in `vercel.json`:

```json
// "crons": [
//   {
//     "path": "/api/monitor-price",
//     "schedule": "* * * * *"
//   }
// ]
```
