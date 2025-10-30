import { useState, useEffect } from 'react'
import './App.css'
import Dashboard from './components/Dashboard'
import { fetchGoldPrices, GoldPriceResponse } from './services/goldPriceService'

function App() {
  const [data, setData] = useState<GoldPriceResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)
        const goldData = await fetchGoldPrices()
        setData(goldData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  return (
    <div className="App">
      <header>
        <h1>Gold Price Trending Dashboard</h1>
        <p className="subtitle">Last 30 Days Market Analysis</p>
      </header>

      <main>
        {loading && (
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading gold price data...</p>
          </div>
        )}

        {error && (
          <div className="error">
            <p>Error: {error}</p>
          </div>
        )}

        {data && !loading && !error && (
          <Dashboard data={data} />
        )}
      </main>

      <footer>
        <p>Data displayed in {data?.currency || 'USD'} per {data?.unit || 'troy ounce'}</p>
      </footer>
    </div>
  )
}

export default App
