# Gold Digger - Gold Price Trending Dashboard

A real-time dashboard displaying gold price trends over the last 30 days with support for both USD and Vietnamese Dong (VND).

## Features

- 🌍 Real-time gold price visualization from multiple APIs
- 🇻🇳 **Vietnam Local Gold Prices** - Real prices from SJC, DOJI, PNJ, and Mi Hồng
- 💰 Buy/Sell prices (Mua vào/Bán ra) from Vietnamese gold companies
- 💱 Real-time USD to VND exchange rate conversion
- 📊 Interactive 30-day price trending charts
- 🔄 Currency toggle between USD and VND
- 📈 Comprehensive price statistics (high, low, average, change)
- 🎯 Multiple API fallback support for reliability
- ⚡ Responsive design for all devices
- 🎨 Dark/light theme support
- 📱 Vietnamese language support for local prices

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

- `VITE_GOLD_API_KEY` - API key from [GoldAPI.io](https://www.goldapi.io/) (100 free requests/month)
- `VITE_EXCHANGE_API_KEY` - API key from [ExchangeRate-API](https://www.exchangerate-api.com/) (1,500 free requests/month)
- `VITE_USE_MOCK_DATA` - Set to `true` to use mock data instead of APIs

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

4. **Mi Hồng**
   - Local gold shop prices
   - Community favorite

**Features:**
- Shows both **Mua vào** (Buy) and **Bán ra** (Sell) prices
- Prices displayed in VND per lượng (Vietnamese tael)
- Automatically updates with latest prices
- Includes Vietnamese language explanations
- Note: 1 lượng = 37.5 grams (Vietnamese standard)

The dashboard also converts international gold prices (USD per troy ounce) to Vietnamese Dong using real-time exchange rates for comparison.
