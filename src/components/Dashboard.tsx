import { useMemo, useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  Legend
} from 'recharts'
import { GoldPriceResponse, calculatePriceStats } from '../services/goldPriceService'
import './Dashboard.css'

interface DashboardProps {
  data: GoldPriceResponse
}

type Currency = 'USD' | 'VND'

const Dashboard = ({ data }: DashboardProps) => {
  const [currency, setCurrency] = useState<Currency>('USD')
  const stats = useMemo(() => calculatePriceStats(data.prices), [data.prices])

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return `${date.getMonth() + 1}/${date.getDate()}`
  }

  const formatPrice = (value: number, curr: Currency = currency) => {
    if (curr === 'VND') {
      return `${value.toLocaleString('vi-VN')} ₫`
    }
    return `$${value.toFixed(2)}`
  }

  const chartData = data.prices.map(item => ({
    date: formatDate(item.date),
    price: currency === 'USD' ? item.price : (item.priceVND || 0),
    fullDate: item.date
  }))

  const currentPrice = currency === 'USD'
    ? data.prices[data.prices.length - 1]?.price || 0
    : data.prices[data.prices.length - 1]?.priceVND || 0

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-date">{payload[0].payload.fullDate}</p>
          <p className="tooltip-price">{formatPrice(payload[0].value)}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="dashboard">
      {/* Currency Toggle */}
      <div className="currency-toggle">
        <button
          className={`toggle-btn ${currency === 'USD' ? 'active' : ''}`}
          onClick={() => setCurrency('USD')}
        >
          🇺🇸 USD
        </button>
        <button
          className={`toggle-btn ${currency === 'VND' ? 'active' : ''}`}
          onClick={() => setCurrency('VND')}
        >
          🇻🇳 VND (Vietnam)
        </button>
        {data.exchangeRate && (
          <span className="exchange-rate">
            Exchange Rate: 1 USD = {data.exchangeRate.toLocaleString('vi-VN')} ₫
          </span>
        )}
      </div>

      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-label">Current Price</div>
          <div className="stat-value current-price">
            {formatPrice(currentPrice)}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">30-Day Change</div>
          <div className={`stat-value ${
            (currency === 'USD' ? stats.change : stats.changeVND) >= 0 ? 'positive' : 'negative'
          }`}>
            {currency === 'USD' ? (
              <>
                {stats.change >= 0 ? '+' : ''}{formatPrice(stats.change)}
                <span className="change-percent">
                  ({stats.changePercent >= 0 ? '+' : ''}{stats.changePercent}%)
                </span>
              </>
            ) : (
              <>
                {stats.changeVND >= 0 ? '+' : ''}{formatPrice(stats.changeVND, 'VND')}
                <span className="change-percent">
                  ({stats.changePercentVND >= 0 ? '+' : ''}{stats.changePercentVND}%)
                </span>
              </>
            )}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">30-Day High</div>
          <div className="stat-value">
            {currency === 'USD' ? formatPrice(stats.max) : formatPrice(stats.maxVND, 'VND')}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">30-Day Low</div>
          <div className="stat-value">
            {currency === 'USD' ? formatPrice(stats.min) : formatPrice(stats.minVND, 'VND')}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">30-Day Average</div>
          <div className="stat-value">
            {currency === 'USD' ? formatPrice(stats.avg) : formatPrice(stats.avgVND, 'VND')}
          </div>
        </div>
      </div>

      <div className="chart-container">
        <h2>Price Trend - Last 30 Days ({currency})</h2>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FFD700" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#FFD700" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
            <XAxis
              dataKey="date"
              stroke="#888"
              tick={{ fontSize: 12 }}
              interval="preserveStartEnd"
            />
            <YAxis
              stroke="#888"
              tick={{ fontSize: 12 }}
              domain={['dataMin - 20', 'dataMax + 20']}
              tickFormatter={(value) => formatPrice(value)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area
              type="monotone"
              dataKey="price"
              stroke="#FFD700"
              strokeWidth={2}
              fill="url(#colorPrice)"
              name={`Gold Price (${currency})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-container">
        <h2>Detailed Price Movement ({currency})</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
            <XAxis
              dataKey="date"
              stroke="#888"
              tick={{ fontSize: 12 }}
              interval="preserveStartEnd"
            />
            <YAxis
              stroke="#888"
              tick={{ fontSize: 12 }}
              domain={['dataMin - 20', 'dataMax + 20']}
              tickFormatter={(value) => formatPrice(value)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#FFA500"
              strokeWidth={2}
              dot={{ fill: '#FFD700', r: 3 }}
              activeDot={{ r: 6 }}
              name={`Gold Price (${currency})`}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {currency === 'VND' && (
        <div className="vietnam-info">
          <h3>🇻🇳 Giá Vàng tại Việt Nam</h3>
          <p>
            Giá vàng hiển thị theo đơn vị troy ounce (31.1035 gram) được chuyển đổi sang VNĐ.
            Giá vàng tại Việt Nam có thể khác nhau tùy thuộc vào thương hiệu và loại vàng (SJC, PNJ, DOJI, v.v.).
          </p>
        </div>
      )}
    </div>
  )
}

export default Dashboard
