import { VietnamGoldResponse } from '../services/vietnamGoldService'
import './VietnamGoldPrices.css'

interface VietnamGoldPricesProps {
  data: VietnamGoldResponse | null
}

const VietnamGoldPrices = ({ data }: VietnamGoldPricesProps) => {
  if (!data || !data.prices || data.prices.length === 0) {
    return (
      <div className="vietnam-prices-container">
        <h2>🇻🇳 Giá Vàng Trong Nước</h2>
        <p className="loading-message">Đang tải giá vàng từ SJC, DOJI, PNJ...</p>
      </div>
    )
  }

  const formatVND = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN').format(amount)
  }

  const formatTime = (isoString: string): string => {
    const date = new Date(isoString)
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="vietnam-prices-container">
      <div className="vietnam-header">
        <h2>🇻🇳 Giá Vàng Trong Nước</h2>
        <p className="update-time">
          Cập nhật: {formatTime(data.timestamp)}
        </p>
      </div>

      <div className="price-table-container">
        <table className="vietnam-price-table">
          <thead>
            <tr>
              <th>Thương Hiệu</th>
              <th>Loại Vàng</th>
              <th className="price-column">Mua Vào</th>
              <th className="price-column">Bán Ra</th>
              <th>Đơn Vị</th>
            </tr>
          </thead>
          <tbody>
            {data.prices.map((price, index) => (
              <tr key={index} className="price-row">
                <td className="company-name">
                  <span className="company-badge">{price.company}</span>
                </td>
                <td className="gold-type">{price.type}</td>
                <td className="price-column buy-price">
                  {formatVND(price.buyPrice)} ₫
                </td>
                <td className="price-column sell-price">
                  {formatVND(price.sellPrice)} ₫
                </td>
                <td className="unit">{price.unit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="vietnam-info-box">
        <h3>📌 Lưu ý:</h3>
        <ul>
          <li><strong>1 lượng</strong> = 37.5 gram (theo chuẩn Việt Nam)</li>
          <li><strong>Giá mua vào:</strong> Giá các tiệm vàng thu mua lại vàng từ khách hàng</li>
          <li><strong>Giá bán ra:</strong> Giá các tiệm vàng bán cho khách hàng</li>
          <li>Giá vàng trong nước thường cao hơn giá quốc tế do thuế và phí dịch vụ</li>
          <li>Giá có thể thay đổi liên tục trong ngày</li>
        </ul>
      </div>

      <div className="sources-info">
        <p className="sources-text">
          <strong>Nguồn dữ liệu:</strong> SJC.com.vn, DOJI.vn, PNJ.com.vn, và các nguồn công khai khác
        </p>
      </div>
    </div>
  )
}

export default VietnamGoldPrices
