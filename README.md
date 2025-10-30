# Gold Digger - Gold Price Trending Dashboard

A real-time dashboard displaying gold price trends over the last 30 days with support for both USD and Vietnamese Dong (VND).

## Features

- 🌍 Real-time gold price visualization from multiple APIs
- 🇻🇳 Vietnam gold price support with VND currency
- 💱 Real-time USD to VND exchange rate conversion
- 📊 Interactive 30-day price trending charts
- 🔄 Currency toggle between USD and VND
- 📈 Comprehensive price statistics (high, low, average, change)
- 🎯 Multiple API fallback support for reliability
- ⚡ Responsive design for all devices
- 🎨 Dark/light theme support

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

### Configuration (Optional)

Create a `.env` file in the root directory for API configuration:

```bash
# Optional: Use real gold price APIs (recommended for production)
VITE_GOLD_API_KEY=your_gold_api_key_here
VITE_EXCHANGE_API_KEY=your_exchange_api_key_here

# Set to 'true' to use mock data (useful for development/testing)
VITE_USE_MOCK_DATA=false
```

**Free API Options:**
- **Gold Price**: [GoldAPI.io](https://www.goldapi.io/) - 100 requests/month free
- **Exchange Rate**: [ExchangeRate-API](https://www.exchangerate-api.com/) - 1,500 requests/month free

**Without API keys**: The dashboard will automatically use free fallback APIs and realistic mock data.

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

### Deploy to Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Push your code to GitHub
2. Import your repository to Vercel
3. Vercel will auto-detect the Vite configuration
4. (Optional) Add environment variables in Vercel dashboard:
   - `VITE_GOLD_API_KEY` - Your gold price API key
   - `VITE_EXCHANGE_API_KEY` - Your exchange rate API key
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
5. Deploy! ✨

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

### Vietnam Gold Prices (🇻🇳 VND)

The dashboard converts international gold prices (USD per troy ounce) to Vietnamese Dong using real-time exchange rates. Note that local Vietnam gold prices (SJC, PNJ, DOJI) may vary due to local premiums and different gold standards.
