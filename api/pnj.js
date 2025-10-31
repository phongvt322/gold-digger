module.exports = async function handler(req, res) {
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
    console.log('Fetching PNJ prices');
    const response = await fetch('https://www.pnj.com.vn/blog/gia-vang/');

    if (!response.ok) {
      throw new Error(`PNJ fetch failed with status ${response.status}`);
    }

    const html = await response.text();
    console.log('Successfully fetched PNJ HTML, length:', html.length);

    res.status(200).json({
      success: true,
      html: html,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching PNJ prices:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
};
