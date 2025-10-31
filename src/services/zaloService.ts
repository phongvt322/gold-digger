/**
 * Zalo messaging service for sending notifications
 * Requires Zalo OA (Official Account) credentials
 */

export interface ZaloMessage {
  text: string;
  goldType: string;
  oldBuyPrice: number;
  newBuyPrice: number;
  oldSellPrice: number;
  newSellPrice: number;
  timestamp: string;
}

/**
 * Send message to Zalo group using Zalo OA API
 */
export const sendZaloGroupMessage = async (message: ZaloMessage): Promise<boolean> => {
  try {
    const accessToken = import.meta.env.VITE_ZALO_ACCESS_TOKEN;
    const groupId = import.meta.env.VITE_ZALO_GROUP_ID;

    if (!accessToken || !groupId) {
      console.error('Zalo credentials not configured. Please set VITE_ZALO_ACCESS_TOKEN and VITE_ZALO_GROUP_ID');
      return false;
    }

    // Format price change message
    const buyChange = message.newBuyPrice - message.oldBuyPrice;
    const sellChange = message.newSellPrice - message.oldSellPrice;
    const buyDirection = buyChange > 0 ? '📈 Tăng' : '📉 Giảm';
    const sellDirection = sellChange > 0 ? '📈 Tăng' : '📉 Giảm';

    const messageText = `🔔 THÔNG BÁO THAY ĐỔI GIÁ VÀNG

📊 Loại: ${message.goldType}

💰 Giá Mua:
   Cũ: ${formatVND(message.oldBuyPrice)}
   Mới: ${formatVND(message.newBuyPrice)}
   ${buyDirection}: ${formatVND(Math.abs(buyChange))}

💵 Giá Bán:
   Cũ: ${formatVND(message.oldSellPrice)}
   Mới: ${formatVND(message.newSellPrice)}
   ${sellDirection}: ${formatVND(Math.abs(sellChange))}

🕒 Thời gian: ${new Date(message.timestamp).toLocaleString('vi-VN')}

Nguồn: DOJI - giavang.doji.vn`;

    // Send to Zalo group using OA API
    // https://developers.zalo.me/docs/api/official-account-api/gui-tin-nhan/gui-tin-nhan-den-nguoi-quan-tam-post-4302
    const response = await fetch('https://openapi.zalo.me/v2.0/oa/message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'access_token': accessToken,
      },
      body: JSON.stringify({
        recipient: {
          user_id: groupId, // For group, you might need to send to multiple users
        },
        message: {
          text: messageText,
        },
      }),
    });

    const result = await response.json();

    if (result.error === 0) {
      console.log('Zalo message sent successfully');
      return true;
    } else {
      console.error('Zalo API error:', result);
      return false;
    }
  } catch (error) {
    console.error('Error sending Zalo message:', error);
    return false;
  }
};

/**
 * Send message using Zalo Webhook (alternative method)
 * This uses a webhook URL that you can configure in your Zalo group
 */
export const sendZaloWebhook = async (message: ZaloMessage): Promise<boolean> => {
  try {
    const webhookUrl = import.meta.env.VITE_ZALO_WEBHOOK_URL;

    if (!webhookUrl) {
      console.error('Zalo webhook URL not configured. Please set VITE_ZALO_WEBHOOK_URL');
      return false;
    }

    const buyChange = message.newBuyPrice - message.oldBuyPrice;
    const sellChange = message.newSellPrice - message.oldSellPrice;
    const buyDirection = buyChange > 0 ? '📈 Tăng' : '📉 Giảm';
    const sellDirection = sellChange > 0 ? '📈 Tăng' : '📉 Giảm';

    const messageText = `🔔 THÔNG BÁO THAY ĐỔI GIÁ VÀNG\n\n📊 Loại: ${message.goldType}\n\n💰 Giá Mua:\n   Cũ: ${formatVND(message.oldBuyPrice)}\n   Mới: ${formatVND(message.newBuyPrice)}\n   ${buyDirection}: ${formatVND(Math.abs(buyChange))}\n\n💵 Giá Bán:\n   Cũ: ${formatVND(message.oldSellPrice)}\n   Mới: ${formatVND(message.newSellPrice)}\n   ${sellDirection}: ${formatVND(Math.abs(sellChange))}\n\n🕒 ${new Date(message.timestamp).toLocaleString('vi-VN')}\n\nNguồn: DOJI`;

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: messageText,
      }),
    });

    if (response.ok) {
      console.log('Zalo webhook message sent successfully');
      return true;
    } else {
      console.error('Zalo webhook error:', await response.text());
      return false;
    }
  } catch (error) {
    console.error('Error sending Zalo webhook:', error);
    return false;
  }
};

const formatVND = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};
