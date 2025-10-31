import type { VercelRequest, VercelResponse } from '@vercel/node';

module.exports = async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    console.log('Fetching SJC prices');
    const response = await fetch('https://sjc.com.vn/xml/tygiavang.xml');

    if (!response.ok) {
      throw new Error(`SJC fetch failed with status ${response.status}`);
    }

    const xml = await response.text();
    console.log('Successfully fetched SJC XML, length:', xml.length);

    res.status(200).json({
      success: true,
      data: xml,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching SJC prices:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
}
