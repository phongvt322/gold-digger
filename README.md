# Gold Digger - Gold Price Trending Dashboard

A real-time dashboard displaying gold price trends over the last 30 days.

## Features

- Real-time gold price visualization
- 30-day price trending chart
- Interactive chart with tooltips
- Responsive design

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

### Deploy to Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Push your code to GitHub
2. Import your repository to Vercel
3. Vercel will auto-detect the Vite configuration
4. Click "Deploy" - Done! ✨

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

## Data Source

The dashboard currently uses mock data that simulates realistic gold price fluctuations. In production, you can replace the mock data generator in `src/services/goldPriceService.ts` with an actual gold price API endpoint such as:
- [Metals API](https://metals-api.com/)
- [Gold API](https://www.goldapi.io/)
- [CoinGecko](https://www.coingecko.com/en/api)
