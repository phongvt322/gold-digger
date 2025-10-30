import { useMemo } from 'react'
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

const Dashboard = ({ data }: DashboardProps) => {
  const stats = useMemo(() => calculatePriceStats(data.prices), [data.prices])

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return `${date.getMonth() + 1}/${date.getDate()}`
  }

  const formatPrice = (value: number) => {
    return `$${value.toFixed(2)}`
  }

  const chartData = data.prices.map(item => ({
    date: formatDate(item.date),
    price: item.price,
    fullDate: item.date
  }))

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
      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-label">Current Price</div>
          <div className="stat-value current-price">
            {formatPrice(data.prices[data.prices.length - 1]?.price || 0)}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">30-Day Change</div>
          <div className={`stat-value ${stats.change >= 0 ? 'positive' : 'negative'}`}>
            {stats.change >= 0 ? '+' : ''}{formatPrice(stats.change)}
            <span className="change-percent">
              ({stats.changePercent >= 0 ? '+' : ''}{stats.changePercent}%)
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">30-Day High</div>
          <div className="stat-value">{formatPrice(stats.max)}</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">30-Day Low</div>
          <div className="stat-value">{formatPrice(stats.min)}</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">30-Day Average</div>
          <div className="stat-value">{formatPrice(stats.avg)}</div>
        </div>
      </div>

      <div className="chart-container">
        <h2>Price Trend (Last 30 Days)</h2>
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
              tickFormatter={formatPrice}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area
              type="monotone"
              dataKey="price"
              stroke="#FFD700"
              strokeWidth={2}
              fill="url(#colorPrice)"
              name="Gold Price (USD)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-container">
        <h2>Detailed Price Movement</h2>
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
              tickFormatter={formatPrice}
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
              name="Gold Price (USD)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default Dashboard
