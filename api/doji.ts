import type { VercelRequest, VercelResponse } from '@vercel/node';

module.exports = async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  // Set CORS headers to allow frontend to access this API
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
    console.log('Fetching DOJI prices from giavang.doji.vn');
    const response = await fetch('https://giavang.doji.vn/');

    if (!response.ok) {
      throw new Error(`DOJI fetch failed with status ${response.status}`);
    }

    const html = await response.text();
    console.log('Successfully fetched DOJI HTML, length:', html.length);

    // Return the HTML so frontend can parse it
    res.status(200).json({
      success: true,
      html: html,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching DOJI prices:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
}
